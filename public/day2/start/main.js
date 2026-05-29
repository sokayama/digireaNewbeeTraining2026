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
    const normalAttributeLocation = gl.getAttribLocation(program, 'aNormal');

    const mvpUniformLocation = gl.getUniformLocation(program, 'uMVPMatrix');
    
    // 【演習①・②】 uniformロケーションの取得（エラーにならないよう事前に取得しておきます）
    const modelUniformLocation = gl.getUniformLocation(program, 'uModelMatrix');
    const lightUniformLocation = gl.getUniformLocation(program, 'uLightPosition');

    // 立方体のデータ（面ごとに法線ベクトルを分離したため、24頂点分用意します）
    const vertexData = new Float32Array([
        // X,    Y,    Z,      R,   G,   B,      NX,  NY,  NZ
        // 前面 (赤) - 法線: 真手前 (0, 0, 1)
        -0.5, -0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
         0.5, -0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
        -0.5, -0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,    1.0, 0.0, 0.0,    0.0, 0.0, 1.0,

        // 背面 (緑) - 法線: 真奥 (0, 0, -1)
        -0.5, -0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
        -0.5,  0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
         0.5,  0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
        -0.5, -0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
         0.5,  0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,
         0.5, -0.5, -0.5,    0.0, 1.0, 0.0,    0.0, 0.0,-1.0,

        // 上面 (青) - 法線: 真上 (0, 1, 0)
        -0.5,  0.5, -0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
        -0.5,  0.5,  0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
         0.5,  0.5,  0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
        -0.5,  0.5, -0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
         0.5,  0.5,  0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,
         0.5,  0.5, -0.5,    0.0, 0.0, 1.0,    0.0, 1.0, 0.0,

        // 下面 (黄色) - 法線: 真下 (0, -1, 0)
        -0.5, -0.5, -0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
         0.5, -0.5, -0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
        -0.5, -0.5, -0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,
        -0.5, -0.5,  0.5,    1.0, 1.0, 0.0,    0.0,-1.0, 0.0,

        // 右面 (マゼンタ) - 法線: 真右 (1, 0, 0)
         0.5, -0.5, -0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5,  0.5, -0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5, -0.5, -0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 0.0, 1.0,    1.0, 0.0, 0.0,

        // 左面 (シアン) - 法線: 真左 (-1, 0, 0)
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

    // 9要素（XYZ + RGB + NXNYNZ）に対応したストライドとオフセット計算
    const floatSize = Float32Array.BYTES_PER_ELEMENT;
    const positionSize = 3;
    const colorSize = 3;    
    const normalSize = 3;
    const stride = (positionSize + colorSize + normalSize) * floatSize;
    
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, positionSize, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, colorSize, gl.FLOAT, false, stride, positionSize * floatSize);

    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, normalSize, gl.FLOAT, false, stride, (positionSize + colorSize) * floatSize);

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

        // 【演習①】 modelMatrix と 固定のライト座標(uLightPosition) を転送してください
        
        // 【演習②】 固定のライト座標をやめ、Math.sin, Math.cos でライト座標を円運動させて転送してください

        gl.drawArrays(gl.TRIANGLES, 0, 36);
        requestAnimationFrame(render);
    };
    render();
};

window.addEventListener('DOMContentLoaded', () => main().catch(e => console.error(e)));