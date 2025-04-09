import * as point from '../point';

describe('point', () => {
  describe('distance', () => {
    it('calculates distance between points', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(point.distance(p1, p2)).toBe(5);
    });

    it('returns 0 for same point', () => {
      const p = { x: 1, y: 1 };
      expect(point.distance(p, p)).toBe(0);
    });
  });

  describe('isPointInCircle', () => {
    const circle = { x: 0, y: 0, radius: 5 };

    it('returns true for points inside circle', () => {
      expect(point.isPointInCircle({ x: 3, y: 0 }, circle)).toBe(true);
      expect(point.isPointInCircle({ x: 3, y: 4 }, circle)).toBe(true);
    });

    it('returns false for points outside circle', () => {
      expect(point.isPointInCircle({ x: 6, y: 0 }, circle)).toBe(false);
    });
  });

  describe('distanceSquared', () => {
    it('calculates squared distance', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(point.distanceSquared(p1, p2)).toBe(25);
    });

    it('matches distance * distance', () => {
      const p1 = { x: 1, y: 2 };
      const p2 = { x: 4, y: 6 };
      const dist = point.distance(p1, p2);
      expect(point.distanceSquared(p1, p2)).toBe(dist * dist);
    });
  });

  describe('midpoint', () => {
    it('finds point halfway between', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 2, y: 4 };
      expect(point.midpoint(p1, p2)).toEqual({ x: 1, y: 2 });
    });

    it('handles negative coordinates', () => {
      const p1 = { x: -2, y: -2 };
      const p2 = { x: 2, y: 2 };
      expect(point.midpoint(p1, p2)).toEqual({ x: 0, y: 0 });
    });
  });

  describe('isPointInRectangle', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };

    it('returns true for points inside', () => {
      expect(point.isPointInRectangle({ x: 5, y: 5 }, rect)).toBe(true);
      expect(point.isPointInRectangle({ x: 0, y: 0 }, rect)).toBe(true); // corner
      expect(point.isPointInRectangle({ x: 10, y: 10 }, rect)).toBe(true); // opposite corner
    });

    it('returns false for points outside', () => {
      expect(point.isPointInRectangle({ x: -1, y: 5 }, rect)).toBe(false);
      expect(point.isPointInRectangle({ x: 11, y: 5 }, rect)).toBe(false);
      expect(point.isPointInRectangle({ x: 5, y: 11 }, rect)).toBe(false);
    });
  });

  describe('isPointInLine', () => {
    const horizontal = { start: { x: 0, y: 0 }, end: { x: 10, y: 0 } };
    
    it('returns true for points on line', () => {
      expect(point.isPointInLine({ x: 5, y: 0 }, horizontal)).toBe(true);
      expect(point.isPointInLine({ x: 0, y: 0 }, horizontal)).toBe(true); // endpoint
    });

    it('returns true for points within width', () => {
      expect(point.isPointInLine({ x: 5, y: 0.4 }, horizontal, 1)).toBe(true);
      expect(point.isPointInLine({ x: 5, y: -0.4 }, horizontal, 1)).toBe(true);
    });

    it('returns false for points too far', () => {
      expect(point.isPointInLine({ x: 5, y: 1 }, horizontal, 1)).toBe(false);
      expect(point.isPointInLine({ x: 11, y: 0 }, horizontal, 1)).toBe(false);
    });

    it('handles zero-length lines', () => {
      const p0 = { x: 0, y: 0 };
      const line = { start: p0, end: p0 };
      expect(point.isPointInLine({ x: 0.4, y: 0 }, line, 1)).toBe(true);
      expect(point.isPointInLine({ x: 1, y: 0 }, line, 1)).toBe(false);
    });

    it('handles diagonal lines', () => {
      const diagonal = { start: { x: 0, y: 0 }, end: { x: 10, y: 10 } };
      expect(point.isPointInLine({ x: 5, y: 5 }, diagonal)).toBe(true);
      expect(point.isPointInLine({ x: 5, y: 6 }, diagonal)).toBe(false);
    });
  });
});
