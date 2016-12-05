/**
 * Created by gameKnife on 2016/12/1.
 */
const glw = require("./gk-glwrap");
const fixedshader = require("./gk-fixedshader");
const resMgr = require("./gk-resmgr");
const math = require("gl-matrix");
const gTimer = require("./gk-timer");
const mouse = require("./gk-mouseorbit");

const gkCore = require("./gk-core.js");

class RenderQueue {
    constructor( _depth ) {
        this.depth = _depth;
        this.meshRenderers = [];
    }

    setupCamera( cam ) {

    }

    clear() {
        meshRenderers = [];
    }

    addRenderer( mr ) {
        this.meshRenderers.push(mr);
    }

    sort() {
        // sort by material
    }

    // func: param0 - renderer
    traverse( func ) {

        for( let i=0, len = this.meshRenderers.length; i < len; ++i)
        {
            func( this.meshRenderers[i] );
        }
    }
}

class Renderer {
    constructor() {
        this.bgMesh = null;
        this.bgProgram = null;
        this.noiseProgram = null;

        this.quadMesh = null;
        this.quadProgram = null;
        this.quadTexture = null;

        this.simBackBuffer = null;

        this.renderQueues = new Map();
    }

    init() {
        // globalRender setup


        // initialize quad
        const quadPosition = [
            -1.0,  1.0,  1.0,   1.0, 0.0, 0.0,       0.0, 0.0,
            1.0,  1.0,  1.0,    1.0, 0.0, 0.0,       0.0, 1.0,
            -1.0, -1.0,  1.0,   1.0, 0.0, 0.0,       1.0, 0.0,
            1.0, -1.0,  1.0,    1.0, 0.0, 0.0,       1.0, 1.0,
        ];
        const quadIndex = [
            0, 1, 2, 2, 1, 3
        ];
        let res = null;
        let ibo = {};
        ibo.trilist =  quadIndex;
        res = {vbo: quadPosition, ibo: ibo };
        this.bgMesh = glw.createMeshObject(res, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);

        // initialize shader
        this.bgProgram = glw.createProgramObject(fixedshader.quadvsp, fixedshader.quadfsp);
        this.noiseProgram = glw.createProgramObject(fixedshader.quadvsp, fixedshader.noisefsp);

        // initialize render texture
        this.simBackBuffer = resMgr.gResmgr.create_render_texture(1024, 1024);
        this.simBackBuffer.load();
    }

    render() {


        // render queue sorting
        for (let queue of this.renderQueues.values()) {
            queue.sort();
        }


        // bind drawing fbo
        glw.gl.bindFramebuffer(glw.gl.FRAMEBUFFER,  this.simBackBuffer.fbo );

        // clear with a grey color
        glw.clear([0.15, 0.15, 0.15, 1.0], 1.0);
        glw.viewport(0, 0, this.simBackBuffer.width, this.simBackBuffer.height);

        // set z enable
        glw.gl.enable(glw.gl.DEPTH_TEST);
        glw.gl.depthFunc(glw.gl.LEQUAL);
        glw.gl.disable(glw.gl.CULL_FACE);

        // render the noising background
        this.noiseProgram.use();
        glw.set_uniform1f("_TIME", gTimer.runTime * 0.001);
        this.bgMesh.bind();
        this.bgMesh.draw(0,0);

        // main render process

        // for every render queue
        for (let queue of this.renderQueues.values()) {

            // setup queue basic parameter

            queue.traverse( this.renderSingleRenderer );
        }

        glw.gl.bindFramebuffer(glw.gl.FRAMEBUFFER, null );
        // clear with a grey color
        glw.clear([0.15, 0.15, 0.15, 1.0], 1.0);
        glw.viewport(0, 0, glw.canvas.width, glw.canvas.height);

        this.bgProgram.use();
        glw.set_uniform1f("_TIME", gTimer.runTime * 0.001);
        glw.bind_texture( this.simBackBuffer.gltextureobject, 0 );
        this.bgMesh.bind();
        this.bgMesh.draw(0, 0);




        // render queue clear
        for (let queue of this.renderQueues.values()) {
            queue.clear();
        }
    }

    destroy() {

    }

    getOrCreateRenderQueue( depth ) {
        if( !this.renderQueues.has( depth ) )
        {
            this.renderQueues.set( depth, new RenderQueue( depth ));
        }

        return this.renderQueues.get( depth );
    }

    renderSingleRenderer( renderer ) {
        if( renderer instanceof gkCore.Component.MeshRenderer )
        {
            // set material
            let mat = renderer.material;

            // extract meshfilter
            let mf = renderer.host.components.get(gkCore.Component.MeshFilter);

            // render

        }
    }
}

module.exports = Renderer;