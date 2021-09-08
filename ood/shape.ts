abstract class Shape {
    constructor() {
    }
    public abstract getArea():number;
}

class Triangle extends Shape {
  public  getArea(){
      return  2;
  };
}

class Circle extends Shape {
  public  getArea(){
      return  2;
  };
}
class AreaCalculator{
    calculateArea(s:Shape){
        return s.getArea();
    }

}
const triangle = new Triangle();
const triangleArea = new AreaCalculator().calculateArea(triangle);

const circle = new Circle();

const circleArea = new AreaCalculator().calculateArea(circle);
