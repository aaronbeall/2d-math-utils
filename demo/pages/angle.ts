import * as angle from '../../src/angle';
import * as vector from '../../src/vector';
import { DemoFunction } from './index';
import { clearCanvas, drawPoint, drawLine, drawResults, drawArrow, drag, move, key, click, animate, drawArc } from '../utils';
import { Point } from '../../src';
import * as point from '../../src/point';

export const angleDemos: Record<keyof typeof angle, DemoFunction> = {
    degreesToRadians: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let degrees = 45;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const radius = 100;

        function draw() {
            clearCanvas(ctx);

            // Draw center dot
            drawPoint(ctx, center, 'black', 5);

            // Draw angle visualization
            const radians = angle.degreesToRadians(degrees);
            drawArc(ctx, center, radius, 0, radians, 'blue');

            // Draw lines at the end of the arc
            const normalEnd = vector.add(center, { x: radius, y: 0 });
            const angleEnd = vector.add(center, vector.fromAngleRadians(radians, radius));
            drawLine(ctx, { start: center, end: normalEnd }, 'blue');
            drawLine(ctx, { start: center, end: angleEnd }, 'blue');

            drawResults(ctx, [
                ['Degrees', degrees],
                ['Radians', radians],
                'Use +/- to adjust angle'
            ]);
        }

        key({ canvas, draw }, {
            '+=': () => degrees++,
            '-_': () => degrees--
        });

        draw();
    },

    radiansToDegrees: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let radians = Math.PI / 4;
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const radius = 100;

        function draw() {
            clearCanvas(ctx);

            // Draw center dot
            drawPoint(ctx, center, 'black', 5);

            // Draw angle visualization
            const degrees = angle.radiansToDegrees(radians);
            drawArc(ctx, center, radius, 0, radians, 'red');

            // Draw lines at the end of the arc
            const normalEnd = vector.add(center, { x: radius, y: 0 });
            const angleEnd = vector.add(center, vector.fromAngleRadians(radians, radius));
            drawLine(ctx, { start: center, end: normalEnd }, 'red');
            drawLine(ctx, { start: center, end: angleEnd }, 'red');

            drawResults(ctx, [
                ['Radians', radians],
                ['Degrees', degrees],
                'Use +/- to adjust angle'
            ]);
        }

        key({ canvas, draw }, {
            '+=': () => radians += Math.PI / 180,
            '-_': () => radians -= Math.PI / 180
        });

        draw();
    },

    radiansBetweenLines: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let line1 = { start: { x: 400, y: 300 }, end: { x: 500, y: 300 } };
        let line2 = { start: { x: 400, y: 300 }, end: { x: 500, y: 400 } };

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, line1, 'blue');
            drawLine(ctx, line2, 'red');
            drawPoint(ctx, line1.start, 'black');

            drawResults(ctx, [
                ['Angle (rad)', angle.radiansBetweenLines(line1, line2)],
                'Drag endpoints to adjust lines'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => {
                const endpoint = point.closest(pos, [line1.end, line2.end]);
                if (endpoint === line1.end) line1.end = pos;
                else line2.end = pos;
            },
            onDrag: pos => {
                const endpoint = point.closest(pos, [line1.end, line2.end]);
                if (endpoint === line1.end) line1.end = pos;
                else line2.end = pos;
            }
        });

        draw();
    },

    degreesBetweenLines: (canvas) => {
        // Same as radiansBetweenLines but showing degrees
        const ctx = canvas.getContext('2d')!;
        let line1 = { start: { x: 400, y: 300 }, end: { x: 500, y: 300 } };
        let line2 = { start: { x: 400, y: 300 }, end: { x: 500, y: 400 } };

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, line1, 'blue');
            drawLine(ctx, line2, 'red');
            drawPoint(ctx, line1.start, 'black');

            drawResults(ctx, [
                ['Angle (deg)', angle.degreesBetweenLines(line1, line2)],
                'Drag endpoints to adjust lines'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => {
                const endpoint = point.closest(pos, [line1.end, line2.end]);
                if (endpoint === line1.end) line1.end = pos;
                else line2.end = pos;
            },
            onDrag: pos => {
                const endpoint = point.closest(pos, [line1.end, line2.end]);
                if (endpoint === line1.end) line1.end = pos;
                else line2.end = pos;
            }
        });

        draw();
    },

    radiansBetweenPoints: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let center = { x: 400, y: 300 };
        let target = { x: 500, y: 300 };

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, center, 'blue');
            drawPoint(ctx, target, 'red');
            drawArrow(ctx, center, target);

            drawResults(ctx, [
                ['Angle (rad)', angle.radiansBetweenPoints(center, target)],
                'Click to set center, move mouse for target'
            ]);
        }

        move({ canvas, draw }, pos => target = pos);
        drag({ canvas, draw }, {
            onStart: pos => center = pos,
            onDrag: pos => center = pos
        });

        draw();
    },

    degreesBetweenPoints: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let center = { x: 400, y: 300 };
        let target = { x: 500, y: 300 };

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, center, 'blue');
            drawPoint(ctx, target, 'red');
            drawArrow(ctx, center, target);

            drawResults(ctx, [
                ['Angle (deg)', angle.degreesBetweenPoints(center, target)],
                'Click to set center, move mouse for target'
            ]);
        }

        move({ canvas, draw }, pos => target = pos);
        drag({ canvas, draw }, {
            onStart: pos => center = pos,
            onDrag: pos => center = pos
        });

        draw();
    },

    degreesBetweenAngles: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let angle1 = 45;
        let angle2 = 90;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        const radius = 100;

        function draw() {
            clearCanvas(ctx);
            
            // Draw angle arrows
            const end1 = vector.add(center, vector.fromAngleDegrees(angle1, radius));
            const end2 = vector.add(center, vector.fromAngleDegrees(angle2, radius));
            drawArrow(ctx, center, end1, 'blue');
            drawArrow(ctx, center, end2, 'red');

            drawResults(ctx, [
                ['Angle 1 (deg)', angle1],
                ['Angle 2 (deg)', angle2],
                ['Degrees Between', angle.degreesBetweenAngles(angle1, angle2)],
                'Use 1/2 to adjust angles'
            ]);
        }

        key({ canvas, draw }, {
            '1': () => angle1 = (angle1 + 15) % 360,
            '2': () => angle2 = (angle2 + 15) % 360
        });

        draw();
    },

    radiansBetweenAngles: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let angle1 = Math.PI / 4;
        let angle2 = Math.PI / 2;
        const center = { x: canvas.width/2, y: canvas.height/2 };
        const radius = 100;

        function draw() {
            clearCanvas(ctx);
            
            // Draw angle arrows
            const end1 = vector.add(center, vector.fromAngleRadians(angle1, radius));
            const end2 = vector.add(center, vector.fromAngleRadians(angle2, radius));
            drawArrow(ctx, center, end1, 'blue');
            drawArrow(ctx, center, end2, 'red');

            drawResults(ctx, [
                ['Angle 1 (rad)', angle1],
                ['Angle 2 (rad)', angle2],
                ['Radians Between', angle.radiansBetweenAngles(angle1, angle2)],
                'Use 1/2 to adjust angles'
            ]);
        }

        key({ canvas, draw }, {
            '1': () => angle1 = (angle1 + Math.PI/6) % (Math.PI * 2),
            '2': () => angle2 = (angle2 + Math.PI/6) % (Math.PI * 2)
        });

        draw();
    },

    rotateAroundByRadians: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let center = { x: 400, y: 300 };
        let point = { x: 500, y: 300 };
        const step = Math.PI / 180;

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, center, 'blue');
            drawPoint(ctx, point, 'red');
            drawArrow(ctx, center, point);

            drawResults(ctx, [
                ['Center', center],
                ['Point', point],
                ['Angle (rad)', angle.radiansBetweenPoints(center, point)],
                'Click to set center, move mouse for point'
            ]);
        }

        move({ canvas, draw }, pos => point = pos);
        click({ canvas, draw }, pos => center = pos);
        animate(
            draw,
            () => point = angle.rotateAroundByRadians(center, point, step)
        );
    },

    rotateAroundByDegrees: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let center = { x: 400, y: 300 };
        let point = { x: 500, y: 300 };
        const step = 1;  // 1 degree per frame

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, center, 'blue');
            drawPoint(ctx, point, 'red');
            drawArrow(ctx, center, point);

            drawResults(ctx, [
                ['Center', center],
                ['Point', point],
                ['Angle (deg)', angle.degreesBetweenPoints(center, point)],
                'Click to set center, move mouse for point'
            ]);
        }

        move({ canvas, draw }, pos => point = pos);
        click({ canvas, draw }, pos => center = pos);
        animate(draw, () => point = angle.rotateAroundByDegrees(center, point, step));
    },

    rotateAngleTowardsRadians: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let currentAngle = 0;
        let center = { x: 400, y: 300 };
        let target = { x: 500, y: 300 };
        let step = Math.PI / 180 / 3;

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, center, 'blue');
            drawPoint(ctx, target, 'red');
            
            const arrowEnd = vector.add(center, vector.fromAngleRadians(currentAngle, 100));
            drawArrow(ctx, center, arrowEnd);

            drawResults(ctx, [
                ['Current Angle', currentAngle],
                ['Target Angle', angle.radiansBetweenPoints(center, target)],
                ['Speed', step],
                'Move mouse to change target',
                'Press +/- to adjust speed'
            ]);
        }

        move({ canvas, draw }, pos => target = pos);
        key({ canvas, draw }, {
            '+=': () => step *= 1.5,
            '-_': () => step /= 1.5
        });
        animate(draw, () => currentAngle = angle.rotateAngleTowardsRadians(currentAngle, angle.radiansBetweenPoints(center, target), step));
    },

    rotateAngleTowardsDegrees: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let currentAngle = 0;
        let center = { x: 400, y: 300 };
        let target = { x: 500, y: 300 };
        let step = .33;

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, center, 'blue');
            drawPoint(ctx, target, 'red');
            
            const arrowEnd = vector.add(center, vector.fromAngleDegrees(currentAngle, 100));
            drawArrow(ctx, center, arrowEnd);

            drawResults(ctx, [
                ['Current Angle', currentAngle],
                ['Target Angle', angle.degreesBetweenPoints(center, target)],
                ['Speed', step],
                'Move mouse to change target',
                'Press +/- to adjust speed'
            ]);
        }

        move({ canvas, draw }, pos => target = pos);
        key({ canvas, draw }, {
            '+=': () => step *= 1.5,
            '-_': () => step /= 1.5
        });
        animate(draw, () => currentAngle = angle.rotateAngleTowardsDegrees(currentAngle, angle.degreesBetweenPoints(center, target), step));
    }
};
