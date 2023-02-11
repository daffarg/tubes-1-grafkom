const canvas = document.querySelector('#canvas')
const gl = canvas.getContext('webgl')

if(!gl){
  throw new Error('WebGL not supported')
}


function handlePolygonButton(){

    // Testing for Polygon
  const vertexTemp = [
    -1, 1, //Hitam
    1, 0, // Hijau
    -1, -1, // Biru
    0.5, 1, //Merah
    1, -1, //Putih
    0, -1,
  ]

  const colorTemp = [
    0, 0, 0,    //V1.color
    0, 1, 0,
    0, 0, 1,
    1, 0, 0,
    1, 1, 1,
    1, 0, 1
  ]

  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTemp), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorTemp), gl.STATIC_DRAW)

  //Vertex Shader
  const vtx = document.getElementById('vertex-shader-2d').text
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader,vtx)
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('Could not compile vertex shader: ' + gl.getShaderInfoLog(vertexShader));
  }

  //Fragment Shader
  const ftx = document.getElementById('fragment-shader-2d').text
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragmentShader, ftx)
  gl.compileShader(fragmentShader)

  //Program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const positionLocation = gl.getAttribLocation(program, `a_position`);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0,0);

  const colorLocation = gl.getAttribLocation(program, `a_color`);
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 6)
}

