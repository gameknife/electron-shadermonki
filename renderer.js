// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const gkCore            = require('./lib/gk-core');

const logger            = require('./lib/gk-logger');
const glw               = require('./lib/gk-glwrap');
const mouse             = require('./lib/gk-mouseorbit');
const resMgr            = require('./lib/gk-resmgr');
const resPanel          = require('./lib/gk-respanel');
const Framework         = require('./lib/gk-framework');
const path              = require('path');

// initial
window.onload = function(){
    // init logger
    logger.init(bid('console-log-container'));
    logger.info('shadermonki started.');

    // initialize rendering
    var canvas = bid('canvas');
    glw.initGL(canvas);

    switch_sceneview(false);

    if(!glw.ready){console.log('initialize error'); return;}

    // initialize mouse orbit
    mouse.init(canvas);

    // filter it and put it into resource manager
    resPanel.init(bid('res-container'), __dirname);
    resPanel.rescan_resources();
    resPanel.reconstruct_filetree();
    resPanel.refresh();

    // temporary feature
    let holder = bid('mesh-holder');
    let current_proj = '';

    holder.ondrop = function( ev ) {

        ev.preventDefault();
        var filetoken = ev.dataTransfer.getData("restoken");

        let type = 0;
        let resobj = resMgr.gResmgr.get_res(filetoken);
        if( resobj !== null )
        {
            current_proj = path.dirname(filetoken) + '/';

            type = resobj.get_type();

            if(type === resMgr.RESTYPE.MESH)
            {
                //create a mesh element
                let _ret = resPanel.create_res_showobj(0, filetoken, type);

                resPanel.clean_folder(this);
                this.appendChild(_ret.obj_container);

                // load mesh here
                if(!resobj.loaded)
                {
                    resobj.load( onFinish => {
                        framework.bindShowObj( resobj.gameObject );
                    } );
                }
                else
                {
                    framework.bindShowObj( resobj.gameObject );
                }

                resPanel.refresh();


            }

        }

    }

    holder.ondragover = function (ev) {
        ev.preventDefault();
    }

    let imgholder = bid('image-holder');
    imgholder.ondrop = function( ev ) {

        ev.preventDefault();
        var filetoken = ev.dataTransfer.getData("restoken");

        let type = 0;
        let resobj = resMgr.gResmgr.get_res(filetoken);
        if( resobj !== null )
        {
            type = resobj.get_type();

            if(type === resMgr.RESTYPE.TEXTURE)
            {
                //create a mesh element
                let _ret = resPanel.create_res_showobj(0, filetoken, type, false);

                resPanel.clean_folder(this);
                this.appendChild(_ret.obj_container);

                // load mesh here
                resobj.load();
                resPanel.refresh();
                //window.parent.renderer.updateTexure(resobj);
            }

        }

    }

    imgholder.ondragover = function (ev) {
        ev.preventDefault();
    }

    // framework start
    window.framework = new Framework();
    window.framework.init();



    // start and loop
    this.running = true;
    refresh_playbtn('btn_play', 'btn_play', window.running);


    // create render loop
    render_loop();
    function render_loop()
    {
        if(window.running) {
            window.framework.update();
        }
        requestAnimationFrame(render_loop);
    }

    // btn control
    {
        var playBtn = bid('btn_play');
        playBtn.onclick = function () {
            window.running = !window.running;
            refresh_playbtn('btn_play', 'btn_play', window.running);
        }
    }

    {
        // btn control
        let playBtn = bid('btn_auto_rotate');
        playBtn.onclick = function () {
            //refresh_playbtn('btn_auto_rotate', 'btn_square', renderer.autoRotate);
        }
    }

    this.fullscreen = false;
    {
        // btn control
        let targetBtn = bid('btn_next');
        targetBtn.onclick = function () {
            window.fullscreen = !window.fullscreen;
            switch_sceneview(window.fullscreen);
        }
    }

};

function refresh_playbtn( element_id, element_class, swt ) {
    var element = bid(element_id);
    if ( swt ) {
        element.className = element_class + '_on';
    }
    else {
        element.className = element_class;
    }
}

function switch_sceneview( fsmode ) {

    var canvas_fsholder = bid('fullscreen');
    var canvas = bid('canvas');
    var canvas_defaultHolder = bid('sceneview');

    //canvas_fsholder.style.visibility = 'hidden';
    //canvas_fsholder.appendChild(canvas);
    //canvas_defaultHolder.appendChild(canvas);

    if( fsmode ) {
        canvas_fsholder.style.visibility = 'visible';
        canvas_fsholder.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if( window.framework != undefined ) {
            window.framework.renderer.resize( window.innerWidth, window.innerHeight );
        }
    }
    else {
        canvas_fsholder.style.visibility = 'hidden';
        canvas_defaultHolder.appendChild(canvas);
        canvas.width = 512;
        canvas.height =512;

        if( window.framework != undefined ) {
            window.framework.renderer.resize(512, 512);
        }
    }
}

function bid(id){return document.getElementById(id);}

