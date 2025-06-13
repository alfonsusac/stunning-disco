export class Point {
  constructor(
    public x: number,
    public y: number
  ) {}

  // Add another point to this point
  add(point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y);
  }
  
  // Add another point to this point (mutable)
  madd(point: Point): Point {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  // Subtract another point from this point
  subtract(point: Point): Point {
    return new Point(this.x - point.x, this.y - point.y);
  }

  // Scale this point by a factor
  scale(factor: number): Point {
    return new Point(this.x * factor, this.y * factor);
  }

  // Minus this point by another point
  minus(): Point {
    return new Point(-this.x, -this.y);
  }

  // Clone this point
  clone(): Point {
    return new Point(this.x, this.y);
  }

  // Get the distance between this point and another point
  distanceTo(point: Point): number {
    const dx = this.x - point.x;
    const dy = this.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}