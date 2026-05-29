#version 300 es
precision mediump float;

in vec3 vColor;
// 【演習①】 頂点シェーダーから補間された vNormal, vWorldPosition を受け取る変数を定義してください

// uniform vec3 uLightPosition; // 【演習①】でコメントアウトを解除して使用します

out vec4 fragColor;

void main() {
    // 【演習①】
    // 1. ピクセルからライトへ向かうベクトル(L)を算出（正規化）
    // 2. 法線(N)の再正規化
    // 3. dot() と max() を使って内積(diffuse)を算出
    // 4. vColor に diffuse を掛けて fragColor に代入

    // 演習前は1日目と同様にベタ塗りの色で出力されます
    fragColor = vec4(vColor, 1.0);
}