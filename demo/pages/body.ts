import { PhysicalBody, Vector2d } from '../../src';
import { DemoFunction } from './index';
import * as point from '../../src/point';
import * as vector from '../../src/vector';
import { animate, clearCanvas, drawCircle, drawRect, simulate, drag, key, drawResults, drawLine, globalKey, keys, drawPoint } from '../utils';


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

        const overlapModes: PhysicalBody["collisionOverlapResolution"][] = ['separate', 'repel', 'none'];
        let currentOverlapModeIndex = 0;

        const addBall = () => {
            const radius = 10 + Math.random() * 20;
            const ball = new Ball(
                Math.random() * canvas.width,
                Math.random() * canvas.height * 0.5,
                radius
            );
            ball.velocity = { x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 };
            ball.collisionOverlapResolution = overlapModes[currentOverlapModeIndex];
            balls.push(ball);
        };

        const removeBall = () => {
            if (balls.length > 0) {
                balls.pop();
            }
        };

        const resetBalls = () => {
            balls.length = 0;
            Array.from({ length: 10 }).forEach(addBall);
        };

        const toggleOverlapMode = () => {
            currentOverlapModeIndex = (currentOverlapModeIndex + 1) % overlapModes.length;
            balls.forEach(ball => {
                ball.collisionOverlapResolution = overlapModes[currentOverlapModeIndex];
            });
        };

        resetBalls();

        const update = (deltaTime: number) => {
            // Update physics
            balls.forEach(ball => {
                if (ball.grabbed) {
                    ball.velocity.x = 0;
                    ball.velocity.y = 0;
                    ball.position.x = mousePos.x - ball.grabOffset.x;
                    ball.position.y = mousePos.y - ball.grabOffset.y;
                    ball.mass = Number.MAX_SAFE_INTEGER; // Give maximum mass while dragging
                } else {
                    ball.mass = Math.PI * ball.radius * ball.radius; // Reset mass
                    ball.update(deltaTime);

                    // Wall collisions
                    ball.collideWithSurface({ x: 0, y: 0 }, { x: 1, y: 0 }); // Left wall
                    ball.collideWithSurface({ x: canvas.width, y: 0 }, { x: -1, y: 0 }); // Right wall
                    ball.collideWithSurface({ x: 0, y: 0 }, { x: 0, y: 1 }); // Top wall
                    ball.collideWithSurface({ x: 0, y: canvas.height }, { x: 0, y: -1 }); // Bottom wall
                }
            });

            // Ball-to-ball collisions
            balls.forEach((b1, i) => {
                balls.slice(i + 1).forEach(b2 => {
                    b1.collideWithBody(b2);
                });
            });
        };

        const draw = () => {
            clearCanvas(ctx);
            balls.forEach(ball => {
                drawCircle(ctx, ball, ball.grabbed ? 'red' : 'blue', true);
            });

            // Show results
            drawResults(ctx, [
                ['Number of Balls', balls.length],
                ['Overlap Mode', overlapModes[currentOverlapModeIndex]],
                'Drag balls to move them',
                'Press +/- to add/remove a ball',
                'Press R to reset',
                'Press O to toggle overlap mode'
            ]);
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

                balls.forEach(ball => {
                    const dist = point.distance(ball.position, mousePos);
                    if (dist <= ball.radius) {
                        ball.grabbed = true;
                        draggedBall = ball;
                        ball.grabOffset = vector.subtract(mousePos, ball.position);
                    }
                });
            },
            onDrag: (pos) => {
                lastPos.x = mousePos.x;
                lastPos.y = mousePos.y;
                mousePos.x = pos.x;
                mousePos.y = pos.y;
                lastTime = performance.now();
                
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

        key({ canvas, draw }, {
            '+': addBall,
            '-': removeBall,
            'r': resetBalls,
            'o': toggleOverlapMode
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
                this.friction = 0.01;
            }
        }
        
        const balls: BilliardBall[] = [];
        const pockets = [
            { x: 20, y: 20 }, // Top-left
            { x: canvas.width / 2, y: 20 }, // Top-center
            { x: canvas.width - 20, y: 20 }, // Top-right
            { x: 20, y: canvas.height - 20 }, // Bottom-left
            { x: canvas.width / 2, y: canvas.height - 20 }, // Bottom-center
            { x: canvas.width - 20, y: canvas.height - 20 } // Bottom-right
        ];
        const pocketRadius = 25;
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

        const resetBalls = () => {
            balls.length = 0;
            balls.push(new BilliardBall(200, canvas.height / 2, colors[0])); // Cue ball
            let row = 0;
            let idx = 1;
            for (let y = -2; y <= 2; y++) {
                for (let x = 0; x <= row; x++) {
                    if (idx < colors.length) {
                        balls.push(new BilliardBall(
                            // Centered along the midline x-axis, facing left
                            550 + row * 15, 
                            canvas.height / 2 + x * 30 - row * 15,
                            colors[idx++]
                        ));
                    }
                }
                row++;
            }
        };

        resetBalls();

        const update = (deltaTime: number) => {
            balls.forEach(ball => {
                ball.update(deltaTime);
                
                // Cushion collisions
                const wallPadding = 10;
                ball.collideWithSurface({ x: wallPadding, y: 0 }, { x: 1, y: 0 }); // Left wall
                ball.collideWithSurface({ x: canvas.width - wallPadding, y: 0 }, { x: -1, y: 0 }); // Right wall
                ball.collideWithSurface({ x: 0, y: wallPadding }, { x: 0, y: 1 }); // Top wall
                ball.collideWithSurface({ x: 0, y: canvas.height - wallPadding }, { x: 0, y: -1 }); // Bottom wall
            });

            // Ball collisions
            balls.forEach((b1, i) => {
                balls.slice(i + 1).forEach(b2 => {
                    b1.collideWithBody(b2);
                });
            });

            // Check for balls in pockets
            for (let i = balls.length - 1; i >= 0; i--) {
                const ball = balls[i];
                const inPocket = pockets.some(pocket => 
                    point.distance(ball.position, pocket) < pocketRadius
                );

                if (inPocket) {
                    if (ball.color === 'white') {
                        // Reset cue ball to starting position
                        ball.position = { x: 200, y: canvas.height / 2 };
                        ball.velocity = vector.fromAngleRadians(Math.random() * Math.PI * 2, 50);
                    } else {
                        balls.splice(i, 1); // Remove ball
                    }
                }
            }
        };
        
        const draw = () => {
            clearCanvas(ctx);

            // Draw wooden frame
            const wallPadding = 10; // Match wall padding
            drawRect(ctx, { x: 0, y: 0, width: canvas.width, height: canvas.height }, 'brown', true); // Outer frame
            drawRect(ctx, { x: wallPadding, y: wallPadding, width: canvas.width - 2 * wallPadding, height: canvas.height - 2 * wallPadding }, 'darkgreen', true); // Inner table

            // Draw pockets
            pockets.forEach(pocket => {
                drawCircle(ctx, { x: pocket.x, y: pocket.y, radius: pocketRadius }, 'black', true);
            });

            // Draw balls
            balls.forEach(ball => {
                drawCircle(ctx, ball, ball.color, true);
            });

            // Draw aiming line
            if (draggedBall) {
                const pullBack = vector.subtract(dragStart, mousePos);
                const aimLine = vector.scale(pullBack, 2);

                // Draw power gauge
                drawLine(ctx, { start: draggedBall.position, end: vector.add(draggedBall.position, aimLine) }, 'rgba(255, 255, 255, .25)', 2);

                // Draw direction indicator
                drawCircle(ctx, { x: draggedBall.position.x + aimLine.x, y: draggedBall.position.y + aimLine.y, radius: 2 }, 'white', true);
            }

            // Show results
            drawResults(ctx, [
                ['Number of Balls', balls.length],
                'Drag the cue ball to aim and shoot',
                'Press R to reset'
            ], { color: 'white' });
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
                    draggedBall.velocity = vector.add(draggedBall.velocity, vector.scale(pullBack, 10));
                    draggedBall = null;
                }
            }
        });
        
        key({ canvas, draw }, {
            'r': resetBalls,
        });

        return simulate(update, draw);
    },

    "Spaceship": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        class Spaceship extends PhysicalBody {
            thrusting = false;
            
            constructor() {
                super({ x: canvas.width / 2, y: canvas.height / 2, mass: 1 });
                this.radius = 20;
            }
            
            thrust() {
                const force = vector.fromAngleRadians(this.angle, 500);
                this.applyForce(force);
            }
            
            update(deltaTime: number) {
                // Apply minimal drag
                this.velocity = vector.scale(this.velocity, 0.999);
                super.update(deltaTime);
                
                // Wrap around edges
                this.position.x = (this.position.x + canvas.width) % canvas.width;
                this.position.y = (this.position.y + canvas.height) % canvas.height;
            }
        }
        
        const ship = new Spaceship();

        // Generate stars
        const stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            color: `rgba(${200 + Math.random() * 55}, ${200 + Math.random() * 55}, ${200 + Math.random() * 55}, 1)`,
            size: Math.random() * 2 + 1
        }));

        type Particle = { x: number; y: number; radius: number; life: number; velocity: Vector2d };

        let particles: Particle[] = [];

        keys.listen();

        const update = (deltaTime: number) => {
            if (keys.isDown('ArrowLeft')) ship.angle -= 4 * deltaTime;
            if (keys.isDown('ArrowRight')) ship.angle += 4 * deltaTime;
            if (keys.isDown('ArrowUp')) {
                ship.thrust();
                ship.thrusting = true;

                // Emit particles
                for (let i = 0; i < 3; i++) {
                    const thrustVector = vector.fromAngleRadians(ship.angle, -15);
                    particles.push({
                        x: ship.position.x + thrustVector.x + (Math.random() - 0.5) * 10,
                        y: ship.position.y + thrustVector.y + (Math.random() - 0.5) * 10,
                        radius: Math.random() * 3 + 1,
                        life: 1,
                        velocity: vector.add(
                            vector.fromAngleRadians(ship.angle, -300),
                            vector.fromAngleRadians(Math.random() * Math.PI * 2, Math.random() * 50)
                        )
                    });
                }
            } else {
                ship.thrusting = false;
            }

            ship.update(deltaTime);

            // Update particles
            particles.forEach(p => {
                p.life -= deltaTime;
                p.x += p.velocity.x * deltaTime;
                p.y += p.velocity.y * deltaTime;

                // Apply friction to slow down particles
                p.velocity = vector.scale(p.velocity, 0.95);

                p.radius *= 0.95; // Shrink over time
            });
            particles = particles.filter(p => p.life > 0); // Remove dead particles
        };

        const draw = () => {
            // Draw black background
            drawRect(ctx, { x: 0, y: 0, width: canvas.width, height: canvas.height }, 'black', true);

            // Draw stars
            stars.forEach(star => {
                drawPoint(ctx, { x: star.x, y: star.y }, star.color, star.size);
            });

            // Draw particles
            particles.forEach(p => {
                drawCircle(ctx, { x: p.x, y: p.y, radius: p.radius }, 'orange', true);
            });

            // Draw spaceship
            ctx.save();
            ctx.translate(ship.position.x, ship.position.y);
            ctx.rotate(ship.angle);

            // Draw ship body
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
                const spikes = 5;
                for (let i = 0; i <= spikes; i++) {
                    const angle = (i / spikes) * Math.PI / 3 - Math.PI / 6; // Symmetrical angle range
                    const length = 10 + Math.random() * 10; // Random spiky length
                    ctx.lineTo(-10 - length * Math.cos(angle), length * Math.sin(angle));
                }
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
            bullets.forEach(bullet => {
                drawCircle(ctx, bullet);
            });
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
