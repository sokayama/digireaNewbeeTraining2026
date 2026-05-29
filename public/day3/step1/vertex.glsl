#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aUV;

out vec3 vNormal;
out vec3 vWorldPosition;
out vec2 vUV;

uniform mat4 uMVPMatrix;
uniform mat4 uModelMatrix;

void main() {
    vNormal = mat3(uModelMatrix) * aNormal;
    vWorldPosition = vec3(uModelMatrix * vec4(aPosition, 1.0));
    
    // UV座標をフラグメントシェーダーへパス
    vUV = aUV;

    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
}