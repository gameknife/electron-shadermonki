/**
 * Created by kaimingyi on 2016/12/15.
 */

var Promise = require('bluebird');
var fs = require('fs-extra');
var fsPromise = require('fs-promise');
var path = require('path');
var http = require('http');
var https = require('https');
var zlib = require('zlib');


var packageBuilder = packageBuilder || {};
module.exports = packageBuilder;

packageBuilder.DownloadFile = function(dir, osgfile, downloadfile, callback) {

    let absDir = path.join(dir, downloadfile);
    try {
        fs.accessSync(absDir, fs.F_OK);
        callback();
    } catch (e) {
        var file = fs.createWriteStream(absDir);
        var request = https.get(osgfile, function (response) {

            switch (response.headers['content-encoding']) {
                // or, just use zlib.createUnzip() to handle both cases
                case 'gzip':
                    response.pipe(zlib.createGunzip()).pipe(file);
                    break;
                case 'deflate':
                    response.pipe(zlib.createInflate()).pipe(file);
                    break;
                default:
                    response.pipe(file);
                    break;
            }

            var len = parseInt(response.headers['content-length'], 10);
            var body = "";
            var cur = 0;
            var total = len / 1048576; //1048576 - bytes in  1Megabyte

            response.on("data", function(chunk) {
                body += chunk;
                cur += chunk.length;
                let outData = "Downloading " + downloadfile + ' - ' +  (100.0 * cur / len).toFixed(2) + "% ";
            });

            response.on("end", function() {

                let outData = "Downloaded " + downloadfile;
                console.log(outData);

                if(callback)
                {
                    callback();
                }
            });
        });
    }
}

packageBuilder.DownloadFileSync = Promise.coroutine(function* (dir, osgfile, downloadfile) {

    let finishFlag = false;

    packageBuilder.DownloadFile(dir, osgfile, downloadfile, e => {
        finishFlag = true;
    });

    for( let i = 0; i < 2000; ++i )
    {
        yield Promise.delay(50);
        if(finishFlag === true)
        {
            break;
        }
    }
});

packageBuilder.ParsePkg = Promise.coroutine(function* ( pkgObject, dir, resdir ){

    console.info('pkg building...\nwork dir: ' + dir);

    // mesh files
    let osgfile = pkgObject.files[0].osgjsUrl;
    let osgModelfile = osgfile.replace('file.osgjs.gz', 'model_file.bin.gz');

    yield packageBuilder.DownloadFileSync(dir, osgfile, 'model.osgjs');
    yield packageBuilder.DownloadFileSync(dir, osgModelfile, 'model.osgjs.bin');

    // material files
    let options = pkgObject.options;
    let materials = options.materials;

    let fetchingTextures = [];

    for( let mat in materials )
    {
        let matnode = materials[mat];

        let mattext = JSON.stringify(matnode);

        fs.writeFile(path.join(resdir, matnode.name + '.mat'), mattext, function(err){
            if(!err) {
                //console.log(matnode.name + " writed");
            }
        });

        // download all textures
        for( let channel in matnode.channels)
        {
            //console.info(matnode);
            let channelnode = matnode.channels[channel];
            if( channelnode.texture )
            {
                let image = channelnode.texture.image;
                let name = image.name;
                let images = image.images;

                let toplodurl = '';
                let maxWidth = 0;
                for( let i=0; i < images.length; ++i)
                {
                    let currImage = images[i];
                    if( currImage.width > maxWidth )
                    {
                        maxWidth = currImage.width;
                        toplodurl = currImage.url;
                    }
                }
                let ext = path.extname(toplodurl);

                fetchingTextures.push( {dir: resdir, url: toplodurl, file: (name+ext)} );
            }
        }

        for( let i=0; i < fetchingTextures.length; ++i ) {
            yield packageBuilder.DownloadFileSync( fetchingTextures[i].dir, fetchingTextures[i].url, fetchingTextures[i].file);
        }

    }

    console.info('pkg built.\nwork dir: ' + dir);

    return true;
});


packageBuilder.build = Promise.coroutine(function* ( callback ) {

    console.info('shader monki package builder v0.1');

    let packageWaitForBuild = [];

    let filelist = fs.walkSync('res/package/');
    filelist.forEach( item => {

        item = path.normalize(item);
        let filename = path.basename( item );
        let dirname = path.dirname(item);
        let relpath = path.relative( 'res/package/', dirname );
        let extname = path.extname(item);
        let purefilename = path.basename( item, extname );
        if(extname == '.spkg')
        {
            let pkgDir = path.join( dirname , purefilename);
            let pkgResDir = path.join( dirname , purefilename, 'res');

            try {
                console.info('spkg found: ' + pkgDir);
                fs.accessSync(pkgDir, fs.F_OK);

                // TODO to remove
                packageWaitForBuild.push(item);
            } catch (e) {
                // It isn't accessible

                // push it & mkdir
                try {
                    fs.mkdirSync(pkgDir);
                    fs.mkdirSync(pkgResDir);
                    packageWaitForBuild.push(item);
                }
                catch (e){
                    console.error('spkg dir create failed!!!');
                }
            }
        }
    });

    for( let i=0; i < packageWaitForBuild.length; ++i)
    {
        let spkgpath = packageWaitForBuild[i];

        let buffer = fs.readFileSync(spkgpath);
        let text = buffer.toString();
        let pkgJSON = JSON.parse(text);

        let extname = path.extname(spkgpath);
        let purefilename = path.basename( spkgpath, extname );
        let dirname = path.dirname(spkgpath);
        let pkgDir = path.join( dirname , purefilename);
        let pkgResDir = path.join( dirname , purefilename, 'res');

        yield packageBuilder.ParsePkg(pkgJSON, pkgDir, pkgResDir);
    }

    if(callback)
    {
        callback();
    }

});

packageBuilder.fetchSinglePkg = Promise.coroutine(function* (url) {
    let guid = url.substr( url.indexOf('models/') + 7 );

    yield fsPromise.unlink('fetchpkg.spkg');

    yield packageBuilder.DownloadFileSync( '', url, 'fetchpkg.spkg' );

    let data = yield fsPromise.readFile('fetchpkg.spkg');
    let text = data.toString();

    function fetchDataToJson(dataType, postfix) {
        let head = '"/i/' + dataType + '/' + guid + postfix + '"';
        let end = '};';

        let token = text.indexOf(head);
        if (token !== -1) {
            let tokenend = text.indexOf(end, token + 1);
            if (tokenend !== -1) {
                let jsondata = text.substr(token, tokenend - token + 1);
                let headjson = jsondata.indexOf('{');
                let purejsondata = jsondata.substr(headjson);
                return JSON.parse(purejsondata);
            }
        }
    }

    function fetchImageData( baseObj,  guid ) {
        if( baseObj.results )
        {
            for( var obj in baseObj.results ) {
                let texobj = baseObj.results[obj];

                if(texobj.uid === guid)
                {
                    return texobj;
                }
            }
        }
    }

    let modelData = fetchDataToJson('models', '');
    let texData = fetchDataToJson('models', '/textures');

    // combine texData to modelData
    let materials = modelData.options.materials;
    if(materials)
    {
        for( var mat in materials ) {
            let matobj = materials[mat];

            if( typeof(matobj) === 'object')
            {
                let channels = matobj.channels;
                for( let chan in channels)
                {
                    let chanobj = channels[chan];
                    if(chanobj && chanobj.texture)
                    {
                        let dataNode = fetchImageData( texData, chanobj.texture.uid );
                        chanobj.texture.image = dataNode;
                    }
                }

            }
        }
    }

    //console.info(modelData);
    let formattedJson = JSON.stringify(modelData);

    function formatName(str) {
        let ret = str.replace(/"/g, "");
        ret = ret.replace(/\|/g, "");
        ret = ret.replace(/ /g, "");
        return ret;
    }

    yield fsPromise.writeFile( 'res/package/' + formatName(modelData['name']) + '.spkg' , formattedJson);

    console.info(modelData['name'] + ' downloaded.');
});

packageBuilder.fetchCollection = Promise.coroutine(function* (url) {

    let multiplier = 0;

    while(true) {


        yield fsPromise.unlink('fetch.collection');
        yield packageBuilder.DownloadFileSync( '', url + '?cursor=' + (24 * multiplier), 'fetch.collection' );

        multiplier++;

        // parse collection into urls
        let data = yield fsPromise.readFile('fetch.collection');
        let text = data.toString();

        let urlProcessed = 0;

        let token = text.indexOf('"viewerUrl"');
        while(token !== -1)
        {
            let nextDouHao = text.indexOf(',', token + 1);
            let url = text.substr(token + 14, nextDouHao - token - 15);
            token = text.indexOf('"viewerUrl"', token + 1);

            urlProcessed++;
            yield packageBuilder.fetchSinglePkg(url);
            //console.info(url);
            //yield Promise.delay(500);
        }

        if(urlProcessed === 0)
        {
            break;
        }
    }


});

