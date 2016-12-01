/**
 * Created by gameKnife on 2016/12/1.
 */

var quadvsp = "attribute vec3 position;\
varying vec2 vTexCoord;\
void main(){\
    vTexCoord = ((position + 1.0) * 0.5).xy;\
    gl_Position = vec4(position, 1.0);\
}\
";

var noisefsp = "precision mediump float;\
uniform sampler2D texture;\
varying vec2 vTexCoord;\
uniform float _TIME;\
float snoise(vec2 co){\
return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\
}\
void main(){\
    float noise = fract(_TIME);\
    vec4 samplerColor = vec4(0.3,0.3,0.3,1.0);\
    float vignette = 1.0 - length((vTexCoord.xy - vec2(0.5,0.5)) * vec2(1.5, 1.5));\
    samplerColor *= vignette;\
    samplerColor += snoise(vTexCoord.xy + vec2(noise,noise)) * 0.04;\
    gl_FragColor = samplerColor;\
}\
";

var quadfsp = "precision mediump float;\
uniform sampler2D texture;\
varying vec2 vTexCoord;\
uniform float _TIME;\
float snoise(vec2 co){\
return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\
}\
void main(){\
    vec4 samplerColor = texture2D(texture, vTexCoord.xy);\
    //samplerColor.x = 0.0;\r\
    gl_FragColor = samplerColor;\
}\
";

module.exports = {quadvsp, noisefsp, quadfsp};