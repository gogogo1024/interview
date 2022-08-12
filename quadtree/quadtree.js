class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
/**
 * x,y 二维坐标，w,h 方块长高的一半
 */
class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    // 检查点是否落在方块内
    contains(point) {
        return (point.x >= (this.x - this.w / 2) && point.x <= (this.x + this.w / 2) &&
            point.y >= (this.y - this.h / 2) && point.y && point.y <= (this.y + this.h / 2));
    }
}
class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }
    insert(point) {
        if (!this.boundary.contains(point)) {
            return;
        }
        if (this.points.length < this.capacity) {
            this.points.push(point);
        } else {
            if (!this.divided) {
                this.subdivide();
            }
            this.topRight.insert(point);
            this.topLeft.insert(point);
            this.bottomRight.insert(point);
            this.bottomLeft.insert(point);
        }
    }
    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;

        let tr = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2)
        this.topRight = new QuadTree(tr, this.capacity)

        let tl = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2)
        this.topLeft = new QuadTree(tl, this.capacity)

        let br = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2)
        this.bottomRight = new QuadTree(br, this.capacity)

        let bl = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2)
        this.bottomLeft = new QuadTree(bl, this.capacity)
        // 说明当前方块已经分裂了 
        this.divided = true;
    }
    show() {
        stroke(255);
        strokeWeight(1);
        noFill();
        rectMode(CENTER);
        rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h)
        if (this.divided) {
            this.topRight.show()
            this.topLeft.show()
            this.bottomRight.show()
            this.bottomLeft.show()

        }
        for (const p of this.points) {
            strokeWeight(4)
            point(p.x, p.y)
        }
    }


}