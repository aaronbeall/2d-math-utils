import { PhysicalBody, Vector2d } from '../../src';
import { DemoFunction } from './index';
import * as point from '../../src/point';
import * as vector from '../../src/vector';
import { animate, clearCanvas, drawCircle, drawRect, simulate, drag } from '../utils';


export const bodyDemos: Record<string, DemoFunction> = {
    "Balls": (canvas) => {
        const ctx = canvas.getContext('2d')!;

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
        
        const balls: Ball[] = [];
        let draggedBall: Ball | null = null;
        const mousePos: Vector2d = { x: 0, y: 0 };
        const dragStart: Vector2d = { x: 0, y: 0 };
        const lastPos: Vector2d = { x: 0, y: 0 };
        let lastTime = 0;

        // Create some balls
        for (let i = 0; i < 10; i++) {
            balls.push(new Ball(
                Math.random() * canvas.width,
                Math.random() * canvas.height * 0.5,
                10 + Math.random() * 20
            ));
        }

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
                    // if (!b1.grabbed && !b2.grabbed) {
                        b1.collideWithBody(b2);
                    // }
                }
            }
        };

        const draw = () => {
            clearCanvas(ctx);
            for (const ball of balls) {
              drawCircle(ctx, ball, ball.grabbed ? 'red' : 'blue', true);
            }
        };

        drag({ canvas, draw }, {
            onStart: (pos) => {
                mousePos.x = pos.x;
                mousePos.y = pos.y;
                dragStart.x = pos.x;
                dragStart.y = pos.y;
                lastPos.x = pos.x;
                lastPos.y = pos.y;
                lastTime = performance.now();

                for (const ball of balls) {
                    const dist = point.distance(ball.position, mousePos);
                    if (dist <= ball.radius) {
                        ball.grabbed = true;
                        draggedBall = ball;
                        ball.grabOffset = vector.subtract(mousePos, ball.position);
                        break;
                    }
                }
            },
            onDrag: (pos) => {
                lastPos.x = mousePos.x;
                lastPos.y = mousePos.y;
                mousePos.x = pos.x;
                mousePos.y = pos.y;
                const currentTime = performance.now();
                const dt = (currentTime - lastTime) / 1000; // Convert to seconds
                lastTime = currentTime;
                
                if (draggedBall) {
                    draggedBall.position = vector.subtract(mousePos, draggedBall.grabOffset);
                }
            },
            onEnd: () => {
                if (draggedBall) {
                    const currentTime = performance.now();
                    const dt = (currentTime - lastTime) / 1000;
                    if (dt > 0) {
                        // Calculate velocity based on movement over time
                        const dragVel = vector.scale(
                            vector.subtract(mousePos, lastPos),
                            1 / dt // Divide by time to get velocity
                        );
                        draggedBall.velocity = dragVel;
                    }
                    draggedBall.grabbed = false;
                    draggedBall = null;
                }
            }
        });

        return simulate(update, draw);
    },

    "Billiards": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        class BilliardBall extends PhysicalBody {
            color: string;
            grabbed = false;
            grabOffset: Vector2d = { x: 0, y: 0 };
            
            constructor(x: number, y: number, color: string) {
                super({ x, y, mass: 1 });
                this.radius = 15;
                this.color = color;
                this.elasticity = 0.95;
                this.friction = .01;
            }
        }
        
        const balls: BilliardBall[] = [];
        const colors = [
            'white',       // cue
            'gold',        // 1
            'royalblue',   // 2
            'crimson',     // 3
            'purple',      // 4
            'darkorange',  // 5
            'forestgreen', // 6
            'saddlebrown', // 7
            'black',       // 8
            'khaki',       // 9
            'steelblue',   // 10
            'indianred',   // 11
            'darkmagenta', // 12
            'coral',       // 13
            'seagreen',    // 14
            'sienna'       // 15
        ];
        let draggedBall: BilliardBall | null = null;
        const mousePos: Vector2d = { x: 0, y: 0 };
        const dragStart: Vector2d = { x: 0, y: 0 };
        
        // Create rack of balls
        balls.push(new BilliardBall(200, canvas.height/2, colors[0])); // Cue ball
        let row = 0;
        let idx = 1;
        for (let y = -2; y <= 2; y++) {
            for (let x = 0; x <= row; x++) {
                if (idx < colors.length) {
                    balls.push(new BilliardBall(
                        600 + x * 30 - row * 15,
                        canvas.height/2 + y * 30,
                        colors[idx++]
                    ));
                }
            }
            row++;
        }
        
        const update = (deltaTime: number) => {
            for (const ball of balls) {
                ball.update(deltaTime);
                
                // Cushion collisions
                const padding = 5;
                ball.collideWithSurface({ x: 1, y: 0 }, { x: padding, y: ball.y });
                ball.collideWithSurface({ x: -1, y: 0 }, { x: canvas.width - padding, y: ball.y });
                ball.collideWithSurface({ x: 0, y: 1 }, { x: ball.x, y: padding });
                ball.collideWithSurface({ x: 0, y: -1 }, { x: ball.x, y: canvas.height - padding });
            }
            
            // Ball collisions
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const b1 = balls[i], b2 = balls[j];
                    b1.collideWithBody(b2);
                }
            }
        };
        
        const draw = () => {
            clearCanvas(ctx);
            
            // Draw table
            ctx.fillStyle = '#076324';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw balls
            for (const ball of balls) {
                if (ball.color.startsWith('striped-')) {
                    // Draw striped ball
                    const baseColor = ball.color.substring(8);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                    // Add stripes
                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, ball.radius, -Math.PI/3, Math.PI/3);
                    ctx.arc(ball.x, ball.y, ball.radius, Math.PI*2/3, Math.PI*4/3);
                    ctx.fillStyle = baseColor;
                    ctx.fill();
                    ctx.restore();
                } else {
                    // Draw solid ball
                    drawCircle(ctx, ball, ball.color, true);
                }
            }
            
            // Draw aiming line
            if (draggedBall) {
                const pullBack = vector.subtract(dragStart, mousePos);
                const maxPower = 200;
                const power = Math.min(vector.length(pullBack), maxPower) / maxPower;
                const aimLine = vector.scale(pullBack, 2);
                
                // Draw power gauge
                ctx.beginPath();
                ctx.moveTo(draggedBall.position.x, draggedBall.position.y);
                ctx.lineTo(
                    draggedBall.position.x + aimLine.x,
                    draggedBall.position.y + aimLine.y
                );
                ctx.strokeStyle = `rgba(255, 255, 255, ${power})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw direction indicator
                ctx.beginPath();
                ctx.arc(
                    draggedBall.position.x + aimLine.x,
                    draggedBall.position.y + aimLine.y,
                    2,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = 'white';
                ctx.fill();
            }
        };
        
        drag({ canvas, draw }, {
            onStart: (pos) => {
                mousePos.x = pos.x;
                mousePos.y = pos.y;
                dragStart.x = pos.x;
                dragStart.y = pos.y;
                const cueBall = balls[0];
                if (point.distance(cueBall.position, mousePos) <= cueBall.radius) {
                    draggedBall = cueBall;
                }
            },
            onDrag: (pos) => {
                mousePos.x = pos.x;
                mousePos.y = pos.y;
            },
            onEnd: () => {
                if (draggedBall) {
                    const pullBack = vector.subtract(dragStart, mousePos);
                    const maxPower = 200;
                    const power = Math.min(vector.length(pullBack), maxPower) / maxPower;
                    draggedBall.velocity = vector.scale(pullBack, power * 2);
                    draggedBall = null;
                }
            }
        });
        
        return simulate(update, draw);
    },

    "Spaceship": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        class Spaceship extends PhysicalBody {
            angle = 0;
            thrusting = false;
            
            constructor() {
                super({ x: canvas.width/2, y: canvas.height/2, mass: 1 });
                this.radius = 20;
            }
            
            applyThrust() {
                const force = vector.fromAngleRadians(this.angle, 500);
                this.applyForce(force);
                this.thrusting = true;
            }
            
            update(deltaTime: number) {
                // Apply minimal drag
                this.velocity = vector.scale(this.velocity, 0.999);
                super.update(deltaTime);
                
                // Wrap around edges
                this.position.x = (this.position.x + canvas.width) % canvas.width;
                this.position.y = (this.position.y + canvas.height) % canvas.height;
                this.thrusting = false;
            }
        }
        
        const ship = new Spaceship();
        const keys = new Set<string>();
        
        window.addEventListener('keydown', e => keys.add(e.key));
        window.addEventListener('keyup', e => keys.delete(e.key));
        
        const update = (deltaTime: number) => {
            if (keys.has('ArrowLeft')) ship.angle -= 4 * deltaTime;
            if (keys.has('ArrowRight')) ship.angle += 4 * deltaTime;
            if (keys.has('ArrowUp')) ship.applyThrust();
            
            ship.update(deltaTime);
        };
        
        const draw = () => {
            clearCanvas(ctx);
            
            ctx.save();
            ctx.translate(ship.position.x, ship.position.y);
            ctx.rotate(ship.angle);
            
            // Draw ship
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(-10, 10);
            ctx.lineTo(-10, -10);
            ctx.closePath();
            ctx.strokeStyle = 'white';
            ctx.stroke();
            
            // Draw thrust
            if (ship.thrusting) {
                ctx.beginPath();
                ctx.moveTo(-10, 0);
                ctx.lineTo(-20, 5);
                ctx.lineTo(-25, 0);
                ctx.lineTo(-20, -5);
                ctx.closePath();
                ctx.fillStyle = 'orange';
                ctx.fill();
            }
            
            ctx.restore();
        };
        
        return simulate(update, draw);
    },

    "Artillery": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        class Cannon {
            position: Vector2d;
            angle = -Math.PI/4;
            power = 500;
            
            constructor(x: number, y: number) {
                this.position = { x, y };
            }
        }
        
        class Cannonball extends PhysicalBody {
            constructor(position: Vector2d, velocity: Vector2d) {
                super({ 
                    ...position,
                    velocity,
                    mass: 1,
                    gravity: { x: 0, y: 500 }
                });
                this.radius = 5;
            }
        }
        
        class Target extends PhysicalBody {
            hit = false;
            
            constructor(x: number) {
                super({ 
                    x,
                    y: canvas.height - 50,
                    mass: 1
                });
                this.radius = 20;
            }
        }
        
        const cannon = new Cannon(50, canvas.height - 50);
        const target = new Target(canvas.width - 100);
        let cannonball: Cannonball | null = null;
        let score = 0;
        
        canvas.addEventListener('mousemove', e => {
            const dx = e.offsetX - cannon.position.x;
            const dy = e.offsetY - cannon.position.y;
            cannon.angle = Math.atan2(dy, dx);
        });
        
        canvas.addEventListener('click', () => {
            if (cannonball) return;
            const velocity = vector.fromAngleRadians(cannon.angle, cannon.power);
            cannonball = new Cannonball(cannon.position, velocity);
        });
        
        const update = (deltaTime: number) => {
            if (cannonball) {
                cannonball.update(deltaTime);
                
                // Check for hit
                if (!target.hit && point.distance(cannonball.position, target.position) < target.radius) {
                    target.hit = true;
                    score++;
                    setTimeout(() => {
                        target.hit = false;
                        target.position.x = Math.random() * (canvas.width - 200) + 100;
                    }, 1000);
                }
                
                // Remove if off screen
                if (cannonball.position.y > canvas.height) {
                    cannonball = null;
                }
            }
        };
        
        const draw = () => {
            clearCanvas(ctx);
            
            // Draw ground
            ctx.fillStyle = '#764';
            ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            
            // Draw cannon
            ctx.save();
            ctx.translate(cannon.position.x, cannon.position.y);
            ctx.rotate(cannon.angle);
            ctx.fillStyle = '#333';
            ctx.fillRect(0, -5, 30, 10);
            ctx.restore();
            
            // Draw target
            ctx.fillStyle = target.hit ? 'red' : 'green';
            drawCircle(ctx, target);
            
            // Draw cannonball
            if (cannonball) {
                drawCircle(ctx, cannonball, '#333');
            }
            
            // Draw score
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.fillText(`Score: ${score}`, 20, 40);
        };
        
        return simulate(update, draw);
    },

    "Tank": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        class Tank extends PhysicalBody {
            angle = 0;
            turretAngle = 0;
            speed = 0;
            
            constructor() {
                super({ x: canvas.width/2, y: canvas.height/2, mass: 5 });
                this.radius = 20;
            }
            
            update(deltaTime: number) {
                const velocity = vector.fromAngleRadians(this.angle, this.speed);
                this.velocity = velocity;
                super.update(deltaTime);
            }
        }
        
        class Bullet extends PhysicalBody {
            timeAlive = 0;
            
            constructor(position: Vector2d, angle: number) {
                super({
                    ...position,
                    velocity: vector.fromAngleRadians(angle, 500),
                    mass: 0.1
                });
                this.radius = 3;
            }
        }
        
        const tank = new Tank();
        const bullets: Bullet[] = [];
        const keys = new Set<string>();
        const mousePos: Vector2d = { x: 0, y: 0 };
        
        canvas.addEventListener('mousemove', e => {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
        });
        
        canvas.addEventListener('click', () => {
            const bulletPos = vector.add(
                tank.position,
                vector.fromAngleRadians(tank.turretAngle, tank.radius)
            );
            bullets.push(new Bullet(bulletPos, tank.turretAngle));
        });
        
        window.addEventListener('keydown', e => keys.add(e.key));
        window.addEventListener('keyup', e => keys.delete(e.key));
        
        const update = (deltaTime: number) => {
            // Tank controls
            if (keys.has('ArrowLeft')) tank.angle -= 2 * deltaTime;
            if (keys.has('ArrowRight')) tank.angle += 2 * deltaTime;
            if (keys.has('ArrowUp')) tank.speed = Math.min(200, tank.speed + 400 * deltaTime);
            if (keys.has('ArrowDown')) tank.speed = Math.max(-100, tank.speed - 400 * deltaTime);
            if (!keys.has('ArrowUp') && !keys.has('ArrowDown')) {
                tank.speed *= 0.95;
            }
            
            // Update turret angle
            const dx = mousePos.x - tank.position.x;
            const dy = mousePos.y - tank.position.y;
            tank.turretAngle = Math.atan2(dy, dx);
            
            // Update tank
            tank.update(deltaTime);
            
            // Keep tank in bounds
            tank.position.x = Math.max(tank.radius, Math.min(canvas.width - tank.radius, tank.position.x));
            tank.position.y = Math.max(tank.radius, Math.min(canvas.height - tank.radius, tank.position.y));
            
            // Update bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                bullet.update(deltaTime);
                bullet.timeAlive += deltaTime;
                
                // Remove old bullets
                if (bullet.timeAlive > 2 || 
                    bullet.position.x < 0 || bullet.position.x > canvas.width ||
                    bullet.position.y < 0 || bullet.position.y > canvas.height) {
                    bullets.splice(i, 1);
                }
            }
        };
        
        const draw = () => {
            clearCanvas(ctx);
            
            // Draw tank body
            ctx.save();
            ctx.translate(tank.position.x, tank.position.y);
            ctx.rotate(tank.angle);
            ctx.fillStyle = '#3a3';
            ctx.fillRect(-25, -15, 50, 30);
            ctx.restore();
            
            // Draw tank turret
            ctx.save();
            ctx.translate(tank.position.x, tank.position.y);
            ctx.rotate(tank.turretAngle);
            ctx.fillStyle = '#373';
            ctx.fillRect(0, -5, 30, 10);
            ctx.restore();
            
            // Draw bullets
            ctx.fillStyle = '#ff0';
            for (const bullet of bullets) {
                drawCircle(ctx, bullet);
            }
        };
        
        return simulate(update, draw);
    },

    "Car": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        class Car extends PhysicalBody {
            angle = 0;
            speed = 0;
            steering = 0;
            
            constructor() {
                super({ x: canvas.width/2, y: canvas.height/2, mass: 2 });
                this.radius = 20;
            }
            
            update(deltaTime: number) {
                // Apply steering
                this.angle += this.steering * this.speed * deltaTime * 0.003;
                
                // Update velocity based on car's angle
                this.velocity = vector.fromAngleRadians(this.angle, this.speed);
                
                // Apply drag
                this.speed *= 0.99;
                
                super.update(deltaTime);
            }
        }
        
        const car = new Car();
        const keys = new Set<string>();
        
        window.addEventListener('keydown', e => keys.add(e.key));
        window.addEventListener('keyup', e => keys.delete(e.key));
        
        const update = (deltaTime: number) => {
            // Car controls
            if (keys.has('ArrowLeft')) car.steering = -1;
            else if (keys.has('ArrowRight')) car.steering = 1;
            else car.steering = 0;
            
            if (keys.has('ArrowUp')) car.speed = Math.min(300, car.speed + 400 * deltaTime);
            if (keys.has('ArrowDown')) car.speed = Math.max(-100, car.speed - 400 * deltaTime);
            
            car.update(deltaTime);
            
            // Keep car in bounds
            car.position.x = (car.position.x + canvas.width) % canvas.width;
            car.position.y = (car.position.y + canvas.height) % canvas.height;
        };
        
        const draw = () => {
            clearCanvas(ctx);
            
            ctx.save();
            ctx.translate(car.position.x, car.position.y);
            ctx.rotate(car.angle);
            
            // Draw car body
            ctx.fillStyle = '#d33';
            ctx.fillRect(-20, -10, 40, 20);
            
            // Draw wheels
            ctx.fillStyle = '#333';
            ctx.fillRect(-15, -12, 8, 4);
            ctx.fillRect(-15, 8, 8, 4);
            ctx.fillRect(7, -12, 8, 4);
            ctx.fillRect(7, 8, 8, 4);
            
            ctx.restore();
        };
        
        return simulate(update, draw);
    },
};
