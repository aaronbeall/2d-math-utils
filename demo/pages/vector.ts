import * as vector from '../../src/vector';
import { DemoFunction } from './index';

export const vectorDemos: Record<keyof typeof vector, DemoFunction> = {
    zero: (canvas) => {
        // Demo showing zero vector
    },
    add: (canvas) => {
        // Interactive vector addition visualization
    },
    subtract: (canvas) => {
        // Interactive vector subtraction visualization
    },
    scale: (canvas) => {
        // Interactive vector scaling visualization
    },
    length: (canvas) => {
        // Interactive vector length visualization
    },
    normalize: (canvas) => {
        // Interactive vector normalization demo
    },
    clampLength: (canvas) => {
        // Interactive vector clamping visualization
    },
    interpolate: (canvas) => {
        // Interactive lerp visualization
    },
    inverseInterpolation: (canvas) => {
        // Interactive inverse lerp visualization
    },
    moveTowards: (canvas) => {
        // Interactive movement demo
    },
    reflect: (canvas) => {
        // Interactive reflection visualization
    },
    fromAngleRadians: (canvas) => {
        // Interactive angle to vector (radians) visualization
    },
    fromAngleDegrees: (canvas) => {
        // Interactive angle to vector (degrees) visualization
    }
};
