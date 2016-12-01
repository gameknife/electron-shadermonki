/**
 * Created by gameKnife on 2016/12/1.
 */
class GKTimer {
    constructor() {
        this.startUpTimer = 0.0;
        this.runTime = 0.0;
        this.lastFrameTime = 0.0;
        this.deltaTime = 0.0;
    }

    init() {
        this.startUpTimer = Date.now();
        this.lastFrameTime = this.startUpTimer;
    }

    update() {
        this.runTime = Date.now() - this.startUpTimer;
        this.deltaTime = this.runTime - this.lastFrameTime;
        this.lastFrameTime = this.runTime;
    }
}

const gTimer = new GKTimer();

module.exports = gTimer;