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
        this.mainCamera.transform.lookAt( gkCore.math.vec3.fromValues(0,0,0) );


        this.mainLight = Fabricate(gkCore.GameObject.Light);
        this.mainLight.transform.position = gkCore.math.vec3.fromValues(-10,15,10);
        this.mainLight.transform.lookAt( gkCore.math.vec3.fromValues(0,0,0) );

        this.mainLight.transform.parent = this.sceneMgr.getSceneRoot().transform;

        // load a mesh into gameobject struct
        let tmpMesh = resMgr.gResmgr.get_res("res/package/Archer/model.osgjs");
        tmpMesh.load();

        // bind it to scene root
        tmpMesh.gameObject.transform.parent = this.sceneMgr.getSceneRoot().transform;

        // create editor
        let refthis = this;

        let vseditor = new acEditor.AceEditorWindow("vs-editor-panel");
        vseditor.setChangeCallback( function(str) {
            refthis.vsp_source = str;
            refthis.updateShader();
        } )

        let fseditor = new acEditor.AceEditorWindow("fs-editor-panel");
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
        let relDelta = gkCore.mouse.frameUpdate();

        this.camerarotation -= relDelta.x * 0.005;

        let sinx = Math.sin(this.camerarotation) * 400.0;
        let cosz = Math.cos(this.camerarotation) * 400.0;

        this.mainCamera.transform.position = gkCore.math.vec3.fromValues(sinx,25,cosz);
        this.mainCamera.transform.lookAt( gkCore.math.vec3.fromValues(0,25,0) );

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