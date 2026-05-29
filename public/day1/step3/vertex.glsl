#version 300 es
// JSから受け取る頂点属性（ローカル座標とカラー）
in vec3 aPosition;
in vec3 aColor;

// 【解答 1】
// 1. フラグメントシェーダーへ「色」を送るための out 変数
out vec3 vColor;
// 2. JSから「MVP行列」を受け取るための uniform 変数
uniform mat4 uMVPMatrix;

void main() {
    // 【解答 2】
    // 1. 受け取ったカラー情報をそのまま out 変数へ代入
    vColor = aColor;
    
    // 2. 頂点座標にMVP行列を掛け算して画面へ投影
    // ※行列の掛け算は「行列 × ベクトル」の順序である必要があります
    gl_Position = uMVPMatrix * vec4(aPosition, 1.0);
}