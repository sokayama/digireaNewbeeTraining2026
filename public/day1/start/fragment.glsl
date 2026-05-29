#version 300 es
precision mediump float;

// 【穴埋め演習 3】
// 1. 頂点シェーダーから自動補間された「色」を受け取る in 変数を定義してください（変数名はout側と一致させる）

// WebGL 2.0での画面への最終出力カラー
out vec4 fragColor;

void main() {
    // 【穴埋め演習 4】
    // 最終出力カラー（fragColor）に、受け取った色を代入してください（アルファ値は 1.0）
    
    // 最初は動作確認のため、強制的に赤色（ベタ塗り）で出力します
    fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
