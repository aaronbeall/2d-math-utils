import * as physics from '../../src/physics';
import { DemoFunction } from './index';

export const physicsDemos: Record<keyof typeof physics, DemoFunction> = {
    applyForce: (canvas) => {
        // Demo of applying a force to an object
    },

    applyDamping: (canvas) => {
        // Demo of applying friction to slow down an object
    },

    applyTorque: (canvas) => {
        // Demo of applying rotational force to an object
    },

    applyAngleForce: (canvas) => {
        // Demo of applying force in a specific direction
    },

    collide: (canvas) => {
        // Interactive demo of collision between two objects
    },

    separate: (canvas) => {
        // Demo of resolving overlap between two objects
    },

    repel: (canvas) => {
        // Interactive demo of repulsion between two objects
    },

    fluid: (canvas) => {
        // Interactive demo of fluid simulation using SPH
    },

    boids: (canvas) => {
        // Interactive demo of flocking behavior for boids
    },
};
