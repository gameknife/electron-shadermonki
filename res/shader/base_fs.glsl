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

#define BIA 0.0003
#define SHADOWMAP_SIZE (1.0 / 1024.0)

float DecodeFloatRGBA(vec4 enc){
    vec4 kDecodeDot = vec4(1.0,1.0/255.0,1.0/65025.0,1.0/160581375.0);
    return dot(enc, kDecodeDot);
}
float frac(float t)
{
    return t - floor(t);
}

float snoise(vec2 co){
return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float sampleShadow(vec3 light_hpos)
{
    float noise = fract(_TIME);
    float noiseMap = snoise(vTexCoord.xy + vec2(noise,noise)) * 1.0;
    vec2 normal = vec2(noiseMap, 1.0 - noiseMap);
    //normal = normalize(normal);
    vec4 shadow4;
    
    shadow4.x = sign(texture2D(_GlobalShadowMap, light_hpos.xy * 0.5 
    + vec2(0.5,0.5) 
    + reflect( normal, vec2(1,0)) 
    * SHADOWMAP_SIZE).r - (light_hpos.z * 0.5 + 0.5) + BIA);
    
        shadow4.y = sign(texture2D(_GlobalShadowMap, light_hpos.xy * 0.5 
    + vec2(0.5,0.5) 
    + reflect( normal, vec2(-1,0)) 
    * SHADOWMAP_SIZE).r - (light_hpos.z * 0.5 + 0.5) + BIA);
        shadow4.z = sign(texture2D(_GlobalShadowMap, light_hpos.xy * 0.5 
    + vec2(0.5,0.5) 
    + reflect( normal, vec2(0,1)) 
    * SHADOWMAP_SIZE).r - (light_hpos.z * 0.5 + 0.5) + BIA);
        shadow4.w = sign(texture2D(_GlobalShadowMap, light_hpos.xy * 0.5 
    + vec2(0.5,0.5) 
    + reflect( normal, vec2(0,-1)) 
    * SHADOWMAP_SIZE).r - (light_hpos.z * 0.5 + 0.5) + BIA);
    
    return max(0.0, dot(shadow4, vec4(0.25)) );
}
void main(){

    // shadow
    vec3 light_hpos = vLightHPos.xyz / vLightHPos.w;
    float shadow = sampleShadow(light_hpos);
    
    // occlusion

    vec4 samplerColor1 = vec4(frac(vTexCoord.x + _TIME),frac(vTexCoord.y + _TIME),0,1);
    vec4 samplerColor2 = vec4(vNormal * vec3(0.5,0.5,0.5) + vec3(0.5,0.5,0.5),1);
    float ndotl = max(0.0, dot(_LIGHTDIR.xyz, vNormal));
    vec4 samplerColor = texture2D(_MainTex, vTexCoord.xy);
    vec4 alphaSamplerColor = texture2D(_AlphaTex, vTexCoord.xy);
    samplerColor *= samplerColor;
    samplerColor.a *= alphaSamplerColor.r * alphaSamplerColor.a;
    if(samplerColor.a < 0.05) discard;
    samplerColor = samplerColor * (ndotl * shadow + vec4(0.2,0.3,0.7,1.0) * (vNormal.y * 0.4 + 0.6));
    samplerColor.a = 1.0;
    //gl_FragColor = vec4(depthA,depthA,depthA,1.0);
    gl_FragColor = sqrt(samplerColor);
}
