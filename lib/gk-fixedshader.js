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

var simplezpassvsp = "attribute vec2 texcoord;\
attribute vec3 normal;\
attribute vec3 position;\
uniform mat4 _MVP;\
uniform mat4 _M2W;\
uniform mat4 _MV;\
\
varying vec2 vTexCoord;\
varying vec4 vNormal;\
\
void main(){\
    vTexCoord = texcoord;\
    vNormal = _MV * vec4(normal, 0.0);\
    gl_Position = _MVP * vec4(position, 1.0);\
}";
var simplezpassfsp = "precision highp float;\
uniform sampler2D _MainTex;\
uniform sampler2D _AlphaTex;\
varying vec2 vTexCoord;\
varying vec4 vNormal;\
void main(){\
    vec4 alphaSamplerColor = texture2D(_AlphaTex, vTexCoord.xy);\
    if(alphaSamplerColor.a < 0.05) discard;\
    gl_FragColor = vec4(vNormal.xyz * 0.5 + 0.5,1.0);\
}";

var ssaovsp = "attribute vec3 position;\
varying vec2 vTexCoord;\
void main(){\
    vTexCoord = ((position + 1.0) * 0.5).xy;\
    gl_Position = vec4(position, 1.0);\
}\
";

var ssaofsp = "precision mediump float;\
uniform sampler2D _GlobalNormalMap;\
uniform sampler2D _GlobalDepthMap;\
uniform float _TIME;\
varying vec2 vTexCoord;\
const vec2 sobel1 = vec2(0,-1);\
const vec2 sobel2 = vec2(-1.41,1.41);\
const vec2 sobel3 = vec2(1.41,1.41);\
const vec2 sobel4 = vec2(0,1);\
const vec2 sobel5 = vec2(1.41,-1.41);\
const vec2 sobel6 = vec2(-1.41,-1.41);\
float DecodeFloatRGBA(vec4 enc){\
    vec4 kDecodeDot = vec4(1.0,1.0/255.0,1.0/65025.0,1.0/160581375.0);\
    return dot(enc, kDecodeDot);\
}\
float snoise(vec2 co){\
return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\
}\
float CalcAccumNormal(){\
    vec3 acc1 = vec3(0,0,0);\
    float noise = fract(_TIME);\
    float noiseMap = snoise(vTexCoord.xy + vec2(noise,noise)) * 1.0;\
    vec2 normal = vec2(noiseMap, 1.0 - noiseMap);\
    normal = normalize(normal);\
    vec2 s1 = reflect(normal, sobel1);\
    vec2 s2 = reflect(normal, sobel2);\
    vec2 s3 = reflect(normal, sobel3);\
    vec2 s4 = reflect(normal, sobel4);\
    vec2 s5 = reflect(normal, sobel5);\
    vec2 s6 = reflect(normal, sobel6);\
    \
    acc1.x = dot(vec3(s1,0.0), texture2D(_GlobalNormalMap, vTexCoord.xy + s1 * -0.003).xyz * 2.0 - 1.0);\
    acc1.y = dot(vec3(s2,0.0), texture2D(_GlobalNormalMap, vTexCoord.xy + s2 * -0.003).xyz * 2.0 - 1.0);\
    acc1.z = dot(vec3(s3,0.0), texture2D(_GlobalNormalMap, vTexCoord.xy + s3 * -0.003).xyz * 2.0 - 1.0);\
    acc1 = vec3(1,1,1) - min(acc1, vec3(1,1,1));\
    \
    vec3 acc2 = vec3(0,0,0);\
    acc2.x = dot(vec3(s4,0.0), texture2D(_GlobalNormalMap, vTexCoord.xy + s4 * -0.006).xyz * 2.0 - 1.0);\
    acc2.y = dot(vec3(s5,0.0), texture2D(_GlobalNormalMap, vTexCoord.xy + s5 * -0.006).xyz * 2.0 - 1.0);\
    acc2.z = dot(vec3(s6,0.0), texture2D(_GlobalNormalMap, vTexCoord.xy + s6 * -0.006).xyz * 2.0 - 1.0);\
    acc2 = vec3(1,1,1) - min(acc2, vec3(1,1,1));\
    \
    return dot(acc1, vec3(0.15,0.15,0.15)) + dot(acc2, vec3(0.15,0.15,0.15));\
}\
void main(){\
    float samplerColor = CalcAccumNormal();\
    gl_FragColor = vec4(samplerColor, samplerColor, samplerColor, 1.0);\
}\
";

module.exports = { quadvsp, noisefsp, quadfsp,
    shadowvsp, shadowfsp,
    simpleshadowvsp, simpleshadowfsp,
    simplezpassvsp, simplezpassfsp,
    ssaovsp, ssaofsp};