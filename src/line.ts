import { Line, Circle, Rectangle, Point } from './types';
import { distance, midpoint } from './point';
import { rotateByRadians, scale, subtract, add, normalize } from './vector';

/**
 * Calculates the length of a line segment
 * @example
 * const line = { 
 *   start: {x: 0, y: 0}, 
 *   end: {x: 3, y: 4} 
 * };
 * lineLength(line) // returns 5
 */
export const lineLength = (line: Line): number => {
  return distance(line.start, line.end);
};

/**
 * Finds the intersection point of two lines (if any).
 * @returns The intersection point or null if the lines do not intersect.
 */
export const lineIntersection = (line1: Line, line2: Line): Point | null => {
  const { start: p1, end: p2 } = line1;
  const { start: p3, end: p4 } = line2;

  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (denom === 0) return null; // Parallel lines

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
  const u = ((p1.x - p3.x) * (p1.y - p2.y) - (p1.y - p3.y) * (p1.x - p2.x)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
    };
  }

  return null; // No intersection
};

/**
 * Finds the intersection points of a line and a circle (if any).
 * @returns An array of intersection points (0, 1, or 2 points).
 */
export const lineCircleIntersection = (line: Line, circle: Circle): Point[] => {
  const { start, end } = line;
  const { x: cx, y: cy, radius } = circle;

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (dx * (start.x - cx) + dy * (start.y - cy));
  const c = (start.x - cx) ** 2 + (start.y - cy) ** 2 - radius ** 2;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return []; // No intersection

  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

  const points: Point[] = [];
  if (t1 >= 0 && t1 <= 1) {
    points.push({ x: start.x + t1 * dx, y: start.y + t1 * dy });
  }
  if (t2 >= 0 && t2 <= 1) {
    points.push({ x: start.x + t2 * dx, y: start.y + t2 * dy });
  }

  return points;
};

/**
 * Finds the intersection points of a line and a rectangle (if any).
 * @returns An array of intersection points (0, 1, or 2 points).
 */
export const lineRectIntersection = (line: Line, rect: Rectangle): Point[] => {
  const { x, y, width, height } = rect;

  const rectLines: Line[] = [
    { start: { x, y }, end: { x: x + width, y } }, // Top
    { start: { x: x + width, y }, end: { x: x + width, y: y + height } }, // Right
    { start: { x: x + width, y: y + height }, end: { x, y: y + height } }, // Bottom
    { start: { x, y: y + height }, end: { x, y } }, // Left
  ];

  const intersections: Point[] = [];
  rectLines.forEach(rectLine => {
    const intersection = lineIntersection(line, rectLine);
    if (intersection) intersections.push(intersection);
  });

  return intersections;
};

/**
 * Rotates a line around a center point.
 * @param line The line to rotate.
 * @param center The center point to rotate around (default is the midpoint of the line).
 * @param angleRadians The angle to rotate by, in radians.
 * @returns A new rotated line.
 */
export const rotateLine = (line: Line, angleRadians: number, center: Point = midpoint(line.start, line.end)): Line => {
  return {
    start: rotateByRadians(subtract(line.start, center), angleRadians),
    end: rotateByRadians(subtract(line.end, center), angleRadians),
  };
};

/**
 * Expands a line by a given length, extending it equally in both directions.
 * @param line The line to expand.
 * @param expansionLength The total length to expand the line by.
 * @returns A new expanded line.
 */
export const expandLine = (line: Line, expansionLength: number): Line => {
  const direction = normalize(subtract(line.end, line.start));
  const expansion = scale(direction, expansionLength / 2);
  return {
    start: subtract(line.start, expansion),
    end: add(line.end, expansion),
  };
};
