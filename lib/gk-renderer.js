/**
 * Created by gameKnife on 2016/12/1.
 */
const glw = require("./gk-glwrap");
const fixedshader = require("./gk-fixedshader");
const resMgr = require("./gk-resmgr");
const math = require("gl-matrix");
const gTimer = require("./gk-timer");
const mouse = require("./gk-mouseorbit");


const GameObject = require("./gk-gameobject.js");
const Component = require("./gk-component.js");

class RenderQueue {
    constructor( _depth ) {
        this.depth = _depth;
        this.meshRenderers = [];

        // per queue uniform unit: { KEY: "_MVP", VALUE: mat4 / vec4 / etc }
        this.uniformPerQueue = new Map();
    }

    setupCamera( cam ) {

        // TODO: add cam param later
        let camts = cam.host.transform;

        let cameraPosition = camts.position;
        let cameraUpDirection = camts.up;
        let cameraForwardDirection = math.vec3.negate(math.vec3.create(), camts.forward);
        let centerPoint = math.vec3.add( math.vec3.create(), cameraPosition, cameraForwardDirection );

        let projMatrix = math.mat4.perspective(math.mat4.create(), 45, 1.0, 0.5, 5000.0);
        let viewMatrix = math.mat4.lookAt(math.mat4.create(), cameraPosition, centerPoint, cameraUpDirection);
        let vpMatrix = math.mat4.multiply(math.mat4.create(), projMatrix, viewMatrix);

        this.uniformPerQueue.set("_PROJ", projMatrix );
        this.uniformPerQueue.set("_VIEW", viewMatrix );
        this.uniformPerQueue.set("_VIEWPROJ", vpMatrix );

    }

    setupLight( light ) {

        let lightDir = light.host.transform.forward;
        this.uniformPerQueue.set("_LIGHTDIR", lightDir);

    }

    clear() {
        this.meshRenderers = [];
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
            func( this.meshRenderers[i], this );
        }
    }
}

// singleton
let instance = null;

class Renderer {
    constructor() {
        if(!instance){
            instance = this;

            this.bgMesh = null;
            this.bgProgram = null;
            this.noiseProgram = null;

            this.quadMesh = null;
            this.quadProgram = null;
            this.quadTexture = null;

            this.simBackBuffer = null;

            this.overrideProgram = null;

            this.renderQueues = new Map();
        }

        return instance;
    }

    init() {

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
        this.bgMesh.draw();

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
        this.bgMesh.draw();




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

    renderSingleRenderer( renderer, queue ) {
        if( renderer instanceof Component.MeshRenderer )
        {
            // grab matrix
            let vpMatrix = queue.uniformPerQueue.get("_VIEWPROJ");

            //renderer.host.transform._localToWorldMatrx;
            let mMatrix = renderer.host.transform.localToWorldMatrix;


            // set material
            let mat = renderer.material;

            // set global shader
            if(instance.overrideProgram !== null) {
                instance.overrideProgram.use();
            }

            let lightDir = queue.uniformPerQueue.get("_LIGHTDIR");
            if(lightDir)
            {
                lightDir[3] = 0;
                glw.set_uniform4f("_LIGHTDIR", lightDir);
            }

            glw.bind_texture( mat.mainTex.gltextureobject, 0 );
            glw.bind_texture( mat.opacityMapTex.gltextureobject, 1 );

            glw.set_uniform4x4fv("_MVP", math.mat4.mul(math.mat4.create(), vpMatrix, mMatrix));
            glw.set_uniform4x4fv("_M2W", mMatrix);

            // extract meshfilter
            let mf = renderer.host.components.get(Component.MeshFilter);

            // render
            //console.info(mf);

            if( mf.mesh !== null ) {
                //console.info(mf.mesh);
                mf.mesh.draw();
            }
        }
    }
}

module.exports = Renderer;