#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vWorldPosition;
in vec2 vUV;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;

out vec4 fragColor;

void main() {
    vec3 L = normalize(uLightPosition - vWorldPosition);
    vec3 N = normalize(vNormal);
    float diffuse = max(dot(N, L), 0.0);
    float ambient = 0.1;

    // 画像から色を取得し、光の強さを掛ける
    vec4 texColor = texture(uTexture, vUV);
    fragColor = vec4(texColor.rgb * (diffuse + ambient), 1.0);
}