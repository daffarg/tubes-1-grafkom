const vSource = `
  attribute vec2 vPosition;
  attribute vec4 vColor;
  varying vec4 fColor;
  void main(){
    gl_Position = vec4(vPosition, 0.0, 1.0);
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

// var polygon = {
//   vertex: [],
//   color: []
// }

// var polygonTemp = {
//   vertex: [],
//   color: []
// }

//  Load shaders and initialize attribute buffers
const program = initShaders(gl, vSource, fSource);
gl.useProgram(program);

// Associate out shader variables with our data buffer
const vBuffer = gl.createBuffer();
const cBuffer = gl.createBuffer();
const vPosition = gl.getAttribLocation(program, 'vPosition');
gl.enableVertexAttribArray(vPosition);
const vColor = gl.getAttribLocation(program, 'vColor');
gl.enableVertexAttribArray(vColor);
isDown = false;
isMovePolyogn = false;
currentEvent = "";
let currentShape;

render();

function render() {
  // Clear canvas
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Kosongin array
  let vertices = []
  let colors = []

  // Isi array
  for (let i = 0; i < shapes.length; i++) {
    // console.log(i)
    if (shapes[i].category === "padding") {
      continue
    }
    for (let j = 0; j < shapes[i].vertices.length; j++) {
      vertices.push(shapes[i].vertices[j]);
    }
  }
  // console.log(shapes)
  // console.log(vertices)

  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].category === "padding") {
      continue
    }
      for (let j = 0; j < shapes[i].color.length; j++) {
        colors.push(shapes[i].color[j]);
      }
  }

  // Isi buffer vBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Konfigurasi cara isi atribut vPosition
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

  // Isi buffer cBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  // Konfigurasi cara isi atribut cPosition
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

  // Gambar tiap shape
  // console.log("shapes length", shapes.length);
  // for (let shapeIdx = 0; shapeIdx < shapes.length; shapeIdx++) {
  //   let first = 0
  //   for (let shapeBefore = 0; shapeBefore < shapeIdx; shapeBefore++){
  //     first += shapes[shapeBefore].vertices.length
  //   }
  //   switch (shapes[shapeIdx].category) {
  //     case "line":
  //       gl.drawArrays(gl.LINES, first, 2);
  //       break;
  //     case "polygon":
  //       let count = shapes[shapeIdx].vertices.length
  //       gl.drawArrays(gl.TRIANGLE_FAN, first, count);
  //       break;
  //     default:
  //       break;
  //   }
  // }
  let vIdx = 0;
  shapes.forEach(shape => {
    let count = shape.vertices.length;
    switch (shape.category) {
      case "line":
        gl.drawArrays(gl.LINES, vIdx, count);
      case "square":
        gl.drawArrays(gl.TRIANGLE_FAN, vIdx, count);
      case "polygon":
        gl.drawArrays(gl.TRIANGLE_FAN, vIdx, count);
      case "rectangle":
        gl.drawArrays(gl.TRIANGLE_FAN, vIdx, count);
      default:
        break;
    }
    vIdx += count;
  })

  window.requestAnimFrame(render);
}

function handleLine() {
  currentEvent = 'line'
  canvas.addEventListener('mousedown', (event) => {
    eventClickLine(event)
  })

  canvas.addEventListener('mousemove', (event) => {
    eventMoveLine(event)
  })

  canvas.addEventListener('mouseup', (event) => {
    eventFinishLine(event)
  })
}

function handleSquare() {
  currentEvent = 'square'
  canvas.addEventListener('mousedown', (event) => {
    eventClickSquare(event)
  })

  canvas.addEventListener('mousemove', (event) => {
    eventMoveSquare(event)
  })

  canvas.addEventListener('mouseup', (event) => {
    eventFinishSquare(event)
  })
}


function handlePolygon() {
  currentEvent = 'polygon'
  canvas.addEventListener('mousedown', (event) => {
    eventClickPolygon(event)
  })

  canvas.addEventListener('mousemove', (event) => {
    eventMovePolygon(event)
  })
}

canvas.addEventListener("click", event => {
  eventClickRectangle(event);
})
canvas.addEventListener("mousemove", event => {
  eventMoveRectangle(event);
})

function handleRectangle() {
  currentEvent = "RECT_MODE";
  console.log(currentEvent);
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

function eventClickLine(e) {
  if (currentEvent === 'line') {
    console.log("down")

    let x, y;
    // normalize
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
    console.log("x", x);
    console.log("y", y);

    let lineVertices = [];
    let lineColor = [];

    for (let i = 0; i < 2; i++) {
      lineVertices.push([x, y]);
      lineColor.push([0, 0, 0, 1]);
    }

    isDown = true

    var newLine = new Line(lineVertices, lineColor);
    shapes.push(newLine);
  }
}

function eventMoveLine(e) {
  if (isDown) {
    // console.log("move")

    var x, y
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (shapes[i].category == "line") {
        // console.log(i);
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
}

function eventClickSquare(e) {
  if(currentEvent === 'square'){
    console.log("down")

    let x, y;
    // normalize
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
    console.log("x", x);
    console.log("y", y);

    let squareVertices = [];
    let squareColor = [];

    for (let i = 0; i < 4; i++) {
      squareVertices.push([x, y]);
      squareColor.push(
        [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]);
    }

    isDown = true

    var newSquare = new Square(squareVertices, squareColor);
    shapes.push(newSquare);
  }
}

function eventMoveSquare(e) {
  if (isDown) {
    // console.log("move")

    var x, y
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (shapes[i].category == "square") {
        // console.log(i);
        let dx = x - shapes[i].vertices[0][0]
        let dy = y - shapes[i].vertices[0][1]

        let side = 0
        if (Math.abs(dx) <= Math.abs(dy)) {
          side = dx
        } else {
          side = dy
        }

        shapes[i].vertices[2][0] = shapes[i].vertices[0][0] + side
        shapes[i].vertices[2][1] = shapes[i].vertices[0][1] + side
        shapes[i].vertices[3][1] = shapes[i].vertices[0][1] + side
        shapes[i].vertices[1][0] = shapes[i].vertices[0][0] + side
        break;
      }
    }
  }
}

function eventFinishSquare(e) {
  isDown = false;
  console.log("up");
}


function eventMovePolygon(e) {
  if (isMovePolyogn) {
    var x, y;
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;

    if (shapes[shapes.length - 1].category == "polygon") {
      var countVertices = shapes[shapes.length - 1].vertices.length
      shapes[shapes.length - 1].vertices[countVertices - 1][0] = x
      shapes[shapes.length - 1].vertices[countVertices - 1][1] = y
    }
  }
}

function eventClickPolygon(e) {
  if (currentEvent === 'polygon') {
    console.log('polygon click')
    var x, y;
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;

    if(shapes.length === 0 ){
      console.log('Polygon yang pada shapes 0')
      var polygon = new Polygon([[x, y]], [[0, 0, 0, 1]])
      shapes.push(polygon)
    }else if(shapes[shapes.length - 1].category !== "polygon"){
      console.log('New polygon')
      var polygon = new Polygon([[x, y]], [[0, 0, 0, 1]])
      shapes.push(polygon)
    }else if(shapes[shapes.length - 1].category === "polygon"){
      console.log('INI nambahin')
      shapes[shapes.length - 1].vertices.push([x, y])
      shapes[shapes.length - 1].color.push([0, 0, 0, 1])
      if (shapes[shapes.length - 1].vertices.length == 2) {
        console.log('untuk move')
        shapes[shapes.length - 1].vertices.push([0, 0])
        shapes[shapes.length - 1].color.push([0, 0, 0, 1]) // Dikasih warna
        isMovePolyogn = true
      }
    }
  }
}

function finalizePolygon() {
  console.log('finish')
  isMovePolyogn = false;
  if(shapes[shapes.length - 1].category === 'polygon'){
    shapes[shapes.length - 1].vertices.pop()
  }
  var padding = new Padding([[0, 0]], [[0, 0, 0, 1]]) //Membedakan antar 2 polygon yang berbeda
  if (shapes[shapes.length - 1].category !== 'padding') {
    shapes.push(padding)
  }
}

// window.onload = main();

function eventClickRectangle(e) {
  let x, y;
  x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
  y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;

  // console.log("Click Rect");
  if (currentEvent === "RECT_MODE") { // Baru klik tombol, belum ngebambar
    console.log("Rect Mode");
    currentShape = new Rectangle([], []);

    for (let i = 0; i < 6; i++) {
      currentShape.vertices.push([x, y]);
      currentShape.color.push([0, 0, 0, 1]);
    }

    shapes.push(currentShape);


    currentEvent = "RECT_DRAW";

  } else if (currentEvent === "RECT_DRAW") { // Lagi ngegambar
    console.log("Rect Draw");
    currentEvent = "";
    currentShape = null;
  }
}

function eventMoveRectangle(e) {
  if (currentEvent === "RECT_DRAW") {

    let oldX, oldY;
    [oldX, oldY] = currentShape.vertices[0];

    let newX, newY;
    newX = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    newY = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;

    currentShape.vertices = [
      [oldX, oldY],
      [newX, oldY],
      [oldX, newY],
      [newX, oldY],
      [newX, newY],
      [oldX, newY]
    ]
  }
}