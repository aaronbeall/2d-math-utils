import { PhysicalBody, Vector2d } from '../../src';
import { DemoFunction } from './index';
import * as point from '../../src/point';
import * as vector from '../../src/vector';
import { animate, clearCanvas, drawCircle, drawRect, simulate } from '../utils';

class Ball extends PhysicalBody {
    grabbed = false;
    grabOffset: Vector2d = { x: 0, y: 0 };

    constructor(x: number, y: number, radius: number) {
        super({
            x,
            y,
            mass: Math.PI * radius * radius,
            gravity: PhysicalBody.DOWNWARD_GRAVITY
        });
        this.radius = radius;
    }
}

export const bodyDemos: Record<string, DemoFunction> = {
    "Balls": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        const balls: Ball[] = [];
        const gravity: Vector2d = { x: 0, y: 980 };
        let draggedBall: Ball | null = null;
        const mousePos: Vector2d = { x: 0, y: 0 };

        // Create some balls
        for (let i = 0; i < 10; i++) {
            balls.push(new Ball(
                Math.random() * canvas.width,
                Math.random() * canvas.height * 0.5,
                10 + Math.random() * 20
            ));
        }

        canvas.addEventListener('mousedown', e => {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
            for (const ball of balls) {
                const dist = point.distance(ball.position, mousePos);
                if (dist <= ball.radius) {
                    ball.grabbed = true;
                    draggedBall = ball;
                    ball.grabOffset.x = mousePos.x - ball.position.x;
                    ball.grabOffset.y = mousePos.y - ball.position.y;
                    break;
                }
            }
        });

        canvas.addEventListener('mousemove', e => {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
        });

        canvas.addEventListener('mouseup', () => {
            if (draggedBall) {
                draggedBall.grabbed = false;
                draggedBall = null;
            }
        });

        const update = (deltaTime: number) => {
            // Update physics
            for (const ball of balls) {
                if (ball.grabbed) {
                    ball.velocity.x = 0;
                    ball.velocity.y = 0;
                    ball.position.x = mousePos.x - ball.grabOffset.x;
                    ball.position.y = mousePos.y - ball.grabOffset.y;
                } else {
                    ball.update(deltaTime);

                    // Wall collisions
                    ball.collideWithSurface({ x: 1, y: 0 }, { x: 0, y: ball.y });          // Left wall
                    ball.collideWithSurface({ x: -1, y: 0 }, { x: canvas.width, y: ball.y });  // Right wall
                    ball.collideWithSurface({ x: 0, y: 1 }, { x: ball.x, y: 0 });          // Top wall
                    ball.collideWithSurface({ x: 0, y: -1 }, { x: ball.x, y: canvas.height }); // Bottom wall
                }
            }

            // Ball-to-ball collisions
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const b1 = balls[i], b2 = balls[j];
                    if (!b1.grabbed && !b2.grabbed) {
                        b1.collideWithBody(b2);
                    }
                }
            }
        };

        const draw = () => {
            clearCanvas(ctx);
            for (const ball of balls) {
              drawCircle(ctx, ball, ball.grabbed ? 'red' : 'blue', true);
            }
        };

        return simulate(update, draw);
    },

    "Billiards": (canvas) => {
      // Demo showing billiard balls on a table. Click and drag the cue ball to hit the other balls.
      // The balls will bounce off the walls and each other.
    },

    "Spaceship": (canvas) => {
      // Demo showing a spaceship that can be controlled with the arrow keys. The spaceship can 
      // rotate and thrust forward, with a very small drag applied. Edges of the canvas loop around.
    },

    "Artillery": (canvas) => {
      // Demo showing a cannon that can be rotated and fired. The cannonball will follow a parabolic 
      // trajectory and can hit a target. 
    },

    "Tank": (canvas) => {
      // Demo showing a tank that can be controlled with the arrow keys. The tank can rotate and 
      // move forward/backward. The cannon rotates toward the mouse. The tank can shoot bullets.
    },

    "Car": (canvas) => {
      // Demo showing a car that can be controlled with the arrow keys. The car can rotate and move 
      // forward/backward. The car has a small drag applied. 
    },
};
