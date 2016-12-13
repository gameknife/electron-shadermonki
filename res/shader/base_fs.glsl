/*

_MainTex ('Font Texture', 2D) = 'white'

*/
precision mediump float;
uniform sampler2D _MainTex;
uniform sampler2D _AlphaTex;
varying vec2 vTexCoord;
varying vec3 vNormal;

uniform float _TIME;
uniform vec4 _LIGHTDIR;

float frac(float t)
{
    return t - floor(t);
}
void main(){
    vec4 samplerColor1 = vec4(frac(vTexCoord.x + _TIME),frac(vTexCoord.y + _TIME),0,1);
    vec4 samplerColor2 = vec4(vNormal * vec3(0.5,0.5,0.5) + vec3(0.5,0.5,0.5),1);
    float ndotl = max(0.0, dot(_LIGHTDIR.xyz, vNormal));
    vec4 samplerColor = texture2D(_MainTex, vTexCoord.xy);
    vec4 alphaSamplerColor = texture2D(_AlphaTex, vTexCoord.xy);
    samplerColor *= samplerColor;
    samplerColor.a *= alphaSamplerColor.a;
    if(samplerColor.a < 0.25) discard;
    samplerColor = samplerColor * (ndotl + vec4(0.3,0.4,0.5,1.0) * (vNormal.y * 0.4 + 0.6));
    samplerColor.a = 1.0;
    gl_FragColor = sqrt(samplerColor);
}
