import { distance, Point } from '../src/index';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const p1: Point = { x: 100, y: 100 };
const p2: Point = { x: 300, y: 300 };

// Draw points
ctx.fillStyle = 'blue';
ctx.beginPath();
ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
ctx.fill();

// Draw line
ctx.strokeStyle = 'red';
ctx.beginPath();
ctx.moveTo(p1.x, p1.y);
ctx.lineTo(p2.x, p2.y);
ctx.stroke();

// Display distance
ctx.fillStyle = 'black';
ctx.font = '16px Arial';
ctx.fillText(`Distance: ${distance(p1, p2).toFixed(2)}`, 10, 30);
