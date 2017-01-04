/*
_MainTex ('Main Texture', 2D) = 'white'
_AlphaTex ('Alpha Texture', 2D) = 'white'
*/
precision mediump float;
uniform sampler2D _MainTex;
uniform sampler2D _AlphaTex;
uniform sampler2D _GlobalNormalMap;
uniform sampler2D _GlobalDepthMap;
uniform sampler2D _GlobalShadowMap;
varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec4 vLightHPos;

uniform float _TIME;
uniform vec4 _LIGHTDIR;

float DecodeFloatRGBA(vec4 enc){
    vec4 kDecodeDot = vec4(1.0,1.0/255.0,1.0/65025.0,1.0/160581375.0);
    return dot(enc, kDecodeDot);
}
float frac(float t)
{
    return t - floor(t);
}
void main(){

    // shadow
    vec3 light_hpos = vLightHPos.xyz / vLightHPos.w;

    vec4 shadowmap = texture2D(_GlobalShadowMap, light_hpos.xy * 0.5 + vec2(0.5,0.5));
    //float depthA = DecodeFloatRGBA(shadowmap);
    float depthA = shadowmap.r;
    if(depthA < (light_hpos.z * 0.5 + 0.5)  - 0.003)
    {
        depthA = 0.0;
    }
    else
    {
        depthA = 1.0;
    }

    vec4 samplerColor1 = vec4(frac(vTexCoord.x + _TIME),frac(vTexCoord.y + _TIME),0,1);
    vec4 samplerColor2 = vec4(vNormal * vec3(0.5,0.5,0.5) + vec3(0.5,0.5,0.5),1);
    float ndotl = max(0.0, dot(_LIGHTDIR.xyz, vNormal));
    vec4 samplerColor = texture2D(_MainTex, vTexCoord.xy);
    vec4 alphaSamplerColor = texture2D(_AlphaTex, vTexCoord.xy);
    samplerColor *= samplerColor;
    samplerColor.a *= alphaSamplerColor.r * alphaSamplerColor.a;
    if(samplerColor.a < 0.05) discard;
    samplerColor = samplerColor * (ndotl * depthA + vec4(0.3,0.4,0.5,1.0) * (vNormal.y * 0.4 * depthA + 0.6));
    samplerColor.a = 1.0;
    //gl_FragColor = vec4(depthA,depthA,depthA,1.0);
    gl_FragColor = sqrt(samplerColor);
}
