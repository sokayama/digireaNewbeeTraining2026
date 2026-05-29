#version 300 es
in vec3 aPosition;
in vec3 aColor;
in vec3 aNormal;

out vec3 vColor;
out vec3 vNormal;
out vec3 vWorldPosition;

uniform mat4 uMVPMatrix;
uniform mat4 uModelMatrix;

void main() {
    vColor = aColor;
    // 法線ベクトルを世界空間の回転に合わせる（mat3キャストで回転成分のみ抽出）
    vNormal = mat3(uModelMatrix) * aNormal;
    // 頂点自体の世界空間での位置座標を算出
    vWorldPosition = vec3(uModelMatrix * vec4(aPosition, 1.0));
    
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
}