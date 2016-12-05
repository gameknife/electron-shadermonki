/**
 * Created by gameKnife on 2016/12/1.
 */
'use strict';
const gTimer            = require("./gk-timer.js");
const Fabricate         = require("./fabricate.js");
const resMgr            = require('./gk-resmgr');

const gkCore            = require("./gk-core.js");

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
    }

    init() {
        gTimer.init();

        this.renderer = gkCore.renderer;
        this.renderer.init();

        this.sceneMgr = gkCore.sceneMgr;
        this.sceneMgr.init();

        this.mainCamera = Fabricate(gkCore.GameObject.Camera);
        this.mainCamera.transform.parent = this.sceneMgr.getSceneRoot().transform;

        let tmpMesh = resMgr.gResmgr.get_res("res/mesh/head.fbx");
        tmpMesh.load();
        tmpMesh.gameObject.transform.parent = this.sceneMgr.getSceneRoot().transform;

        console.info(this.sceneMgr.getSceneRoot().transform);
        console.info(tmpMesh.gameObject.transform);
    }

    update() {
        gTimer.update();

        this.sceneMgr.update();
        this.renderer.render();
    }

    destory() {

    }
}

module.exports = ShaderMonkiFramework;