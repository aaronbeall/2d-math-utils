import * as vector from '../../src/vector';
import * as point from '../../src/point';
import * as angle from '../../src/angle';
import { DemoFunction } from './index';
import { clearCanvas, drawPoint, drawLine, drawResults, drawArrow, drag, move, key, drawCircle, animate, drawCentered, drawAxes, drawWithOffset } from '../utils';

export const vectorDemos: Record<keyof typeof vector, DemoFunction> = {
    zero: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        const v = vector.zero();

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v, 'blue');
            });

            drawResults(ctx, [
                ['Vector', v],
                'Zero vector has no direction or length'
            ]);
        }

        draw();
    },

    add: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v1 = { x: 100, y: 0 };
        let v2 = { x: 0, y: 100 };

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v1, 'blue');
                drawArrow(ctx, v1, vector.add(v1, v2), 'red');
                drawArrow(ctx, origin, vector.add(v1, v2), 'green');
            });

            drawResults(ctx, [
                ['Vector 1', v1],
                ['Vector 2', v2],
                ['Sum', vector.add(v1, v2)],
                'Drag blue/red arrows to adjust vectors'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => {
                const end1 = vector.add(origin, v1);
                const end2 = vector.add(end1, v2);
                const closest = point.closest(pos, [end1, end2]);
                if (closest === end1) v1 = vector.subtract(pos, origin);
                else v2 = vector.subtract(pos, end1);
            }
        });

        draw();
    },

    subtract: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v1 = { x: 100, y: 0 };
        let v2 = { x: 0, y: 100 };

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v1, 'blue');
                drawArrow(ctx, origin, v2, 'red');
                drawArrow(ctx, origin, vector.subtract(v1, v2), 'green');
            });

            drawResults(ctx, [
                ['Vector 1', v1],
                ['Vector 2', v2],
                ['Difference', vector.subtract(v1, v2)],
                'Drag blue/red arrows to adjust vectors'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => {
                const end1 = vector.add(origin, v1);
                const end2 = vector.add(origin, v2);
                const closest = point.closest(pos, [end1, end2]);
                if (closest === end1) v1 = vector.subtract(pos, origin);
                else v2 = vector.subtract(pos, origin);
            }
        });

        draw();
    },

    scale: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v = { x: 100, y: 0 };
        let scale = 0.75;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v, 'blue');
                drawArrow(ctx, origin, vector.scale(v, scale), 'green');
            });

            drawResults(ctx, [
                ['Vector', v],
                ['Scale', scale],
                ['Result', vector.scale(v, scale)],
                'Drag blue arrow to adjust vector',
                'Use +/- to adjust scale'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => (v = pos)
        });

        key({ canvas, draw }, {
            '+': () => (scale *= 1.1),
            '-': () => (scale /= 1.1)
        });

        draw();
    },

    length: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v = { x: 100, y: 0 };

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v, 'blue');
            });

            drawResults(ctx, [
                ['Vector', v],
                ['Length', vector.length(v)],
                'Drag arrow to adjust vector'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: (pos) => (v = vector.subtract(pos, center))
        });

        draw();
    },

    normal: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let p1 = { x: center.x - 100, y: center.y };
        let p2 = { x: center.x + 100, y: center.y };

        function draw() {
            clearCanvas(ctx);

            // Draw points and line
            drawPoint(ctx, p1, 'blue');
            drawPoint(ctx, p2, 'red');
            drawLine(ctx, { start: p1, end: p2 }, 'gray');

            // Calculate and draw normal
            const normalVector = vector.normal(p1, p2);
            const normalStart = vector.interpolate(p1, p2, 0.5); // Midpoint
            const normalEnd = vector.add(normalStart, vector.scale(normalVector, 50));
            drawArrow(ctx, normalStart, normalEnd, 'green');

            drawResults(ctx, [
                ['Point 1', p1],
                ['Point 2', p2],
                ['Normal', normalVector],
                'Drag blue/red points to adjust'
            ]);
        }

        drag({ canvas, draw }, {
            onDrag: (pos) => {
                const closest = point.closest(pos, [p1, p2]);
                if (closest === p1) p1 = pos;
                else p2 = pos;
            }
        });

        draw();
    },

    normalize: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v = { x: 100, y: 0 };

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v, 'blue');
                drawArrow(ctx, origin, vector.normalize(v), 'green');
            });

            drawResults(ctx, [
                ['Vector', v],
                ['Length', vector.length(v)],
                ['Normalized', vector.normalize(v)],
                'Drag arrow to adjust vector'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => v = pos
        });

        draw();
    },

    clampLength: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v = { x: 100, y: 0 };
        let maxLength = 100;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v, 'blue');
                drawArrow(ctx, origin, vector.clampLength(v, maxLength), 'green');
                drawCircle(ctx, { x: 0, y: 0, radius: maxLength }, 'gray');
            });

            drawResults(ctx, [
                ['Vector', v],
                ['Length', vector.length(v)],
                ['Max Length', maxLength],
                'Drag arrow to adjust vector',
                'Use +/- to adjust max length'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => v = pos
        });

        key({ canvas, draw }, {
            '+': () => (maxLength += 10),
            '-': () => (maxLength = Math.max(10, maxLength - 10))
        });

        draw();
    },

    interpolate: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v1 = { x: -100, y: 0 };
        let v2 = { x: 100, y: 0 };
        let t = 0.5;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                const result = vector.interpolate(v1, v2, t);
                drawArrow(ctx, origin, v1, 'blue');
                drawArrow(ctx, origin, v2, 'red');
                drawArrow(ctx, origin, result, 'green');
            });

            drawResults(ctx, [
                ['Vector 1', v1],
                ['Vector 2', v2],
                ['t', t],
                ['Result', vector.interpolate(v1, v2, t)],
                'Drag blue/red arrows to adjust vectors',
                'Use +/- to adjust t'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => {
                const closest = point.closest(pos, [v1, v2]);
                closest.x = pos.x;
                closest.y = pos.y;
            }
        });

        key({ canvas, draw }, {
            '+': () => (t = Math.min(1, t + 0.1)),
            '-': () => (t = Math.max(0, t - 0.1))
        });

        draw();
    },

    interpolateInverse: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v1 = { x: -100, y: 0 };
        let v2 = { x: 100, y: 0 };
        let p = { x: 0, y: 0 };

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                const t = vector.interpolateInverse(v1, v2, p);
                const projected = vector.interpolate(v1, v2, t);
                drawArrow(ctx, origin, v1, 'blue');
                drawArrow(ctx, origin, v2, 'red');
                drawPoint(ctx, p, 'green');
                drawPoint(ctx, projected, 'black');
                drawLine(ctx, { start: p, end: projected }, 'gray');
            });

            drawResults(ctx, [
                ['Start', v1],
                ['End', v2],
                ['Point', p],
                ['t', vector.interpolateInverse(v1, v2, p)],
                'Drag blue/red arrows for vectors',
                'Move mouse to test positions'
            ]);
        }

        move({ canvas, draw, center }, (pos) => {
            p = pos;
        });

        drag({ canvas, draw, center }, {
            onDrag: (pos) => {
                const closest = point.closest(pos, [v1, v2]);
                closest.x = pos.x;
                closest.y = pos.y;
            }
        });

        draw();
    },

    reflect: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let velocity = { x: 100, y: 100 };
        let normal = vector.fromAngleRadians(0, 1);
        const rotateAmount = Math.PI / 12;
        let restitution = 1;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                const normalVec = vector.scale(vector.normalize(normal), 100);
                drawArrow(ctx, origin, normalVec, 'blue');
                drawPoint(ctx, velocity, 'red');
                drawArrow(ctx, velocity, origin, 'red');
                const reflected = vector.scale(
                    vector.reflect(velocity, vector.normalize(normal)),
                    restitution
                );
                drawArrow(ctx, origin, reflected, 'green');
            });

            drawResults(ctx, [
                ['Normal', normal],
                ['Velocity', velocity],
                ['Restitution', restitution],
                ['Reflected', vector.scale(vector.reflect(velocity, vector.normalize(normal)), restitution)],
                'Drag red arrow to adjust incoming velocity',
                'Drag blue arrow to adjust surface normal',
                'Use +/- to adjust restitution'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => {
                const closest = point.closest(pos, [velocity, normal]);
                if (closest === velocity) {
                    velocity = pos;
                } else {
                    normal = vector.subtract(pos, origin);
                }
            }
        });

        key({ canvas, draw }, {
            '+': () => (restitution = Math.min(2, restitution + 0.1)),
            '-': () => (restitution = Math.max(0, restitution - 0.1)),
        });

        draw();
    },

    fromAngleRadians: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let angle = 0;
        let length = 100;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                const v = vector.fromAngleRadians(angle, length);
                drawArrow(ctx, origin, v, 'blue');
            });

            drawResults(ctx, [
                ['Angle (rad)', angle],
                ['Length', length],
                ['Vector', vector.fromAngleRadians(angle, length)],
                'Use +/- to adjust angle',
                'Use [/] to adjust length'
            ]);
        }

        key({ canvas, draw }, {
            '+': () => (angle += Math.PI / 12),
            '-': () => (angle -= Math.PI / 12),
            '[': () => (length = Math.max(10, length - 10)),
            ']': () => (length += 10)
        });

        draw();
    },

    fromAngleDegrees: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let angle = 0;
        let length = 100;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                const v = vector.fromAngleDegrees(angle, length);
                drawArrow(ctx, origin, v, 'blue');
            });

            drawResults(ctx, [
                ['Angle (deg)', angle],
                ['Length', length],
                ['Vector', vector.fromAngleDegrees(angle, length)],
                'Use +/- to adjust angle',
                'Use [/] to adjust length'
            ]);
        }

        key({ canvas, draw }, {
            '+': () => (angle += 15),
            '-': () => (angle -= 15),
            '[': () => (length = Math.max(10, length - 10)),
            ']': () => (length += 10)
        });

        draw();
    },

    rotateByRadians: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v = { x: 100, y: 0 };
        let angle = Math.PI / 4;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v, 'blue');
                drawArrow(ctx, origin, vector.rotateByRadians(v, angle), 'green');
            });

            drawResults(ctx, [
                ['Vector', v],
                ['Angle (rad)', angle],
                ['Rotated', vector.rotateByRadians(v, angle)],
                'Drag blue arrow to adjust vector',
                'Use +/- to adjust angle'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => (v = pos)
        });

        key({ canvas, draw }, {
            '+': () => (angle += Math.PI / 12),
            '-': () => (angle -= Math.PI / 12)
        });

        draw();
    },

    rotateByDegrees: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v = { x: 100, y: 0 };
        let angle = 15;

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v, 'blue');
                drawArrow(ctx, origin, vector.rotateByDegrees(v, angle), 'green');
            });

            drawResults(ctx, [
                ['Vector', v],
                ['Angle (deg)', angle],
                ['Rotated', vector.rotateByDegrees(v, angle)],
                'Drag blue arrow to adjust vector',
                'Use +/- to adjust angle'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => (v = pos)
        });

        key({ canvas, draw }, {
            '+': () => (angle += 15),
            '-': () => (angle -= 15)
        });

        draw();
    },

    dot: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const origin = { x: 0, y: 0 };
        let v1 = { x: 100, y: 0 };
        let v2 = { x: 0, y: 100 };

        function draw() {
            clearCanvas(ctx);
            drawWithOffset(ctx, center, (ctx) => {
                drawAxes(ctx);
                drawArrow(ctx, origin, v1, 'blue');
                drawArrow(ctx, origin, v2, 'red');
                const dotProduct = vector.dot(v1, v2);
                const projectionScale = dotProduct / (vector.length(v1) * vector.length(v2));
                const projection = vector.scale(v2, projectionScale);
                drawArrow(ctx, origin, projection, 'green');
            });

            drawResults(ctx, [
                ['Vector 1', v1],
                ['Vector 2', v2],
                ['Dot Product', vector.dot(v1, v2)],
                ['Projection of v1 onto v2', vector.scale(v2, vector.dot(v1, v2) / (vector.length(v2) ** 2))],
                'Drag blue/red arrows to adjust vectors'
            ]);
        }

        drag({ canvas, draw, center }, {
            onDrag: (pos) => {
                const closest = point.closest(pos, [v1, v2]);
                closest.x = pos.x;
                closest.y = pos.y;
            }
        });

        draw();
    }
};
