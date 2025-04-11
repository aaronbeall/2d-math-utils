import { Line, Point } from './types';
import { distance } from './point';

/**
 * Converts degrees to radians
 * @example
 * degreesToRadians(180) // returns Math.PI
 */
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees
 * @example
 * radiansToDegrees(Math.PI) // returns 180
 */
export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
}

/**
 * Calculates angle between two lines in radians
 * @example
 * const horizontal = { start: {x:0,y:0}, end: {x:1,y:0} };
 * const vertical = { start: {x:0,y:0}, end: {x:0,y:0}, end: {x:0,y:1} };
 * radiansBetweenLines(horizontal, vertical) // returns Math.PI/2 (90 degrees)
 */
export const radiansBetweenLines = (line1: Line, line2: Line): number => {
  const dx1 = line1.end.x - line1.start.x;
  const dy1 = line1.end.y - line1.start.y;
  const dx2 = line2.end.x - line2.start.x;
  const dy2 = line2.end.y - line2.start.y;

  const dotProduct = dx1 * dx2 + dy1 * dy2;
  const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

  const cosTheta = dotProduct / (magnitude1 * magnitude2);
  return Math.acos(cosTheta);
}

/**
 * Calculates angle between two lines in degrees
 * @example
 * const horizontal = { start: {x:0,y:0}, end: {x:1,y:0} };
 * const diagonal = { start: {x:0,y:0}, end: {x:1,y:1} };
 * degreesBetweenLines(horizontal, diagonal) // returns 45
 */
export const degreesBetweenLines = (line1: Line, line2: Line): number => {
  return radiansToDegrees(radiansBetweenLines(line1, line2));
}

/**
 * Gets angle in radians from p1 to p2 (0 = right, π/2 = down)
 * @example
 * const center = {x:0, y:0};
 * const point = {x:0, y:1};
 * radiansBetweenPoints(center, point) // returns Math.PI/2 (pointing down)
 */
export const radiansBetweenPoints = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx);
}

/**
 * Gets angle in degrees from p1 to p2 (0 = right, 90 = down)
 * @example
 * const center = {x:0, y:0};
 * const point = {x:-1, y:0};
 * degreesBetweenPoints(center, point) // returns 180 (pointing left)
 */
export const degreesBetweenPoints = (p1: Point, p2: Point): number => {
  return radiansToDegrees(radiansBetweenPoints(p1, p2));
}

/**
 * Calculates smallest angle between two angles in degrees
 * @example
 * degreesBetweenAngles(350, 10) // returns 20 (not 340)
 * degreesBetweenAngles(0, 180) // returns 180
 */
export const degreesBetweenAngles = (degrees1: number, degrees2: number): number => {
  const radians1 = degreesToRadians(degrees1);
  const radians2 = degreesToRadians(degrees2);
  const diff = radians2 - radians1;
  return radiansToDegrees(Math.atan2(Math.sin(diff), Math.cos(diff)));
}

/**
 * Calculates smallest angle between two angles in radians
 * @example
 * radiansBetweenAngles(2*Math.PI-0.1, 0.1) // returns 0.2 (not 2*Math.PI-0.2)
 */
export const radiansBetweenAngles = (radians1: number, radians2: number): number => {
  const diff = radians2 - radians1;
  return Math.atan2(Math.sin(diff), Math.cos(diff));
}

/**
 * Rotates a point around a center point by an angle in radians
 * @example
 * const point = {x:2, y:0};
 * const center = {x:0, y:0};
 * rotateAroundByRadians(center, point, Math.PI/2) // returns {x:0, y:2}
 */
export const rotateAroundByRadians = (center: Point, point: Point, angleRadians: number): Point => {
  const angleToTarget = radiansBetweenPoints(center, point);
  const distanceToTarget = distance(center, point);

  return {
    x: center.x + Math.cos(angleToTarget + angleRadians) * distanceToTarget,
    y: center.y + Math.sin(angleToTarget + angleRadians) * distanceToTarget,
  };
}

/**
 * Rotates a point around a center point by an angle in degrees
 * @example
 * const point = {x:1, y:0};
 * const center = {x:0, y:0};
 * rotateAroundByDegrees(point, center, 90) // returns {x:0, y:1}
 */
export const rotateAroundByDegrees = (center: Point, point: Point, angleDegrees: number): Point => {
  return rotateAroundByRadians(center, point, degreesToRadians(angleDegrees));
}

/**
 * Adjusts an angle towards the angle between two points by a specified amount,
 * choosing the shortest rotation path.
 * 
 * @param currentAngleRadians - The current angle in radians
 * @param targetAngleRadians - The target angle in radians
 * @param rotateAmountRadians - Maximum amount to rotate by in radians
 * @returns The new angle in radians
 */
export const rotateAngleTowardsRadians = (
  currentAngleRadians: number,
  targetAngleRadians: number,
  rotateAmountRadians: number
): number => {
  // Normalize angles to [0, 2π]
  const current = ((currentAngleRadians % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const normalizedTarget = ((targetAngleRadians % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Calculate shortest angular distance
  let diff = normalizedTarget - current;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;

  // Clamp rotation to the specified amount
  const rotation = Math.abs(diff) <= rotateAmountRadians 
    ? diff 
    : Math.sign(diff) * rotateAmountRadians;

  return current + rotation;
};

/**
 * Adjusts an angle towards the angle between two points by a specified amount,
 * choosing the shortest rotation path.
 * 
 * @param currentAngleDegrees - The current angle in degrees
 * @param targetAngleDegrees - The target angle in degrees
 * @param rotateAmountDegrees - Maximum amount to rotate by in degrees
 * @returns The new angle in degrees
 */
export const rotateAngleTowardsDegrees = (
  currentAngleDegrees: number,
  targetAngleDegrees: number,
  rotateAmountDegrees: number
): number => {
  return radiansToDegrees(
    rotateAngleTowardsRadians(
      degreesToRadians(currentAngleDegrees),
      degreesToRadians(targetAngleDegrees),
      degreesToRadians(rotateAmountDegrees)
    )
  );
};