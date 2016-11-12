'use strict'
const path      = require('path')
const logger    = require('./lib/gk-logger.js');
const math      = require('./lib/gk-math.js');
const glw       = require('./lib/gk-glwrap.js');
const mouse     = require('./lib/gk-mouseorbit.js');

var renderer = renderer || {};

renderer.bgMesh = null;
renderer.bgProgram = null;

renderer.quadMesh = null;
renderer.quadProgram = null;
renderer.timer = 0;
renderer.modelrotation = 0;
renderer.camerarotation = 0;

renderer.init = function() {

    // abs time of start
    this.timer = Date.now();

    // test for quad vertex data
    const quadPosition = [
        -1.0,  1.0,  1.0,   1.0, 0.0, 0.0,       0.0, 0.0,
        1.0,  1.0,  1.0,    1.0, 0.0, 0.0,       0.0, 1.0,
        -1.0, -1.0,  1.0,   1.0, 0.0, 0.0,       1.0, 0.0,
        1.0, -1.0,  1.0,    1.0, 0.0, 0.0,       1.0, 1.0,
    ];

    const quadIndex = [
        0, 1, 2, 2, 1, 3
    ];

    this.bgMesh = glw.createMeshObject(quadPosition, quadIndex, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);

    // create a procedural sphere
    const sphere = math.mesh.sphere(24,24,1.0,[1,1,1,1]);

    // use fbx loader to load a fbx mesh
    loader_fbx.load( path.join(__dirname, 'res/mesh/head.fbx'), function(res) {
        renderer.quadMesh = glw.createMeshObject(res[0].vbo, res[0].ibo, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
    } );
}

renderer.render = function() {

    // time calc
    var runTime = Date.now() - this.timer;

    // clear with a grey color
    glw.clear([0.15, 0.15, 0.15, 1.0], 1.0);
    glw.viewport(0, 0, glw.canvas.width, glw.canvas.height);

    // set z enable
    glw.gl.enable(glw.gl.DEPTH_TEST);
    glw.gl.depthFunc(glw.gl.LEQUAL);

    if (this.quadProgram != null) {
        // use program
        this.quadProgram.use();
    }
    else
    {
        // use error shader
    }


    // global time uniform
    glw.set_uniform1f("_TIME", runTime * 0.001);

    var mMatrix = math.mat4.identity(math.mat4.create());

    // setup mvp frame
    var vMatrix = math.mat4.identity(math.mat4.create());
    var pMatrix = math.mat4.identity(math.mat4.create());
    var vpMatrix = math.mat4.identity(math.mat4.create());
    var mvpMatrix = math.mat4.identity(math.mat4.create());

    var relDelta = mouse.frameUpdate();



    this.modelrotation += relDelta.x * 0.005;
    this.camerarotation += relDelta.y * 0.005;
    this.camerarotation = Math.max( -glw.PI * 0.5, Math.min(glw.PI * 0.5, this.camerarotation) );

    var sinx = Math.sin(this.camerarotation) * 75.0;
    var cosz = Math.cos(this.camerarotation) * 75.0;

    math.mat4.rotate(mMatrix, this.modelrotation, [0,1,0], mMatrix);


    var cameraPosition = [0.0, 20.0 + sinx, cosz];
    var cameraUpDirection = [0.0, 1.0, 0.0];
    var centerPoint = [0.0, 20.0, 0.0];

    var camera = math.camera.create(
        cameraPosition,
        centerPoint,
        cameraUpDirection,
        45, 1.0, 0.5, 1000.0
    );
    math.mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);

    math.mat4.multiply(vpMatrix, mMatrix, mvpMatrix);


    glw.set_uniform4x4fv("_MVP", mvpMatrix);
    glw.set_uniform4x4fv("_M2W", mMatrix);

    // set a lightdir
    var lightDir = [-0.3,0.8,0.1,1];
    lightDir = math.vec3.normalize(lightDir);
    glw.set_uniform4f("_LIGHTDIR", lightDir);

    // mesh draw
    if(this.quadMesh != null)
    {
        this.quadMesh.bind();
        this.quadMesh.draw();
    }
}

renderer.updateShader = function (vsp, fsp) {
    this.quadProgram = glw.createProgramObject(vsp, fsp);//glw._create_program(vs, ps);
    if(this.quadProgram !== null)
    {
        logger.info('shader update successfully.');
    }
}

/**
 * Created by kaimingyi on 2016/11/7.
 */
