attribute vec2 texcoord;
attribute vec3 normal;
attribute vec3 position;
uniform mat4 _MVP;
uniform mat4 _MV;
uniform mat4 _M2W;
uniform mat4 _MVP_LIGHT;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec4 vLightHPos;
varying vec4 vHpos;

void main()
{
    vTexCoord = (position * 0.075).xy;
    vTexCoord = texcoord;
    vNormal = (_M2W * vec4(normal, 0.0)).xyz;
    vLightHPos = _MV * vec4(position, 1.0);
    vLightHPos = _MVP_LIGHT * vLightHPos;
    
    /*gl_Position = vec4(position, 1.0);*/
    gl_Position = _MVP * vec4(position, 1.0);
    
    vHpos = gl_Position;
    vHpos.xy *= -1.0;
    vHpos.xyz = (vHpos.w - vHpos.xyz) * 0.5;
}