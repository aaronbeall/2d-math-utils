# 2D Math Utils

Common math utilities meant for working with 2D games and simulations. This library provides a collection of functions and classes to simplify working with 2D geometry, physics, and vector math.

[Live Demo](https://aaronbeall.github.io/2d-math-utils/)

## Installation

Install the library using npm:

```bash
npm install 2d-math-utils
```

## Example Usage

Here's an example of how to use the library to calculate the angle between two points and create a vector:

```typescript
import { angle, vector, point } from '2d-math-utils';

const pointA = { x: 0, y: 0 };
const pointB = { x: 3, y: 4 };

// Calculate the angle between two points
const angleBetween = angle.radiansBetweenPoints(pointA, pointB);
console.log(`Angle between points: ${angleBetween} radians`);

// Create a vector from the angle
const directionVector = vector.fromAngleRadians(angleBetween, 5);
console.log('Direction vector:', directionVector);

// Add the vector to pointA to get a new point
const newPoint = point.add(pointA, directionVector);
console.log('New point:', newPoint);
```

### TypeScript

This library is written in TypeScript, providing type definitions out of the box. 

```typescript
import { Point, Vector2d, Line, Circle, Rect } from '2d-math-utils';

const pointA: Point = { x: 0, y: 0 };
const pointB: Point = { x: 3, y: 4 };
```

### Alternative Import

You can also import specific modules directly if you prefer:

```typescript
import * as vector from "math-utils-2d/vector";
```

## Package Overview

### `angle`
Utilities for working with angles, including conversions between degrees and radians, and calculating angles between points.

### `vector`
Functions for creating and manipulating 2D vectors, such as addition, scaling, and rotation.

### `point`
Utilities for working with 2D points, including distance calculations and point transformations.

### `physics` 🧪
**_Experimental_**: Higher level physics-related utilities, including collision detection and basic physics simulations.

### `PhysicalBody`
A class representing a physical body with properties like position, velocity, and mass, useful for simulations. 

### `intersection`
Functions for calculating intersections between geometric shapes, such as lines and circles.