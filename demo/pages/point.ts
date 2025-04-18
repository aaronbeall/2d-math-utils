import * as point from '../../src/point';
import { DemoFunction } from './index';
import { clearCanvas, drawPoint, drawLine, drawText, drawResults, drawCircle, drag, click, move, drawRect, key, animate } from '../utils';
import { Point } from '../../src';

export const pointDemos: Record<keyof typeof point, DemoFunction> = {
    distance: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let p1 = { x: 100, y: 100 };
        let p2 = { x: 300, y: 300 };
        
        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, p1, 'blue');
            drawPoint(ctx, p2, 'red');
            drawLine(ctx, { start: p1, end: p2 }, 'gray');
            
            drawResults(ctx, [
                ['Distance', point.distance(p1, p2)],
                'Click to set point 1'
            ]);
        }
        
        click({ canvas, draw }, pos => p1 = pos);
        move({ canvas, draw }, pos => p2 = pos);
        draw(); // initial draw still needed
    },
    
    distanceSquared: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let p1 = { x: 100, y: 100 };
        let p2 = { x: 300, y: 300 };
        
        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, p1, 'blue');
            drawPoint(ctx, p2, 'red');
            drawLine(ctx, { start: p1, end: p2 }, 'gray');
            
            drawResults(ctx, [
                ['Distance', point.distance(p1, p2)],
                ['Distance²', point.distanceSquared(p1, p2)],
                'Click to set point 1'
            ]);
        }
        
        click({ canvas, draw }, pos => p1 = pos);
        move({ canvas, draw }, pos => p2 = pos);
        draw();
    },

    midpoint: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let p1 = { x: 100, y: 100 };
        let p2 = { x: 300, y: 300 };
        
        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, p1, 'blue');
            drawPoint(ctx, p2, 'red');
            drawLine(ctx, { start: p1, end: p2 }, 'gray');
            
            const mid = point.midpoint(p1, p2);
            drawPoint(ctx, mid, 'green');
            
            drawResults(ctx, [
                ['Midpoint', mid],
                'Click to set point 1'
            ]);
        }
        
        click({ canvas, draw }, pos => p1 = pos);
        move({ canvas, draw }, pos => p2 = pos);
        draw();
    },

    closest: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let points: Point[] = [];
        let mousePos = { x: 0, y: 0 };

        function generatePoints() {
            points = Array.from({ length: 10 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            }));
        }

        function draw() {
            clearCanvas(ctx);
            const closest = point.closest(mousePos, points);
            
            points.forEach(p => {
                drawPoint(ctx, p, p === closest ? 'red' : 'blue');
            });

            drawResults(ctx, [
                ['Mouse', mousePos],
                ['Closest', closest],
                'Click to generate new points'
            ]);
        }

        click({ canvas, draw }, () => generatePoints());
        move({ canvas, draw }, pos => mousePos = pos);
        
        generatePoints();
        draw();
    },

    isPointInCircle: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let circle = { x: 200, y: 200, radius: 50 };
        let mousePos = { x: 0, y: 0 };

        function draw() {
            clearCanvas(ctx);
            const isInside = point.isPointInCircle(mousePos, circle);
            drawCircle(ctx, circle, isInside ? 'green' : 'red');
            drawPoint(ctx, circle, 'blue');
            drawPoint(ctx, mousePos, isInside ? 'green' : 'red');
            
            drawResults(ctx, [
                ['Inside', isInside],
                ['Circle', circle],
                'Click and drag to resize circle'
            ]);
        }

        move({ canvas, draw }, pos => mousePos = pos);
        drag({ canvas, draw }, {
            onStart: pos => circle = { ...circle, ...pos },
            onDrag: pos => circle.radius = point.distance(circle, pos)
        });
        draw();
    },

    isPointInRectangle: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let rect = { x: 200, y: 200, width: 100, height: 100 };
        let mousePos = { x: 0, y: 0 };
        
        function draw() {
            clearCanvas(ctx);
            const isInside = point.isPointInRectangle(mousePos, rect);
            drawRect(ctx, rect, isInside ? 'green' : 'red');
            drawPoint(ctx, mousePos, isInside ? 'green' : 'red');
            
            drawResults(ctx, [
                ['Inside', isInside],
                ['Rectangle', rect],
                'Click and drag to draw rectangle'
            ]);
        }

        move({ canvas, draw }, pos => mousePos = pos);
        drag({ canvas, draw }, {
            onStart: pos => rect = { ...rect, x: pos.x, y: pos.y, width: 0, height: 0 },
            onDrag: pos => {
                rect.width = pos.x - rect.x;
                rect.height = pos.y - rect.y;
            }
        });
        draw();
    },

    isPointInLine: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let line = { start: { x: 100, y: 100 }, end: { x: 300, y: 300 } };
        let mousePos = { x: 0, y: 0 };
        let lineWidth = 10;

        function draw() {
            clearCanvas(ctx);
            const isInside = point.isPointInLine(mousePos, line, lineWidth);
            const color = isInside ? 'green' : 'red';
            drawCircle(ctx, { ...line.start, radius: lineWidth / 2 }, color, true);
            drawCircle(ctx, { ...line.end, radius: lineWidth / 2 }, color, true);
            drawLine(ctx, line, color, lineWidth);
            
            drawResults(ctx, [
                ['Inside', isInside],
                ['Line', line],
                ['Line Width', lineWidth],
                'Click and drag to draw line',
                'Press + or - to adjust width'
            ]);
        }

        move({ canvas, draw }, pos => mousePos = pos);
        drag({ canvas, draw }, {
            onStart: pos => line.start = line.end = pos,
            onDrag: pos => line.end = pos
        });
        key({ canvas, draw }, {
            '+': () => lineWidth++,
            '-': () => lineWidth--
        });
        
        draw();
    },

    moveTowards: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let current = { x: canvas.width/2, y: canvas.height/2 };
        let target = { x: canvas.width/2 + 100, y: canvas.height/2 };
        let maxDistance = 5;

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, current, 'blue');
            drawPoint(ctx, target, 'red');
            drawLine(ctx, { start: current, end: target }, 'gray');
            
            drawResults(ctx, [
                ['Current', current],
                ['Target', target],
                ['Distance', point.distance(current, target)],
                ['Speed', maxDistance],
                'Move mouse to set target',
                'Use +/- to adjust speed'
            ]);
        }

        move({ canvas, draw }, pos => target = pos);
        key({ canvas, draw }, {
            '+': () => maxDistance *= 1.2,
            '-': () => maxDistance /= 1.2
        });

        animate(
            draw,
            () => current = point.moveTowards(current, target, maxDistance)
        );
    },

    interpolate: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let p1 = { x: 100, y: 100 };
        let p2 = { x: 300, y: 300 };
        let t = 0.5;

        function draw() {
            clearCanvas(ctx);
            drawPoint(ctx, p1, 'blue');
            drawPoint(ctx, p2, 'red');
            drawLine(ctx, { start: p1, end: p2 }, 'gray');

            const interpolated = point.interpolate(p1, p2, t);
            drawPoint(ctx, interpolated, 'green');

            drawResults(ctx, [
                ['Point 1', p1],
                ['Point 2', p2],
                ['t (Interpolation)', t.toFixed(2)],
                ['Interpolated', interpolated],
                'Click to set Point 1',
                'Move mouse to set Point 2',
                'Use +/- to adjust t'
            ]);
        }

        click({ canvas, draw }, pos => p1 = pos);
        move({ canvas, draw }, pos => p2 = pos);
        key({ canvas, draw }, {
            '+': () => t = Math.min(1, t + 0.05),
            '-': () => t = Math.max(0, t - 0.05)
        });

        draw();
    },
};
