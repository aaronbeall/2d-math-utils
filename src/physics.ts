import { distanceSquared } from "./point";
import { Vector2d } from "./types";
import { add, normalize, scale, subtract } from "./vector";

/**
 * Applies a force to an object's acceleration or velocity vector
 * @param vector Current acceleration vector
 * @param force Force vector to apply
 * @param mass Object's mass (affects force impact)
 * @returns New acceleration vector
 * 
 * @example
 * // Apply gravity
 * obj.acceleration = applyForce(
 *   obj.acceleration,
 *   { x: 0, y: 9.81 },
 *   obj.mass
 * );
 */
export const applyForce = (vector: Vector2d, force: Vector2d, mass: number): Vector2d => {
  return add(vector, scale(force, 1 / mass));
};

/**
 * Applies rotational force to change angular velocity
 * @param angularVelocity Current angular velocity
 * @param torque Amount of rotational force
 * @param mass Object's mass (affects rotation)
 * @returns New angular velocity
 * 
 * @example
 * // Rotate clockwise
 * obj.angularVelocity = applyTorque(
 *   obj.angularVelocity,
 *   -5, // negative = clockwise
 *   obj.mass
 * );
 */
export const applyTorque = (angularVelocity: number, torque: number, mass: number): number => {
  return angularVelocity + (torque / mass);
};

/**
 * Applies force in direction of angle
 * @param vector Current acceleration vector
 * @param force Magnitude of thrust
 * @param angle Direction of thrust in radians
 * @param mass Object's mass
 * @returns New acceleration vector
 * 
 * @example
 * // Rocket thrust
 * obj.acceleration = applyThrust(
 *   obj.acceleration,
 *   100,         // thrust power
 *   obj.angle,   // rocket's angle
 *   obj.mass
 * );
 */
export const applyThrust = (vector: Vector2d, force: number, angle: number, mass: number): Vector2d => {
  const thrustVector = { 
    x: Math.cos(angle) * force,
    y: Math.sin(angle) * force
  };
  return applyForce(vector, thrustVector, mass);
};

/**
 * Calculates collision response between two objects using impulse-based collision
 * @param v1 Velocity of first object
 * @param v2 Velocity of second object
 * @param p1 Position of first object
 * @param p2 Position of second object
 * @param mass1 Mass of first object (default: 1)
 * @param mass2 Mass of second object (default: 1)
 * @param restitution Bounciness factor (1 = perfect elastic, 0 = no bounce)
 * @returns [newV1, newV2] New velocities after collision
 * 
 * @example
 * // Head-on collision between two balls
 * const [v1, v2] = collide(
 *   { x: 5, y: 0 },  // ball1 moving right
 *   { x: -5, y: 0 }, // ball2 moving left
 *   { x: 0, y: 0 },  // ball1 position
 *   { x: 10, y: 0 }, // ball2 position
 *   1, 1, 0.9        // equal mass, high bounce
 * );
 */
export const collide = (
  v1: Vector2d, 
  v2: Vector2d, 
  p1: Vector2d, 
  p2: Vector2d, 
  mass1: number = 1, 
  mass2: number = 1,
  restitution = 0.9 // Bouncy factor (1 = perfect elastic)
): [Vector2d, Vector2d] => {
  // Get collision normal
  const normal = normalize(subtract(p2, p1));
  
  // Get relative velocity
  const relativeVelocity = subtract(v2, v1);
  
  // Calculate impulse
  const velocityAlongNormal = (relativeVelocity.x * normal.x + relativeVelocity.y * normal.y);
  const j = -(1 + restitution) * velocityAlongNormal;
  const impulse = j / (1/mass1 + 1/mass2);
  
  // Apply impulse
  const impulseVector = scale(normal, impulse);
  return [
    subtract(v1, scale(impulseVector, 1/mass1)),
    add(v2, scale(impulseVector, 1/mass2))
  ];
};

/**
 * Calculates repulsion force between two objects based on their overlap
 * @param p1 Position of first object
 * @param p2 Position of second object
 * @param radius1 Radius of first object
 * @param radius2 Radius of second object
 * @param mass1 Mass of first object (affects force)
 * @param mass2 Mass of second object (affects force)
 * @param strength Repulsion strength multiplier (default: 1)
 * @returns [force1, force2] Forces to apply to each object
 * 
 * @example
 * // Soft body collision
 * const [f1, f2] = repel(
 *   ball1.position,
 *   ball2.position,
 *   ball1.radius,
 *   ball2.radius,
 *   ball1.mass,
 *   ball2.mass,
 *   1000 // strong repulsion
 * );
 */
export const repel = (
  p1: Vector2d,
  p2: Vector2d,
  radius1: number,
  radius2: number,
  mass1: number = 1,
  mass2: number = 1,
  strength: number = 1
): [Vector2d, Vector2d] => {
  const normal = normalize(subtract(p2, p1));
  const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  const overlap = (radius1 + radius2) - distance;
  
  // Only repel if overlapping
  if (overlap <= 0) return [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  
  // Force increases as objects get closer (inverse square)
  const forceMagnitude = (strength * mass1 * mass2 * overlap) / (distance * distance);
  const force = scale(normal, forceMagnitude);
  
  return [
    scale(force, -1), // Force on object 1 (away from object 2)
    force             // Force on object 2 (away from object 1)
  ];
};

/**
 * Resolves collisions between multiple objects
 * @param objects Array of objects with position, velocity, radius, and mass
 * @param restitution Bounciness factor (1 = perfect elastic, 0 = no bounce)
 * @returns Array of new velocities after all collisions
 * 
 * @example
 * // Resolve pool ball collisions
 * const newVelocities = collideMany(balls, 0.9);
 * balls.forEach((ball, i) => {
 *   ball.velocity = newVelocities[i];
 * });
 */
export const collideMany = (
  objects: { 
    position: Vector2d; 
    velocity: Vector2d;
    radius: number;
    mass: number;
  }[], 
  restitution: number = 0.9
): Vector2d[] => {
  // Create copy of velocities to accumulate changes
  const newVelocities = objects.map(obj => ({ ...obj.velocity }));
  
  // Check each pair of objects
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const obj1 = objects[i];
      const obj2 = objects[j];
      
      // Check if objects are overlapping
      const distance = Math.sqrt(distanceSquared(obj1.position, obj2.position));
      if (distance <= obj1.radius + obj2.radius) {
        // Calculate collision response
        const [v1, v2] = collide(
          newVelocities[i],
          newVelocities[j],
          obj1.position,
          obj2.position,
          obj1.mass,
          obj2.mass,
          restitution
        );
        
        newVelocities[i] = v1;
        newVelocities[j] = v2;
      }
    }
  }
  
  return newVelocities;
};

/**
 * Calculates repulsion forces between multiple objects
 * @param objects Array of objects with position, radius, and mass
 * @param strength Repulsion strength multiplier
 * @returns Array of force vectors to apply to each object
 * 
 * @example
 * // Crowd simulation
 * const forces = repelMany(
 *   people,    // array of people
 *   50         // personal space force
 * );
 * people.forEach((person, i) => 
 *   person.applyForce(forces[i])
 * );
 */
export const repelMany = (objects: { position: Vector2d; radius: number; mass: number }[], strength: number = 1): Vector2d[] => {
  const forces = objects.map(() => ({ x: 0, y: 0 }));
  
  // Calculate forces between each pair
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const [f1, f2] = repel(
        objects[i].position,
        objects[j].position,
        objects[i].radius,
        objects[j].radius,
        objects[i].mass,
        objects[j].mass,
        strength
      );
      
      // Accumulate forces for both objects
      forces[i] = add(forces[i], f1);
      forces[j] = add(forces[j], f2);
    }
  }
  
  return forces;
};

interface FluidParticle {
  position: Vector2d;
  velocity: Vector2d;
  density: number;
  pressure: number;
  mass: number;
}

/**
 * Simple fluid simulation using Smooth Particle Hydrodynamics (SPH)
 * @param particles Array of fluid particles
 * @param smoothingRadius Radius of influence for each particle
 * @param stiffness Pressure constant (k)
 * @param restDensity Target density of fluid
 * @param viscosity Viscosity coefficient
 * @returns Array of forces to apply to each particle
 * 
 * @example
 * // Water simulation
 * const forces = resolveFluid(
 *   particles,
 *   30,    // interaction radius
 *   50,    // pressure stiffness
 *   1,     // rest density
 *   0.1    // viscosity
 * );
 * particles.forEach((p, i) => 
 *   p.applyForce(forces[i])
 * );
 */
export const resolveFluid = (
  particles: FluidParticle[],
  smoothingRadius: number = 30,
  stiffness: number = 50,
  restDensity: number = 1,
  viscosity: number = 0.1
): Vector2d[] => {
  const forces = particles.map(() => ({ x: 0, y: 0 }));
  
  // Calculate densities
  particles.forEach(p => {
    p.density = 0;
    particles.forEach(neighbor => {
      const dist = Math.sqrt(distanceSquared(p.position, neighbor.position));
      if (dist < smoothingRadius) {
        // Simple density kernel
        p.density += neighbor.mass * (1 - dist / smoothingRadius);
      }
    });
    // Calculate pressure from density
    p.pressure = stiffness * (p.density - restDensity);
  });

  // Calculate forces
  particles.forEach((p, i) => {
    particles.forEach(neighbor => {
      if (p === neighbor) return;
      
      const dist = Math.sqrt(distanceSquared(p.position, neighbor.position));
      if (dist < smoothingRadius) {
        // Direction from p to neighbor
        const dir = normalize(subtract(neighbor.position, p.position));
        
        // Pressure force (repels particles in compressed regions)
        const pressureForce = scale(dir, 
          -(p.pressure + neighbor.pressure) * 
          (1 - dist / smoothingRadius) / 
          (2 * p.density * neighbor.density)
        );
        
        // Viscosity force (averages out velocities)
        const relativeVel = subtract(neighbor.velocity, p.velocity);
        const viscosityForce = scale(relativeVel, 
          viscosity * (1 - dist / smoothingRadius) / 
          (p.density * neighbor.density)
        );
        
        forces[i] = add(forces[i], scale(add(pressureForce, viscosityForce), p.mass * neighbor.mass));
      }
    });
  });
  
  return forces;
};

interface Boid {
  position: Vector2d;
  velocity: Vector2d;
  mass?: number;
}

interface BoidRules {
  separationRadius?: number;   // Radius to avoid other boids
  alignmentRadius?: number;    // Radius to match velocity
  cohesionRadius?: number;     // Radius to move toward center
  separationWeight?: number;   // How strongly to avoid others
  alignmentWeight?: number;    // How strongly to match velocity
  cohesionWeight?: number;     // How strongly to move to center
  maxSpeed?: number;           // Maximum velocity magnitude
}

/**
 * Calculates flocking behavior forces for a group of boids
 * @param boids Array of boids with position and velocity
 * @param rules Configuration for flocking behavior
 * @returns Array of forces to apply to each boid
 * 
 * @example
 * // Bird flock simulation
 * const forces = resolveBoids(birds, {
 *   separationRadius: 25,  // personal space
 *   alignmentRadius: 50,   // match velocity range
 *   cohesionRadius: 50,    // group radius
 *   separationWeight: 2,   // strong avoidance
 *   alignmentWeight: 1.2,  // medium matching
 *   cohesionWeight: 1,     // normal grouping
 *   maxSpeed: 10           // speed limit
 * });
 * birds.forEach((bird, i) => 
 *   bird.applyForce(forces[i])
 * );
 */
export const resolveBoids = (boids: Boid[], rules: BoidRules = {}): Vector2d[] => {
  const {
    separationRadius = 25,
    alignmentRadius = 50,
    cohesionRadius = 50,
    separationWeight = 1,
    alignmentWeight = 1,
    cohesionWeight = 1,
    maxSpeed = 10
  } = rules;

  return boids.map((boid, i) => {
    let separation = { x: 0, y: 0 };
    let alignment = { x: 0, y: 0 };
    let cohesion = { x: 0, y: 0 };
    let neighborCount = 0;

    // Calculate forces from all neighbors
    boids.forEach((other, j) => {
      if (i === j) return;
      
      const dist = Math.sqrt(distanceSquared(boid.position, other.position));
      
      // Separation - avoid crowding
      if (dist < separationRadius) {
        const away = normalize(subtract(boid.position, other.position));
        separation = add(separation, scale(away, 1 / Math.max(dist, 0.1)));
      }
      
      // Alignment and Cohesion
      if (dist < alignmentRadius) {
        alignment = add(alignment, other.velocity);
        cohesion = add(cohesion, other.position);
        neighborCount++;
      }
    });

    // Average and scale forces
    let force = { x: 0, y: 0 };
    
    if (neighborCount > 0) {
      // Normalize separation
      if (separation.x !== 0 || separation.y !== 0) {
        separation = normalize(separation);
      }
      
      // Average alignment and cohesion
      alignment = scale(alignment, 1 / neighborCount);
      cohesion = scale(cohesion, 1 / neighborCount);
      
      // Move toward center of neighbors
      cohesion = subtract(cohesion, boid.position);
      
      // Normalize forces
      if (alignment.x !== 0 || alignment.y !== 0) alignment = normalize(alignment);
      if (cohesion.x !== 0 || cohesion.y !== 0) cohesion = normalize(cohesion);
      
      // Combine forces with weights
      force = add(
        add(
          scale(separation, separationWeight),
          scale(alignment, alignmentWeight)
        ),
        scale(cohesion, cohesionWeight)
      );
    }

    // Clamp to max speed
    if (maxSpeed > 0) {
      const speed = Math.sqrt(force.x * force.x + force.y * force.y);
      if (speed > maxSpeed) {
        force = scale(force, maxSpeed / speed);
      }
    }

    return force;
  });
};


