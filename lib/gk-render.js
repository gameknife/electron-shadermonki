'use strict';

var renderer = renderer || {};

renderer.quadIBO = null;
renderer.quadVBO = null;
renderer.quadProgram = null;


renderer.init = function() {

    this.quadVBO = null;
    this.quadIBO = null;
    this.quadProgram = null;

    // test for quad vertex data
    var quadPosition = [
        -0.7,  0.7,  0.0,
        0.7,  0.7,  0.0,
        -0.7, -0.7,  0.0,
        0.7, -0.7,  0.0
    ];

    var quadIndex = [
        0, 1, 2, 2, 1, 3
    ];

    this.quadVBO = [glw.create_vbo(quadPosition)];
    this.quadIBO = glw.create_ibo(quadIndex);

    var vs = glw.create_shader_from_source(vsp, glw.gl.VERTEX_SHADER);
    var ps = glw.create_shader_from_source(fsp, glw.gl.FRAGMENT_SHADER);

    this.quadProgram = glw.create_program(vs, ps);
    if(this.quadProgram == null)
    {
        console.warn('program create failed.');
    }
}

renderer.render = function() {

    // clear with a red color
    glw.clear([0.7, 0.1, 0.1, 1.0], 1.0);
    glw.viewport(0,0,glw.canvas.width, glw.canvas.height);

    // simple draw a quad
    glw.use_program(this.quadProgram);
    glw.bind_draw_buffer(this.quadVBO, this.quadIBO);
    glw.draw_elements(glw.gl.TRIANGLES, 2*3);

}

var vsp = "attribute vec3 position;\
varying vec2 vTexCoord;\
void main(){\
    vTexCoord = ((position + 1.0) * 0.5).xy;\
    gl_Position = vec4(position, 1.0);\
}\
";

var fsp = "precision mediump float;\
uniform sampler2D texture;\
varying vec2 vTexCoord;\
void main(){\
    vec4 samplerColor = vec4(vTexCoord.x,vTexCoord.y,0,1);\
    gl_FragColor = samplerColor;\
}\
";

/**
 * Created by kaimingyi on 2016/11/7.
 */
