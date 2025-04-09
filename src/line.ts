import { Line } from './types';
import { distance } from './point';

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