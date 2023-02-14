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