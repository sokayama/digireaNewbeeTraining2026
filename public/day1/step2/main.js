// ==========================================
// 1. シェーダーの非同期読み込み関数
// ==========================================
const loadShaderSource = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`シェーダーの読み込みに失敗しました: ${url}`);
    }
    return response.text();
};

// ==========================================
// 2. ユーティリティ関数
// ==========================================
const createProgram = (gl, vsSource, fsSource) => {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error('Vertex Shader Error:', gl.getShaderInfoLog(vs));
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error('Fragment Shader Error:', gl.getShaderInfoLog(fs));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program Link Error:', gl.getProgramInfoLog(program));
    }
    return program;
};

// ==========================================
// 3. メイン処理
// ==========================================
const main = async () => {
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
        throw new Error('WebGL 2.0 がサポートされていません');
    }

    const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
        loadShaderSource('vertex.glsl'),
        loadShaderSource('fragment.glsl')
    ]);

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
    const colorAttributeLocation = gl.getAttribLocation(program, 'aColor');
    const mvpUniformLocation = gl.getUniformLocation(program, 'uMVPMatrix');

    const vertexData = new Float32Array([
        // X,    Y,   Z,     R,   G,   B
         0.0,  0.5, 0.0,   1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0,   0.0, 1.0, 0.0,
         0.5, -0.5, 0.0,   0.0, 0.0, 1.0
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    // インターリーブ設定
    const floatSize = Float32Array.BYTES_PER_ELEMENT;
    const positionSize = 3;
    const colorSize = 3;    
    const stride = (positionSize + colorSize) * floatSize;
    
    const positionOffset = 0;
    const colorOffset = positionSize * floatSize;

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, positionSize, gl.FLOAT, false, stride, positionOffset);

    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, colorSize, gl.FLOAT, false, stride, colorOffset);

    gl.bindVertexArray(null);

    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();

    mat4.lookAt(viewMatrix, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 10.0);

    let angle = 0;

    const render = () => {
        gl.clearColor(0.05, 0.1, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        // 【解答 5】
        angle += 0.01;
        
        // 1. モデル行列のY軸回転 (angleラジアン回転)
        mat4.fromRotation(modelMatrix, angle, [0, 1, 0]);

        // 2. MVP行列の構築 (Projection * View * Model)
        // ※ gl-matrixは指定した順に掛け算される（破壊的メソッド）ため順序に注意
        mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
        mat4.multiply(mvpMatrix, projectionMatrix, mvpMatrix);

        // 3. 計算したMVP行列をシェーダーの uniform 変数へ転送
        gl.uniformMatrix4fv(mvpUniformLocation, false, mvpMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        requestAnimationFrame(render);
    };

    render();
};

// ==========================================
// 4. エントリーポイント（エラーの捕捉）
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    main().catch((error) => {
        console.error('アプリケーションの初期化に失敗しました:', error);
    });
});