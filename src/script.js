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
const shapeSelect = document.getElementById('shapes')
const newLineLengthInput = document.getElementById('new-line-length')
const gl = setupWebGL(canvas);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.8, 0.8, 0.8, 1.0);

let shapes = []
let vertices = []
let colors = []

let animation = false
let theta = 0.0
let prevTheta = 0.0

const allowedRadius = 0.1
let selectShapeCategory = ""
let selectShapeIdx = -1
let selectLineVertexIdx = -1
let selectSquareVertexIdx = -1
let selectPolygonVertexIdx = -1

let prevHorizontalTranslateVal = 0
let prevVerticalTranslateVal = 0
let prevDegree = 0

let animationShapesIdx = []

let currentEventText = document.getElementById("current-action-text")


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
isDownLine = false;
isDownSquare = false;
isMovePolyogn = false;
isDownMove = false;
let currentEvent = "";
let currentShape;
let currentColor = [1, 0, 0, 1]

render();

function render() {
  handleDisplayPolygonButton()
  // Clear canvas
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (animation) {
    theta += (theta * Math.PI / 180) - prevTheta + 0.1
    prevTheta = theta

    console.log(animationShapesIdx)

    for (let i = 0; i < animationShapesIdx.length; i ++) {
      let modelCenter = shapes[i].vertices
      .reduce((totalVertexSum, vertex) => [totalVertexSum[0] + vertex[0], totalVertexSum[1] + vertex[1]])
      .map(axis => axis / shapes[i].vertices.length)

      for (let vertex of shapes[i].vertices) { //Tekan dulu salah satu vertex dari model yang dibuat pakai event select vertex
      
      vertex[0] -= modelCenter[0]
      vertex[1] -= modelCenter[1]

      let newX = (Math.cos(theta) * vertex[0]) - (Math.sin(theta) * vertex[1])
      let newY = (Math.cos(theta) * vertex[1]) + (Math.sin(theta) * vertex[0])

      vertex[0] = newX + modelCenter[0]
      vertex[1] = newY + modelCenter[1]
      }
    }
  }

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
        vIdx += count;
    }
  })

  window.requestAnimFrame(render);
}

/** ============= Handle Click Button ========================= */

function handleLine() {
  currentEvent = 'line'
  currentEventText.innerHTML = "Current Event: Line"
  canvas.onmousedown = function (event) {
    eventClickLine(event)
  }
  canvas.onmousemove = function (event) {
    eventMoveLine(event)
  }
  canvas.onmouseup = function (event) {
    eventFinishLine(event)
  }
}

function handleSquare() {
  currentEvent = 'square'
  currentEventText.innerHTML = "Current Event: Square"

  canvas.onmousedown = function (event) {
    eventClickSquare(event)
  }

  canvas.onmousemove = function (event) {
    eventMoveSquare(event)
  }

  canvas.onmouseup = function (event) {
    eventFinishSquare(event)
  }
}

function handlePolygon() {
  currentEvent = 'polygon'
  currentEventText.innerHTML = "Current Event: Polygon"
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
  currentEventText.innerHTML = "Current Event: Rectangle"
  currentEvent = "RECT_MODE";
  console.log(currentEvent);
}

function handleSelect() {
  currentEvent = 'move'
  currentEventText.innerHTML = "Current Event: Select Vertex"
  canvas.addEventListener("mousedown", (event) => {
    eventClickSelect(event);
  })
  canvas.addEventListener("mousemove", (event) => {
    eventMoveSelect(event);
  })
  canvas.addEventListener("mouseup", (event) => {
    eventFinishSelect(event);
  })
}

function handleDeletePolygonVertex() {
  currentEvent = 'deleteVertexPolygon'
  currentEventText.innerHTML = "Current Event: Delete Polygon Vertex"

  canvas.addEventListener("mousedown", (event) => {
    deletePolygonVertex(event);
  })
}

function handleDisplayPolygonButton() {
  if (currentEvent === "polygon" || currentEvent === "deleteVertexPolygon") {
    document.getElementById('finalizePolygon').style.display = 'block'
    document.getElementById('deletePolygonVertex').style.display = 'block'
  } else {
    document.getElementById('finalizePolygon').style.display = 'none'
    document.getElementById('deletePolygonVertex').style.display = 'none'
  }
}

function handleVertexColorChange() {
  currentEvent = 'changeVertexColor'
  currentEventText.innerHTML = "Current Event: Change Vertex Color"
  canvas.onclick = function (event) {
    eventClickVertexColorChange(event);
  }
}

function handleLineLengthChange() {
  currentEvent = 'changeLineLength'
  currentEventText.innerHTML = "Current Event: Change Line Length"
  canvas.onclick = function (event) {
    eventClickLineLengthChange(event)
  }
}

function handleSelectVertexForAnimation() {
  currentEvent = "selectVertexForAnim"
  currentEventText.innerHTML = "Current Event: Select Vertex for Animation"
  canvas.onclick = function (event) {
    eventSelectVertexForAnimation(event)
  }
}


/** ======================= Line Event ========================= */

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
      lineColor.push(currentColor);
    }

    isDownLine = true

    var newLine = new Line(lineVertices, lineColor);
    shapes.push(newLine);
  }
}

function eventMoveLine(e) {
  if (isDownLine) {
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
  isDownLine = false;
  console.log(shapes)
  console.log("up");
}



/** ======================= Square Event ========================= */

function eventClickSquare(e) {
  if (currentEvent === 'square') {
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
        currentColor);
    }

    isDownSquare = true

    var newSquare = new Square(squareVertices, squareColor);
    shapes.push(newSquare);
  }
}

function eventMoveSquare(e) {
  if (isDownSquare) {
    // console.log("move")

    var x, y
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (shapes[i].category == "square") {
        // console.log(i);
        let dx = x - shapes[i].vertices[0][0]
        let dy = y - shapes[i].vertices[0][1]

        let side = Math.min(Math.abs(dx), Math.abs(dy))

        if (dy > 0) {
          dy = side
        } else {
          dy = -side
        }

        if (dx > 0) {
          dx = side
        } else {
          dx = -side
        }

        shapes[i].vertices[2][0] = shapes[i].vertices[0][0] + dx
        shapes[i].vertices[2][1] = shapes[i].vertices[0][1] + dy
        shapes[i].vertices[3][1] = shapes[i].vertices[0][1] + dy
        shapes[i].vertices[1][0] = shapes[i].vertices[0][0] + dx
        break;
      }
    }
  }
}

function eventFinishSquare(e) {
  isDownSquare = false;
  console.log("up");
}




/** ======================= Polygon Event ========================= */

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

    if (shapes.length === 0) {
      var polygon = new Polygon([[x, y]], [currentColor])
      shapes.push(polygon)
    } else if (shapes[shapes.length - 1].category !== "polygon") {
      var polygon = new Polygon([[x, y]], [currentColor])
      shapes.push(polygon)
    } else if (shapes[shapes.length - 1].category === "polygon") {
      if (!shapes[shapes.length - 1].isFinish) {
        shapes[shapes.length - 1].vertices.push([x, y])
        shapes[shapes.length - 1].color.push(currentColor)
        if (shapes[shapes.length - 1].vertices.length == 2) {
          shapes[shapes.length - 1].vertices.push([x, y])
          shapes[shapes.length - 1].color.push(currentColor) // Dikasih warna
          isMovePolyogn = true
        }
      } else {
        var polygon = new Polygon([[x, y]], [currentColor])
        shapes.push(polygon)
      }
    }
  }
}

function finalizePolygon() {
  if (currentEvent === "polygon") {
    isMovePolyogn = false;
    if (shapes[shapes.length - 1].category === 'polygon') {
      shapes[shapes.length - 1].isFinish = true
      shapes[shapes.length - 1].vertices.pop()
      shapes[shapes.length - 1].color.pop()
    }
  }
}

function deletePolygonVertex(e) { //Menghapus Vertex polygon yang diklik ketika telah melakukan finish polygon
  if (currentEvent === 'deleteVertexPolygon') {
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
    for (let i = 0; i < shapes.length; i++) {
      var vertexIdx = 0
      if (shapes[i].category === "polygon") {
        for (let temp of shapes[i].vertices) {
          referenceVertex = euclideanDistance(temp, [x, y])
          if (referenceVertex < allowedRadius) {
            shapes[i].vertices.splice(vertexIdx, 1)
            shapes[i].color.splice(vertexIdx, 1)
            break
          }
          vertexIdx++
        }
      }
    }
  }
}




/** ======================= Rectangle Event ========================= */

function eventClickRectangle(e) {
  let x, y;
  x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
  y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;

  // console.log("Click Rect");
  if (currentEvent === "RECT_MODE") { // Baru klik tombol, belum ngebambar
    console.log("Rect Mode");
    currentShape = new Rectangle([], []);

    for (let i = 0; i < 4; i++) {
      currentShape.vertices.push([x, y]);
      currentShape.color.push(currentColor);
    }

    shapes.push(currentShape);


    currentEvent = "RECT_DRAW";

  } else if (currentEvent === "RECT_DRAW") { // Lagi ngegambar
    console.log("Rect Draw");
    currentEvent = "RECT_MODE";
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
      // [oldX, newY],
      // [newX, oldY],
      [newX, newY],
      [oldX, newY]
    ]
  }
}



/** ======================= Select Event for Resize and Move Vertex  ========================= */

function eventClickSelect(e) {
  if (currentEvent === "move") {
    if (selectShapeCategory !== "") {
      selectShapeCategory = "" // kosongkan kategori shape
      selectShapeIdx = -1 // kosongkan index shape
      selectLineVertexIdx = -1
    } else {
      isDownMove = true
      let x, y;
      // normalize
      x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
      y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;

      for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].category === "line" && shapeSelect.value === "line") {
          console.log(shapes[i].vertices)
          let firstVertex = euclideanDistance(shapes[i].vertices[0], [x, y])
          console.log("firstVertex", firstVertex)
          let secondVertex = euclideanDistance(shapes[i].vertices[1], [x, y])
          console.log("secondVertex", secondVertex)
          if (firstVertex < allowedRadius) {
            selectLineVertexIdx = 0
          } else if (secondVertex < allowedRadius) {
            selectLineVertexIdx = 1
          }
          if (selectLineVertexIdx != -1) { // apakah dalam radius 
            console.log("tes")
            selectShapeCategory = "line"
            selectShapeIdx = i
            break
          }
        } else if (shapes[i].category === "square" && shapeSelect.value === "square") {
          console.log("masuk square")
          for (let j = 0; j < shapes[i].vertices.length; j++) {
            referenceVertex = euclideanDistance(shapes[i].vertices[j], [x, y])
            if (referenceVertex < allowedRadius) {
              console.log("kotak masuk")
              selectShapeCategory = "square"
              selectSquareVertexIdx = j
              selectShapeIdx = i
              break
            }
          }
          
        } else if (shapes[i].category === "polygon" && shapeSelect.value === "polygon") {
          var vertexIdx = 0
          for (let temp of shapes[i].vertices) {
            referenceVertex = euclideanDistance(temp, [x, y])
            if (referenceVertex < allowedRadius) {
              selectShapeCategory = "polygon"
              selectShapeIdx = i
              selectPolygonVertexIdx = vertexIdx
              break
            }
            vertexIdx++
          }
        } else if (shapes[i].category === "rectangle" && shapeSelect.value === "rectangle") {
          let selectedRectangleVertex = shapes[i].vertices
            .map(vertex => [euclideanDistance(vertex, [x, y]), shapes[i].vertices.indexOf(vertex)])
            .filter(distanceResult => distanceResult[0] < allowedRadius)
            .reduce((currentMinimum, distanceResult) => currentMinimum[0] < distanceResult[0] ? currentMinimum : distanceResult, [Number.MAX_VALUE, null])
          if (selectedRectangleVertex[1] !== null) {
            selectShapeCategory = "rectangle"
            selectShapeIdx = i
            selectRectangleVertexIdx = selectedRectangleVertex[1]
            break
          }
        }
      }
    }
  }
}

function eventMoveSelect(e) {
  if (isDownMove) {
    let x, y;
    // normalize
    x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;

    if (selectShapeCategory === "line") {
      shapes[selectShapeIdx].vertices[selectLineVertexIdx][0] = x
      shapes[selectShapeIdx].vertices[selectLineVertexIdx][1] = y
    } else if (selectShapeCategory === "square") {
      // console.log(i);

      if (selectSquareVertexIdx == 0) {
        console.log(0)

        // kurangi dengan yang bersebrangan secara diagonal
        let dx = x - shapes[selectShapeIdx].vertices[2][0]
        let dy = y - shapes[selectShapeIdx].vertices[2][1]

        let side = Math.min(Math.abs(dx), Math.abs(dy))

        if (dy > 0) {
          dy = side
        } else {
          dy = -side
        }
  
        if (dx > 0) {
          dx = side
        } else {
          dx = -side
        }

        shapes[selectShapeIdx].vertices[0][0] = shapes[selectShapeIdx].vertices[2][0] + dx
        shapes[selectShapeIdx].vertices[0][1] = shapes[selectShapeIdx].vertices[2][1] + dy
        shapes[selectShapeIdx].vertices[1][1] = shapes[selectShapeIdx].vertices[2][1] + dy
        shapes[selectShapeIdx].vertices[3][0] = shapes[selectShapeIdx].vertices[2][0] + dx
      } else if (selectSquareVertexIdx == 1) {

        // kurangi dengan yang bersebrangan secara diagonal
        let dx = x - shapes[selectShapeIdx].vertices[3][0]
        let dy = y - shapes[selectShapeIdx].vertices[3][1]

        let side = Math.min(Math.abs(dx), Math.abs(dy))

        if (dy > 0) {
          dy = side
        } else {
          dy = -side
        }
  
        if (dx > 0) {
          dx = side
        } else {
          dx = -side
        }

        shapes[selectShapeIdx].vertices[1][0] = shapes[selectShapeIdx].vertices[3][0] + dx
        shapes[selectShapeIdx].vertices[1][1] = shapes[selectShapeIdx].vertices[3][1] + dy
        shapes[selectShapeIdx].vertices[0][1] = shapes[selectShapeIdx].vertices[3][1] + dy
        shapes[selectShapeIdx].vertices[2][0] = shapes[selectShapeIdx].vertices[3][0] + dx
      } else if (selectSquareVertexIdx == 2) {

        // kurangi dengan yang bersebrangan secara diagonal
        dx = x - shapes[selectShapeIdx].vertices[0][0]
        dy = y - shapes[selectShapeIdx].vertices[0][1]

        let side = Math.min(Math.abs(dx), Math.abs(dy))

        if (dy > 0) {
          dy = side
        } else {
          dy = -side
        }
  
        if (dx > 0) {
          dx = side
        } else {
          dx = -side
        }

        shapes[selectShapeIdx].vertices[2][0] = shapes[selectShapeIdx].vertices[0][0] + dx
        shapes[selectShapeIdx].vertices[2][1] = shapes[selectShapeIdx].vertices[0][1] + dy
        shapes[selectShapeIdx].vertices[3][1] = shapes[selectShapeIdx].vertices[0][1] + dy
        shapes[selectShapeIdx].vertices[1][0] = shapes[selectShapeIdx].vertices[0][0] + dx
      } else if (selectSquareVertexIdx == 3) {
        dx = x - shapes[selectShapeIdx].vertices[1][0]
        dy = y - shapes[selectShapeIdx].vertices[1][1]

        let side = Math.min(Math.abs(dx), Math.abs(dy))

        if (dy > 0) {
          dy = side
        } else {
          dy = -side
        }
  
        if (dx > 0) {
          dx = side
        } else {
          dx = -side
        }

        shapes[selectShapeIdx].vertices[3][0] = shapes[selectShapeIdx].vertices[1][0] + dx
        shapes[selectShapeIdx].vertices[3][1] = shapes[selectShapeIdx].vertices[1][1] + dy
        shapes[selectShapeIdx].vertices[2][1] = shapes[selectShapeIdx].vertices[1][1] + dy
        shapes[selectShapeIdx].vertices[0][0] = shapes[selectShapeIdx].vertices[1][0] + dx
      }

      
    } else if (selectShapeCategory === "polygon") {
      shapes[selectShapeIdx].vertices[selectPolygonVertexIdx][0] = x
      shapes[selectShapeIdx].vertices[selectPolygonVertexIdx][1] = y
    } else if (selectShapeCategory === "rectangle") {
      let vertexSameX, vertexSameY
      for (let i = 0; i < 4; i++) {
        if (shapes[selectShapeIdx].vertices[i][0] === shapes[selectShapeIdx].vertices[selectRectangleVertexIdx][0] && selectRectangleVertexIdx !== i) {
          vertexSameX = shapes[selectShapeIdx].vertices[i]
        }
        if (shapes[selectShapeIdx].vertices[i][1] === shapes[selectShapeIdx].vertices[selectRectangleVertexIdx][1] && selectRectangleVertexIdx !== i) {
          vertexSameY = shapes[selectShapeIdx].vertices[i]
        }
      }
      shapes[selectShapeIdx].vertices[selectRectangleVertexIdx] = [x, y]
      vertexSameX[0] = x
      vertexSameY[1] = y
    }
  }
}

function eventFinishSelect(e) {
  isDownMove = false
  console.log("up")
}

/** ======================= Get Current Color ========================= */

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getColor() {
  var colorHex = document.getElementById('current-color').value
  var rgb = hexToRgb(colorHex)
  var selectedColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1]
  currentColor = selectedColor
}



/** ======================= Translasi and Rotate ========================= */

function translateHorizontal(input) {
  if (currentEvent === 'move') {
    var valueRange = input.value
    var normalizeValue = valueRange / 100000
    for (let vertex of shapes[selectShapeIdx].vertices) { //Tekan dulu salah satu vertex dari model yang dibuat pakai event select vertex
      vertex[0] += normalizeValue - prevHorizontalTranslateVal
    }
    prevHorizontalTranslateVal = normalizeValue
  }
}

function translateVertical(input) {
  if (currentEvent === 'move') {
    var valueRange = input.value
    var normalizeValue = valueRange / 100000
    for (let vertex of shapes[selectShapeIdx].vertices) { //Tekan dulu salah satu vertex dari model yang dibuat pakai event select vertex
      vertex[1] += normalizeValue- prevVerticalTranslateVal
    }
    prevVerticalTranslateVal = normalizeValue
  }
}

function translateReset(input) {
  input.value = 0
}

function rotateModel(input) { //Rotate terhadapt 0, 0 canvas
  if (currentEvent === 'move') {
    var degree = input.value
    degree = degree * Math.PI / 180
    for (let vertex of shapes[selectShapeIdx].vertices) { //Tekan dulu salah satu vertex dari model yang dibuat pakai event select vertex
      var newX = (Math.cos(degree) * vertex[0]) - (Math.sin(degree) * vertex[1])
      var newY = (Math.cos(degree) * vertex[1]) + (Math.sin(degree) * vertex[0])
      vertex[0] = newX
      vertex[1] = newY
    }
  }
}

function rotateModelSelf(input) { //Rotate terhadapt diri sendiri canvas
  console.log("rotate Self")
  if (currentEvent === 'move') {
    var degree = input.value
    degree = degree * Math.PI / 180 - prevDegree
    prevDegree = degree

    let modelCenter = shapes[selectShapeIdx].vertices
      .reduce((totalVertexSum, vertex) => [totalVertexSum[0] + vertex[0], totalVertexSum[1] + vertex[1]])
      .map(axis => axis / shapes[selectShapeIdx].vertices.length)

    for (let vertex of shapes[selectShapeIdx].vertices) { //Tekan dulu salah satu vertex dari model yang dibuat pakai event select vertex
      
      vertex[0] -= modelCenter[0]
      vertex[1] -= modelCenter[1]

      let newX = (Math.cos(degree) * vertex[0]) - (Math.sin(degree) * vertex[1])
      let newY = (Math.cos(degree) * vertex[1]) + (Math.sin(degree) * vertex[0])

      vertex[0] = newX + modelCenter[0]
      vertex[1] = newY + modelCenter[1]
    }
  }
}



/** ======================= Change vertex color Event ========================= */

function eventClickVertexColorChange(event) {
  console.log(currentEvent)
  if (currentEvent = 'changeVertexColor') {
    let x, y;
    // normalize
    x = (2 * (event.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (event.clientY - canvas.offsetTop)) / canvas.clientHeight;

    let idxOnRange = -1
    for (let i = 0; i < shapes.length; i++) {
      if (shapes[i].category === "line" && shapeSelect.value === "line") {
        console.log(shapes[i].vertices)
        for (let j = 0; shapes[i].vertices.length; j++) {
          referenceVertex = euclideanDistance(shapes[i].vertices[j], [x, y])
          console.log(referenceVertex < allowedRadius)
          if (referenceVertex < allowedRadius) {
            shapes[i].color[j] = currentColor
            break
          }
        }
      } else if (shapes[i].category === "square" && shapeSelect.value === "square") {
        console.log("masuk")
        for (let j = 0; shapes[i].vertices.length; j++) {
          referenceVertex = euclideanDistance(shapes[i].vertices[j], [x, y])
          console.log(referenceVertex < allowedRadius)
          if (referenceVertex < allowedRadius) {
            shapes[i].color[j] = currentColor
            break
          }
        }
      } else if (shapes[i].category === "polygon" && shapeSelect.value === "polygon") {
        var vertexIdx = 0
        for (let temp of shapes[i].vertices) {
          referenceVertex = euclideanDistance(temp, [x, y])
          if (referenceVertex < allowedRadius) {
            shapes[i].color[vertexIdx] = currentColor //Pilih terlebih dahulu color lalu klik vertex yang ingin diganti warnanya
            break
          }
          vertexIdx++
        }
      } else if (shapes[i].category === "rectangle" && shapeSelect.value === "rectangle") {
        let selectedRectangleVertex = shapes[i].vertices
          .map(vertex => [euclideanDistance(vertex, [x, y]), shapes[i].vertices.indexOf(vertex)])
          .filter(distanceResult => distanceResult[0] < allowedRadius)
          .reduce((currentMinimum, distanceResult) => currentMinimum[0] < distanceResult[0] ? currentMinimum : distanceResult, [Number.MAX_VALUE, null])
        if (selectedRectangleVertex[1] !== null) {
          shapes[i].color[selectedRectangleVertex[1]] = currentColor
          // selectShapeCategory = "rectangle"
          // selectShapeIdx = i
          // selectRectangleVertexIdx = selectedRectangleVertex[1]
          break
        }
      }
    }
  }
}



/** ======================= Change Line Length  ========================= */

function eventClickLineLengthChange(event) {
  if (currentEvent === 'changeLineLength') {
    let x, y;
    // normalize
    x = (2 * (event.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (event.clientY - canvas.offsetTop)) / canvas.clientHeight;

    for (let i = 0; i < shapes.length; i ++) {
      if (shapes[i].category === 'line') {
        for (let j = 0; j < shapes[i].vertices.length; j ++) {
          referenceVertex = euclideanDistance(shapes[i].vertices[j], [x, y])
          if (referenceVertex < allowedRadius) {
            console.log("masuk radius (ubah panjang garis)")
            xMiddle = (shapes[i].vertices[0][0] + shapes[i].vertices[1][0]) / 2
            yMiddle = (shapes[i].vertices[0][1] + shapes[i].vertices[1][1]) / 2

            const d1 = Math.sqrt((shapes[i].vertices[0][0] - xMiddle) ** 2 + (shapes[i].vertices[0][1]  - yMiddle) ** 2);
            const d2 = Math.sqrt((shapes[i].vertices[1][0] - xMiddle) ** 2 + (shapes[i].vertices[1][1]  - yMiddle) ** 2);
            
            const increase = (newLineLengthInput.value - d1 - d2) / 2;

            const theta = Math.atan2(shapes[i].vertices[1][1] - shapes[i].vertices[0][1], shapes[i].vertices[1][0] - shapes[i].vertices[0][0]);

            // Tentukan koordinat titik pertama baru pada garis
            const x1_baru = shapes[i].vertices[0][0] - increase * Math.cos(theta);
            const y1_baru = shapes[i].vertices[0][1] - increase * Math.sin(theta);

            // Tentukan koordinat titik kedua baru pada garis
            const x2_baru = shapes[i].vertices[1][0] + increase * Math.cos(theta);
            const y2_baru = shapes[i].vertices[1][1] + increase * Math.sin(theta);

            shapes[i].vertices[0][0] = x1_baru
            shapes[i].vertices[0][1] = y1_baru
            shapes[i].vertices[1][0] = x2_baru
            shapes[i].vertices[1][1] = y2_baru
          }
        }
      }
    }
  }
}



/** ======================= Handle File Event ========================= */

function saveToFile() {
  // Create a new Blob object
  const blob = new Blob([JSON.stringify(shapes)], { type: 'text/plain' });

  // Generate a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a new link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'data.txt';

  // Simulate a click on the link element to download the file
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function uploadFromFile(event){
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.addEventListener('load', (event) => {
    const text = event.target.result;
    shapes = JSON.parse(text)
  });

  reader.readAsText(file);
}



/** ======================= Animation ========================= */

function startAnimation() {
  document.getElementById("current-animation-state").innerHTML = "Animation: True"
  animation = true
}

function stopAnimation() {
  document.getElementById("current-animation-state").innerHTML = "Animation: False"
  animation = false
}

function eventSelectVertexForAnimation(event) {
  if (currentEvent === 'selectVertexForAnim') {
    let x, y;
    // normalize
    x = (2 * (event.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
    y = 1 - (2 * (event.clientY - canvas.offsetTop)) / canvas.clientHeight;
  
    console.log("x", x)
    console.log("y", y)
    let selected = false
  
    for (let i = 0; i < shapes.length; i ++) {
      if (shapeSelect.value === shapes[i].category) {
        for (let j = 0; j < shapes[i].vertices.length; j ++) {
          referenceVertex = euclideanDistance(shapes[i].vertices[j], [x, y])
          console.log("reference", referenceVertex)
          if (referenceVertex < allowedRadius) {
            console.log("shape masuk animasi")
            animationShapesIdx.push(i)
            selected = true
            break
          }
        }
      }
      if (selected) {
        break
      }
    }
  }
}