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
