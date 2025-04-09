import * as physics from '../../src/physics';
import { DemoFunction } from './index';

export const physicsDemos: Record<keyof typeof physics, DemoFunction> = {
    collide: (canvas) => {
        // Interactive demo of collision between two balls
    },

    applyForce: (canvas) => {
        // Demo of continuous force application
    },

    applyTorque: (canvas) => {
        // Demo of rotational force
    },

    applyThrust: (canvas) => {
        // Demo of directional thrust
    },

    repel: (canvas) => {
        // Interactive demo of repulsion between two objects
    },

    repelMany: (canvas) => {
        // Demo of multiple objects repelling each other
    },

    collideMany: (canvas) => {
        // Interactive demo of multiple object collisions
    },

    resolveFluid: (canvas) => {
        // Interactive fluid simulation demo
    },

    resolveBoids: (canvas) => {
        // Interactive flocking behavior demo
    }
};
