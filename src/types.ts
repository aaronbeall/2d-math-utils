export type Point = {
  x: number;
  y: number;
}

export type Line = {
  start: Point;
  end: Point;
}

export type Circle = {
  x: number;
  y: number;
  radius: number;
}

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Vector2d = Point;