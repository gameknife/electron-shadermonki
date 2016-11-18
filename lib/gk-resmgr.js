/**
 * Created by kaimingyi on 14/11/2016.
 */
const logger = require('./gk-logger.js');
const path = require('path');
const loader_fbx = require('./loader/loader-fbx.js');
const glw = require('./gk-glwrap.js');

// type define
var RESTYPE = RESTYPE || {};
RESTYPE.INVALID = 0;
RESTYPE.MESH = 1;
RESTYPE.TEXTURE = 2;

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
        loader_fbx.load( this.filetoken, function(res) {
            ref.glmeshobject = glw.createMeshObject(res[0].vbo, res[0].ibo, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
            let timeelapsed = Date.now() - timestamp;
            logger.info('Mesh ' + ref.filetoken + ' loaded in ' + timeelapsed + 'ms.');
        } );
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
                    return new MeshResObj(token);
                    break;
                case 'jpg':
                case 'png':
                    return new TextureResObj(token);
                    break;
            }
        }

        return null;
    }
}
const gResmgr = new BaseResMgr();

module.exports = {RESTYPE, BaseResMgr, BaseResObj, gResmgr};