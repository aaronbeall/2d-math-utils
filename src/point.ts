import { Circle, Line, Point, Rectangle } from './types';

/**
 * Calculates Euclidean distance between two points
 * @example
 * const p1 = {x: 0, y: 0};
 * const p2 = {x: 3, y: 4};
 * distance(p1, p2) // returns 5
 */
export const distance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculates squared distance between points (faster than distance)
 * @example
 * const p1 = {x: 0, y: 0};
 * const p2 = {x: 3, y: 4};
 * distanceSquared(p1, p2) // returns 25
 */
export const distanceSquared = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
};

/**
 * Finds point halfway between two points
 * @example
 * const p1 = {x: 0, y: 0};
 * const p2 = {x: 2, y: 4};
 * midpoint(p1, p2) // returns {x: 1, y: 2}
 */
export const midpoint = (p1: Point, p2: Point): Point => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

/**
 * Finds the closest point from a list of points
 * @example
 * const target = { x: 0, y: 0 };
 * const points = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
 * closest(target, points) // returns { x: 1, y: 1 }
 */
export const closest = (target: Point, points: Point[]): Point => {
    if (!points.length) throw new Error('Points array is empty');
    return points.reduce((closest, point) => 
        distanceSquared(target, point) < distanceSquared(target, closest) 
            ? point 
            : closest
    );
};

/**
 * Checks if a point is inside a circle
 * @example
 * const circle = { x: 0, y: 0, radius: 5 };
 * isPointInCircle({x:3, y:4}, circle) // returns true
 * isPointInCircle({x:4, y:4}, circle) // returns false
 */
export const isPointInCircle = (point: Point, circle: Circle): boolean => {
  const distSquared = distanceSquared(point, { x: circle.x, y: circle.y });
  return distSquared < circle.radius * circle.radius;
};

/**
 * Checks if a point is inside a rectangle
 * @example
 * const rect = { x: 0, y: 0, width: 10, height: 10 };
 * isPointInRectangle({x:5, y:5}, rect) // returns true
 * isPointInRectangle({x:11, y:5}, rect) // returns false
 */
export const isPointInRectangle = (point: Point, rect: Rectangle): boolean => (
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height
);

/**
 * Checks if a point is within a certain distance of a line segment
 * @param width The thickness of the line
 * @example
 * const line = { 
 *   start: {x:0, y:0}, 
 *   end: {x:10, y:0} 
 * };
 * isPointInLine({x:5, y:1}, line, 2) // returns true
 * isPointInLine({x:5, y:2}, line, 2) // returns false
 */
export const isPointInLine = (point: Point, line: Line, width: number = 1): boolean => {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const lineLength = Math.sqrt(dx * dx + dy * dy);
  
  if (lineLength === 0) {
    return distance(point, line.start) <= width / 2;
  }

  const t = ((point.x - line.start.x) * dx + (point.y - line.start.y) * dy) / (lineLength * lineLength);

  if (t < 0) return distance(point, line.start) <= width / 2;
  if (t > 1) return distance(point, line.end) <= width / 2;

  const projX = line.start.x + t * dx;
  const projY = line.start.y + t * dy;
  const distToLine = distance(point, { x: projX, y: projY });

  return distToLine <= width / 2;
};
