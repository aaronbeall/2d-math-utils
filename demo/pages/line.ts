import * as line from '../../src/line';
import { DemoFunction } from './index';
import { clearCanvas, drawLine, drawPoint, drawCircle, drawResults, drag, click, move, key, ResultEntry, drawRect } from '../utils';
import { Point, point } from '../../src';

export const lineDemos: Record<keyof typeof line, DemoFunction> = {
    lineLength: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let lineSegment = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, lineSegment, 'blue');
            drawResults(ctx, [
                ['Line Length', line.lineLength(lineSegment)],
                'Click and drag to draw line'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => lineSegment.start = lineSegment.end = pos,
            onDrag: pos => lineSegment.end = pos
        });

        draw();
    },

    lineIntersection: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let line1 = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let line2 = { start: { x: 100, y: 300 }, end: { x: 300, y: 100 } };
        let draggedPoint: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, line1, 'blue');
            drawLine(ctx, line2, 'red');
            const intersection = line.lineIntersection(line1, line2);
            if (intersection) drawPoint(ctx, intersection, 'green');

            drawResults(ctx, [
                ['Intersection', intersection || 'None'],
                'Drag endpoints to adjust the lines'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => {
                draggedPoint = point.closest(pos, [line1.start, line1.end, line2.start, line2.end]);
            },
            onDrag: pos => {
                if (draggedPoint) {
                    draggedPoint.x = pos.x;
                    draggedPoint.y = pos.y;
                }
            },
            onEnd: () => {
                draggedPoint = null;
            }
        });

        draw();
    },

    lineCircleIntersection: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let lineSegment = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let circle = { x: 200, y: 200, radius: 50 };
        let draggedPoint: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, lineSegment, 'blue');
            drawCircle(ctx, circle, 'red');
            const intersections = line.lineCircleIntersection(lineSegment, circle);
            intersections.forEach(p => drawPoint(ctx, p, 'green'));

            drawResults(ctx, [
                ...intersections?.map<ResultEntry>(p => ['Intersection', p]) ?? [],
                'Drag endpoints or circle to adjust'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => {
                const points = [lineSegment.start, lineSegment.end, circle];
                draggedPoint = point.closest(pos, points);
            },
            onDrag: pos => {
                if (draggedPoint) {
                    draggedPoint.x = pos.x;
                    draggedPoint.y = pos.y;
                }
            },
            onEnd: () => {
                draggedPoint = null;
            }
        });

        draw();
    },

    lineRectIntersection: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let lineSegment = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let rect = { x: 150, y: 150, width: 100, height: 100 };
        let draggedPoint: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, lineSegment, 'blue');
            drawRect(ctx, rect, 'red');
            const intersections = line.lineRectIntersection(lineSegment, rect);
            intersections.forEach(p => drawPoint(ctx, p, 'green'));

            drawResults(ctx, [
                ...intersections?.map<ResultEntry>(p => ['Intersection', p]) ?? [],
                'Drag endpoints or rectangle to adjust'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => {
                const points = [lineSegment.start, lineSegment.end, rect];
                draggedPoint = point.closest(pos, points);
            },
            onDrag: pos => {
                if (draggedPoint) {
                    draggedPoint.x = pos.x;
                    draggedPoint.y = pos.y;
                }
            },
            onEnd: () => {
                draggedPoint = null;
            }
        });

        draw();
    },

    rotateLine: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let lineSegment = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let angle = 0;
        let useMidpoint = true; // Toggle between midpoint and canvas center
        const canvasCenter = { x: canvas.width / 2, y: canvas.height / 2 };

        function draw() {
            clearCanvas(ctx);

            // Determine rotation center
            const rotationCenter = useMidpoint 
                ? point.midpoint(lineSegment.start, lineSegment.end) 
                : canvasCenter;

            // Draw original line
            drawLine(ctx, lineSegment, 'blue');

            // Rotate line around the selected center
            const rotated = line.rotateLine(lineSegment, angle, rotationCenter);
            drawLine(ctx, rotated, 'red');

            // Draw rotation center
            drawPoint(ctx, rotationCenter, 'green');

            drawResults(ctx, [
                ['Angle (radians)', angle.toFixed(2)],
                ['Rotation Center', useMidpoint ? 'Line Midpoint' : 'Canvas Center'],
                'Click and drag to draw line',
                'Use +/- to rotate the line',
                'Press C to toggle rotation center'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => lineSegment.start = lineSegment.end = pos,
            onDrag: pos => lineSegment.end = pos
        });

        key({ canvas, draw }, {
            '+': () => angle += Math.PI / 18,
            '-': () => angle -= Math.PI / 18,
            'c': () => useMidpoint = !useMidpoint
        });

        draw();
    },

    expandLine: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let lineSegment = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let expansionLength = 50;

        function draw() {
            clearCanvas(ctx);
            const expanded = line.expandLine(lineSegment, expansionLength);
            drawLine(ctx, expanded, 'red', 2);
            drawLine(ctx, lineSegment, 'blue');

            // Draw blue dots at the ends of the line
            drawPoint(ctx, lineSegment.start, 'blue', 5);
            drawPoint(ctx, lineSegment.end, 'blue', 5);

            drawResults(ctx, [
                ['Expansion Length', expansionLength],
                'Click and drag to draw line',
                'Use +/- to expand or shrink the line'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => lineSegment.start = lineSegment.end = pos,
            onDrag: pos => lineSegment.end = pos
        });

        key({ canvas, draw }, {
            '+': () => expansionLength += 10,
            '-': () => expansionLength = Math.max(0, expansionLength - 10)
        });

        draw();
    },
};
