/**
 * Created by kaimingyi on 14/11/2016.
 */
const logger = require('./gk-logger.js');
const path = require('path');

var RESTYPE = RESTYPE || {};

RESTYPE.INVALID = 0;
RESTYPE.MESH = 1;
RESTYPE.TEXTURE = 2;

class BaseResObj {
    constructor(token) {
        this.filetoken = token;
        this.loaded = false;
        this.type = RESTYPE.INVALID;
    }

    get_type() {
        return this.type;
    }

    load() {
        this.loaded = true;
    }

    unload() {
        this.loaded = false;
    }
}

class MeshResObj extends BaseResObj {
    constructor(token) {
        super(token);
        this.type = RESTYPE.MESH;
    }

    load() {
        super.load();
    }

    unload() {
        super.unload();
    }
}

class TextureResObj extends BaseResObj {
    constructor(token) {
        super(token);
        this.type = RESTYPE.TEXTURE;
    }

    load() {
        super.load();
    }

    unload() {
        super.unload();
    }
}

function getFileExtension(filename) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
}

class BaseResMgr {

    constructor() {
        this.resrefs = new Map();
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
    }

    get_res(token) {
        return this.resrefs.get(token);
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