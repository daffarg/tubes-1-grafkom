const canvas = document.querySelector('#canvas')
const gl = canvas.getContext('webgl')

if(!gl){
  throw new Error('WebGL not supported')
}

var polygonVertex = []
var polygonColor = []
var hoverPolygon = false

var polygonVertexTemp = []
var polygonColorTemp = [
  0, 0, 0,    //V1.color
  0, 1, 0,
  0, 0, 1,
  1, 0, 0,
  1, 1, 1,
  1, 0, 1
]

function makeBufferAndDraw(vertexData, colorData){
  // Testing for Polygon
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW)

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
}

function handlePolygonButton(){
  hoverPolygon = true

  canvas.onmousedown = (e) =>{
    var clickX = e.clientX
    var clickY = e.clientY
    var rect = e.target.getBoundingClientRect();

    var x,y;
    x = (2*(clickX - rect.left) - canvas.width) / canvas.width;
    y = (canvas.height - 2*(clickY - rect.top)) / canvas.height;
    polygonVertexTemp.push(x)
    polygonVertexTemp.push(y)

    console.log(polygonVertexTemp)
    makeBufferAndDraw(polygonVertexTemp, polygonColorTemp);
    var count = polygonVertexTemp.length/2
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
    
    if(polygonVertexTemp.length >= 6 && hoverPolygon){
      polygonVertexTemp[polygonVertexTemp.length-2] = x
      polygonVertexTemp[polygonVertexTemp.length-1] = y
    }

    makeBufferAndDraw(polygonVertexTemp, polygonColorTemp);
    var count = polygonVertexTemp.length/2
    if(count >= 2){
      gl.drawArrays(gl.TRIANGLE_FAN, 0, count)
    }
  }  
}

// function finishPolygon(){
//   canvas.removeEventListener('mousedown', () =>{console.log('removed');})
//   canvas.removeEventListener('mousemove', () =>{console.log('removed');})
//   polygonVertex.push(polygonVertexTemp)
//   polygonColor.push(polygonColorTemp)
  
//   polygonVertexTemp = []
//   polygonColorTemp = []

//   console.warn(polygonVertex)

//   makeBufferAndDraw(polygonVertex, polygonColor);
//   var count = polygonVertex.length/2
//   gl.drawArrays(gl.TRIANGLE_FAN, 0, count);
// }

