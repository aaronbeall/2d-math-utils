import * as vector from '../vector';

describe('vector', () => {
  describe('zero', () => {
    it('returns zero vector', () => {
      expect(vector.zero()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('add', () => {
    it('adds vectors', () => {
      const v1 = { x: 1, y: 2 };
      const v2 = { x: 3, y: 4 };
      expect(vector.add(v1, v2)).toEqual({ x: 4, y: 6 });
    });
  });

  describe('subtract', () => {
    it('subtracts vectors', () => {
      const v1 = { x: 3, y: 4 };
      const v2 = { x: 1, y: 1 };
      expect(vector.subtract(v1, v2)).toEqual({ x: 2, y: 3 });
    });

    it('handles negative results', () => {
      const v1 = { x: 1, y: 1 };
      const v2 = { x: 3, y: 4 };
      expect(vector.subtract(v1, v2)).toEqual({ x: -2, y: -3 });
    });
  });

  describe('scale', () => {
    it('multiplies vector by scalar', () => {
      const v = { x: 2, y: 3 };
      expect(vector.scale(v, 2)).toEqual({ x: 4, y: 6 });
    });

    it('handles negative scalars', () => {
      const v = { x: 2, y: 3 };
      expect(vector.scale(v, -1)).toEqual({ x: -2, y: -3 });
    });
  });

  describe('length', () => {
    it('calculates vector length', () => {
      expect(vector.length({ x: 3, y: 4 })).toBe(5);
    });

    it('handles zero vector', () => {
      expect(vector.length({ x: 0, y: 0 })).toBe(0);
    });
  });

  describe('normalize', () => {
    it('creates unit vector', () => {
      const v = { x: 3, y: 4 };
      const normalized = vector.normalize(v);
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
    });

    it('handles zero vector', () => {
      expect(vector.normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    });
  });

  describe('clampLength', () => {
    it('clamps long vectors', () => {
      const result = vector.clampLength({ x: 3, y: 4 }, 2.5);
      expect(result.x).toBeCloseTo(1.5);
      expect(result.y).toBeCloseTo(2);
    });

    it('leaves short vectors unchanged', () => {
      const v = { x: 1, y: 1 };
      expect(vector.clampLength(v, 2)).toEqual(v);
    });
  });

  describe('interpolate', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 10, y: 20 };

    it('interpolates between vectors', () => {
      expect(vector.interpolate(start, end, 0.5)).toEqual({ x: 5, y: 10 });
    });

    it('clamps t value', () => {
      expect(vector.interpolate(start, end, -1)).toEqual(start);
      expect(vector.interpolate(start, end, 2)).toEqual(end);
    });
  });

  describe('inverseInterpolation', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 10, y: 10 };

    it('finds interpolation position', () => {
      const point = { x: 5, y: 5 };
      expect(vector.interpolateInverse(start, end, point)).toBeCloseTo(0.5);
    });

    it('clamps result to 0-1', () => {
      expect(vector.interpolateInverse(start, end, { x: -5, y: -5 })).toBe(0);
      expect(vector.interpolateInverse(start, end, { x: 15, y: 15 })).toBe(1);
    });
  });

  describe('moveTowards', () => {
    it('moves by max distance', () => {
      const result = vector.moveTowards({ x: 0, y: 0 }, { x: 10, y: 0 }, 2);
      expect(result).toEqual({ x: 2, y: 0 });
    });

    it('reaches target if close enough', () => {
      const target = { x: 3, y: 0 };
      expect(vector.moveTowards({ x: 0, y: 0 }, target, 5)).toEqual(target);
    });
  });

  describe('reflect', () => {
    it('reflects vector off surface', () => {
      const velocity = { x: 1, y: 1 };
      const normal = { x: 1, y: 0 }; // vertical wall
      const reflected = vector.reflect(velocity, normal);
      expect(reflected.x).toBeCloseTo(-1);
      expect(reflected.y).toBeCloseTo(1);
    });
  });
});
