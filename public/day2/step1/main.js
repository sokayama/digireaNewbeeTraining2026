const loadShaderSource = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`シェーダー読み込み失敗: ${url}`);
    return response.text();
};

const createProgram = (gl, vsSource, fsSource) => {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return program;
};

const main = async () => {
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL 2.0 非対応');

    const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
        loadShaderSource('vertex.glsl'),
        loadShaderSource('fragment.glsl')
    ]);

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
    const colorAttributeLocation = gl.getAttribLocation(program, 'aColor');
    const normalAttributeLocation = gl.getAttribLocation(program, 'aNormal'); // 【追加】法線用

    const mvpUniformLocation = gl.getUniformLocation(program, 'uMVPMatrix');
    const modelUniformLocation = gl.getUniformLocation(program, 'uModelMatrix'); // 【追加】世界座標計算用
    const lightUniformLocation = gl.getUniformLocation(program, 'uLightPosition'); // 【追加】ライト座標用

    // ==========================================
    // ★ 頂点データ (法線 NX, NY, NZ を追加したインターリーブ配列)
    // ==========================================
    const vertexData = new Float32Array([
        // X,    Y,    Z,      R,   G,   B,      NX,  NY,  NZ
        // 前面 (赤) - 法線: 真手前 (0, 0, 1)
        -0.5, -0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
         0.5, -0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
        -0.5, -0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,

        // 背面 (緑) - 法線: 奥 (0, 0, -1)
        -0.5, -0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
        -0.5,  0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
         0.5,  0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
        -0.5, -0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
         0.5,  0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
         0.5, -0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,

        // 上面 (青) - 法線: 上 (0, 1, 0)
        -0.5,  0.5, -0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
        -0.5,  0.5,  0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
         0.5,  0.5,  0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
        -0.5,  0.5, -0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
         0.5,  0.5,  0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
         0.5,  0.5, -0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,

        // 下面 (黄色) - 法線: 下 (0, -1, 0)
        -0.5, -0.5, -0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
         0.5, -0.5, -0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
        -0.5, -0.5, -0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
        -0.5, -0.5,  0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,

        // 右面 (マゼンタ) - 法線: 右 (1, 0, 0)
         0.5, -0.5, -0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5,  0.5, -0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5, -0.5, -0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,

        // 左面 (シアン) - 法線: 左 (-1, 0, 0)
        -0.5, -0.5, -0.5,    0.0, 1.0, 1.0,   -1.0, 0.0, 0.0,
        -0.5, -0.5,  0.5,    0.0, 1.0, 1.0,   -1.0, 0.0, 0.0,
        -0.5,  0.5,  0.5,    0.0, 1.0, 1.0,   -1.0, 0.0, 0.0,
        -0.5, -0.5, -0.5,    0.0, 1.0, 1.0,   -1.0, 0.0, 0.0,
        -0.5,  0.5,  0.5,    0.0, 1.0, 1.0,   -1.0, 0.0, 0.0,
        -0.5,  0.5, -0.5,    0.0, 1.0, 1.0,   -1.0, 0.0, 0.0
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

    // インターリーブ設定の更新 (9要素に拡張)
    const floatSize = Float32Array.BYTES_PER_ELEMENT;
    const positionSize = 3;
    const colorSize = 3;    
    const normalSize = 3; // 【追加】
    const stride = (positionSize + colorSize + normalSize) * floatSize;
    
    const positionOffset = 0;
    const colorOffset = positionSize * floatSize;
    const normalOffset = (positionSize + colorSize) * floatSize; // 【追加】

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, positionSize, gl.FLOAT, false, stride, positionOffset);

    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, colorSize, gl.FLOAT, false, stride, colorOffset);

    // 【追加】法線属性の有効化
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, normalSize, gl.FLOAT, false, stride, normalOffset);

    gl.bindVertexArray(null);

    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();

    mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 10.0);

    let angle = 0;

    const render = () => {
        gl.clearColor(0.05, 0.1, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        angle += 0.01;
        mat4.fromRotation(modelMatrix, angle, [0.5, 1, 0]);
        mat4.multiply(mvpMatrix, viewMatrix, modelMatrix);
        mat4.multiply(mvpMatrix, projectionMatrix, mvpMatrix);

        gl.uniformMatrix4fv(mvpUniformLocation, false, mvpMatrix);

        // 【演習①の解答】モデル行列と固定のライト座標をGPUへ転送
        gl.uniformMatrix4fv(modelUniformLocation, false, modelMatrix);
        gl.uniform3fv(lightUniformLocation, [2.0, 1.5, 2.0]); // 右上奥に固定配置

        gl.drawArrays(gl.TRIANGLES, 0, 36);
        requestAnimationFrame(render);
    };
    render();
};

window.addEventListener('DOMContentLoaded', () => {
    main().catch((error) => console.error(error));
});