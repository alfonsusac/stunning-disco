// import { Point } from "@/lib/point"
// import { useReactiveRef } from "@/lib/useSkate"
// import { getNewTransformAroundPoint } from "./zoomAroundPoint"

// export function useReactiveAppCamera(
//   onChange: (camera: Camera) => void
// ) {
//   const [updateCamera, camera] = useReactiveRef({
//     pos: new Point(0, 0),
//     zoom: 1,
//     // Controls
//     zoomAroundPoint(deltaY: number, x: number, y: number,) {
//       const newTransform = getNewTransformAroundPoint(this.zoom, deltaY, new Point(x, y), this.pos)
//       this.zoom = newTransform.zoom
//       this.pos = newTransform.pos
//       updateCamera()
//     },
//     pan(dx: number, dy: number) {
//       this.pos = this.pos.add(new Point(dx, dy))
//       updateCamera()
//     },
//     setPos(x: number, y: number) {
//       this.pos = new Point(x, y)
//       updateCamera()
//     },
//     // Geometric transformations
//     toCanvasSpace(x: number, y: number) { return new Point(x, y).subtract(this.pos).scale(1 / this.zoom) },
//     toScreenSpace(x: number, y: number) { return new Point(x, y).scale(this.zoom).add(this.pos) },
//     projectPoints<const P extends Point[]>(points: Point[]): P { return points.map(point => this.toScreenSpace(point.x, point.y)) as P },
//   },
//     state => onChange(state)
//   )
//   return [camera]
// }

// export type Camera = ReturnType<typeof useReactiveAppCamera>[0]