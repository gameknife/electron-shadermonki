/**
 * Created by gameKnife on 2016/12/5.
 */
window.gkCore = exports;

exports.Component           = require('./gk-component.js');
exports.GameObject          = require('./gk-gameobject.js');
const Renderer              = require('./gk-renderer.js');
exports.renderer            = new Renderer();
const SceneMgr              = require('./gk-scenemgr.js');
exports.sceneMgr            = new SceneMgr();
exports.math                = require('gl-matrix');
exports.mouse               = require("./gk-mouseorbit.js");
const BaseResMgr            = require("./gk-resmgr").BaseResMgr;
exports.resMgr              = new BaseResMgr();
exports.mathext             = require("./util/gl-matrix-extension.js");