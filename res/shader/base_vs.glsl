attribute vec2 texcoord;
attribute vec3 normal;
attribute vec3 position;
uniform mat4 _MVP;
uniform mat4 _M2W;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main(){
    vTexCoord = (position * 0.075).xy;
    //vTexCoord = texcoord;\r\
    vNormal = (_M2W * vec4(normal, 0.0)).xyz;
    /*gl_Position = vec4(position, 1.0);*/
    gl_Position = _MVP * vec4(position, 1.0);
}