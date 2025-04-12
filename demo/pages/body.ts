import { radiansBetweenPoints } from "./../../src/angle";
import { angle, PhysicalBody, Point, Vector2d } from '../../src';
import { DemoFunction } from './index';
import * as point from '../../src/point';
import * as vector from '../../src/vector';
import { animate, clearCanvas, drawCircle, drawRect, simulate, drag, key, drawResults, drawLine, keys, drawPoint, move, click, drawArrow, drawWithOffset } from '../utils';


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
                ['Number of Balls', balls.length, { precision: 0 }],
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
                ['Number of Balls', balls.length, { precision: 0 }],
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
            position: Point;
            angle = -Math.PI / 4;
            power = 0;
            charging = false;
            chargeStartTime = 0;

            constructor(x: number, y: number) {
                this.position = { x, y };
            }

            startCharging() {
                this.charging = true;
                this.chargeStartTime = performance.now();
            }

            stopCharging() {
                this.charging = false;
                this.power = this.calculatePower();
            }

            calculatePower(): number {
                const minPower = 100;
                const maxPower = 1000;
                const powerPerSecond = 500;

                const chargeDuration = (performance.now() - this.chargeStartTime) / 1000; // in seconds
                return Math.min(maxPower, minPower + chargeDuration * powerPerSecond);
            }
        }
        
        class Cannonball extends PhysicalBody {
            constructor(position: Point, velocity: Vector2d) {
                super({ 
                    position,
                    velocity,
                    mass: 5,
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
                    mass: 10 // Give the target some mass to react to collisions
                });
                this.radius = 20;
            }

            applyGravity() {
                this.gravity = { x: 0, y: 500 }; // Apply downward gravity
            }

            reset() {
                this.hit = false;
                this.gravity = { x: 0, y: 0 }; // Remove gravity
                this.velocity = { x: 0, y: 0 }; // Reset velocity
                this.position.x = Math.random() * (canvas.width - 200) + 100; // Random x position
                this.position.y = Math.random() * (canvas.height - 200); // Random y position
            }
        }
        
        const cannon = new Cannon(50, canvas.height - 50);
        const target = new Target(canvas.width - 100);
        let cannonball: Cannonball | null = null;
        let score = 0;

        const ground = canvas.height - 30;

        drag({ canvas, draw }, {
            onStart: () => {
                cannon.startCharging();
            },
            onEnd: () => {
                cannon.stopCharging();
                const velocity = vector.fromAngleRadians(cannon.angle, cannon.power);
                cannonball = new Cannonball({ ...cannon.position }, velocity);
            }
        });

        move({ canvas }, (pos) => {
            cannon.angle = angle.radiansBetweenPoints(cannon.position, pos);
        });

        const update = (deltaTime: number) => {
            if (cannonball) {
                cannonball.update(deltaTime);
                
                // Check for collision with the target
                if (!target.hit && cannonball.collideWithBody(target)) {
                    target.hit = true;
                    target.applyGravity(); // Apply gravity to the target
                    score++;
                    cannonball = null;
                }
                
                // Remove if off screen or hits the ground
                else if (cannonball.position.y > ground) {
                    cannonball = null;
                }
            }

            // Update target physics
            target.update(deltaTime);

            // Reset target if it falls below the ground
            if (target.position.y > ground) {
                target.reset();
            }
        };
        
        function draw() {
            clearCanvas(ctx);
            
            // Draw ground
            drawRect(ctx, { x: 0, y: ground, width: canvas.width, height: canvas.height - ground }, '#764', true);
            
            // Draw cannon base
            drawCircle(ctx, { x: cannon.position.x, y: cannon.position.y, radius: 15 }, '#333', true);

            // Draw cannon
            const cannonEnd = vector.add(
                cannon.position,
                vector.fromAngleRadians(cannon.angle, 30) // Cannon length
            );
            drawLine(ctx, { start: cannon.position, end: cannonEnd }, '#333', 10);

            // Visualize charged power with a red arrow
            if (cannon.charging) {
                const power = cannon.calculatePower();
                const powerArrowEnd = vector.add(
                    cannon.position,
                    vector.fromAngleRadians(cannon.angle, power / 10) // Scale power for visualization
                );
                drawArrow(ctx, cannon.position, powerArrowEnd, 'red');
            }

            // Draw target
            drawCircle(ctx, target, target.hit ? 'red' : 'blue', true);

            // Draw cannonball
            if (cannonball) {
                drawCircle(ctx, cannonball, '#333', true);
            }
            
            // Draw score and power
            drawResults(ctx, [
                ['Score', score, { precision: 0 }],
                ['Angle', angle.radiansToDegrees(cannon.angle)],
                ['Power', cannon.charging ? cannon.calculatePower() : cannon.power],
                "Click and hold to charge cannon",
            ]);
        };
        
        return simulate(update, draw);
    },

    "Tank": (canvas) => {
        const ctx = canvas.getContext('2d')!;
        
        class Tank extends PhysicalBody {
            angle = 0;
            turretAngle = 0;
            speed = 0;
            turretRotationSpeed = 5;
            
            constructor() {
                super({ x: canvas.width/2, y: canvas.height/2, mass: 5 });
                this.radius = 20;
                this.mass = 100
            }
            
            update(deltaTime: number) {
                // Update turret angle based on mouse position
                const mouseTargetAngle = angle.radiansBetweenPoints(this.position, mousePos);
                this.turretAngle = angle.rotateAngleTowardsRadians(this.turretAngle, mouseTargetAngle, this.turretRotationSpeed * deltaTime);

                // Tank movement -- always move in the direction of the tank's angle
                this.velocity = vector.fromAngleRadians(tank.angle, tank.speed);
                
                // Apply drag
                this.speed *= 0.99;

                super.update(deltaTime);
            }
        }
        
        class Bullet extends PhysicalBody {
            timeAlive = 0;
            
            constructor(position: Vector2d, angle: number) {
                super({
                    position,
                    velocity: vector.fromAngleRadians(angle, 2500)
                });
                this.radius = 3;
                this.mass = 25;
            }
        }

        class Obstacle extends PhysicalBody {
            constructor(x: number, y: number, radius: number) {
                super({ x, y, mass: radius * 10 });
                this.radius = radius;
                this.elasticity = 0.8;
                this.friction = 0.2;
            }
        }

        const tank = new Tank();
        const bullets: Bullet[] = [];
        const obstacles: Obstacle[] = Array.from({ length: 15 }, () => 
            new Obstacle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                10 + Math.random() * 20
            )
        );
        const mousePos: Point = { x: 0, y: 0 };

        // Use move() to update turret angle based on mouse position
        move({ canvas, draw }, (pos) => {
            mousePos.x = pos.x;
            mousePos.y = pos.y;
        });

        // Use click() to fire bullets
        click({ canvas, draw }, () => {
            const bulletPos = vector.add(
                tank.position,
                vector.fromAngleRadians(tank.turretAngle, tank.radius)
            );
            bullets.push(new Bullet(bulletPos, tank.turretAngle));
        });

        keys.listen();

        const update = (deltaTime: number) => {
            // Tank movement controls using keys.isDown()
            const turnSpeed = 2;
            const throttleSpeed = 400;
            if (keys.isDown('ArrowLeft')) tank.angle -= turnSpeed * deltaTime;
            if (keys.isDown('ArrowRight')) tank.angle += turnSpeed * deltaTime;
            if (keys.isDown('ArrowUp')) tank.speed = Math.min(200, tank.speed + throttleSpeed * deltaTime);
            if (keys.isDown('ArrowDown')) tank.speed = Math.max(-100, tank.speed - throttleSpeed * deltaTime);

            // Tank movement
            tank.update(deltaTime);

            // Keep tank in bounds
            tank.position.x = Math.max(tank.radius, Math.min(canvas.width - tank.radius, tank.position.x));
            tank.position.y = Math.max(tank.radius, Math.min(canvas.height - tank.radius, tank.position.y));

            // Update bullets
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                bullet.update(deltaTime);
                bullet.timeAlive += deltaTime;

                // Remove bullets that are too old or out of bounds
                if (bullet.timeAlive > 2 || 
                    bullet.position.x < 0 || bullet.position.x > canvas.width ||
                    bullet.position.y < 0 || bullet.position.y > canvas.height) {
                    bullets.splice(i, 1);
                }
            }

            // Update obstacles
            obstacles.forEach(obstacle => obstacle.update(deltaTime));

            // Handle collisions between tank and obstacles
            obstacles.forEach(obstacle => tank.collideWithBody(obstacle));

            // Handle collisions between bullets and obstacles
            bullets.forEach(bullet => {
                obstacles.forEach(obstacle => bullet.collideWithBody(obstacle));
            });

            // Handle collisions between obstacles
            obstacles.forEach((o1, i) => {
                obstacles.slice(i + 1).forEach(o2 => o1.collideWithBody(o2));
            });
        };

        function draw() {
            clearCanvas(ctx);

            // Draw tank body
            drawWithOffset(ctx, tank.position, (ctx) => {
                ctx.rotate(tank.angle);
                drawRect(ctx, { 
                    x: -25, 
                    y: -15, 
                    width: 50, 
                    height: 30 
                }, '#3a3', true);
            });

            // Draw tank turret
            drawWithOffset(ctx, tank.position, (ctx) => {
                ctx.rotate(tank.turretAngle);
                const turretEnd = vector.fromAngleRadians(0, 30);
                drawLine(ctx, { 
                    start: { x: 0, y: 0 }, 
                    end: turretEnd 
                }, '#373', 10);
            });

            // Draw bullets
            bullets.forEach(bullet => {
                drawCircle(ctx, bullet, "orange", true);
            });

            // Draw obstacles
            obstacles.forEach(obstacle => {
                drawCircle(ctx, obstacle, "gray", true);
            });

            // Render speed in the output
            drawResults(ctx, [
                ['Speed', tank.speed],
                "Arrow Keys: Rotate and Throttle",
                "Click to Fire",
            ]);
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
                this.mass = 100;
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

        class Obstacle extends PhysicalBody {
            constructor(x: number, y: number, radius: number) {
                super({ x, y, mass: radius * 10 });
                this.radius = radius;
                this.elasticity = 0.8;
                this.friction = 0.002;
            }
        }
        
        const car = new Car();
        const obstacles: Obstacle[] = Array.from({ length: 15 }, () => 
            new Obstacle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                10 + Math.random() * 20
            )
        );
        keys.listen();

        const update = (deltaTime: number) => {
            // Car controls using keys.isDown()
            const steeringSpeed = 1;
            if (keys.isDown('ArrowLeft')) car.steering = -steeringSpeed;
            else if (keys.isDown('ArrowRight')) car.steering = steeringSpeed;
            else car.steering = 0;

            const throttleSpeed = 400;
            if (keys.isDown('ArrowUp')) car.speed = Math.min(300, car.speed + throttleSpeed * deltaTime);
            if (keys.isDown('ArrowDown')) car.speed = Math.max(-100, car.speed - throttleSpeed * deltaTime);

            car.update(deltaTime);

            // Keep car in bounds
            car.position.x = (car.position.x + canvas.width) % canvas.width;
            car.position.y = (car.position.y + canvas.height) % canvas.height;

            // Update obstacles
            obstacles.forEach(obstacle => {
                obstacle.update(deltaTime);

                // Loop obstacles around the canvas
                obstacle.position.x = (obstacle.position.x + canvas.width) % canvas.width;
                obstacle.position.y = (obstacle.position.y + canvas.height) % canvas.height;
            });

            // Handle collisions between car and obstacles
            obstacles.forEach(obstacle => car.collideWithBody(obstacle));

            // Handle collisions between obstacles
            obstacles.forEach((o1, i) => {
                obstacles.slice(i + 1).forEach(o2 => o1.collideWithBody(o2));
            });
        };

        const draw = () => {
            clearCanvas(ctx);

            // Draw car body and wheels using drawWithOffset and drawRect
            drawWithOffset(ctx, car.position, (ctx) => {
                ctx.rotate(car.angle);

                // Draw car body
                drawRect(ctx, { x: -20, y: -10, width: 40, height: 20 }, '#d33', true);

                // Draw wheels
                drawRect(ctx, { x: -15, y: -12, width: 8, height: 4 }, '#333', true);
                drawRect(ctx, { x: -15, y: 8, width: 8, height: 4 }, '#333', true);
                drawRect(ctx, { x: 7, y: -12, width: 8, height: 4 }, '#333', true);
                drawRect(ctx, { x: 7, y: 8, width: 8, height: 4 }, '#333', true);
            });

            // Draw obstacles
            obstacles.forEach(obstacle => {
                drawCircle(ctx, obstacle, "gray", true);
            });

            // Render speed and steering in the output
            drawResults(ctx, [
                ['Speed', car.speed],
                ['Steering', car.steering],
                "Arrow Keys: Steer and Accelerate",
            ]);
        };
        
        return simulate(update, draw);
    },
};
