import { distance, Point } from './index';

describe('2d-math-utils', () => {
  describe('distance', () => {
    it('calculates distance between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };
      expect(distance(p1, p2)).toBe(5);
    });
  });
});
