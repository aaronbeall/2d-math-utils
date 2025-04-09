import { Vector2d } from "./types";

/**
 * Creates a zero vector (0,0)
 * @example
 * zero() // returns {x: 0, y: 0}
 */
export const zero = (): Vector2d => ({ x: 0, y: 0 });

/**
 * Adds two vectors
 * @example
 * add({x:1,y:2}, {x:3,y:4}) // returns {x:4,y:6}
 */
export const add = (v1: Vector2d, v2: Vector2d): Vector2d => ({ 
  x: v1.x + v2.x, 
  y: v1.y + v2.y 
});

/**
 * Subtracts second vector from first
 * @example
 * subtract({x:3,y:4}, {x:1,y:1}) // returns {x:2,y:3}
 */
export const subtract = (v1: Vector2d, v2: Vector2d): Vector2d => ({ 
  x: v1.x - v2.x, 
  y: v1.y - v2.y 
});

/**
 * Multiplies vector by scalar value
 * @example
 * scale({x:2,y:3}, 2) // returns {x:4,y:6}
 */
export const scale = (v: Vector2d, scalar: number): Vector2d => ({ 
  x: v.x * scalar, 
  y: v.y * scalar 
});

/**
 * Calculates length of vector
 * @example
 * length({x:3,y:4}) // returns 5
 */
export const length = (v: Vector2d): number => 
  Math.sqrt(v.x * v.x + v.y * v.y);

/**
 * Returns unit vector (length 1) in same direction
 * @example
 * normalize({x:3,y:4}) // returns {x:0.6,y:0.8}
 */
export const normalize = (v: Vector2d): Vector2d => {
  const len = length(v);
  return len === 0 ? zero() : scale(v, 1 / len);
};

/**
 * Limits vector length while preserving direction
 * @example
 * clampLength({x:3,y:4}, 2) // returns {x:1.2,y:1.6}
 */
export const clampLength = (v: Vector2d, maxLength: number): Vector2d => {
  const len = length(v);
  return len > maxLength ? scale(normalize(v), maxLength) : v;
};

/**
 * Linear interpolation between two vectors.
 * @param start Starting vector
 * @param end Ending vector
 * @param t Interpolation value (0-1). 0 = start, 1 = end, 0.5 = halfway between
 */
export const interpolate = (start: Vector2d, end: Vector2d, t: number): Vector2d => ({
  x: start.x + (end.x - start.x) * Math.max(0, Math.min(1, t)),
  y: start.y + (end.y - start.y) * Math.max(0, Math.min(1, t))
});

/**
 * Inverse linear interpolation - returns how far along the interpolation a point is
 * @returns Value between 0-1 representing position between start and end
 */
export const inverseInterpolation = (start: Vector2d, end: Vector2d, point: Vector2d): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dp = subtract(point, start);
  return Math.max(0, Math.min(1, (dp.x * dx + dp.y * dy) / (dx * dx + dy * dy)));
};

/**
 * Moves a point towards a target by a maximum distance
 * @example
 * const current = {x:0, y:0};
 * const target = {x:10, y:0};
 * moveTowards(current, target, 2) // returns {x:2, y:0}
 * moveTowards(current, target, 20) // returns {x:10, y:0}
 */
export const moveTowards = (current: Vector2d, target: Vector2d, maxDistance: number): Vector2d => {
  const diff = subtract(target, current);
  const dist = length(diff);
  return dist <= maxDistance ? target : add(current, scale(normalize(diff), maxDistance));
};

/**
 * Reflects a vector off a surface
 * @param vector The incoming vector (like velocity)
 * @param normal The normalized surface normal
 * @example
 * const velocity = {x:1, y:1};
 * const wallNormal = {x:1, y:0};
 * reflect(velocity, wallNormal) // returns {x:-1, y:1}
 */
export const reflect = (vector: Vector2d, normal: Vector2d): Vector2d => {
  const dot = 2 * (vector.x * normal.x + vector.y * normal.y);
  return {
    x: vector.x - dot * normal.x,
    y: vector.y - dot * normal.y
  };
};

/**
 * Creates a vector from an angle and length
 * @param angleRadians Angle in radians (0 = right, π/2 = down)
 * @param length Length of resulting vector
 * @example
 * fromAngleRadians(Math.PI/2, 5) // returns {x:0, y:5} (pointing down with length 5)
 */
export const fromAngleRadians = (angleRadians: number, length: number): Vector2d => ({
    x: Math.cos(angleRadians) * length,
    y: Math.sin(angleRadians) * length
});

/**
 * Creates a vector from an angle in degrees and length
 * @param angleDegrees Angle in degrees (0 = right, 90 = down)
 * @param length Length of resulting vector
 * @example
 * fromAngleDegrees(90, 5) // returns {x:0, y:5} (pointing down with length 5)
 */
export const fromAngleDegrees = (angleDegrees: number, length: number): Vector2d => 
    fromAngleRadians(angleDegrees * Math.PI / 180, length);