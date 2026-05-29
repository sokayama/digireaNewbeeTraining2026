#version 300 es
precision mediump float;

// 【解答 3】
// 1. 頂点シェーダーから自動補間された「色」を受け取る in 変数（out側と変数名を一致させる）
in vec3 vColor;

// WebGL 2.0での画面への最終出力カラー
out vec4 fragColor;

void main() {
    // 【解答 4】
    // 最終出力カラー（fragColor）に、受け取った色を代入する（アルファ値は 1.0）
    fragColor = vec4(vColor, 1.0);
}