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
    const normalAttributeLocation = gl.getAttribLocation(program, 'aNormal');
    // ★【実装】step 1: UV座標用の Attribute Location を取得してください
    const uvAttributeLocation = gl.getAttribLocation(program, 'aUV');

    const mvpUniformLocation = gl.getUniformLocation(program, 'uMVPMatrix');
    const modelUniformLocation = gl.getUniformLocation(program, 'uModelMatrix');
    const lightUniformLocation = gl.getUniformLocation(program, 'uLightPosition');

    // XYZ(3) + RGB(3) + Normal(3) + UV(2) = 1頂点あたり11要素
    const vertexData = new Float32Array([
        // X,    Y,    Z,      R,   G,   B,      NX,  NY,  NZ,     U,   V
        // 前面
        -0.5, -0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    1.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    1.0, 1.0,
        -0.5, -0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    1.0, 1.0,
        -0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 0.0, 1.0,    0.0, 1.0,
        // 背面
        -0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 0.0,-1.0,    1.0, 0.0,
        -0.5,  0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 0.0,-1.0,    1.0, 1.0,
         0.5,  0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 0.0,-1.0,    0.0, 1.0,
        -0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 0.0,-1.0,    1.0, 0.0,
         0.5,  0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 0.0,-1.0,    0.0, 1.0,
         0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 0.0,-1.0,    0.0, 0.0,
        // 上面
        -0.5,  0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 1.0, 0.0,    0.0, 1.0,
        -0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 1.0, 0.0,    0.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 1.0, 0.0,    1.0, 0.0,
        -0.5,  0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 1.0, 0.0,    0.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    0.0, 1.0, 0.0,    1.0, 0.0,
         0.5,  0.5, -0.5,    1.0, 1.0, 1.0,    0.0, 1.0, 0.0,    1.0, 1.0,
        // 下面
        -0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    0.0,-1.0, 0.0,    0.0, 0.0,
         0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    0.0,-1.0, 0.0,    1.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 1.0,    0.0,-1.0, 0.0,    1.0, 1.0,
        -0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    0.0,-1.0, 0.0,    0.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 1.0,    0.0,-1.0, 0.0,    1.0, 1.0,
        -0.5, -0.5,  0.5,    1.0, 1.0, 1.0,    0.0,-1.0, 0.0,    0.0, 1.0,
        // 右面
         0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    1.0, 0.0, 0.0,    1.0, 0.0,
         0.5,  0.5, -0.5,    1.0, 1.0, 1.0,    1.0, 0.0, 0.0,    1.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    1.0, 0.0, 0.0,    0.0, 1.0,
         0.5, -0.5, -0.5,    1.0, 1.0, 1.0,    1.0, 0.0, 0.0,    1.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 1.0, 1.0,    1.0, 0.0, 0.0,    0.0, 1.0,
         0.5, -0.5,  0.5,    1.0, 1.0, 1.0,    1.0, 0.0, 0.0,    0.0, 0.0,
        // 左面
        -0.5, -0.5, -0.5,    1.0, 1.0, 1.0,   -1.0, 0.0, 0.0,    0.0, 0.0,
        -0.5, -0.5,  0.5,    1.0, 1.0, 1.0,   -1.0, 0.0, 0.0,    1.0, 0.0,
        -0.5,  0.5,  0.5,    1.0, 1.0, 1.0,   -1.0, 0.0, 0.0,    1.0, 1.0,
        -0.5, -0.5, -0.5,    1.0, 1.0, 1.0,   -1.0, 0.0, 0.0,    0.0, 0.0,
        -0.5,  0.5,  0.5,    1.0, 1.0, 1.0,   -1.0, 0.0, 0.0,    1.0, 1.0,
        -0.5,  0.5, -0.5,    1.0, 1.0, 1.0,   -1.0, 0.0, 0.0,    0.0, 1.0
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

// =====================================
    // インターリーブ設定 (1頂点あたり11要素)
    // =====================================
    const floatSize = Float32Array.BYTES_PER_ELEMENT;
    const positionSize = 3;
    const colorSize = 3;    // 今回シェーダーでは使いませんが配列には存在します
    const normalSize = 3;
    // const uvSize = 2; // ★【実装】step 1 : で使用します

    // ストライド: 11要素（3 + 3 + 3 + 2）× 4バイト = 44バイト
    const stride = (positionSize + colorSize + normalSize + 2) * floatSize;
    
    // 1. 位置座標 (X, Y, Z) の有効化
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, positionSize, gl.FLOAT, false, stride, 0);

    // 2. 法線 (NX, NY, NZ) の有効化（RGBの3要素分を飛ばした位置から読み込む）
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, normalSize, gl.FLOAT, false, stride, (positionSize + colorSize) * floatSize);

    // =====================================
    // ★【実装】step 1 : ここに UV座標 (aUV) の Attribute有効化 と ポインタ設定 を記述してください
    // =====================================
    // gl.enableVertexAttribArray(uvAttributeLocation);
    // gl.vertexAttribPointer(uvAttributeLocation, ...);

    gl.bindVertexArray(null);

    // ★【実装】step 2 :  ここで画像の非同期読み込みと、テクスチャの生成・転送を行ってください


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
        gl.uniformMatrix4fv(modelUniformLocation, false, modelMatrix);

        const lightX = 3.0 * Math.cos(angle * 2.0);
        const lightY = 2.0;
        const lightZ = 3.0 * Math.sin(angle * 2.0);
        gl.uniform3fv(lightUniformLocation, [lightX, lightY, lightZ]);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
        requestAnimationFrame(render);
    };
    render();
};

window.addEventListener('DOMContentLoaded', () => main().catch(e => console.error(e)));