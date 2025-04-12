import { scale } from "./../../src/vector";
import * as physics from '../../src/physics';
import { DemoFunction } from './index';
import { clearCanvas, drawCircle, drawLine, drawResults, drag, animate, click, key, drawWithOffset, drawArrow } from '../utils';
import { Line, Point } from '../../src';
import { fromAngleRadians, subtract } from '../../src/vector';
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
        let obj1 = { position: { x: 200, y: 200 }, velocity: { x: 0, y: 0 }, mass: 1, radius: 30 };
        let obj2 = { position: { x: 220, y: 200 }, velocity: { x: 0, y: 0 }, mass: 1, radius: 30 };

        function draw() {
            clearCanvas(ctx);
            drawCircle(ctx, { ...obj1.position, radius: obj1.radius }, 'blue');
            drawCircle(ctx, { ...obj2.position, radius: obj2.radius }, 'red');
            drawResults(ctx, [
                ['Object 1 Position', obj1.position],
                ['Object 2 Position', obj2.position],
                'Objects separate if overlapping'
            ]);
        }

        animate(() => {
            physics.separate(obj1, obj2);
        }, draw);
    },

    repel: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        let obj1 = { position: { x: 200, y: 200 }, velocity: { x: 0, y: 0 }, mass: 1, radius: 30 };
        let obj2 = { position: { x: 220, y: 200 }, velocity: { x: 0, y: 0 }, mass: 1, radius: 30 };

        function draw() {
            clearCanvas(ctx);
            drawCircle(ctx, { ...obj1.position, radius: obj1.radius }, 'blue');
            drawCircle(ctx, { ...obj2.position, radius: obj2.radius }, 'red');
            drawResults(ctx, [
                ['Object 1 Position', obj1.position],
                ['Object 1 Velocity', obj1.velocity],
                ['Object 2 Position', obj2.position],
                ['Object 2 Velocity', obj2.velocity],
                'Objects repel if overlapping'
            ]);
        }

        animate(() => {
            physics.repel(obj1, obj2, 0.5);
            obj1.position.x += obj1.velocity.x;
            obj1.position.y += obj1.velocity.y;
            obj2.position.x += obj2.velocity.x;
            obj2.position.y += obj2.velocity.y;
        }, draw);
    },

    fluid: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const particles = Array.from({ length: 50 }, () => ({
            position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
            velocity: { x: 0, y: 0 },
            density: 0,
            pressure: 0,
            mass: 1
        }));

        function draw() {
            clearCanvas(ctx);
            particles.forEach(p => drawCircle(ctx, { ...p.position, radius: 5 }, 'blue'));
            drawResults(ctx, ['Fluid simulation']);
        }

        animate(() => {
            const forces = physics.fluid(particles, 30, 50, 1, 0.1);
            particles.forEach((p, i) => {
                p.velocity.x += forces[i].x;
                p.velocity.y += forces[i].y;
                p.position.x += p.velocity.x;
                p.position.y += p.velocity.y;
            });
        }, draw);
    },

    boids: (canvas) => {
        const ctx = canvas.getContext('2d')!;
        const boids = Array.from({ length: 30 }, () => ({
            position: { x: Math.random() * canvas.width, y: Math.random() * canvas.height },
            velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
        }));

        function draw() {
            clearCanvas(ctx);
            boids.forEach(b => drawCircle(ctx, { ...b.position, radius: 5 }, 'blue'));
            drawResults(ctx, ['Flocking simulation']);
        }

        animate(() => {
            const forces = physics.boids(boids, {
                separationRadius: 25,
                alignmentRadius: 50,
                cohesionRadius: 50,
                separationWeight: 1.5,
                alignmentWeight: 1,
                cohesionWeight: 1,
                maxSpeed: 2
            });
            boids.forEach((b, i) => {
                b.velocity.x += forces[i].x;
                b.velocity.y += forces[i].y;
                b.position.x += b.velocity.x;
                b.position.y += b.velocity.y;
            });
        }, draw);
    },
};
