/**
 * Created by kaimingyi on 2016/11/20.
 */
const fs = require('fs-promise');
var Promise = require("bluebird");
const zlib = require('zlib');

var loader_osgjs = loader_osgjs || {};
module.exports = loader_osgjs;

loader_osgjs.binaryData = null;

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

loader_osgjs.load = Promise.coroutine(function* (url, urlbin, callback) {
    let source = yield fs.readFile(url);


    if (source === null) {
        console.warn('error : ' + err);
        return;
    }

    let bin = yield fs.readFile(urlbin);

    if (bin === null) {
        console.warn('error : ' + err);
        return;
    }

    var typedArray = new Uint8Array( bin );

    // check magic number 1f8b
    if ( typedArray[ 0 ] === 0x1f && typedArray[ 1 ] === 0x8b ) {

        if ( !zlib ) {
            Notify.error( 'zlib init failed.' );
        }

        var zdec = new zlib.Gunzip( typedArray );
        var result = zdec.decompress();

        console.info("unziped bin data.");

        loader_osgjs.binaryData = result.buffer;
    }
    else
    {
        console.info("directed bin data.");

        loader_osgjs.binaryData = typedArray;
    }



    var text = source.toString();
    var res = yield loader_osgjs.parse(text);

    //console.info(res);

    callback(res);
});

loader_osgjs.parse = Promise.coroutine(function* (test) {

    let rootNode = JSON.parse(test);

    //console.info(rootNode['osg.Node']);

    return loader_osgjs.parseNode(rootNode);

});

loader_osgjs.parseNode = Promise.coroutine(function* (node) {

    var res = [];

    for( let subnode in node )
    {
        let currObj = node[subnode];

        if(subnode === 'osg.Geometry') {

            res.push( yield loader_osgjs.parseGeometry(currObj) );
            return res;
        }
        else {

            if(typeof currObj === 'object')
            {
                //console.info(node[subnode]);
                res = res.concat( yield loader_osgjs.parseNode(currObj) );
            }
        }
    }

    return res;
});

loader_osgjs.parseGeometry = Promise.coroutine(function* (node) {

    let geometry = {};

    let iboNode = node['PrimitiveSetList'];
    let userDataNode = node['UserDataContainer'];
    let vboNode = node['VertexAttributeList'];

    if( iboNode !== undefined && vboNode !== undefined )
    {
        geometry.vbo = yield loader_osgjs.parseVbo(vboNode, userDataNode);
        geometry.ibo = yield loader_osgjs.parseIbo(iboNode);
    }

    return geometry;
});

const IMPLICIT_HEADER_PRIMITIVE_LENGTH = 0;
const IMPLICIT_HEADER_MASK_LENGTH = 1;
const IMPLICIT_HEADER_EXPECTED_INDEX = 2;
const IMPLICIT_HEADER_LENGTH = 3;

/**
 * 恢复成delta表示的
 * @param t {Uint32Array}
 * @param off {number}
 */
function undelta(t, off){
    //第一个是1， 第二个是0， 所以从 a=i+1 开始， 例如 1,0,0,0,0
    for (var i = off || 0, r = t.length, n = t[i], a = i + 1; r > a; ++a) {
        var s = t[a];
        n = t[a] = n + (s >> 1 ^ -(1 & s));
    }
    return t;
}

/**
 * @param t {Uint32Array}  解开后的原始数据
 * @param e {Uint16Array}  解码输出数据
 * @param r {number} 偏移。例如 472 =  o.IMPLICIT_HEADER_LENGTH + n[o.IMPLICIT_HEADER_MASK_LENGTH] = 3+469
 * @param n {Object} 没用先
 */
function decodeIdex(t, e, r, n){
    var a = t[IMPLICIT_HEADER_EXPECTED_INDEX];    //0
    var s = t[IMPLICIT_HEADER_MASK_LENGTH];       // 469
    var o = new Uint32Array(t.subarray(IMPLICIT_HEADER_LENGTH, s + IMPLICIT_HEADER_LENGTH));//o是去掉头和mask之后的
    var u = 32 * s - e.length;
    //mask次循环
    for (var l = 1 << 31, h = 0; s > h; ++h){
        //32次循环
        for (var c = o[h], d = 32, p = h * d, f = h === s - 1 ? u : 0, g = f; d > g; ++g,++p){
            c & l >>> g ? e[p] = t[r++] : e[p] = n ? a : a++;
        }
    }
    return e;
}

/**
 * @param t {Uint32Array}  解开后的原始数据
 * @param e elment size
 * @param i 解码后的实际index索引
 */
function decodeVert(t,e,i){
    var r=t.length/e;               //452
    var n=new Uint8Array(r);
    var    a=i.length-1;
        n[i[0]]=1,
        n[i[1]]=1,
        n[i[2]]=1;

    // 2 - a
    for(var s=2;a>s;++s){

        var o=s-2;
        var u=i[o];
        var l=i[o+1];
        var h=i[o+2];
        var c=i[o+3];

        if(1!==n[c]){
            n[c]=1,u*=e,l*=e,h*=e,c*=e;
            // x,y,z
            for(var d=0;e>d;++d)
                t[c+d]=t[c+d]+t[l+d]+t[h+d]-t[u+d];
        }
    }
    return t;
}

function dd(t, o, i) {
    for (var r = i[0], n = t.length, a = 0; n > a; ++a) {
        var s = r - t[a];
        o[a] = s,
        s >= r && (r = s + 1);
    }
    return i[0] = r,o;
}

/**
 * @param buff {Uint8Array} 数据
 * @return {Uint16Array} 顶点索引
 */
function decodePrimIndex_varint(buff, offset, len){
    var u32dt = varintToInt32(buff,offset,len);
    var idxDtOff = IMPLICIT_HEADER_LENGTH+u32dt[IMPLICIT_HEADER_MASK_LENGTH];
    u32dt = undelta(u32dt, idxDtOff);
    var oo = new Uint16Array(u32dt[IMPLICIT_HEADER_PRIMITIVE_LENGTH]);//这里是有多少个index
    var d1 = decodeIdex(u32dt,oo,IMPLICIT_HEADER_LENGTH+u32dt[IMPLICIT_HEADER_MASK_LENGTH],2);
    dd(d1,d1,[0]);
    return d1;
}

function varintToInt32(u8buff, offset, sz){
    var ret = new Uint32Array(sz);
    for(var s=offset,a=0; a!=sz;){
        var o=0,u=0;
        do{
            o |= (0x7f & u8buff[s])<<u;
            u+=7;
        }while(0!==(0x80 & u8buff[s++]));
        ret[a++]=o;
    }
    return ret;
}

function varintToPInt32(u8buff, offset, sz){
    var ret = new Uint32Array(sz);
    for(var s=offset,a=0; a!=sz;){
        var o=0,u=0;
        do{
            o |= (0x7f & u8buff[s])<<u;
            u+=7;
        }while(0!==(0x80 & u8buff[s++]));
        //o = o & 1 ? (o+1) / -2 : o / 2
        ret[a++]=o;
    }
    return ret;
}

loader_osgjs.parseIbo = Promise.coroutine(function* (node) {

    let ibo = [];

    //node.forEach( currObj => {
    let currObj = node[0];
        // multi indice

        for( let elementUnit in currObj)
        {
            let unitObj = currObj[elementUnit];

            let topology =  unitObj['Mode'];
            let indiceData = unitObj['Indices'];

            if( topology !== undefined && indiceData !== undefined ) {

                let nodeArray = indiceData['Array'];

                let type = Object.keys(nodeArray)[0];
                let nodeData = nodeArray[type];
                let size = nodeData['Size'];
                let offset = nodeData['Offset'];
                let itemSize = indiceData['ItemSize'];
                if( nodeData["File"] !== "model_file.bin.gz" )
                {
                    continue;
                }

                // TODO: manage endianness
                // let tmpArray = null;
                //
                // if ( type === 'Uint16Array' ) {
                //     tmpArray = new Uint16Array(loader_osgjs.binaryData);
                // } else if ( type === 'Int16Array' ) {
                //     tmpArray = new Int16Array(loader_osgjs.binaryData);
                // } else if ( type === 'Uint32Array' ) {
                //     tmpArray = new Uint32Array(loader_osgjs.binaryData);
                // } else if ( type === 'Int32Array' ) {
                //     tmpArray = new Int32Array(loader_osgjs.binaryData);
                // } else if ( type === 'Uint8Array' ) {
                //     tmpArray = new Uint8Array(loader_osgjs.binaryData);
                // } else if ( type === 'Int8Array' ) {
                //     tmpArray = new Int8Array(loader_osgjs.binaryData);
                // }

                let i32 = decodePrimIndex_varint(loader_osgjs.binaryData, offset, size * itemSize);

                //console.info( tmpArray.subarray(offset, size * itemSize) );
                for( let i=0; i < size * itemSize; ++i)
                {
                    ibo.push( i32[i] );
                }
            }
        }

    //} );

    return ibo;
});

loader_osgjs.parseVbo = Promise.coroutine(function* (node, userDataNode, ) {

    let vbo = [];
    //return vbo;
    let position = [];
    let normal = [];
    let texcoord = [];

    let vtx_bbl = [];
    let vtx_h = [];

    let uv0_bbl = [];
    let uv0_h = [];

    let epsilon = 0;
    let nphi = 0;

    let valueArray = userDataNode.Values;

    //console.info( valueArray );

    valueArray.forEach( item => {

        switch(item['Name'])
        {
            case 'vtx_bbl_x':
                vtx_bbl[0] = parseFloat(item['Value']);
                break;
            case 'vtx_bbl_y':
                vtx_bbl[1] = parseFloat(item['Value']);
                break;
            case 'vtx_bbl_z':
                vtx_bbl[2] = parseFloat(item['Value']);
                break;
            case 'vtx_h_x':
                vtx_h[0] = parseFloat(item['Value']);
                break;
            case 'vtx_h_y':
                vtx_h[1] = parseFloat(item['Value']);
                break;
            case 'vtx_h_z':
                vtx_h[2] = parseFloat(item['Value']);
                break;

            case 'uv_0_bbl_x':
                uv0_bbl[0] = parseFloat(item['Value']);
                break;
            case 'uv_0_bbl_y':
                uv0_bbl[1] = parseFloat(item['Value']);
                break;
            case 'uv_0_h_x':
                uv0_h[0] = parseFloat(item['Value']);
                break;
            case 'uv_0_h_y':
                uv0_h[1] = parseFloat(item['Value']);
                break;

            case 'epsilon':
                epsilon = parseFloat(item['Value']);
                break;
            case 'nphi':
                nphi = parseFloat(item['Value']);
                break;
        }
    } );

    function ParseVertexElement( targetNode, targetArray, bbl_target, h_target ) {

        if (targetNode !== undefined && targetNode.Array !== undefined) {


            let nodeArray = targetNode['Array'];
            let type = Object.keys(nodeArray)[0];
            let nodeData = nodeArray[type];

            let size = nodeData['Size'];
            let offset = nodeData['Offset'];
            let itemSize = targetNode['ItemSize'];
            if (nodeData["File"] === "model_file.bin.gz") {

                //console.info('process' + offset + ' | ' + size * itemSize);

                // let tmpArray = null;
                //
                // if (type === 'Uint16Array') {
                //     tmpArray = new Uint16Array(loader_osgjs.binaryData);
                // } else if (type === 'Int16Array') {
                //     tmpArray = new Int16Array(loader_osgjs.binaryData);
                // } else if (type === 'Uint32Array') {
                //     tmpArray = new Uint32Array(loader_osgjs.binaryData);
                // } else if (type === 'Int32Array') {
                //     tmpArray = new Int32Array(loader_osgjs.binaryData);
                // } else if (type === 'Uint8Array') {
                //     tmpArray = new Uint8Array(loader_osgjs.binaryData);
                // } else if (type === 'Int8Array') {
                //     tmpArray = new Int8Array(loader_osgjs.binaryData);
                // }

                //console.info( tmpArray.subarray(offset, size * itemSize) );
                // for (i = offset; i < offset + size * itemSize; ++i) {
                //     targetArray.push(tmpArray[i]);
                // }

                let i32 = varintToPInt32(loader_osgjs.binaryData, offset, size * itemSize);
                console.info('arr: ' + i32.length / 3);

                i32 = decodeVert(i32, itemSize, iDxResult);

                //console.info(i32);
                //console.info( tmpArray.subarray(offset, size * itemSize) );
                for( let i=0; i < size * itemSize; ++i)
                {
                    if(bbl_target !== null)
                    {
                        targetArray.push( bbl_target[i % itemSize] + i32[i] * h_target[i % itemSize] );
                    }
                    else
                    {
                        targetArray.push( i32[i]);
                    }
                }

            }
        }
    }

    //console.info( vtx_bbl );

    ParseVertexElement(node['Vertex'], position, vtx_bbl, vtx_h);
    //ParseVertexElement(node['Normal'], normal, null, null);
    //ParseVertexElement(node['TexCoord0'], texcoord, uv0_bbl, uv0_h);

    //console.info(position);
    //console.info(texcoord);

    for( let i = 0; i < position.length / 3; ++i )
    {
        vbo.push( position[i * 3 + 0] );
        vbo.push( position[i * 3 + 1] );
        vbo.push( position[i * 3 + 2] );

        vbo.push( normal[i * 3 + 0] );
        vbo.push( normal[i * 3 + 1] );
        vbo.push( normal[i * 3 + 2] );

        vbo.push( texcoord[i * 2 + 0] );
        vbo.push( texcoord[i * 2 + 1] );
    }

    return vbo;
});