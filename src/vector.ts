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
 * Calculates the normal vector (perpendicular) between two vectors.
 * @param v1 First vector
 * @param v2 Second vector
 * @returns A normalized vector perpendicular to the edge from v1 to v2
 * @example
 * const v1 = { x: 0, y: 0 };
 * const v2 = { x: 1, y: 0 };
 * normal(v1, v2) // returns { x: 0, y: -1 }
 */
export const normal = (v1: Vector2d, v2: Vector2d): Vector2d => {
    const edge = subtract(v2, v1);
    return normalize({ x: -edge.y, y: edge.x }); // Perpendicular to the edge
};

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
 * Clamps vector length between a minimum and maximum value while preserving direction.
 * @param v The vector to clamp.
 * @param minLength The minimum length of the vector.
 * @param maxLength The maximum length of the vector.
 * @example
 * clampLength({x:3,y:4}, 2, 5) // returns {x:3,y:4} (unchanged)
 * clampLength({x:3,y:4}, 6, 10) // returns {x:4.5,y:6} (scaled up to min length)
 * clampLength({x:3,y:4}, 1, 3) // returns {x:1.8,y:2.4} (scaled down to max length)
 */
export const clamp = (v: Vector2d, minLength: number, maxLength: number): Vector2d => {
    const len = length(v);
    const clampedLength = Math.max(minLength, Math.min(maxLength, len));
    return scale(normalize(v), clampedLength);
};

/**
 * Linear interpolation between two vectors.
 * @param start Starting vector
 * @param end Ending vector
 * @param t Interpolation value (0-1). 0 = start, 1 = end, 0.5 = halfway between
 */
export const interpolate = (start: Vector2d, end: Vector2d, t: number): Vector2d => ({
  x: start.x + (end.x - start.x) * t,
  y: start.y + (end.y - start.y) * t
});

/**
 * Inverse linear interpolation - returns how far along the interpolation a point is
 * @returns Value between 0-1 representing position between start and end
 */
export const interpolateInverse = (start: Vector2d, end: Vector2d, point: Vector2d): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dp = subtract(point, start);
  return Math.max(0, Math.min(1, (dp.x * dx + dp.y * dy) / (dx * dx + dy * dy)));
};

/**
 * Reflects a vector off a surface using formula R = V - 2(V·N)N
 * @param vector The incoming vector V (like velocity)
 * @param normal The normalized surface normal N
 * @example
 * const velocity = {x:1, y:1};
 * const wallNormal = {x:1, y:0};
 * reflect(velocity, wallNormal) // returns {x:-1, y:1}
 */
export const reflect = (vector: Vector2d, normal: Vector2d): Vector2d => {
    // Using reflection formula R = V - 2(V·N)N
    const dotProduct = 2 * dot(vector, normal); // 2(V·N)
    return {
        x: vector.x - dotProduct * normal.x,
        y: vector.y - dotProduct * normal.y
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

/**
 * Rotates a vector by an angle in radians
 * @param v Vector to rotate
 * @param angleRadians Angle in radians to rotate by (positive = clockwise)
 * @example
 * const v = {x:1, y:0};
 * rotateByRadians(v, Math.PI/2) // returns {x:0, y:1}
 */
export const rotateByRadians = (v: Vector2d, angleRadians: number): Vector2d => {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos
    };
};

/**
 * Rotates a vector by an angle in degrees
 * @param v Vector to rotate
 * @param angleDegrees Angle in degrees to rotate by (positive = clockwise)
 * @example
 * const v = {x:1, y:0};
 * rotateByDegrees(v, 90) // returns {x:0, y:1}
 */
export const rotateByDegrees = (v: Vector2d, angleDegrees: number): Vector2d =>
    rotateByRadians(v, angleDegrees * Math.PI / 180);

/**
 * Calculates the dot product of two vectors
 * @example
 * const v1 = { x: 1, y: 0 };
 * const v2 = { x: 0, y: 1 };
 * dot(v1, v2) // returns 0
 */
export const dot = (v1: Vector2d, v2: Vector2d): number => 
  v1.x * v2.x + v1.y * v2.y;

/**
 * Resizes a vector to a specified length while preserving its direction.
 * @param v The vector to resize.
 * @param newLength The desired length of the vector.
 * @example
 * resize({x:3, y:4}, 10) // returns {x:6, y:8}
 */
export const resize = (v: Vector2d, newLength: number): Vector2d => {
    return scale(normalize(v), newLength);
};

