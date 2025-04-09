import * as angle from '../../src/angle';
import { DemoFunction } from './index';

export const angleDemos: Record<keyof typeof angle, DemoFunction> = {
    degreesToRadians: (canvas) => {
        // Visualization of angle conversion
    },
    radiansToDegrees: (canvas) => {
        // Visualization of angle conversion
    },
    radiansBetweenLines: (canvas) => {
        // Interactive demo with draggable line endpoints
    },
    degreesBetweenLines: (canvas) => {
        // Interactive demo with draggable line endpoints
    },
    radiansBetweenPoints: (canvas) => {
        // Interactive demo with point and angle visualization
    },
    degreesBetweenPoints: (canvas) => {
        // Interactive demo with point and angle visualization
    },
    degreesBetween: (canvas) => {
        // Interactive demo showing shortest angle between two angles
    },
    radiansBetween: (canvas) => {
        // Interactive demo showing shortest angle between two angles
    },
    rotateAroundByRadians: (canvas) => {
        // Interactive demo with point rotating around center
    },
    rotateAroundByDegrees: (canvas) => {
        // Interactive demo with point rotating around center
    },
    rotateAngleTowardsRadians: (canvas) => {
        // Interactive demo showing smooth rotation
    },
    rotateAngleTowardsDegrees: (canvas) => {
        // Interactive demo showing smooth rotation
    }
};
