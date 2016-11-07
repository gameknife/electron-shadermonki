'use strict';

var glw = glw || {};

// const
glw.VERSION = '0.1';
glw.PI2  = 6.28318530717958647692528676655900576;
glw.PI   = 3.14159265358979323846264338327950288;
glw.PIH  = 1.57079632679489661923132169163975144;
glw.PIH2 = 0.78539816339744830961566084581987572;

// member
glw.ready = false;
glw.canvas = null;
glw.gl = null;

glw.curr_program = null;

// method

// initialize webgl
glw.initGL = function(canvasId, options){
    this.ready = false;
    this.canvas = null;
    this.gl = null;

    if(Object.prototype.toString.call(canvasId) === '[object String]'){
        this.canvas = document.getElementById(canvasId);
    }else{
        if(Object.prototype.toString.call(canvasId) === '[object HTMLCanvasElement]'){
            this.canvas = canvasId;
        }
    }

    var opt = options || {};
    if(this.canvas == null){return false;}
    this.gl = this.canvas.getContext('webgl', opt)
           || this.canvas.getContext('experimental-webgl', opt);

    if(this.gl != null){
        this.ready = true;
    }

    return this.ready;
};

// glclear
glw.clear = function(color, depth, stencil){
    var gl = this.gl;
    var flg = gl.COLOR_BUFFER_BIT;
    gl.clearColor(color[0], color[1], color[2], color[3]);
    if(depth != null){
        gl.clearDepth(depth);
        flg = flg | gl.DEPTH_BUFFER_BIT;
    }
    if(stencil != null){
        gl.clearStencil(stencil);
        flg = flg | gl.STENCIL_BUFFER_BIT;
    }
    gl.clear(flg);
};

// glviewport
glw.viewport = function(x, y, width, height){
    var X = x || 0;
    var Y = y || 0;
    var w = width  || window.innerWidth;
    var h = height || window.innerHeight;
    this.gl.viewport(X, Y, w, h);
};

// dp
glw.draw_arrays = function(primitive, vertexCount){
    this.gl.drawArrays(primitive, 0, vertexCount);
};

// dip
glw.draw_elements = function(primitive, indexLength){
    this.gl.drawElements(primitive, indexLength, this.gl.UNSIGNED_SHORT, 0);
};

// gen & bind vbo data
// TODO: managed later
glw.create_vbo = function(data){
    if(data == null){return;}
    var vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    return vbo;
};

// gen & bind ibo data
// TODO: managed later
glw.create_ibo = function(data){
    if(data == null){return;}
    var ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
}

// create shader
glw.create_shader_from_source = function(source, type){
    var shader, msg;
    switch(type){
        case this.gl.VERTEX_SHADER:
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);
            break;
        case this.gl.FRAGMENT_SHADER:
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            break;
        default :
            return;
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
        return shader;
    }else{
        msg = this.gl.getShaderInfoLog(shader);
        alert(msg);
        console.warn('compile failed of shader: ' + msg);
    }
};

// create program
glw.create_program = function(vs, fs){
    var program = this.gl.createProgram();
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);
    if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
        this.gl.useProgram(program);
        return program;
    }else{
        console.warn('link program failed: ' + this.gl.getProgramInfoLog(program));
        return null;
    }
};

// use program
glw.use_program = function(prg){
    this.gl.useProgram(prg);
    this.curr_program = prg;
};

// buffer bind
glw.bind_draw_buffer = function(vbo, ibo){
    for(var i in vbo){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
        this.gl.enableVertexAttribArray(0);
        // a quad, 4 x 3 x 4(4xfloat3)
        this.gl.vertexAttribPointer(0,3,this.gl.FLOAT,false,0,0);
    }
    if(ibo != null){this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);}
};

glw.set_uniform1f = function(name, fvalue)
{
    if(this.curr_program != null) {
        var loc = this.gl.getUniformLocation(this.curr_program, name);
        if (loc != -1) {
            this.gl.uniform1f(loc, fvalue);
        }
    }
}
