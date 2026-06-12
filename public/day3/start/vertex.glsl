#version 300 es
in vec3 aPosition;
in vec3 aNormal;
// 1日目の aColor は今回は使わないため削除しても構いません
// ★【実装】step 3 : JSから受け取る UV座標 の in 変数と、フラグメントへ送る out 変数を定義してください


out vec3 vNormal;
out vec3 vWorldPosition;

uniform mat4 uMVPMatrix;
uniform mat4 uModelMatrix;

void main() {
    vNormal = mat3(uModelMatrix) * aNormal;
    vWorldPosition = vec3(uModelMatrix * vec4(aPosition, 1.0));
    
    // ★【実装】step 3 : 受け取ったUV座標をそのまま out 変数へ代入(パス)してください


    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
}