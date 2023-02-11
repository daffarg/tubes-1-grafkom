const canvas = document.querySelector('#canvas')
const gl = canvas.getContext('webgl')

if(!gl){
  throw new Error('WebGL not supported')
}

const vertexTemp = []
const colorTemp = [
  0, 0, 0,    //V1.color
  0, 1, 0,
  0, 0, 1,
  1, 0, 0,
  1, 1, 1,
  1, 0, 1
]

function handlePolygonButton(){

  canvas.onmousedown = (e) =>{
    var clickX = e.clientX
    var clickY = e.clientY
    var rect = e.target.getBoundingClientRect();

    var x,y;
    x = (2*(clickX - rect.left) - canvas.width) / canvas.width;
    y = (canvas.height - 2*(clickY - rect.top)) / canvas.height;
    vertexTemp.push(x)
    vertexTemp.push(y)

    console.log(vertexTemp)
    // Testing for Polygon
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
    var count = vertexTemp.length/2
    if(count >= 3){
      gl.drawArrays(gl.TRIANGLE_FAN, 0, count)
    }
  }

  
  canvas.onmousemove = (e) => {
    var clickX = e.clientX
    var clickY = e.clientY
    var rect = e.target.getBoundingClientRect();

    var x,y;
    x = (2*(clickX - rect.left) - canvas.width) / canvas.width;
    y = (canvas.height - 2*(clickY - rect.top)) / canvas.height;
    
    if(vertexTemp.length >= 6){
      vertexTemp[vertexTemp.length-2] = x
      vertexTemp[vertexTemp.length-1] = y
    }
    // Testing for Polygon
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
    var count = vertexTemp.length/2
    if(count >= 2){
      gl.drawArrays(gl.TRIANGLE_FAN, 0, count)
    }
  }  
}

