'use strict';

var renderer = renderer || {};

renderer.quadIBO = null;
renderer.quadVBO = null;
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


    var sphere = math.mesh.sphere(24,24,1.0,[1,1,1,1]);
    // resource object
    this.quadMesh = glw.createMeshObject(sphere.position, sphere.index, [glw.VERTEX_LAYOUT_P, glw.VERTEX_LAYOUT_T0, glw.VERTEX_LAYOUT_N]);
    this.quadProgram = glw.createProgramObject(vsp, fsp);//glw._create_program(vs, ps);
    if(this.quadProgram == null)
    {
        console.warn('program create failed.');
    }
}

renderer.render = function() {

    var runTime = Date.now() - this.timer;

    // clear with a red color
    glw.clear([0.7, 0.1, 0.1, 1.0], 1.0);
    glw.viewport(0,0,glw.canvas.width, glw.canvas.height);

    glw.gl.enable(glw.gl.DEPTH_TEST);
    glw.gl.depthFunc(glw.gl.LEQUAL);

    // simple draw a quad
    this.quadProgram.use();

    // global time uniform
    glw.set_uniform1f("_TIME", runTime * 0.001);

    var vMatrix = math.mat4.identity(math.mat4.create());
    var pMatrix = math.mat4.identity(math.mat4.create());
    var vpMatrix = math.mat4.identity(math.mat4.create());

    var sinx = Math.sin(runTime * 0.005) * 5.0;
    var cosz = Math.cos(runTime * 0.005) * 5.0;

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

    // mesh draw
    this.quadMesh.bind();
    this.quadMesh.draw();
}

var vsp = "\
attribute vec2 texcoord;\
attribute vec3 normal;\
attribute vec3 position;\
uniform mat4 _MVP;\
\
\
varying vec2 vTexCoord;\
varying vec3 vNormal;\
\
void main(){\
\
    vTexCoord = ((position + 1.0) * 0.5).xy;\
    vTexCoord = texcoord;\
    vNormal = normal;\
    /*gl_Position = vec4(position, 1.0);*/\
    gl_Position = _MVP * vec4(position, 1.0);\
}\
";

var fsp = "precision mediump float;\
uniform sampler2D texture;\
varying vec2 vTexCoord;\
varying vec3 vNormal;\
\
\
uniform float _TIME;\
float frac(float t)\
{\
    return t - floor(t);\
}\
void main(){\
    vec4 samplerColor1 = vec4(frac(vTexCoord.x + _TIME),frac(vTexCoord.y + _TIME),0,1);\
    vec4 samplerColor = vec4(vNormal * vec3(0.5,0.5,0.5) + vec3(0.5,0.5,0.5),1);\
    samplerColor.a = 1.0;\
    gl_FragColor = samplerColor;\
}\
";

/**
 * Created by kaimingyi on 2016/11/7.
 */
