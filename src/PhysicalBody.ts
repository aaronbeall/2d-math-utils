import { Circle, Point, Vector2d } from './types';
import * as vector from './vector';
import * as physics from './physics';
import { distance } from './point';
import { radiansBetweenPoints, rotateAngleTowardsRadians } from './angle';

/**
 * PhysicalBody class for simulating physical objects in 2D space.
 * 
 * It can be used for both top-down and side-view games.
 * 
 * This class is a referance implementation for a 2D physics simulation.
 */
export class PhysicalBody {
  /** Default downward gravity for 2D side-view games */
  static DOWNWARD_GRAVITY: Vector2d = { x: 0, y: 980 };

  /** General Properties (useful in all scenarios) */
  position: Point = { x: 0, y: 0 }; // Current position in world space
  velocity: Vector2d = vector.zero();      // Current movement speed & direction
  acceleration: Vector2d = vector.zero();  // Current change in velocity
  mass: number = 1;            // Mass affects force response & collisions
  radius: number = 0;          // Collision radius
  elasticity: number = 0.8;    // Bounce factor (0 = stop, 1 = perfect bounce)
  collisionOverlapResolution: 'separate' | 'repel' | 'none' = 'separate'; // Overlap resolution mode

  /** Top-Down Properties (for top-down games like tanks, racing) */
  angle: number = 0;           // Rotation angle in radians
  angularVelocity: number = 0; // Speed of rotation
  angularDrag: number = 0;     // Rotation damping
  friction: number = 0;  // Ground friction (0 = slide forever, 1 = instant stop)

  /** Side-View Properties (for platformers, physics games) */
  gravity: Vector2d = vector.zero();  // Gravity force vector
  drag: number = 0;   // Air drag (0 = none, 1 = instant stop)

  constructor(props: Partial<PhysicalBody> = {}) {
    Object.assign(this, props);
  }

  update(deltaTime: number) {
    // Apply gravity directly as acceleration (no mass needed)
    physics.applyForce(this.acceleration, this.gravity);
    
    // Apply ground friction for top-down movement
    if (this.friction > 0) {
      physics.applyDamping(this.velocity, this.friction);
    }

    // Apply air resistance for side-view movement
    if (this.drag > 0) {
      physics.applyDamping(this.velocity, this.drag);
    }

    // Update velocity with acceleration
    physics.applyForce(this.velocity, this.acceleration, deltaTime);

    // Update position with velocity
    physics.applyForce(this.position, this.velocity, deltaTime);
    
    // Update angle with angular velocity
    this.angle += this.angularVelocity * deltaTime;
    
    // Apply angular drag
    if (this.angularDrag > 0) {
      this.angularVelocity = physics.applyTorque(this.angularVelocity, this.angularVelocity, 1 / this.mass);
    }

    // Reset forces
    this.acceleration = vector.zero();
    this.angularVelocity = 0;
  }

  /**
   * Applies a continuous force that affects acceleration over time
   * Example: Gravity, engine thrust, wind
   * @param force The force vector to apply
   */
  applyForce(force: Vector2d) {
    physics.applyForce(this.acceleration, force, 1 / this.mass);
  }

  /**
   * Applies an instant change in velocity
   * Example: Collision impact, jump, explosion knockback
   * @param impulse The impulse vector (mass * velocity change)
   */
  applyImpulse(impulse: Vector2d) {
    physics.applyForce(this.velocity, impulse, 1 / this.mass);
  }

  /**
   * Applies a continuous rotational force
   * Example: Steering torque, wind rotation
   */
  applyTorque(torque: number) {
    this.angularVelocity = physics.applyTorque(this.angularVelocity, torque, 1 / this.mass);
  }

  /**
   * Applies a continuous forward force in the direction of angle
   * Example: Rocket engine, car acceleration
   */
  thrust(force: number, angle: number = this.angle) {
    physics.applyAngleForce(this.acceleration, angle, force, this.mass);
  }

  /**
   * Points the body towards a target point
   */
  pointAt(target: Point) {
    this.angle = radiansBetweenPoints(this.position, target);
  }

  /**
   * Gradually rotates the body towards a target point at a specified rotation speed.
   * @param target The target point to rotate towards.
   * @param rotationSpeed The maximum rotation speed in radians per second.
   * @param deltaTime The time step for the rotation.
   */
  pointTowards(target: Point, rotationSpeed: number) {
    const targetAngle = radiansBetweenPoints(this.position, target);
    this.angle = rotateAngleTowardsRadians(this.angle, targetAngle, rotationSpeed);
  }

  collideWithBody(other: PhysicalBody): boolean {
    if (this === other) return false; // Ignore self-collision

    // Check if bodies are overlapping
    const dist = distance(other.position, this.position);
    if (dist > this.radius + other.radius) return false;

    // Calculate bounciness from combined restitution (multiply elasticities)
    const restitution = this.elasticity * other.elasticity;

    // Resolve collision using physics library
    physics.collide(this, other, restitution, this.collisionOverlapResolution);

    return true;
  }

  collideWithSurface(point: Point, normal: Vector2d) {
    // Normalize the normal vector
    const n = vector.normalize(normal);
    
    // Calculate penetration (negative means penetrating)
    const d = vector.dot(vector.subtract(this.position, point), n);
    if (d >= this.radius) return;
    
    // Move out of surface by remaining distance
    this.position = vector.add(
      this.position,
      vector.scale(n, this.radius - d)
    );
    
    // Apply reflection with elasticity
    this.velocity = vector.scale(
      vector.reflect(this.velocity, n),
      this.elasticity
    );
  }

  // Getters and Setters for x position
  get x() { return this.position.x; }
  set x(value: number) { this.position.x = value; }

  // Getters and Setters for y position
  get y() { return this.position.y; }
  set y(value: number) { this.position.y = value; }
}
