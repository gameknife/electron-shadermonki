/**
 * Created by gameKnife on 2016/12/1.
 */
'use strict';
const gTimer            = require("./gk-timer.js");
const Fabricate         = require("./fabricate.js");
const resMgr            = require('./gk-resmgr');

const gkCore            = require("./gk-core.js");
const acEditor          = require('./gk-acewrap');
const glw               = require("./gk-glwrap");

class Framework
{
    constructor() {

    }

    init() {

    }

    update() {

    }

    destroy() {

    }
}

class ShaderMonkiFramework extends Framework
{
    constructor() {
        super();

        this.renderer = null;
        this.sceneMgr = null;

        this.mainCamera = null;


        this.modelrotation = 0;
        this.camerarotation = 0;

        this.autoRotate = false;

        this.vsp_source = null;
        this.fsp_source = null;
    }

    init() {
        gTimer.init();

        this.renderer = gkCore.renderer;
        this.renderer.init();

        this.sceneMgr = gkCore.sceneMgr;
        this.sceneMgr.init();

        this.mainCamera = Fabricate(gkCore.GameObject.Camera);
        this.mainCamera.transform.parent = this.sceneMgr.getSceneRoot().transform;

        // temporary camera transform setting
        this.mainCamera.transform.position = gkCore.math.vec3.fromValues(0,15,50);
        this.mainCamera.transform.rotation = gkCore.math.quat.setAxisAngle(gkCore.math.quat.create(), gkCore.math.vec3.fromValues(0,1,0), Math.PI );

        // load a mesh into gameobject struct
        let tmpMesh = resMgr.gResmgr.get_res("res/mesh/head.fbx");
        tmpMesh.load();

        // bind it to scene root
        tmpMesh.gameObject.transform.parent = this.sceneMgr.getSceneRoot().transform;



        // create editor
        let refthis = this;

        var vseditor = new acEditor.AceEditorWindow("vs-editor-panel");
        vseditor.setChangeCallback( function(str) {
            refthis.vsp_source = str;
            refthis.updateShader();
        } )

        var fseditor = new acEditor.AceEditorWindow("fs-editor-panel");
        fseditor.setChangeCallback( function(str) {
            refthis.fsp_source = str;
            refthis.updateShader();
        } );

        // default assets loading
        vseditor.loadFile('res/shader/base_vs.glsl');
        fseditor.loadFile('res/shader/base_fs.glsl');

    }

    update() {
        gTimer.update();

        // update mouse

        this.sceneMgr.update();
        this.renderer.render();
    }

    destory() {

    }

    updateShader() {
        let program = glw.createProgramObject(this.vsp_source, this.fsp_source);
        this.renderer.overrideProgram = program;
    }
}

module.exports = ShaderMonkiFramework;