#version 300 es
in vec3 aPosition;
in vec3 aColor;
in vec3 aNormal; // 今回新しく追加された法線データ

// ★【演習】step 1: フラグメントシェーダーへ送る変数(vNormal, vWorldPosition)を定義してください

out vec3 vColor;
uniform mat4 uMVPMatrix;
// uniform mat4 uModelMatrix; // ★【演習】step 1:でコメントアウトを解除して使用します

void main() {
    vColor = aColor;

    // ★【演習】 
    // step 1: 法線をモデル行列(の3x3部分)で回転させてフラグメントシェーダーへ送るコードを記述してください
    // step 1: モデル行列を使って「世界座標」を算出しフラグメントシェーダーへ送るコードを記述してください
    
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
}