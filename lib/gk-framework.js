/**
 * Created by gameKnife on 2016/12/1.
 */
'use strict';
const Renderer = require("./gk-renderer.js");
const SceneMgr = require("./gk-scenemgr");
const gTimer = require("./gk-timer.js");
const GameObject = require("./gk-gameobject.js");
const Component = require("./gk-component.js");
const Fabricate = require("./fabricate.js");

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

        this.renderer = new Renderer();
        this.renderer.init();

        this.sceneMgr = new SceneMgr();
        this.sceneMgr.init();

        this.mainCamera = Fabricate(GameObject.Camera);

        this.mainCamera.transform.parent = this.sceneMgr.getSceneRoot().transform;
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