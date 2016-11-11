'use strict';

var renderer = renderer || {};

renderer.quadMesh = null;
renderer.quadProgram = null;
renderer.timer = 0;

renderer.init = function() {

    // abs time of start
    this.timer = Date.now();

    // test for quad vertex data
    var quadPosition = [
        -0.7,  0.7,  0.0,   1.0, 0.0, 0.0,       0.0, 0.0,
        0.7,  0.7,  0.0,    1.0, 0.0, 0.0,       0.0, 1.0,
        -0.7, -0.7,  0.0,   1.0, 0.0, 0.0,       1.0, 0.0,
        0.7, -0.7,  0.0,    1.0, 0.0, 0.0,       1.0, 1.0,
    ];

    var quadIndex = [
        0, 1, 2, 2, 1, 3
    ];
    //this.quadMesh = glw.createMeshObject(quadPosition, quadIndex, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);

    // create a procedural sphere
    var sphere = math.mesh.sphere(24,24,1.0,[1,1,1,1]);

    // hardware resource object
    this.quadMesh = glw.createMeshObject(sphere.position, sphere.index, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
    //this.quadProgram = glw.createProgramObject(vsp, fsp);//glw._create_program(vs, ps);
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

    // setup mvp frame
    var vMatrix = math.mat4.identity(math.mat4.create());
    var pMatrix = math.mat4.identity(math.mat4.create());
    var vpMatrix = math.mat4.identity(math.mat4.create());

    var sinx = Math.sin(runTime * 0.002) * 5.0;
    var cosz = Math.cos(runTime * 0.002) * 5.0;

    var cameraPosition = [sinx, 0.0, cosz];
    var cameraUpDirection = [0.0, 1.0, 0.0];
    var centerPoint = [0.0, 0.0, 0.0];

    var camera = math.camera.create(
        cameraPosition,
        centerPoint,
        cameraUpDirection,
        45, 1.0, 0.5, 1000.0
    );
    math.mat4.vpFromCamera(camera, vMatrix, pMatrix, vpMatrix);
    glw.set_uniform4x4fv("_MVP", vpMatrix);

    // set a lightdir
    var lightDir = [-0.3,0.8,0,1];
    lightDir = math.vec3.normalize(lightDir);
    glw.set_uniform4f("_LIGHTDIR", lightDir);

    // mesh draw
    this.quadMesh.bind();
    this.quadMesh.draw();
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
