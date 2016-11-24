/*

_MainTex ('Font Texture', 2D) = 'white'

*/
precision mediump float;
uniform sampler2D texture;
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
    vec4 samplerColor = texture2D(texture, vTexCoord.xy);
    if(samplerColor.a < 0.5) discard;
    samplerColor = samplerColor * (ndotl + vec4(0.3,0.4,0.5,1.0) * (vNormal.y * 0.4 + 0.6));
    samplerColor.a = 1.0;
    gl_FragColor = sqrt(samplerColor);
}
