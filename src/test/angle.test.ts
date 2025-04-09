import * as angle from '../angle';

describe('angle', () => {
  describe('degreesToRadians', () => {
    it('converts common angles', () => {
      expect(angle.degreesToRadians(0)).toBe(0);
      expect(angle.degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(angle.degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(angle.degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('radiansBetweenLines', () => {
    it('calculates angles between perpendicular lines', () => {
      const horizontal = { start: {x:0, y:0}, end: {x:1, y:0} };
      const vertical = { start: {x:0, y:0}, end: {x:0, y:1} };
      expect(angle.radiansBetweenLines(horizontal, vertical)).toBeCloseTo(Math.PI / 2);
    });

    it('handles parallel lines', () => {
      const line1 = { start: {x:0, y:0}, end: {x:1, y:0} };
      const line2 = { start: {x:0, y:1}, end: {x:1, y:1} };
      expect(angle.radiansBetweenLines(line1, line2)).toBeCloseTo(0);
    });
  });

  describe('radiansToDegrees', () => {
    it('converts common angles', () => {
      expect(angle.radiansToDegrees(0)).toBe(0);
      expect(angle.radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(angle.radiansToDegrees(Math.PI)).toBeCloseTo(180);
      expect(angle.radiansToDegrees(2 * Math.PI)).toBeCloseTo(360);
    });
  });

  describe('degreesBetweenLines', () => {
    it('calculates angles between common orientations', () => {
      const horizontal = { start: {x:0, y:0}, end: {x:1, y:0} };
      const diagonal = { start: {x:0, y:0}, end: {x:1, y:1} };
      expect(angle.degreesBetweenLines(horizontal, diagonal)).toBeCloseTo(45);
    });
  });

  describe('radiansBetweenPoints', () => {
    it('calculates angles in all quadrants', () => {
      const center = { x: 0, y: 0 };
      expect(angle.radiansBetweenPoints(center, { x: 1, y: 0 })).toBeCloseTo(0);
      expect(angle.radiansBetweenPoints(center, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
      expect(angle.radiansBetweenPoints(center, { x: -1, y: 0 })).toBeCloseTo(Math.PI);
      expect(angle.radiansBetweenPoints(center, { x: 0, y: -1 })).toBeCloseTo(-Math.PI / 2);
    });
  });

  describe('degreesBetweenPoints', () => {
    it('calculates angles in all quadrants', () => {
      const center = { x: 0, y: 0 };
      expect(angle.degreesBetweenPoints(center, { x: 1, y: 0 })).toBeCloseTo(0);
      expect(angle.degreesBetweenPoints(center, { x: 0, y: 1 })).toBeCloseTo(90);
      expect(angle.degreesBetweenPoints(center, { x: -1, y: 0 })).toBeCloseTo(180);
      expect(angle.degreesBetweenPoints(center, { x: 0, y: -1 })).toBeCloseTo(-90);
    });
  });

  describe('degreesBetween', () => {
    it('finds shortest angle between degrees', () => {
      expect(angle.degreesBetweenAngles(0, 90)).toBeCloseTo(90);
      expect(angle.degreesBetweenAngles(350, 10)).toBeCloseTo(20);
      expect(angle.degreesBetweenAngles(0, 180)).toBeCloseTo(180);
      expect(angle.degreesBetweenAngles(90, 270)).toBeCloseTo(180);
    });
  });

  describe('radiansBetween', () => {
    it('finds shortest angle between radians', () => {
      expect(angle.radiansBetweenAngles(0, Math.PI/2)).toBeCloseTo(Math.PI/2);
      expect(angle.radiansBetweenAngles(2*Math.PI-0.1, 0.1)).toBeCloseTo(0.2);
    });
  });

  describe('rotateAroundByRadians', () => {
    it('rotates points around origin', () => {
      const point = { x: 1, y: 0 };
      const center = { x: 0, y: 0 };
      
      const result = angle.rotateAroundByRadians(point, center, Math.PI/2);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });

    it('rotates points around arbitrary center', () => {
      const point = { x: 2, y: 1 };
      const center = { x: 1, y: 1 };
      
      const result = angle.rotateAroundByRadians(point, center, Math.PI);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });
  });

  describe('rotateAroundByDegrees', () => {
    it('rotates points by degrees', () => {
      const point = { x: 1, y: 0 };
      const center = { x: 0, y: 0 };
      
      const result = angle.rotateAroundByDegrees(point, center, 90);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
    });
  });

  describe('rotateAngleTowardsRadians', () => {
    it('rotates towards target with clamped amount', () => {
      const point = { x: 0, y: 0 };
      const target = { x: 0, y: 1 }; // Points up (90°)
      const current = 0; // Starting at 0°
      const maxRotate = Math.PI/4; // Can rotate 45° max
      
      const result = angle.rotateAngleTowardsRadians(point, target, current, maxRotate);
      expect(result).toBeCloseTo(Math.PI/4); // Should rotate 45° towards 90°
    });

    it('reaches target if within rotation amount', () => {
      const point = { x: 0, y: 0 };
      const target = { x: 1, y: 1 }; // 45°
      const current = 0;
      const maxRotate = Math.PI; // Can rotate 180°
      
      const result = angle.rotateAngleTowardsRadians(point, target, current, maxRotate);
      expect(result).toBeCloseTo(Math.PI/4); // Should reach 45°
    });
  });

  describe('rotateAngleTowardsDegrees', () => {
    it('rotates towards target with clamped amount', () => {
      const point = { x: 0, y: 0 };
      const target = { x: 0, y: 1 }; // Points up (90°)
      
      const result = angle.rotateAngleTowardsDegrees(point, target, 0, 45);
      expect(result).toBeCloseTo(45); // Should rotate 45° towards 90°
    });
  });
});
