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
    const uvAttributeLocation = gl.getAttribLocation(program, 'aUV');

    const mvpUniformLocation = gl.getUniformLocation(program, 'uMVPMatrix');
    const modelUniformLocation = gl.getUniformLocation(program, 'uModelMatrix');
    const lightUniformLocation = gl.getUniformLocation(program, 'uLightPosition');

    // ==========================================
    // 頂点データ (XYZ + RGB + NX,NY,NZ + U,V) 11要素 x 36頂点
    // ==========================================
    const vertexData = new Float32Array([
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

    // インターリーブ設定 (11要素)
    const floatSize = Float32Array.BYTES_PER_ELEMENT;
    const positionSize = 3;
    const colorSize = 3;    
    const normalSize = 3;
    const uvSize = 2;
    const stride = (positionSize + colorSize + normalSize + uvSize) * floatSize;
    
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, positionSize, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, normalSize, gl.FLOAT, false, stride, (positionSize + colorSize) * floatSize);

    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, uvSize, gl.FLOAT, false, stride, (positionSize + colorSize + normalSize) * floatSize);

    gl.bindVertexArray(null);

    // ==========================================
    // 画像の非同期読み込みとテクスチャ転送
    // ==========================================
    const image = new Image();
    image.src = 'texture.png'; 
    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
    });

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    // 画像サイズが2の累乗でなくても安全に表示させるための設定
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

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