import * as vector from '../../src/vector';
import * as point from '../../src/point';
import * as angle from '../../src/angle';
import { DemoFunction } from './index';
import { clearCanvas, drawPoint, drawLine, drawResults, drawArrow, drag, move, key, drawCircle, animate } from '../utils';

export const vectorDemos: Record<keyof typeof vector, DemoFunction> = {
    zero: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        const v = vector.zero();

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, center, 'blue');
            drawArrow(ctx, center, vector.add(center, v));
            drawResults(ctx, [
                ['Vector', v],
                'Zero vector has no direction or length'
            ]);
        }

        draw();
    },

    add: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v1 = { x: 100, y: 0 };
        let v2 = { x: 0, y: 100 };

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v1), 'blue');
            drawArrow(ctx, vector.add(center, v1), vector.add(vector.add(center, v1), v2), 'red');
            drawArrow(ctx, center, vector.add(center, vector.add(v1, v2)), 'green');
            
            drawResults(ctx, [
                ['Vector 1', v1],
                ['Vector 2', v2],
                ['Sum', vector.add(v1, v2)],
                'Drag blue/red arrows to adjust vectors'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => {
                const end1 = vector.add(center, v1);
                const end2 = vector.add(vector.add(center, v1), v2);
                const closest = point.closest(pos, [end1, end2]);
                if (closest === end1) v1 = vector.subtract(pos, center);
                else v2 = vector.subtract(pos, vector.add(center, v1));
            }
        });

        draw();
    },

    subtract: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v1 = { x: 100, y: 0 };
        let v2 = { x: 0, y: 100 };

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v1), 'blue');
            drawArrow(ctx, center, vector.add(center, v2), 'red');
            drawArrow(ctx, center, vector.add(center, vector.subtract(v1, v2)), 'green');
            
            drawResults(ctx, [
                ['Vector 1', v1],
                ['Vector 2', v2],
                ['Difference', vector.subtract(v1, v2)],
                'Drag blue/red arrows to adjust vectors'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => {
                const end1 = vector.add(center, v1);
                const end2 = vector.add(center, v2);
                const closest = point.closest(pos, [end1, end2]);
                if (closest === end1) v1 = vector.subtract(pos, center);
                else v2 = vector.subtract(pos, center);
            }
        });

        draw();
    },

    scale: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v = { x: 100, y: 0 };
        let scale = 1;

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v), 'blue');
            drawArrow(ctx, center, vector.add(center, vector.scale(v, scale)), 'green');
            
            drawResults(ctx, [
                ['Vector', v],
                ['Scale', scale],
                ['Result', vector.scale(v, scale)],
                'Drag blue arrow to adjust vector',
                'Use +/- to adjust scale'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => v = vector.subtract(pos, center)
        });

        key({ canvas, draw }, {
            '+=': () => scale *= 1.1,
            '-_': () => scale /= 1.1
        });

        draw();
    },

    length: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v = { x: 100, y: 0 };

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v));
            
            drawResults(ctx, [
                ['Vector', v],
                ['Length', vector.length(v)],
                'Drag arrow to adjust vector'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => v = vector.subtract(pos, center)
        });

        draw();
    },

    normalize: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v = { x: 100, y: 0 };

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v), 'blue');
            drawArrow(ctx, center, vector.add(center, vector.normalize(v)), 'green');
            
            drawResults(ctx, [
                ['Vector', v],
                ['Length', vector.length(v)],
                ['Normalized', vector.normalize(v)],
                'Drag arrow to adjust vector'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => v = vector.subtract(pos, center)
        });

        draw();
    },

    clampLength: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v = { x: 100, y: 0 };
        let maxLength = 100;

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v), 'blue');
            drawArrow(ctx, center, vector.add(center, vector.clampLength(v, maxLength)), 'green');
            drawCircle(ctx, { ...center, radius: maxLength });
            
            drawResults(ctx, [
                ['Vector', v],
                ['Length', vector.length(v)],
                ['Max Length', maxLength],
                'Drag arrow to adjust vector',
                'Use +/- to adjust max length'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => v = vector.subtract(pos, center)
        });

        key({ canvas, draw }, {
            '+=': () => maxLength += 10,
            '-_': () => maxLength = Math.max(10, maxLength - 10)
        });

        draw();
    },

    interpolate: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v1 = { x: -100, y: 0 };
        let v2 = { x: 100, y: 0 };
        let t = 0.5;

        function draw() {
            clearCanvas(ctx);
            const start = vector.add(center, v1);
            const end = vector.add(center, v2);
            const result = vector.add(center, vector.interpolate(v1, v2, t));
            
            drawArrow(ctx, center, start, 'blue');
            drawArrow(ctx, center, end, 'red');
            drawArrow(ctx, center, result, 'green');
            
            drawResults(ctx, [
                ['Vector 1', v1],
                ['Vector 2', v2],
                ['t', t],
                ['Result', vector.interpolate(v1, v2, t)],
                'Drag blue/red arrows to adjust vectors',
                'Use +/- to adjust t'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => {
                const end1 = vector.add(center, v1);
                const end2 = vector.add(center, v2);
                const closest = point.closest(pos, [end1, end2]);
                if (closest === end1) v1 = vector.subtract(pos, center);
                else v2 = vector.subtract(pos, center);
            }
        });

        key({ canvas, draw }, {
            '+=': () => t = Math.min(1, t + 0.1),
            '-_': () => t = Math.max(0, t - 0.1)
        });

        draw();
    },

    interpolateInverse: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v1 = { x: -100, y: 0 };
        let v2 = { x: 100, y: 0 };
        let p = { x: 0, y: 0 };

        function draw() {
            clearCanvas(ctx);
            const start = vector.add(center, v1);
            const end = vector.add(center, v2);
            const pos = vector.add(center, p);
            const t = vector.interpolateInverse(v1, v2, p);
            const projected = vector.add(center, vector.interpolate(v1, v2, t));
            
            // Draw base vectors
            drawArrow(ctx, center, start, 'blue');
            drawArrow(ctx, center, end, 'red');
            
            // Draw point and its projection onto the interpolation line
            drawPoint(ctx, pos, 'green');
            drawPoint(ctx, projected, 'black');
            drawLine(ctx, { start: pos, end: projected }, 'gray');
            
            drawResults(ctx, [
                ['Start', v1],
                ['End', v2],
                ['Point', p],
                ['t', t],
                'Drag blue/red arrows for vectors',
                'Move mouse to test positions'
            ]);
        }

        move({ canvas, draw }, pos => p = vector.subtract(pos, center));

        drag({ canvas, draw }, {
            onDrag: pos => {
                const end1 = vector.add(center, v1);
                const end2 = vector.add(center, v2);
                const closest = point.closest(pos, [end1, end2]);
                if (closest === end1) v1 = vector.subtract(pos, center);
                else v2 = vector.subtract(pos, center);
            }
        });

        draw();
    },

    reflect: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let velocity = { x: 100, y: 100 };
        let normal = vector.fromAngleRadians(0, 1);  // Start pointing right, length 1
        const rotateAmount = Math.PI/12;
        
        function draw() {
            clearCanvas(ctx);
            const normalVec = vector.scale(vector.normalize(normal), 100);
            
            // Draw surface normal
            drawArrow(ctx, center, vector.add(center, normalVec), 'blue');
            
            // Draw incoming vector
            drawArrow(ctx, center, vector.add(center, velocity), 'red');
            
            // Draw reflected vector
            const reflected = vector.reflect(velocity, vector.normalize(normal));
            drawArrow(ctx, center, vector.add(center, reflected), 'green');
            
            drawResults(ctx, [
                ['Normal', normal],
                ['Velocity', velocity],
                ['Reflected', reflected],
                'Drag red arrow to adjust velocity',
                'Use +/- to rotate surface'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => velocity = vector.subtract(pos, center)
        });

        key({ canvas, draw }, {
            '+=': () => {
                const currentAngle = angle.radiansBetweenPoints(center, vector.add(center, normal));
                normal = vector.fromAngleRadians(currentAngle + rotateAmount, 1);
            },
            '-_': () => {
                const currentAngle = angle.radiansBetweenPoints(center, vector.add(center, normal));
                normal = vector.fromAngleRadians(currentAngle - rotateAmount, 1);
            }
        });

        draw();
    },

    fromAngleRadians: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let angle = 0;
        let length = 100;

        function draw() {
            clearCanvas(ctx);
            const v = vector.fromAngleRadians(angle, length);
            drawArrow(ctx, center, vector.add(center, v));
            
            drawResults(ctx, [
                ['Angle (rad)', angle],
                ['Length', length],
                ['Vector', v],
                'Use +/- to adjust angle',
                'Use 1/2 to adjust length'
            ]);
        }

        key({ canvas, draw }, {
            '+=': () => angle += Math.PI/12,
            '-_': () => angle -= Math.PI/12,
            '1': () => length = Math.max(10, length - 10),
            '2': () => length += 10
        });

        draw();
    },

    fromAngleDegrees: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let angle = 0;
        let length = 100;

        function draw() {
            clearCanvas(ctx);
            const v = vector.fromAngleDegrees(angle, length);
            drawArrow(ctx, center, vector.add(center, v));
            
            drawResults(ctx, [
                ['Angle (deg)', angle],
                ['Length', length],
                ['Vector', v],
                'Use +/- to adjust angle',
                'Use 1/2 to adjust length'
            ]);
        }

        key({ canvas, draw }, {
            '+=': () => angle += 15,
            '-_': () => angle -= 15,
            '1': () => length = Math.max(10, length - 10),
            '2': () => length += 10
        });

        draw();
    },

    rotateByRadians: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v = { x: 100, y: 0 };
        let angle = Math.PI/4;

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v), 'blue');
            drawArrow(ctx, center, vector.add(center, vector.rotateByRadians(v, angle)), 'green');
            
            drawResults(ctx, [
                ['Vector', v],
                ['Angle (rad)', angle],
                ['Rotated', vector.rotateByRadians(v, angle)],
                'Drag blue arrow to adjust vector',
                'Use +/- to adjust angle'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => v = vector.subtract(pos, center)
        });

        key({ canvas, draw }, {
            '+=': () => angle += Math.PI/12,
            '-_': () => angle -= Math.PI/12
        });

        draw();
    },

    rotateByDegrees: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        let v = { x: 100, y: 0 };
        let angle = 15;

        function draw() {
            clearCanvas(ctx);
            drawArrow(ctx, center, vector.add(center, v), 'blue');
            drawArrow(ctx, center, vector.add(center, vector.rotateByDegrees(v, angle)), 'green');
            
            drawResults(ctx, [
                ['Vector', v],
                ['Angle (deg)', angle],
                ['Rotated', vector.rotateByDegrees(v, angle)],
                'Drag blue arrow to adjust vector',
                'Use +/- to adjust angle'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: pos => v = vector.subtract(pos, center)
        });

        key({ canvas, draw }, {
            '+=': () => angle += 15,
            '-_': () => angle -= 15
        });

        draw();
    }
};
