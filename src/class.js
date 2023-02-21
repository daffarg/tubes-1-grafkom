class Shape {
    constructor(vertices, color, category) {
        this.vertices = vertices;
        this.color = color;
        this.category = category;
    }
}

class Line extends Shape {
    constructor(vertices, color) {
        super(vertices, color, "line");
    }
}

class Square extends Shape {
    constructor(vertices, color) {
        super(vertices, color, "square");
    }
}

class Polygon extends Shape{
    constructor(vertices, color){
        super(vertices, color, "polygon");
        this.isFinish = false
    }
}

class Rectangle extends Shape {
    constructor(vertices, color){
        super(vertices, color, "rectangle");
    }
}