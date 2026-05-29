#version 300 es
precision mediump float;

in vec3 vColor;
in vec3 vNormal;
in vec3 vWorldPosition;

uniform vec3 uLightPosition;

out vec4 fragColor;

void main() {
    // 1. ピクセルからライトへ向かう方向ベクトルを算出（引き算して正規化）
    vec3 L = normalize(uLightPosition - vWorldPosition);
    // 2. 補間によって長さが変化した法線ベクトルを再正規化
    vec3 N = normalize(vNormal);

    // 3. 内積（dot）をとり、max関数でマイナス値を0.0にクランプ（ランバート反射）
    float diffuse = max(dot(N, L), 0.0);
    
    // 4. 環境光（光の当たらない面が完全な真黒になるのを防ぐ底上げ）
    float ambient = 0.1;

    // 本体の色に、計算した光の強さを掛け算して出力
    fragColor = vec4(vColor * (diffuse + ambient), 1.0);
}