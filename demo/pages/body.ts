import { PhysicalBody } from '../../src';
import * as vector from '../../src/vector';
import { DemoFunction } from './index';

export const bodyDemos: Record<string, DemoFunction> = {

    "Balls": (canvas) => {
      // Demo showing bouncing balls with gravity that bounce off the walls, floor, and each other. 
      // Click and drag the balls to throw them.
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
