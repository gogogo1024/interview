function setup() {
    createCanvas(400, 400);
    let boundary = new Rectangle(200, 200, 200, 200);
    let qt = new QuadTree(boundary, 4);
    for (let index = 0; index < 10; index++) {
        let point = new Point(random(width), random(width));
        console.log(point);

        qt.insert(point);
    }
    console.log(qt);
    background(0)
    qt.show()
}