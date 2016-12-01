/**
 * Created by gameKnife on 2016/12/1.
 */
'use strict';
const Renderer = require("./gk-renderer.js");
const gTimer = require("./gk-timer.js");

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

        this.modelrotation = 0;
        this.camerarotation = 0;

        this.autoRotate = false;
    }

    init() {
        gTimer.init();

        this.renderer = new Renderer();
        this.renderer.init();
    }

    update() {
        gTimer.update();

        this.renderer.render();
    }

    destory() {

    }
}

module.exports = ShaderMonkiFramework;