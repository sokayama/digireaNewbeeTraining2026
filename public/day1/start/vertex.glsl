#version 300 es
// JSから受け取る頂点属性（ローカル座標とカラー）
in vec3 aPosition;
in vec3 aColor;

// ★【穴埋め演習】
// Step 1. フラグメントシェーダーへ「色」を送るための out 変数を定義してください
// Step 2. JSから「MVP行列」を受け取るための uniform 変数を定義してください

void main() {
    // ★【穴埋め演習】
    // Step 1. 受け取ったカラー情報をそのまま out 変数へ代入してください
    // Step 2. 頂点座標にMVP行列を掛け算して、既定の出力変数（gl_Position）に代入してください
    
    // ※Step 1（行列なしの三角形）のときは、以下の1行だけで動かします
    gl_Position = vec4(aPosition, 1.0);
}
