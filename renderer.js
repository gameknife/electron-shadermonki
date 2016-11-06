// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// initial
window.onload = function(){
    win = window;
    var canvas = bid('canvas');
    glw = window.parent.glw;
    glw.initGL(canvas);
    if(!glw.ready){console.log('initialize error'); return;}

    // clear with a red color
    glw.clear([0.7, 0.1, 0.1, 1.0], 1.0);
};

function bid(id){return document.getElementById(id);}