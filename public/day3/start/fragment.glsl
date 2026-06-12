#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vWorldPosition;
// ★【実装】step 4 : 補間されたUV座標を受け取る in 変数と、画像データを受け取る uniform 変数(sampler2D) を定義してください


uniform vec3 uLightPosition;
out vec4 fragColor;

void main() {
    vec3 L = normalize(uLightPosition - vWorldPosition);
    vec3 N = normalize(vNormal);
    float diffuse = max(dot(N, L), 0.0);
    float ambient = 0.1;

    // ★【実装】step 4 :
    // 1. texture() 関数を使って、UV座標から画像の色(vec4)を取得する
    // 2. 取得した色(RGB)に (diffuse + ambient) を掛け合わせて fragColor に出力する
    
    // ※ 演習前はエラーを防ぐため真っ白なモデルを出力しておきます
    fragColor = vec4(vec3(1.0) * (diffuse + ambient), 1.0);
}