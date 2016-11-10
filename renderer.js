// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// initial
window.onload = function(){


    this.editorPanel = ace.edit("editorPanel");
    this.editorPanel.setTheme('ace/theme/twilight');
    var GLSLMode = ace.require("ace/mode/glsl").Mode;
    this.editorPanel.session.setMode(new GLSLMode());

    this.editorPanel.setValue(fsp);

    this.editorPanel.commands.addCommand({
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

var vsp = "\
attribute vec2 texcoord;\
attribute vec3 normal;\
attribute vec3 position;\
uniform mat4 _MVP;\
\
\
varying vec2 vTexCoord;\
varying vec3 vNormal;\
\
void main(){\
\
    vTexCoord = ((position + 1.0) * 0.5).xy;\
    vTexCoord = texcoord;\
    vNormal = normal;\
    /*gl_Position = vec4(position, 1.0);*/\
    gl_Position = _MVP * vec4(position, 1.0);\
}\
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
    samplerColor = samplerColor * ndotl + vec4(0.3,0.4,0.7,1.0) * (vNormal.y * 0.25 + 0.75);\r\
    samplerColor.a = 1.0;\r\
    gl_FragColor = sqrt(samplerColor);\r\
}\
";
