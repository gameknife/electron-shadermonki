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

var quadfsp = "precision highp float;\
uniform sampler2D texture;\
varying vec2 vTexCoord;\
float DecodeFloatRGBA(vec4 enc){\
    vec4 kDecodeDot = vec4(1.0,1.0/255.0,1.0/65025.0,1.0/160581375.0);\
    return dot(enc, kDecodeDot);\
}\
void main(){\
    vec4 samplerColor = texture2D(texture, vTexCoord.xy);\
    gl_FragColor = samplerColor;\
}\
";

var shadowvsp = "attribute vec2 texcoord;\
attribute vec3 normal;\
attribute vec3 position;\
uniform mat4 _MVP;\
uniform mat4 _M2W;\
\
varying vec2 vTexCoord;\
varying vec2 zOffset;\
\
void main(){\
    vTexCoord = texcoord;\
    gl_Position = _MVP * vec4(position, 1.0);\
    zOffset = gl_Position.zw;\
}";
var shadowfsp = "precision highp float;\
uniform sampler2D _MainTex;\
uniform sampler2D _AlphaTex;\
varying vec2 vTexCoord;\
varying vec2 zOffset;\
\
\
float frac(float t)\
{\
    return t - floor(t);\
}\
vec4 frac(vec4 t)\
{\
    return t - floor(t);\
}\
vec4 EncodeFloatRGBA( float v )\
{\
    vec4 kEncodeMul = vec4(1.0, 255.0, 65025.0, 160581375.0);\
    float kEncodeBit = 1.0/255.0;\
    vec4 enc = kEncodeMul * vec4(v,v,v,v);\
    enc = frac(enc);\
    enc -= enc.yzww * kEncodeBit;\
    return enc;\
}\
void main(){\
    vec4 encoded = EncodeFloatRGBA(zOffset.x / zOffset.y);\
    vec4 samplerColor = texture2D(_MainTex, vTexCoord.xy);\
    vec4 alphaSamplerColor = texture2D(_AlphaTex, vTexCoord.xy);\
    if(samplerColor.a < 0.05) discard;\
    gl_FragColor = encoded;\
}";

var simpleshadowvsp = "attribute vec2 texcoord;\
attribute vec3 normal;\
attribute vec3 position;\
uniform mat4 _MVP;\
uniform mat4 _M2W;\
\
varying vec2 vTexCoord;\
\
void main(){\
    vTexCoord = texcoord;\
    gl_Position = _MVP * vec4(position, 1.0);\
}";
var simpleshadowfsp = "precision highp float;\
uniform sampler2D _MainTex;\
uniform sampler2D _AlphaTex;\
varying vec2 vTexCoord;\
void main(){\
    vec4 alphaSamplerColor = texture2D(_AlphaTex, vTexCoord.xy);\
    if(alphaSamplerColor.a < 0.05) discard;\
    gl_FragColor = vec4(1.0,1.0,1.0,1.0);\
}";
module.exports = {quadvsp, noisefsp, quadfsp, shadowvsp, shadowfsp, simpleshadowvsp, simpleshadowfsp};