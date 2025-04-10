import { Point, Vector2d } from './types';
import * as vector from './vector';
import * as physics from './physics';
import { distance } from './point';

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
  x: number = 0;               // Current x position
  y: number = 0;               // Current y position
  velocity: Vector2d = vector.zero();      // Current movement speed & direction
  acceleration: Vector2d = vector.zero();  // Current change in velocity
  mass: number = 1;            // Mass affects force response & collisions
  radius: number = 0;          // Collision radius
  elasticity: number = 0.8;    // Bounce factor (0 = stop, 1 = perfect bounce)

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
    // Apply gravity with mass
    this.applyForce(vector.scale(this.gravity, this.mass));
    
    // Apply ground friction for top-down movement
    if (this.friction > 0) {
      this.velocity = vector.scale(this.velocity, 1 - this.friction);
    }

    // Apply air resistance for side-view movement
    if (this.drag > 0) {
      this.velocity = vector.scale(this.velocity, 1 - this.drag);
    }

    // Update velocity with acceleration
    this.velocity = vector.add(this.velocity, vector.scale(this.acceleration, deltaTime));

    // Update position with velocity
    this.position = vector.add(this.position, vector.scale(this.velocity, deltaTime));
    
    // Update angle with angular velocity
    this.angle += this.angularVelocity * deltaTime;
    
    // Apply angular drag
    if (this.angularDrag > 0) {
      this.angularVelocity *= (1 - this.angularDrag * deltaTime);
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
    physics.applyVectorForce(this.acceleration, force, this.mass);
  }

  /**
   * Applies an instant change in velocity
   * Example: Collision impact, jump, explosion knockback
   * @param impulse The impulse vector (mass * velocity change)
   */
  applyImpulse(impulse: Vector2d) {
    physics.applyVectorForce(this.velocity, impulse, this.mass);
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
  applyThrust(force: number, angle: number = this.angle) {
    physics.applyVectorForceAngle(this.acceleration, angle, force, this.mass);
  }

  collideWithBody(other: PhysicalBody): boolean {
    const dist = distance(other.position, this.position);
    if (dist > this.radius + other.radius) return false;

    // Calculate combined restitution (multiply elasticities)
    const restitution = this.elasticity * other.elasticity;

    // Calculate and apply collision response
    const [cv1, cv2] = physics.collide(
      this.velocity,
      other.velocity,
      this.position,
      other.position,
      this.mass,
      other.mass,
      restitution
    );

    this.velocity = cv1;
    other.velocity = cv2;

    return true;
  }

  collideWithSurface(normal: Vector2d, point: Point) {
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

  get position(): Vector2d {
    return { x: this.x, y: this.y };
  }

  set position(value: Vector2d) {
    this.x = value.x;
    this.y = value.y;
  }
}
