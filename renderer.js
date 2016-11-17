// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict'

const logger    = require('./lib/gk-logger.js');
const glw       = require('./lib/gk-glwrap.js');
const mouse     = require('./lib/gk-mouseorbit.js');
const resMgr       = require('./lib/gk-resmgr');
const resPanel  = require('./lib/gk-respanel')

// initial
window.onload = function(){

    this.editor_vs = ace.edit("vs-editor-panel");
    this.editor_vs.setTheme('ace/theme/twilight');
    var GLSLMode = ace.require("ace/mode/glsl").Mode;
    this.editor_vs.session.setMode(new GLSLMode());
    this.editor_vs.setValue(vsp);
    this.editor_vs.clearSelection();

    this.editor_vs.getSession().on('change', function(e) {
        // e.type, etc
        vsp = window.editor_vs.getValue();
        window.parent.renderer.updateShader(vsp, fsp);
    });

    this.editor_vs.commands.addCommand({
        name: 'save to',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function(editor) {
            //...
            console.info("edit saving...");
            vsp = editor.getValue();
            window.parent.renderer.updateShader(vsp, fsp);
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });

    this.editor_fs = ace.edit("fs-editor-panel");
    this.editor_fs.setTheme('ace/theme/twilight');
    var GLSLMode = ace.require("ace/mode/glsl").Mode;
    this.editor_fs.session.setMode(new GLSLMode());
    this.editor_fs.setValue(fsp);
    this.editor_fs.clearSelection();

    this.editor_fs.getSession().on('change', function(e) {
        // e.type, etc
        fsp = window.editor_fs.getValue();
        window.parent.renderer.updateShader(vsp, fsp);
    });

    this.editor_fs.commands.addCommand({
        name: 'save to',
        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
        exec: function(editor) {
            //...
            console.info("edit saving...");
            fsp = editor.getValue();
            window.parent.renderer.updateShader(vsp, fsp);
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });


    //logger = window.parent.logger;
    logger.init(bid('console-log-container'));

    logger.info('shadermonki started.');

    //win = window;
    var canvas = bid('canvas');
    var renderer = window.parent.renderer;

    mouse.init(canvas);

    glw.initGL(canvas);
    if(!glw.ready){console.log('initialize error'); return;}

    renderer.init();

    window.parent.renderer.updateShader(vsp, fsp);

    // filter it and put it into resource manager
    resPanel.init(bid('res-container'), __dirname);
    resPanel.rescan_resources();
    resPanel.reconstruct_filetree();
    resPanel.refresh();

    let holder = bid('mesh-holder');
    holder.ondrop = function( ev ) {

        ev.preventDefault();
        var filetoken = ev.dataTransfer.getData("restoken");

        let type = 0;
        let resobj = resMgr.gResmgr.get_res(filetoken);
        if( resobj !== null )
        {
            type = resobj.get_type();

            if(type === resMgr.RESTYPE.MESH)
            {
                //create a mesh element
                let _ret = resPanel.create_res_showobj(0, filetoken, type);

                resPanel.clean_folder(this);
                this.appendChild(_ret.obj_container);

                // load mesh here
                resobj.load();
                resPanel.refresh();
                window.parent.renderer.updateMesh(resobj);
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
                window.parent.renderer.updateTexure(resobj);
            }

        }

    }

    imgholder.ondragover = function (ev) {
        ev.preventDefault();
    }


    this.running = true;
    refresh_playbtn('btn_play', 'btn_play', window.running);
    // create render loop
    render_loop();
    function render_loop()
    {
        if(window.running) {
            renderer.render();
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
            renderer.autoRotate = !renderer.autoRotate;
            refresh_playbtn('btn_auto_rotate', 'btn_square', renderer.autoRotate);
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

function bid(id){return document.getElementById(id);}

var vsp = "\
attribute vec2 texcoord;\r\
attribute vec3 normal;\r\
attribute vec3 position;\r\
uniform mat4 _MVP;\r\
uniform mat4 _M2W;\r\
\r\
\r\
varying vec2 vTexCoord;\r\
varying vec3 vNormal;\r\
\r\
void main(){\r\
\r\
    vTexCoord = (position * 0.075).xy;\r\
    //vTexCoord = texcoord;\r\
    vNormal = (_M2W * vec4(normal, 0.0)).xyz;\r\
    /*gl_Position = vec4(position, 1.0);*/\r\
    gl_Position = _MVP * vec4(position, 1.0);\r\
}\r\
";

var fsp = "\
/*\r\
\r\
_MainTex ('Font Texture', 2D) = 'white'\r\
\r\
*/\r\
precision mediump float;\r\
uniform sampler2D texture;\r\
varying vec2 vTexCoord;\r\
varying vec3 vNormal;\r\
\r\
\r\
uniform float _TIME;\r\
uniform vec4 _LIGHTDIR;\r\
float frac(float t)\r\
{\r\
    return t - floor(t);\r\
}\r\
void main(){\r\
    vec4 samplerColor1 = vec4(frac(vTexCoord.x + _TIME),frac(vTexCoord.y + _TIME),0,1);\r\
    vec4 samplerColor2 = vec4(vNormal * vec3(0.5,0.5,0.5) + vec3(0.5,0.5,0.5),1);\r\
    float ndotl = max(0.0, dot(_LIGHTDIR.xyz, vNormal));\r\
    vec4 samplerColor = texture2D(texture, vTexCoord.xy);\r\
    samplerColor = samplerColor * (ndotl + vec4(0.3,0.4,0.5,1.0) * (vNormal.y * 0.4 + 0.6));\r\
    samplerColor.a = 1.0;\r\
    gl_FragColor = sqrt(samplerColor);\r\
}\
";
