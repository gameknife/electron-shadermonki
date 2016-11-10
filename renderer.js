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

    this.running = true;
    // create render loop
    render_loop();

    function render_loop()
    {
        if(this.running) {
            renderer.render();
        }
        requestAnimationFrame(render_loop);
    }

    // btn control
    var playBtn = bid('btn_play');
    playBtn.onclick = function () {
        console.info('click');
        window.running = !window.running;
    }


};




function bid(id){return document.getElementById(id);}


