/**
 * Created by kaimingyi on 14/11/2016.
 */
const logger = require('./gk-logger.js');
const path = require('path');
const loader_fbx = require('./loader/loader-fbx.js');
const loader_osgjs = require('./loader/loader-osgjs.js');
const glw = require('./gk-glwrap.js');
const Fabricate = require('./fabricate');
const GameObject = require('./gk-gameobject');
const Component = require('./gk-component');
const math = require('gl-matrix');

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
        this.gameObject = null;
    }

    loadimpl() {
        // load fbx tmp
        let ref = this;

        let timestamp = Date.now();


        let ext = getFileExtension(this.filetoken);
        this.gameObject = Fabricate(GameObject.Base);

        switch (ext)
        {
            case 'fbx':

                loader_fbx.load( this.filetoken, function(res) {

                    // return a GameObject


                    res.forEach( item => {

                        // every submesh, create a GameObject
                        let submeshGO = Fabricate(GameObject.StaticMesh);

                        let mr = submeshGO.components.get(Component.MeshRenderer);
                        let mf = submeshGO.components.get(Component.MeshFilter);

                        mr.material = glw.createMaterialObject();
                        let texres = gResmgr.get_res('res/texture/white.jpg');
                        texres.load();
                        mr.material.mainTex = texres;
                        mr.material.opacityMapTex = texres;

                        mf.mesh = glw.createMeshObject( item, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);

                        submeshGO.transform.parent = ref.gameObject.transform;

                    });
                    //ref.glmeshobject = glw.createMeshObject(res, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
                    let timeelapsed = Date.now() - timestamp;
                    logger.info('Mesh ' + ref.filetoken + ' loaded in ' + timeelapsed + 'ms.');
                } );

                break;
            case 'osgjs':

                loader_osgjs.load( this.filetoken, this.filetoken + '.bin',function(res) {

                    //console.info(res);

                    // load texture in res

                    res.forEach( item => {

                        let submeshGO = Fabricate(GameObject.StaticMesh);

                        let mr = submeshGO.components.get(Component.MeshRenderer);
                        let mf = submeshGO.components.get(Component.MeshFilter);

                        let defaultres = gResmgr.get_res('res/texture/white.jpg');
                        defaultres.load();

                        if(item.mainMaterial)
                        {
                            mr.material = item.mainMaterial;

                            if( item.mainMaterial.mainTexPath && item.mainMaterial.mainTexPath !== null )
                            {
                                let textoken = item.mainMaterial.mainTexPath;
                                let texres = gResmgr.get_res(textoken);
                                texres.load();
                                item.mainMaterial.mainTex = texres;
                            }
                            else
                            {
                                item.mainMaterial.mainTex = defaultres;
                            }

                            if( item.mainMaterial.lightMapTexPath && item.mainMaterial.lightMapTexPath !== null )
                            {
                                let textoken = item.mainMaterial.lightMapTexPath;
                                let texres = gResmgr.get_res(textoken);
                                texres.load();
                                item.mainMaterial.lightMapTex = texres;
                            }
                            else
                            {
                                item.mainMaterial.lightMapTex = defaultres;
                            }

                            if( item.mainMaterial.opacityMapTexPath && item.mainMaterial.opacityMapTexPath !== null )
                            {
                                let textoken = item.mainMaterial.opacityMapTexPath;
                                let texres = gResmgr.get_res(textoken);
                                texres.load();
                                item.mainMaterial.opacityMapTex = texres;
                                console.info(textoken);
                            }
                            else
                            {
                                item.mainMaterial.opacityMapTex = defaultres;
                            }
                        }
                        else
                        {
                            mr.material = glw.createMaterialObject();
                            let texres = gResmgr.get_res('res/texture/white.jpg');
                            texres.load();
                            mr.material.mainTex = texres;
                            mr.material.opacityMapTex = texres;
                        }

                        mf.mesh = glw.createMeshObject( item, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
                        submeshGO.transform.parent = ref.gameObject.transform;

                        if(item.worldmatrix) {
                            let wmx = math.mat4.clone(item.worldmatrix);
                            let pos = math.mat4.getTranslation(math.vec3.create(), wmx);
                            let rot = math.mat4.getRotation(math.quat.create(), wmx);

                            math.mat4.getScaling = function (out, mat) {
                                var m11 = mat[0],
                                    m12 = mat[1],
                                    m13 = mat[2],
                                    m21 = mat[4],
                                    m22 = mat[5],
                                    m23 = mat[6],
                                    m31 = mat[8],
                                    m32 = mat[9],
                                    m33 = mat[10];

                                out[0] = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13);
                                out[1] = Math.sqrt(m21 * m21 + m22 * m22 + m23 * m23);
                                out[2] = Math.sqrt(m31 * m31 + m32 * m32 + m33 * m33);

                                return out;
                            };

                            let scale = math.mat4.getScaling(math.vec3.create(), wmx);

                            submeshGO.transform.localPosition = pos;
                            submeshGO.transform.localRotation = rot;
                            submeshGO.transform.localScale = scale;

                        }
                        else
                        {
                            // adjust yz
                            submeshGO.transform.localRotation = math.quat.rotateX( math.quat.create(), math.quat.create(), -Math.PI * 0.5 );
                        }


                    });

                    //ref.gameObject.transform.localRotation = math.quat.rotateX( math.quat.create(), math.quat.create(), -Math.PI * 0.5 );

                    //console.info(res);
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