// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// initial
window.onload = function(){
    //win = window;
    var canvas = bid('canvas');
    glw = window.parent.glw;
    renderer = window.parent.renderer;

    glw.initGL(canvas);
    if(!glw.ready){console.log('initialize error'); return;}

    renderer.init();
    // create render loop
    requestAnimationFrame(render_loop);

    function render_loop()
    {
        renderer.render();
    }
};




function bid(id){return document.getElementById(id);}


