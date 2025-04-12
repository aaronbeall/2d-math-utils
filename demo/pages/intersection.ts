import { getLineIntersection } from "./../../src/intersection";
import * as intersection from '../../src/intersection';
import { DemoFunction } from './index';
import { clearCanvas, drawLine, drawPoint, drawCircle, drawResults, drag, click, move, key, ResultEntry, drawRect } from '../utils';
import { Circle, Point, point, vector } from '../../src';

export const intersectionDemos: Record<keyof typeof intersection, DemoFunction> = {

    getLineIntersection: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let line1 = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let line2 = { start: { x: 100, y: 300 }, end: { x: 300, y: 100 } };
        let draggedPoint: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, line1, 'blue');
            drawLine(ctx, line2, 'red');
            const p = intersection.getLineIntersection(line1, line2);
            if (p) drawPoint(ctx, p, 'green');

            drawResults(ctx, [
                ['Intersection', p || 'None'],
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

    getLineCircleIntersections: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let lineSegment = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let circle = { x: 200, y: 200, radius: 50 };
        let draggedPoint: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, lineSegment, 'blue');
            drawCircle(ctx, circle, 'red');
            const intersections = intersection.getLineCircleIntersections(lineSegment, circle);
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

    getLineRectIntersections: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let lineSegment = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let rect = { x: 150, y: 150, width: 100, height: 100 };
        let draggedPoint: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawLine(ctx, lineSegment, 'blue');
            drawRect(ctx, rect, 'red');
            const intersections = intersection.getLineRectIntersections(lineSegment, rect);
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

    getCircleOverlap: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let circle1 = { x: 200, y: 200, radius: 100 };
        let circle2 = { x: 300, y: 200, radius: 50 };
        let draggedCircle: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawCircle(ctx, circle1, 'blue');
            drawCircle(ctx, circle2, 'red');
            const overlap = intersection.getCircleOverlap(circle1, circle2);

            if (overlap > 0) {
                // Use getLineCircleIntersections to find overlap center
                const line = { start: circle1, end: circle2 };
                const intersections = intersection.getLineCircleIntersections(line, {
                    x: circle1.x,
                    y: circle1.y,
                    radius: circle1.radius - overlap / 2,
                });

                if (intersections.length > 0) {
                    const overlapCenter = intersections[0];
                    drawCircle(ctx, { x: overlapCenter.x, y: overlapCenter.y, radius: overlap / 2 }, 'green', true);
                }
            }

            drawResults(ctx, [
                ['Overlap Depth', overlap],
                'Drag circles to adjust'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => {
                const points = [circle1, circle2];
                draggedCircle = point.closest(pos, points);
            },
            onDrag: pos => {
                if (draggedCircle) {
                    draggedCircle.x = pos.x;
                    draggedCircle.y = pos.y;
                }
            },
            onEnd: () => {
                draggedCircle = null;
            }
        });

        draw();
    },

    getRectanglesIntersection: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let rect1 = { x: 100, y: 100, width: 150, height: 100 };
        let rect2 = { x: 200, y: 150, width: 250, height: 150 };
        let draggedRect: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            drawRect(ctx, rect1, 'blue');
            drawRect(ctx, rect2, 'red');
            const intersectionRect = intersection.getRectanglesIntersection(rect1, rect2);
            if (intersectionRect) drawRect(ctx, intersectionRect, 'green', true);

            drawResults(ctx, [
                ['Intersection', intersectionRect || 'None'],
                'Drag rectangles to adjust'
            ]);
        }

        drag({ canvas, draw }, {
            onStart: pos => {
                const points = [rect1, rect2];
                draggedRect = point.closest(pos, points);
            },
            onDrag: pos => {
                if (draggedRect) {
                    draggedRect.x = pos.x;
                    draggedRect.y = pos.y;
                }
            },
            onEnd: () => {
                draggedRect = null;
            }
        });

        draw();
    },
};
