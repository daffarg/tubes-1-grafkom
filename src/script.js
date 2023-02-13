const canvas = document.querySelector('#canvas')
const gl = canvas.getContext('webgl')

if(!gl){
  throw new Error('WebGL not supported')
}

var polygon = {
  vertex : [],
  color : []
}

var polygonTemp = {
  vertex : [],
  color : []
}

function main() {  
  //Polygon
  makeBufferAndProgram(polygon.vertex, polygon.color);
  var countPoly = polygon.vertex.length/2
  if(countPoly >= 3){
    gl.drawArrays(gl.TRIANGLE_FAN, 0, countPoly)
  }
}


function handlePolygon(){
  canvas.addEventListener('mousedown', (event) => {
    eventClickPolygon(event)
  })

  canvas.addEventListener('mousemove', (event) =>{
    eventMovePolygon(event)
  })
} 


function makeBufferAndProgram(vertexData, colorData){
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

function eventClickPolygon(e){
  var clickX = e.clientX
  var clickY = e.clientY
  var rect = e.target.getBoundingClientRect();

  var x,y;
  x = (2*(clickX - rect.left) - canvas.width) / canvas.width;
  y = (canvas.height - 2*(clickY - rect.top)) / canvas.height;
  polygonTemp.vertex.push(x)
  polygonTemp.vertex.push(y)

  makeBufferAndProgram(polygonTemp.vertex, polygonTemp.color)
  var count = polygonTemp.vertex.length/2
    if(count >= 3){
      gl.drawArrays(gl.TRIANGLE_FAN, 0, count)
    }
}

function eventMovePolygon(e){
  var clickX = e.clientX
    var clickY = e.clientY
    var rect = e.target.getBoundingClientRect();

    var x,y;
    x = (2*(clickX - rect.left) - canvas.width) / canvas.width;
    y = (canvas.height - 2*(clickY - rect.top)) / canvas.height;
    
    if(polygonTemp.vertex.length >= 6){
      polygonTemp.vertex[polygonTemp.vertex.length-2] = x
      polygonTemp.vertex[polygonTemp.vertex.length-1] = y
    }

    makeBufferAndProgram(polygonTemp.vertex, polygonTemp.color);
    var count = polygonTemp.vertex.length/2
    if(count >= 2){
      gl.drawArrays(gl.TRIANGLE_FAN, 0, count)
    }
}

function finalizePolygon() {
  console.log('ini sebelum', polygonTemp.vertex)
  polygonTemp.vertex.pop()
  polygonTemp.vertex.pop()
  console.log('ini sesudah', polygonTemp.vertex)

  polygon.vertex.push(polygonTemp.vertex)
  polygon.color.push(polygonTemp.color)
  
  polygonTemp.vertex = []
  polygonTemp.color = []

  polygon.vertex.pop()
  polygon.vertex.pop()
}

window.onload = main();