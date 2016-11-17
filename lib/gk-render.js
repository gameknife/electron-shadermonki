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
renderer.quadTexture = null;


renderer.timer = 0;
renderer.modelrotation = 0;
renderer.camerarotation = 0;

renderer.autoRotate = false;

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
    this.bgProgram = glw.createProgramObject(quadvsp, quadfsp);//glw._create_program(vs, ps);

    // create a procedural sphere
    const sphere = math.mesh.sphere(24,24,1.0,[1,1,1,1]);

    //his.updateMesh( 'res/mesh/head.fbx' );
}

renderer.lastFrameTime = 0;

renderer.render = function() {

    // time calc
    var runTime = Date.now() - this.timer;
    var deltaTime = runTime - this.lastFrameTime;
    this.lastFrameTime = runTime;

    // clear with a grey color
    glw.clear([0.15, 0.15, 0.15, 1.0], 1.0);
    glw.viewport(0, 0, glw.canvas.width, glw.canvas.height);

    // set z enable
    glw.gl.enable(glw.gl.DEPTH_TEST);
    glw.gl.depthFunc(glw.gl.LEQUAL);

    this.bgProgram.use();
    glw.set_uniform1f("_TIME", runTime * 0.001);

    this.bgMesh.bind();
    this.bgMesh.draw();

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

    if(this.autoRotate)
    {
        this.modelrotation += deltaTime * 0.001;
    }

    this.camerarotation += relDelta.y * 0.005;
    this.camerarotation = Math.max( -glw.PI * 0.5, Math.min(glw.PI * 0.5, this.camerarotation) );

    var sinx = Math.sin(this.camerarotation) * 60.0;
    var cosz = Math.cos(this.camerarotation) * 60.0;

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

    if( this.quadTexture !== null && this.quadTexture.gltextureobject != null )
    {
        glw.bind_texture( this.quadTexture.gltextureobject, 0 );
    }

    // mesh draw
    if(this.quadMesh != null && this.quadMesh.glmeshobject != null)
    {
        this.quadMesh.glmeshobject.bind();
        this.quadMesh.glmeshobject.draw();
    }
}

renderer.updateShader = function (vsp, fsp) {
    this.quadProgram = glw.createProgramObject(vsp, fsp);//glw._create_program(vs, ps);
    if(this.quadProgram !== null)
    {
        logger.info('shader update successfully.');
    }
}

renderer.updateMesh = function ( meshresobj ) {
    if( meshresobj !== null )
    {
        this.quadMesh = meshresobj;
    }
}

renderer.updateTexure = function ( texobj ) {
    if( texobj !== null )
    {
        this.quadTexture = texobj;
    }
}

var quadvsp = "attribute vec3 position;\
varying vec2 vTexCoord;\
void main(){\
    vTexCoord = ((position + 1.0) * 0.5).xy;\
    gl_Position = vec4(position, 1.0);\
}\
";

var quadfsp = "precision mediump float;\
uniform sampler2D texture;\
varying vec2 vTexCoord;\
uniform float _TIME;\
float snoise(vec2 co){\
return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\
}\
void main(){\
    float noise = fract(_TIME);\
    vec4 samplerColor = vec4(0.3,0.3,0.3,1.0);\
    float vignette = 1.0 - length((vTexCoord.xy - vec2(0.5,0.5)) * vec2(1.5, 1.5));\
    samplerColor *= vignette;\
    samplerColor += snoise(vTexCoord.xy + vec2(noise,noise)) * 0.04;\
    gl_FragColor = samplerColor;\
}\
";

/**
 * Created by kaimingyi on 2016/11/7.
 */
