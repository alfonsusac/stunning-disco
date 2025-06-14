import { getNewTransformAroundPoint } from "@/feature/zoomAroundPoint"
import { Point } from "./point"

export class ReactiveCamera {

  #pos
  #zoom
  #onChange

  constructor(
    onChange: () => void = (() => {}),
    initialPos: Point = new Point(0, 0),
    initialZoom: number = 1
  ) {
    this.#onChange = onChange
    this.#pos = initialPos
    this.#zoom = initialZoom
  }

  get pos() {
    return this.#pos
  }
  get zoom() {
    return this.#zoom
  }

  zoomAroundPoint(deltaY: number, x: number, y: number) {
    const newTransform = getNewTransformAroundPoint(this.#zoom, deltaY, new Point(x, y), this.#pos)
    this.#zoom = newTransform.zoom
    this.#pos = newTransform.pos
    this.#onChange()
  }

  pan(dx: number, dy: number) {
    this.#pos = this.#pos.add(new Point(dx, dy))
    this.#onChange()
  }

  setPos(x: number, y: number) {
    this.#pos = new Point(x, y)
    this.#onChange()
  }

  toCanvasSpace(point: Point): Point
  toCanvasSpace(x: number, y: number): Point
  toCanvasSpace(p1: any, p2?: any): any {
    if (typeof p1 === 'number' && typeof p2 === 'number') {
      return new Point(p1, p2).subtract(this.#pos).scale(1 / this.#zoom)
    }
    if (p1 instanceof Point) {
      return this.toCanvasSpace(p1.x, p1.y)
    }
  }

  toScreenSpace(point: Point): Point
  toScreenSpace(x: number, y: number): Point
  toScreenSpace(p1: any, p2?: any): any {
    if (typeof p1 === 'number' && typeof p2 === 'number') {
      return new Point(p1, p2).scale(this.#zoom).add(this.#pos)
    }
    if (p1 instanceof Point) {
      return this.toScreenSpace(p1.x, p1.y)
    }
  }
}