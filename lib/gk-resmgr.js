/**
 * Created by kaimingyi on 14/11/2016.
 */
const logger = require('./gk-logger.js');
const path = require('path');
const loader_fbx = require('./loader/loader-fbx.js');
const loader_osgjs = require('./loader/loader-osgjs.js');
const glw = require('./gk-glwrap.js');

// type define
var RESTYPE = RESTYPE || {};
RESTYPE.INVALID = 0;
RESTYPE.MESH = 1;
RESTYPE.TEXTURE = 2;
RESTYPE.TEXT = 3;
RESTYPE.MATERIAL = 4;

// base class obj
class BaseResObj {
    constructor(token) {
        this.filetoken = token;
        this.loaded = false;
        this.type = RESTYPE.INVALID;
        this.dynamic = false;
    }

    get_type() {
        return this.type;
    }

    load() {
        if( !this.loaded )
        {
            this.loadimpl();
        }
        this.loaded = true;
    }

    unload() {
        if(this.loaded)
        {
            this.unloadimpl();
        }
        this.loaded = false;
    }
}

class MaterialResObj extends BaseResObj {

}

class MeshResObj extends BaseResObj {
    constructor(token) {
        super(token);
        this.type = RESTYPE.MESH;
        this.glmeshobject = null;
    }

    loadimpl() {
        // load fbx tmp
        let ref = this;

        let timestamp = Date.now();


        let ext = getFileExtension(this.filetoken);

        switch (ext)
        {
            case 'fbx':

                loader_fbx.load( this.filetoken, function(res) {

                    res.forEach( item => {

                        item.mainMaterial = glw.createMaterialObject();

                        let texres = gResmgr.get_res('res/texture/white.jpg');
                        item.mainMaterial.mainTex = texres;
                        item.mainMaterial.opacityMapTex = texres;

                    });
                    ref.glmeshobject = glw.createMeshObject(res, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
                    let timeelapsed = Date.now() - timestamp;
                    logger.info('Mesh ' + ref.filetoken + ' loaded in ' + timeelapsed + 'ms.');
                } );

                break;
            case 'osgjs':

                loader_osgjs.load( this.filetoken, this.filetoken + '.bin',function(res) {

                    //console.info(res);

                    // load texture in res

                    res.forEach( item => {

                        if(item.mainMaterial)
                        {

                            if( item.mainMaterial.mainTexPath && item.mainMaterial.mainTexPath !== null )
                            {
                                let textoken = item.mainMaterial.mainTexPath;
                                let texres = gResmgr.get_res(textoken);
                                item.mainMaterial.mainTex = texres;
                            }

                            if( item.mainMaterial.lightMapTexPath && item.mainMaterial.lightMapTexPath !== null )
                            {
                                let textoken = item.mainMaterial.lightMapTexPath;
                                let texres = gResmgr.get_res(textoken);
                                item.mainMaterial.lightMapTex = texres;
                            }

                            if( item.mainMaterial.opacityMapTexPath && item.mainMaterial.opacityMapTexPath !== null )
                            {
                                let textoken = item.mainMaterial.opacityMapTexPath;
                                let texres = gResmgr.get_res(textoken);
                                item.mainMaterial.opacityMapTex = texres;
                            }
                        }

                    });

                    //console.info(res);

                    ref.glmeshobject = glw.createMeshObject(res, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
                    let timeelapsed = Date.now() - timestamp;
                    logger.info('Mesh ' + ref.filetoken + ' loaded in ' + timeelapsed + 'ms.');
                } );

                break;
        }


    }

    unloadimpl() {
        // release
    }
}

class TextureResObj extends BaseResObj {
    constructor(token) {
        super(token);
        this.type = RESTYPE.TEXTURE;
        this.gltextureobject = null;
        this.width = 0;
        this.height = 0;
    }

    loadimpl() {

        let ref = this;

        let img = new Image();
        this.image = img;
        let timestamp = Date.now();

        img.onload = function () {
            ref.gltextureobject = glw._create_bind_texture(img);
            let timeelapsed = Date.now() - timestamp;
            logger.info('Texture ' + ref.filetoken + ' loaded in ' + timeelapsed + 'ms.');

            this.width = img.width;
            this.height = img.height;
        };

        // trigger loading
        img.src = this.filetoken;
    }

    unloadimpl() {
        // TODO
    }
}

class RenderTextureResObj extends TextureResObj {
    constructor(_width, _height) {

        let token = "dyn_" + gResmgr.dynamicTokenId;
        gResmgr.dynamicTokenId++;

        super(token);
        this.dynamic = true;
        this.width = _width;
        this.height = _height;

        this.fbo = null;
        this.depth = null;
    }

    loadimpl() {
        let ret = glw._create_framebuffer(this.width, this.height);
        if(ret !== null)
        {
            this.gltextureobject = ret.rendertexture;
            this.fbo = ret.framebuffer;
            this.depth = ret.depthRenderbuffer;
        }

    }

    unloadimpl() {
        // TODO
    }
}

class TextResObj extends BaseResObj {
    constructor(token) {
        super(token);
        this.type = RESTYPE.TEXT;
    }

    loadimpl() {

    }

    unloadimpl() {

    }
}

function getFileExtension(filename) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
}

class BaseResMgr {

    constructor() {
        this.resrefs = new Map();
        this.dynamicTokenId = 0;
    }

    add_res(token) {

        if (this.resrefs.has(token)) {
            logger.error('Duplicate res added: ' + token);
            return;
        }

        let retRes = this.create_res_type_by_token(token);
        if (retRes !== null) {
            this.resrefs.set(token, retRes);
        }

        return retRes;
    }

    get_res(token) {
        token = path.normalize(token);
        return this.resrefs.get(token);
    }

    create_render_texture( _width, _height ) {
        let retRes = new RenderTextureResObj(_width, _height);
        if (retRes !== null) {
            this.resrefs.set(retRes.filetoken, retRes);
        }
        return retRes;
    }

    create_dyn_res_by_type(type) {
        switch (type) {
            case RESTYPE.MESH:
                return new MeshResObj(token);
                break;
            case RESTYPE.TEXTURE:
                return new TextureResObj(token);
                break;
        }
        return null;
    }

    create_res_type_by_token(token) {

        let ext = getFileExtension(token);

        if (ext !== undefined) {
            ext = ext.toLowerCase();
            switch (ext) {
                case 'fbx':
                case 'osgjs':
                    return new MeshResObj(token);
                    break;
                case 'jpg':
                case 'png':
                    return new TextureResObj(token);
                    break;
                case 'glsl':
                case 'js':
                    return new TextResObj(token);
                    break;
            }
        }

        return null;
    }
}
const gResmgr = new BaseResMgr();

module.exports = {RESTYPE, BaseResMgr, BaseResObj, gResmgr};