import { distance, distanceSquared } from "./point";
import { Point, Vector2d } from "./types";
import { add, dot, fromAngleRadians, normalize, scale, subtract } from "./vector";

/**
 * Modifies velocity/acceleration/position vector by applying a force
 * @param vector Vector to modify
 * @param force Force to apply
 * @param scaler Object mass (affects force impact) or time scale
 */
export const applyForce = (vector: Vector2d, force: Vector2d, scaler: number = 1): void => {
    vector.x += force.x * scaler;
    vector.y += force.y * scaler;
};

/**
 * Modifies velocity/acceleration vector by applying friction (direct velocity reduction)
 * @param vector Vector to modify (like velocity)
 * @param damping Amount of friction (0 = no friction, 1 = full stop)
 */
export const applyDamping = (vector: Vector2d, damping: number): void => {
    vector.x *= (1 - damping);
    vector.y *= (1 - damping);
};

/**
 * Modifies angular velocity by applying torque
 */
export const applyTorque = (angularVelocity: number, torque: number, scaler: number = 1): number => {
    return angularVelocity + torque * scaler;
};

/**
 * Modifies velocity vector by applying force in direction of angle
 */
export const applyAngleForce = (vector: Vector2d, angle: number, force: number, scaler: number = 1): void => {
    applyForce(
      vector, 
      fromAngleRadians(angle, force), 
      scaler
    );
};

interface CollisionObject {
  position: Vector2d;
  velocity: Vector2d;
  mass: number;
  radius: number;
}

/**
 * Calculates collision response between two objects using impulse-based collision.
 * @param obj1 First object
 * @param obj2 Second object
 * @param restitution Bounciness factor (1 = perfect elastic, 0 = no bounce)
 * @param resolveOverlapMode Mode to resolve overlap ('separate', 'repel', 'none')
 */
export const collide = (
  obj1: CollisionObject,
  obj2: CollisionObject,
  restitution = 0.9,
  resolveOverlapMode: 'separate' | 'repel' | 'none' = 'separate'
): void => {
  const normal = normalize(subtract(obj2.position, obj1.position));
  const relativeVelocity = subtract(obj2.velocity, obj1.velocity);

  // Check if objects are moving toward each other
  const velocityAlongNormal = dot(relativeVelocity, normal);
  if (velocityAlongNormal <= 0) {

    // Calculate impulse
    const impulseMagnitude = -(1 + restitution) * velocityAlongNormal;
    const impulse = impulseMagnitude / (1 / obj1.mass + 1 / obj2.mass);

    // Apply impulse
    const impulseVector = scale(normal, impulse);
    obj1.velocity = subtract(obj1.velocity, scale(impulseVector, 1 / obj1.mass));
    obj2.velocity = add(obj2.velocity, scale(impulseVector, 1 / obj2.mass));
  }

  // Handle overlap resolution based on mode
  if (resolveOverlapMode === 'separate') {
    separate(obj1, obj2);
  } else if (resolveOverlapMode === 'repel') {
    repel(obj1, obj2);
  }
};

/**
 * Resolves overlap between two objects by adjusting their positions.
 * @param obj1 First object
 * @param obj2 Second object
 */
export const separate = (
  obj1: CollisionObject,
  obj2: CollisionObject
): void => {
  const normal = subtract(obj2.position, obj1.position);
  const dist = distance(obj1.position, obj2.position);

  // Check if there is overlap
  const overlap = obj1.radius + obj2.radius - dist;
  if (overlap <= 0) {
    return; // No overlap
  }

  // Handle case where positions are identical
  const direction = dist === 0 ? { x: 1, y: 0 } : scale(normal, 1 / dist);

  // Calculate the correction vector
  const totalMass = obj1.mass + obj2.mass;
  const correction = scale(direction, overlap);

  // Distribute the correction based on the masses
  const obj1Correction = scale(correction, obj2.mass / totalMass);
  const obj2Correction = scale(correction, obj1.mass / totalMass);

  // Adjust the positions of the objects
  obj1.position = subtract(obj1.position, obj1Correction);
  obj2.position = add(obj2.position, obj2Correction);
};

/**
 * Calculates repulsion force between two objects based on their overlap
 * @param obj1 First object
 * @param obj2 Second object
 * @param strength Repulsion strength multiplier (default: 1)
 * 
 * @example
 * // Soft body collision
 * repel(
 *   ball1,
 *   ball2,
 *   1000 // strong repulsion
 * );
 */
export const repel = (
  obj1: CollisionObject,
  obj2: CollisionObject,
  strength: number = 1
): void => {
  const normal = subtract(obj2.position, obj1.position);
  const dist = distance(obj1.position, obj2.position);
  const overlap = obj1.radius + obj2.radius - dist;

  // Only apply repulsion if overlapping
  if (overlap <= 0 || dist === 0) {
    return;
  }

  // Normalize the direction vector
  const direction = scale(normal, 1 / dist);

  // Calculate repulsion force based on overlap and scale by strength
  const repulsionForce = overlap * strength;

  // Calculate repulsion force proportional to mass difference
  const totalMass = obj1.mass + obj2.mass;
  const obj1Strength = (obj2.mass / totalMass) * repulsionForce;
  const obj2Strength = (obj1.mass / totalMass) * repulsionForce;

  // Apply repulsion forces to velocities
  obj1.velocity = subtract(obj1.velocity, scale(direction, obj1Strength));
  obj2.velocity = add(obj2.velocity, scale(direction, obj2Strength));
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
export const fluid = (
  particles: FluidParticle[],
  {
    smoothingRadius = 30,
    stiffness = 50,
    restDensity = 1,
    viscosity = 0.1
  }: {
    smoothingRadius?: number;
    stiffness?: number;
    restDensity?: number;
    viscosity?: number;
  } = {}
): Vector2d[] => {
  const forces = particles.map(() => ({ x: 0, y: 0 }));
  const gridSize = smoothingRadius; // Size of each grid cell
  const grid: Record<string, FluidParticle[]> = {};

  // Helper to compute grid key
  const getGridKey = (x: number, y: number) => `${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`;

  // Populate the grid
  particles.forEach(p => {
    const key = getGridKey(p.position.x, p.position.y);
    if (!grid[key]) grid[key] = [];
    grid[key].push(p);
  });

  // Calculate densities
  particles.forEach(p => {
    p.density = 0;
    const key = getGridKey(p.position.x, p.position.y);

    // Check neighboring cells
    const [gx, gy] = key.split(',').map(Number);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighborKey = `${gx + dx},${gy + dy}`;
        const neighbors = grid[neighborKey] || [];
        neighbors.forEach(neighbor => {
          const dist = Math.sqrt(distanceSquared(p.position, neighbor.position));
          if (dist < smoothingRadius) {
            p.density += neighbor.mass * (1 - dist / smoothingRadius);
          }
        });
      }
    }

    // Calculate pressure from density
    p.pressure = stiffness * (p.density - restDensity);
  });

  // Calculate forces
  particles.forEach((p, i) => {
    const key = getGridKey(p.position.x, p.position.y);

    // Check neighboring cells
    const [gx, gy] = key.split(',').map(Number);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighborKey = `${gx + dx},${gy + dy}`;
        const neighbors = grid[neighborKey] || [];
        neighbors.forEach(neighbor => {
          if (p === neighbor) return;

          const dist = distance(p.position, neighbor.position);
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
      }
    }
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
export const boids = (boids: Boid[], rules: BoidRules = {}): Vector2d[] => {
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


