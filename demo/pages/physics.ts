import { scale, add, clamp } from "./../../src/vector";
import * as physics from '../../src/physics';
import { DemoFunction } from './index';
import { clearCanvas, drawCircle, drawLine, drawResults, drag, animate, click, key, drawWithOffset, drawArrow, ResultEntry, move } from '../utils';
import { Line, Point } from '../../src';
import { fromAngleRadians, subtract, normalize } from '../../src/vector';
import { radiansBetweenPoints } from '../../src/angle';
import { distance, closest } from '../../src/point';

export const physicsDemos: Record<keyof typeof physics, DemoFunction> = {
    applyForce: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let position = { x: canvas.width / 2, y: canvas.height / 2 };
        let velocity = { x: 0, y: 0 };
        let force = { x: 0.05, y: -0.03 };

        function draw() {
            clearCanvas(ctx);
            drawCircle(ctx, { ...position, radius: 10 }, 'blue');
            drawResults(ctx, [
                ['Position', position],
                ['Velocity', velocity],
                ['Force', force],
                'Click to reset position',
                'Use +/- to change force magnitude'
            ]);
        }

        animate(() => {
            physics.applyForce(velocity, force, 1);
            position.x += velocity.x;
            position.y += velocity.y;
        }, draw);

        click({ canvas, draw }, (pos) => {
            position = { ...pos };
            velocity = { x: 0, y: 0 };
        });

        key({ canvas, draw }, {
            '+': () => {
                force.x *= 1.1;
                force.y *= 1.1;
            },
            '-': () => {
                force.x *= 0.9;
                force.y *= 0.9;
            }
        });
    },

    applyDamping: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let position = { x: canvas.width / 2, y: canvas.height / 2 };
        let velocity = { x: 5, y: -3 };
        let damping = 0.05;

        function draw() {
            clearCanvas(ctx);
            drawCircle(ctx, { ...position, radius: 10 }, 'blue');
            drawResults(ctx, [
                ['Position', position],
                ['Velocity', velocity],
                ['Damping', damping],
                'Click to reset position',
                'Use +/- to change damping amount'
            ]);
        }

        animate(() => {
            physics.applyDamping(velocity, damping);
            position.x += velocity.x;
            position.y += velocity.y;
        }, draw);

        click({ canvas, draw }, (pos) => {
            position = { ...pos };
            velocity = { x: 5, y: -3 };
        });

        key({ canvas, draw }, {
            '+': () => {
                damping = Math.min(damping + 0.01, 1); // Cap damping at 1
            },
            '-': () => {
                damping = Math.max(damping - 0.01, 0); // Ensure damping is non-negative
            }
        });
    },

    applyTorque: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let angle = 0;
        let angularVelocity = 0;
        let torque = 0.1;

        function draw() {
            clearCanvas(ctx);
            const center = { x: canvas.width / 2, y: canvas.height / 2 };
            const end = fromAngleRadians(angle, 50);

            drawWithOffset(ctx, center, (ctx) => {
                drawLine(ctx, { start: { x: 0, y: 0 }, end }, 'blue', 2);
            });

            drawResults(ctx, [
                ['Angle', angle],
                ['Angular Velocity', angularVelocity],
                ['Torque', torque],
                'Click to reset angle',
                'Use +/- to change torque amount'
            ]);
        }

        animate(() => {
            angularVelocity = physics.applyTorque(angularVelocity, torque, 0.01);
            angle += angularVelocity;
        }, draw);

        click({ canvas, draw }, () => {
            angle = 0;
            angularVelocity = 0;
        });

        key({ canvas, draw }, {
            '+': () => {
                torque = Math.min(torque + 0.01, 1); // Cap torque at 1
            },
            '-': () => {
                torque = Math.max(torque - 0.01, 0); // Ensure torque is non-negative
            }
        });
    },

    applyAngleForce: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let position = { x: canvas.width / 2, y: canvas.height / 2 };
        let velocity = { x: 0, y: 0 };
        let forceMagnitude = 0.1;

        function draw() {
            clearCanvas(ctx);
            drawCircle(ctx, { ...position, radius: 10 }, 'blue');
            drawResults(ctx, [
                ['Position', position],
                ['Velocity', velocity],
                ['Force Magnitude', forceMagnitude],
                'Press to apply force away from mouse',
                'Use +/- to change force magnitude'
            ]);
        }

        let isMouseDown = false;
        let mousePos = { x: 0, y: 0 };
        animate(() => {
            if (isMouseDown) {
                const angle = radiansBetweenPoints(mousePos, position);
                physics.applyAngleForce(velocity, angle, forceMagnitude, 1);
            }
            position.x += velocity.x;
            position.y += velocity.y;

            // Reset position if it leaves the canvas bounds
            if (
                position.x < 0 || position.x > canvas.width ||
                position.y < 0 || position.y > canvas.height
            ) {
                position = { x: canvas.width / 2, y: canvas.height / 2 };
                velocity = { x: 0, y: 0 };
            }
        }, draw);

        drag({ canvas, draw }, {
            onStart: (pos) => {
                isMouseDown = true;
                mousePos = pos;
            },
            onDrag: (pos) => mousePos = pos,
            onEnd: (pos) => {
                mousePos = pos;
                isMouseDown = false; 
            }
        });

        key({ canvas, draw }, {
            '+': () => forceMagnitude += .01,
            '-': () => forceMagnitude -= .01
        });
    },

    collide: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let obj1 = { position: { x: 200, y: 200 }, velocity: { x: 0, y: 0 }, mass: 1, radius: 20 };
        let obj2 = { position: { x: 400, y: 200 }, velocity: { x: 0, y: 0 }, mass: 1, radius: 20 };
        let isSimulationRunning = false;

        let draggedPosition: Point | null = null;

        const init1: Line = { start: { x: 200, y: 300 }, end: { x: 250, y: 320 } };
        const init2: Line = { start: { x: 400, y: 300 }, end: { x: 330, y: 310 } };

        start();

        function draw() {
            clearCanvas(ctx);

            // Update object radii based on mass
            obj1.radius = obj1.mass * 20;
            obj2.radius = obj2.mass * 20;

            // Draw initial circles and velocity arrows
            drawCircle(ctx, { x: init1.start.x, y: init1.start.y, radius: obj1.radius }, 'gray', false);
            drawArrow(ctx, init1.start, init1.end, 'gray');

            drawCircle(ctx, { x: init2.start.x, y: init2.start.y, radius: obj2.radius }, 'gray', false);
            drawArrow(ctx, init2.start, init2.end, 'gray');

            if (isSimulationRunning) {
                // Draw solid circles during simulation
                drawCircle(ctx, { ...obj1.position, radius: obj1.radius }, 'blue', true);
                drawCircle(ctx, { ...obj2.position, radius: obj2.radius }, 'red', true);
            } 
            drawResults(ctx, [
                'Drag initial positions and velocities',
                ["Object 1", Object.entries(obj1)],
                ["Object 2", Object.entries(obj2)],
                ['Restitution', restitution],
                'Press +/- to adjust mass of first object',
                'Press [/] to adjust mass of second object',
                'Press 1/2 to adjust restitution',
                'Press R to replay simulation',
            ]);
        }

        function start() {
            obj1 = { 
                ...obj1,
                position: { ...init1.start }, 
                velocity: scale(subtract(init1.end, init1.start), .1)
            };
            obj2 = { 
                ...obj2,
                position: { ...init2.start }, 
                velocity: scale(subtract(init2.end, init2.start), .1)
            };
            isSimulationRunning = true;
        }

        drag({ canvas, draw }, {
            onStart: (pos) => {
                draggedPosition = closest(pos, [init1.start, init1.end, init2.start, init2.end]);
            },
            onDrag: (pos) => {
                if (draggedPosition) {
                    draggedPosition.x = pos.x;
                    draggedPosition.y = pos.y;
                }
            },
            onEnd: () => {
                draggedPosition = null;
                start();
            }
        });

        key({ canvas, draw }, {
            'r': start,
            '+': () => obj1.mass += 0.1,
            '-': () => obj1.mass -= 0.1,
            '[': () => obj2.mass -= 0.1,
            ']': () => obj2.mass += 0.1,
            '1': () => restitution = Math.max(restitution - 0.1, 0), // Decrease restitution
            '2': () => restitution = Math.min(restitution + 0.1, 1), // Increase restitution
        });

        let restitution = 0.9; // Default restitution

        animate(() => {
            if (isSimulationRunning) {
                obj1.position.x += obj1.velocity.x;
                obj1.position.y += obj1.velocity.y;
                obj2.position.x += obj2.velocity.x;
                obj2.position.y += obj2.velocity.y;
                if (distance(obj1.position, obj2.position) < obj1.radius + obj2.radius) {
                    physics.collide(obj1, obj2, restitution);
                }
            }
        }, draw);
    },

    separate: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const objects = Array.from({ length: 5 }, () => createRandomObject());

        function createRandomObject(position: Point = {
            x: canvas.width / 2 + Math.random() * 50 - 25, // Clustered around the center
            y: canvas.height / 2 + Math.random() * 50 - 25
        }): { position: Point; velocity: Point; mass: number; radius: number } {
            const radius = Math.random() * 20 + 10; // Random radius between 10 and 30
            return {
                position,
                velocity: { x: 0, y: 0 },
                mass: radius / 10, // Mass proportional to radius
                radius,
            };
        }

        function draw() {
            clearCanvas(ctx);
            objects.forEach(obj => {
                drawCircle(ctx, { ...obj.position, radius: obj.radius }, 'blue');
            });
            drawResults(ctx, [
                'Click to add a new random size object'
            ]);
        }

        animate(() => {
            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    physics.separate(objects[i], objects[j]);
                }
            }
        }, draw);

        click({ canvas, draw }, (pos) => {
            const noise = () => Math.random() * 2 - 1; // Random noise between -1 and 1
            const noisyPos = { x: pos.x + noise(), y: pos.y + noise() };
            objects.push(createRandomObject(noisyPos));
        });
    },

    repel: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const objects = Array.from({ length: 5 }, () => createRandomObject());

        let repelStrength = 0.001;
        let friction = 0.99;

        function createRandomObject(position: Point = {
            x: canvas.width / 2 + Math.random() * 50 - 25, // Clustered around the center
            y: canvas.height / 2 + Math.random() * 50 - 25
        }): { position: Point; velocity: Point; mass: number; radius: number } {
            const radius = Math.random() * 20 + 10; // Random radius between 10 and 30
            return {
                position,
                velocity: { x: 0, y: 0 },
                mass: radius / 10, // Mass proportional to radius
                radius,
            };
        }

        function draw() {
            clearCanvas(ctx);
            objects.forEach(obj => {
                drawCircle(ctx, { ...obj.position, radius: obj.radius }, 'red');
            });
            drawResults(ctx, [
                'Click to add a new random size object',
                [`Repel Strength`, repelStrength, { precision: 4 }],
                [`Friction`, friction],
                'Use +/- to change repel strength',
                'Use [/] to change friction',
            ]);
        }

        animate(() => {
            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    physics.repel(objects[i], objects[j], repelStrength);
                }
            }
            // Update positions based on velocities
            objects.forEach(obj => {
                obj.position.x += obj.velocity.x;
                obj.position.y += obj.velocity.y;

                // Apply drag to slow down the velocity
                obj.velocity.x *= friction;
                obj.velocity.y *= friction;
            });
        }, draw);

        key({ canvas, draw }, {
            '+': () => repelStrength += .001,
            '-': () => repelStrength -= .001,
            '[': () => friction -= .01,
            ']': () => friction += .01
        });

        click({ canvas, draw }, (pos) => {
            const noise = () => Math.random() * 2 - 1; // Random noise between -1 and 1
            const noisyPos = { x: pos.x + noise(), y: pos.y + noise() };
            objects.push(createRandomObject(noisyPos));
        });
    },

    fluid: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const particles = Array.from({ length: 1500 }, () => ({
            position: { 
                x: canvas.width / 2 + Math.random() * 150 - 25, // Clustered near the center
                y: canvas.height / 2 + Math.random() * 150 - 25 
            },
            velocity: { x: 0, y: 0 },
            density: 0,
            pressure: 0,
            mass: 1
        }));

        const settings = {
            smoothingRadius: 15,
            stiffness: 5,
            restDensity: 1,
            viscosity: 0.5
        }

        const gravity = { x: 0, y: 0.1 }; // Gravity force
        let lastMousePos: Point | null = null;

        function draw() {
            clearCanvas(ctx);
            particles.forEach(p => drawCircle(ctx, { ...p.position, radius: 5 }, 'blue')); // Reduced radius to 2
            drawResults(ctx, [
                'Fluid simulation',
                ['Particles', particles.length, { precision: 0 }],
                ['Fluid', Object.entries(settings)],
                'Click and drag to apply forces',
            ]);
        }

        animate(() => {
            const forces = physics.fluid(particles, settings);
            particles.forEach((p, i) => {
                // Apply fluid forces
                p.velocity.x += forces[i].x;
                p.velocity.y += forces[i].y;

                // Apply gravity
                p.velocity.x += gravity.x;
                p.velocity.y += gravity.y;

                // Update position
                p.position.x += p.velocity.x;
                p.position.y += p.velocity.y;

                // Keep particles within canvas bounds
                if (p.position.x < 0 || p.position.x > canvas.width) {
                    p.velocity.x *= -0.5; // Reverse and dampen velocity
                    p.position.x = Math.max(0, Math.min(canvas.width, p.position.x));
                }
                if (p.position.y < 0 || p.position.y > canvas.height) {
                    p.velocity.y *= -0.5; // Reverse and dampen velocity
                    p.position.y = Math.max(0, Math.min(canvas.height, p.position.y));
                }
            });
        }, draw);

        drag({ canvas, draw }, {
            onStart: (pos) => {
                lastMousePos = pos;
            },
            onDrag: (pos) => {
                if (lastMousePos) {
                    const dragForce = 2.5; // Strength of the drag force
                    const dragVector = subtract(pos, lastMousePos);
                    particles.forEach(p => {
                        const dist = distance(p.position, pos);
                        if (dist < 50) { // Apply force to nearby particles
                            const force = scale(dragVector, dragForce / (dist + 1)); // Inverse distance weighting
                            p.velocity.x += force.x;
                            p.velocity.y += force.y;
                        }
                    });
                }
                lastMousePos = pos;
            },
            onEnd: () => {
                lastMousePos = null;
            }
        });
    },

    boids: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const boids = Array.from({ length: 30 }, () => ({
            position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
            velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
        }));

        const settings = {
            separationRadius: 25,
            alignmentRadius: 50,
            cohesionRadius: 50,
            separationWeight: 1.5,
            alignmentWeight: 2,
            cohesionWeight: 0.1,
            maxSpeed: 0.12
        };
        const wallAvoidanceRadius = 50; // Distance to start avoiding walls
        const wallAvoidanceWeight = 2;  // Strength of wall avoidance

        const mouseAvoidanceRadius = 100; // Distance to start avoiding the mouse
        const mouseAvoidanceWeight = 5;   // Strength of mouse avoidance
        let mousePos: Point | null = null;

        const wanderingAngles = Array.from({ length: boids.length }, () => Math.random() * Math.PI * 2);

        function draw() {
            clearCanvas(ctx);
            boids.forEach(b => {
                const angle = Math.atan2(b.velocity.y, b.velocity.x);
                const bodyLength = 20;
                const bodyWidth = 10;

                // Draw boid as a longer arrow
                ctx.save();
                ctx.translate(b.position.x, b.position.y);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(bodyLength / 2, 0); // Arrow tip
                ctx.lineTo(-bodyLength / 2, -bodyWidth / 2); // Left wing
                ctx.lineTo(-bodyLength / 2, bodyWidth / 2); // Right wing
                ctx.closePath();
                ctx.fillStyle = 'blue';
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.stroke();
                ctx.restore();
            });
            drawResults(ctx, [
                'Flocking simulation',
                ...Object.entries(settings).map<ResultEntry>(([key, value]) => [key, value]),
            ]);
        }

        move({ canvas, draw }, (pos) => {
            mousePos = pos;
        });

        animate(() => {
            const forces = physics.boids(boids, settings);

            boids.forEach((b, i) => {
                // Apply forces to velocity
                b.velocity.x += forces[i].x;
                b.velocity.y += forces[i].y;

                // Gradual wandering behavior for isolated boids
                if (forces[i].x === 0 && forces[i].y === 0) {
                    wanderingAngles[i] += (Math.random() - 0.5) * 0.1; // Gradually change angle
                    const wanderForce = fromAngleRadians(wanderingAngles[i], settings.maxSpeed);
                    b.velocity = add(b.velocity, wanderForce);
                }

                // Wall avoidance
                const wallForces = { x: 0, y: 0 };
                if (b.position.x < wallAvoidanceRadius) {
                    wallForces.x += wallAvoidanceWeight / Math.max(b.position.x, 1);
                }
                if (b.position.x > canvas.width - wallAvoidanceRadius) {
                    wallForces.x -= wallAvoidanceWeight / Math.max(canvas.width - b.position.x, 1);
                }
                if (b.position.y < wallAvoidanceRadius) {
                    wallForces.y += wallAvoidanceWeight / Math.max(b.position.y, 1);
                }
                if (b.position.y > canvas.height - wallAvoidanceRadius) {
                    wallForces.y -= wallAvoidanceWeight / Math.max(canvas.height - b.position.y, 1);
                }
                b.velocity = add(b.velocity, wallForces);

                // Mouse avoidance
                if (mousePos) {
                    const mouseDist = distance(b.position, mousePos);
                    if (mouseDist < mouseAvoidanceRadius) {
                        const awayFromMouse = normalize(subtract(b.position, mousePos));
                        const mouseForce = scale(awayFromMouse, mouseAvoidanceWeight / Math.max(mouseDist, 1));
                        b.velocity = add(b.velocity, mouseForce);
                    }
                }

                // Apply damping
                b.velocity = scale(b.velocity, 0.95);

                // Update position
                b.position = add(b.position, b.velocity);

                // Prevent boids from leaving the canvas
                b.position.x = Math.max(0, Math.min(canvas.width, b.position.x));
                b.position.y = Math.max(0, Math.min(canvas.height, b.position.y));
            });
        }, draw);
    },
};
