import { Line, Circle, Rectangle, Point } from './types';
import { distance, midpoint } from './point';
import { rotateByRadians, scale, subtract, add, normalize } from './vector';


/**
 * Finds the intersection point of two lines (if any).
 * @returns The intersection point or null if the lines do not intersect.
 */
export const getLineIntersection = (line1: Line, line2: Line): Point | null => {
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
export const getLineCircleIntersections = (line: Line, circle: Circle): Point[] => {
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
export const getLineRectIntersections = (line: Line, rect: Rectangle): Point[] => {
  const { x, y, width, height } = rect;

  const rectLines: Line[] = [
    { start: { x, y }, end: { x: x + width, y } }, // Top
    { start: { x: x + width, y }, end: { x: x + width, y: y + height } }, // Right
    { start: { x: x + width, y: y + height }, end: { x, y: y + height } }, // Bottom
    { start: { x, y: y + height }, end: { x, y } }, // Left
  ];

  const intersections: Point[] = [];
  rectLines.forEach(rectLine => {
    const intersection = getLineIntersection(line, rectLine);
    if (intersection) intersections.push(intersection);
  });

  return intersections;
};

/**
 * Checks if two circles overlap.
 * @returns The depth of overlap or 0 if no overlap.
 */
export const getCircleOverlap = (circle1: Circle, circle2: Circle): number => {
  const d = distance(circle1, circle2);
  const overlap = circle1.radius + circle2.radius - d;
  return overlap > 0 ? overlap : 0; // Return overlap depth or 0 if no overlap
};

/**
 * Returns the intersection rectangle of two rectangles or null if there is no overlap.
 * @returns The intersection rectangle or null if there is no overlap.
 */
export const getRectanglesIntersection = (rect1: Rectangle, rect2: Rectangle): Rectangle | null => {
  const x = Math.max(rect1.x, rect2.x);
  const y = Math.max(rect1.y, rect2.y);
  const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
  const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;

  if (width > 0 && height > 0) {
    return { x, y, width, height };
  }

  return null; // No intersection
};