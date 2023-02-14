const vSource = `
  attribute vec4 vPosition;
  attribute vec4 vColor;
  varying vec4 fColor;
  void main(){
    gl_Position = vPosition;
    fColor = vColor;
  }
`;

const fSource = `
  precision mediump float;
  varying vec4 fColor;
  void main(){
    gl_FragColor = fColor;
  }
`;

const canvas = document.querySelector('#canvas')
const gl = setupWebGL(canvas);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

let shapes = []
let vertices = []
let colors = []

var polygon = {
  vertex : [],
  color : []
}

var polygonTemp = {
  vertex : [],
  color : []
}

//  Load shaders and initialize attribute buffers
const program = initShaders(gl, vSource, fSource);
gl.useProgram(program);

// Associate out shader variables with our data buffer
const vBuffer = gl.createBuffer();
const cBuffer = gl.createBuffer();

render();

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let i = 0; i < shapes.length; i++) {
      for (let j = 0; j < shapes[i].vertices.length; j ++) {
        vertices.push(shapes[i].vertices[j]);
      }
    }

    for (let i = 0; i < shapes.length; i++) {
      for (let j = 0; j < shapes[i].color.length; j ++) {
        colors.push(shapes[i].color[j]);
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    const vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    const vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    if (shapes.length > 0) {
      for (let i = 0; i < shapes.length; i ++) {
        if (shapes[i].category == "line") {
          gl.drawArrays(gl.LINES, 0, 2);
        }
      }
    } 
    
    window.requestAnimFrame(render);
}

isDown = false;

gl.clearColor(0.8, 0.8, 0.8, 1.0);
// function main() {  
//   //Polygon
//   //makeBufferAndProgram(polygon.vertex, polygon.color);
//   // var countPoly = polygon.vertex.length/2
//   // if(countPoly >= 3){
//   //   gl.drawArrays(gl.TRIANGLE_FAN, 0, countPoly)
//   // }
// }

function handleLine() {
  canvas.addEventListener('mousedown', (event) => {
    eventClickLine(event)
  })

  canvas.addEventListener('mousemove', (event) =>{
    eventMoveLine(event)
  })

  canvas.addEventListener('mouseup', (event) =>{
    eventFinishLine(event)
  })
}


function handlePolygon(){
  canvas.addEventListener('mousedown', (event) => {
    eventClickPolygon(event)
  })

  canvas.addEventListener('mousemove', (event) =>{
    eventMovePolygon(event)
  })
} 

// function makeBufferAndProgram(vertexData, colorData){
//   // Testing for Polygon
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

//   const colorBuffer = gl.createBuffer()
//   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW)

//   //Vertex Shader
//   const vtx = document.getElementById('vertex-shader-2d').text
//   const vertexShader = gl.createShader(gl.VERTEX_SHADER)
//   gl.shaderSource(vertexShader,vtx)
//   gl.compileShader(vertexShader);

//   //Fragment Shader
//   const ftx = document.getElementById('fragment-shader-2d').text
//   const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
//   gl.shaderSource(fragmentShader, ftx)
//   gl.compileShader(fragmentShader)

//   //Program
//   const program = gl.createProgram();
//   gl.attachShader(program, vertexShader)
//   gl.attachShader(program, fragmentShader);
//   gl.linkProgram(program);

//   const positionLocation = gl.getAttribLocation(program, `a_position`);
//   gl.enableVertexAttribArray(positionLocation);
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0,0);

//   const colorLocation = gl.getAttribLocation(program, `a_color`);
//   gl.enableVertexAttribArray(colorLocation);
//   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//   gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

// }

function eventClickLine(e){
  isDown = true

  console.log("down")

  let x,y;
  let temp = [];
  // normalize
  x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
  y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
  console.log("x", x);
  console.log("y", y);

  let lineVertices = [];
  let lineColor = [];

  for (let i = 0; i < 2; i++) {
    lineVertices.push([x, y]);
    lineColor.push([0,0,0,1]);
  }

  console.log(lineVertices)

  var newLine = new Line(lineVertices, lineColor);
  shapes.push(newLine);
  console.log("shapes in on click")
  console.log(shapes);

  console.log(x, y);
}

function eventMoveLine(e){
  if (isDown) {
    console.log("move")

    var x, y
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
    for (let i = shapes.length - 1; i >= 0; i --) {
      if (shapes[i].category == "line") {
        shapes[i].vertices[0][0] = x;
        shapes[i].vertices[0][1] = y;
        break;
      }
    }
  } 
}

function eventFinishLine(e) {
  isDown = false;
  console.log("up");
  console.log(shapes);
  gl.drawArrays(gl.LINES, 0, 2);
  console.log("all vertices");
  console.log(vertices);
  
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

// window.onload = main();