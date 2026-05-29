#version 300 es
// JSから受け取る頂点属性
in vec3 aPosition;
in vec3 aColor;

// 【解答 1】
// フラグメントシェーダーへ「色」を送るための out 変数を定義
out vec3 vColor;

// （Step 2で使用する uniform 変数。ここではまだ使いません）
// uniform mat4 uMVPMatrix;

void main() {
    // 【解答 2】
    // 受け取ったカラー情報をそのまま out 変数へ代入
    vColor = aColor;
    
    // Step 1: 行列を使わず、そのままの座標を出力（クリップ座標系へ直接描画）
    gl_Position = vec4(aPosition, 1.0);
}