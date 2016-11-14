// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict'

const logger    = require('./lib/gk-logger.js');
const glw       = require('./lib/gk-glwrap.js');
const mouse     = require('./lib/gk-mouseorbit.js');
const fs        = require('fs-extra');
const res       = require('./lib/gk-resmgr');
const path      = require('path');

// initial
window.onload = function(){

    this.editor_vs = ace.edit("vs-editor-panel");
    this.editor_vs.setTheme('ace/theme/twilight');
    var GLSLMode = ace.require("ace/mode/glsl").Mode;
    this.editor_vs.session.setMode(new GLSLMode());
    this.editor_vs.setValue(vsp);
    this.editor_vs.clearSelection();
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
    window.resMgr = new res.BaseResMgr();

    let filelist = fs.walkSync(__dirname + '/res/');
    filelist.forEach( item => {
        item = path.relative( __dirname, item );
        window.resMgr.add_res(item);
    });


    let resFolderStruct = { '_folded' : false, '_name': 'root', '_child' : {} };
    // build the folder struct
    window.resMgr.resrefs.forEach( item => {
        let folders = item.filetoken.split('/');

        let currFolderLevel = resFolderStruct;

        // go check the folder links, choose the last
        for( let i=0; i < folders.length; ++i)
        {
            if( i === folders.length - 1)
            {
                // leaf
                currFolderLevel._child[folders[i]] = item;
                break;
            }

            if( folders[i] in currFolderLevel._child )
            {
                currFolderLevel = currFolderLevel._child[folders[i]];
            }
            else
            {
                currFolderLevel._child[folders[i]] = { '_folded' : true, '_child' : {} };
                currFolderLevel._child[folders[i]]._name = folders[i];

                currFolderLevel = currFolderLevel._child[folders[i]];
            }
        }
    });

    console.info(resFolderStruct);

    // dispatch res to resouce
    let resContainer = bid('res-container');

    function list_folder(folderStruct, container, depth) {

        for (let element in folderStruct._child) {

            let folder = folderStruct._child[element];
            if(folder === undefined)
            {
                break;
            }
            var obj_container = document.createElement('div');
            obj_container.style.padding = '2px ' + depth + 'px';
            var log_line = document.createElement('button');
            obj_container.appendChild(log_line);


            if (folder instanceof res.BaseResObj)
            {
                log_line.onclick = function () {

                    // load mesh fast
                    window.parent.renderer.updateMesh( folder.filetoken );

                }


                log_line.id = 'btn-' + folder.filetoken;
                log_line.className = 'obj-line';

                var log_icon = document.createElement('i');

                switch (folder.get_type()) {
                    case res.RESTYPE.MESH:
                        log_icon.className = 'btm bt-database';
                        break;
                    case res.RESTYPE.TEXTURE:
                        log_icon.className = 'bts bt-photo';
                        break;
                }

                log_icon.style.color = '#8af';
                log_line.appendChild(log_icon);

                var log_text = document.createTextNode(' ' + folder.filetoken.split('/').pop());
                log_line.appendChild(log_text);
                container.appendChild(obj_container);
            }
            else
            {
                log_line.onclick = function () {
                    folder._folded = !folder._folded;
                    clean_folder(resContainer);
                    list_folder(resFolderStruct, resContainer, 1);
                }


                log_line.id = 'folder-' + folder._name;
                log_line.className = 'obj-line';

                var log_icon = document.createElement('i');
                if (folder._folded) {
                    log_icon.className = 'bts bt-folder';
                }
                else
                {
                    log_icon.className = 'btm bt-folder';
                }

                log_icon.style.color = '#8af';
                log_line.appendChild(log_icon);

                var log_text = document.createTextNode(' ' + folder._name);
                log_line.appendChild(log_text);
                container.appendChild(obj_container);

                if (folder._folded) {

                }
                else
                {
                    console.info(folder);
                    list_folder(folder, container, depth + 10);
                }
            }


            //var log_icon = document.createElement('i');

        }
        ;
    }

    function clean_folder(resContainer) {
        while (resContainer.firstChild) {
            resContainer.removeChild(resContainer.firstChild);
        }
    }

    clean_folder(resContainer);
    list_folder(resFolderStruct, resContainer, 1);




    //
    //     // var infotype = line[0];
    //     var log_icon = document.createElement('i');
    //     //
    //     switch (item.get_type()) {
    //         case res.RESTYPE.MESH:
    //             log_icon.className = 'btm bt-database';
    //             log_icon.style.color = '#8af';
    //             break;
    //         case res.RESTYPE.TEXTURE:
    //             log_icon.className = 'bts bt-photo';
    //             log_icon.style.color = '#8af';
    //             break;
    //     }
    //
    //     log_line.appendChild(log_icon);
    //
    //     var log_text = document.createTextNode(' ' + item.filetoken);
    //     log_line.appendChild(log_text);
    //
    //     container.appendChild(log_line);
    // });



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
    vTexCoord = ((position + 1.0) * 0.5).xy;\r\
    vTexCoord = texcoord;\r\
    vNormal = (_M2W * vec4(normal, 0.0)).xyz;\r\
    /*gl_Position = vec4(position, 1.0);*/\r\
    gl_Position = _MVP * vec4(position, 1.0);\r\
}\r\
";

var fsp = "precision mediump float;\r\
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
    vec4 samplerColor = vec4(1.0,0.95,0.5,1.0);\r\
    samplerColor = samplerColor * ndotl + vec4(0.3,0.4,0.7,1.0) * (vNormal.y * 0.4 + 0.6);\r\
    samplerColor.a = 1.0;\r\
    gl_FragColor = sqrt(samplerColor);\r\
}\
";
