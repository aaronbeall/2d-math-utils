import { Point, Vector2d } from './types';
import * as vector from './vector';
import * as physics from './physics';

export interface PhysicalProperties {
  mass?: number;
  drag?: number;
  angularDrag?: number;
  bounceRestitution?: number;
  radius?: number;
}

export class PhysicalBody {
  position: Point;
  velocity: Vector2d;
  acceleration: Vector2d;
  angle: number;
  angularVelocity: number;
  mass: number;
  drag: number;
  angularDrag: number;
  bounceRestitution: number;
  radius: number;

  constructor(position: Vector2d, props: PhysicalProperties = {}) {
    this.position = position;
    this.velocity = vector.zero();
    this.acceleration = vector.zero();
    this.angle = 0;
    this.angularVelocity = 0;
    this.mass = props.mass ?? 1;
    this.drag = props.drag ?? 0;
    this.angularDrag = props.angularDrag ?? 0;
    this.bounceRestitution = props.bounceRestitution ?? 0.8;
    this.radius = props.radius ?? 0;
  }

  /**
   * position: Current location (changes by velocity)
   * velocity: Rate of position change (changes by acceleration)
   * acceleration: Rate of velocity change (from forces)
   * Example: 
   * - position: x=10 means "10 units from origin"
   * - velocity: x=5 means "moving 5 units per second"
   * - acceleration: x=2 means "velocity increases by 2 per second"
   */
  update(deltaTime: number) {
    // Acceleration changes velocity
    this.velocity = vector.add(this.velocity, vector.scale(this.acceleration, deltaTime));
    
    // Drag reduces velocity
    if (this.drag > 0) {
      this.velocity = vector.scale(this.velocity, 1 - this.drag * deltaTime);
    }

    // Velocity changes position
    this.position = vector.add(this.position, vector.scale(this.velocity, deltaTime));
    
    // Update angle with angular velocity
    this.angle += this.angularVelocity * deltaTime;
    
    // Apply angular drag
    if (this.angularDrag > 0) {
      this.angularVelocity *= (1 - this.angularDrag * deltaTime);
    }

    // Reset acceleration - forces must be continuously applied or they stop affecting velocity
    this.acceleration = vector.zero();
  }

  /**
   * Applies a continuous force that affects acceleration over time
   * Example: Gravity, engine thrust, wind
   * @param force The force vector to apply
   */
  applyForce(force: Vector2d) {
    this.acceleration = physics.applyForce(this.acceleration, force, this.mass);
  }

  /**
   * Applies an instant change in velocity
   * Example: Collision impact, jump, explosion knockback
   * @param impulse The impulse vector (mass * velocity change)
   */
  applyImpulse(impulse: Vector2d) {
    this.velocity = physics.applyForce(this.velocity, impulse, this.mass);
  }

  /**
   * Applies a continuous rotational force
   * Example: Steering torque, wind rotation
   */
  applyTorque(torque: number) {
    this.angularVelocity = physics.applyTorque(this.angularVelocity, torque, this.mass);
  }

  /**
   * Applies a continuous forward force in the direction of angle
   * Example: Rocket engine, car acceleration
   */
  thrust(force: number, angle: number = this.angle) {
    this.acceleration = physics.applyThrust(this.acceleration, force, angle, this.mass);
  }

  collideWithBody(other: PhysicalBody): boolean {
    const distance = vector.length(vector.subtract(other.position, this.position));
    if (distance > this.radius + other.radius) return false;

    // Calculate collision response
    const [v1, v2] = physics.collide(
      this.velocity,
      other.velocity,
      this.position,
      other.position,
      this.mass,
      other.mass
    );

    // Apply new velocities with restitution
    this.velocity = vector.scale(v1, this.bounceRestitution);
    other.velocity = vector.scale(v2, other.bounceRestitution);

    return true;
  }

  collideWithSurface(normal: Vector2d) {
    this.velocity = vector.scale(
      vector.reflect(this.velocity, normal),
      this.bounceRestitution
    );
  }

  get forward(): Vector2d {
    return {
      x: Math.cos(this.angle),
      y: Math.sin(this.angle)
    };
  }

  get right(): Vector2d {
    return {
      x: Math.cos(this.angle + Math.PI / 2),
      y: Math.sin(this.angle + Math.PI / 2)
    };
  }
}
