import { Point, Vector2d } from './types';
import * as vector from './vector';
import * as physics from './physics';


export class PhysicalBody {

  static DOWNWARD_GRAVITY: Vector2d = { x: 0, y: 980 }; // Gravity vector (downward)

  x: number = 0;
  y: number = 0;
  velocity: Vector2d = vector.zero();
  acceleration: Vector2d = vector.zero();
  angle: number = 0;
  angularVelocity: number = 0;
  mass: number = 1;
  drag: number = 0;
  angularDrag: number = 0;
  elasticity: number = 0.8; // 0 = no bounce, 1 = full bounce
  radius: number = 0;
  gravity: Vector2d = vector.zero();

  constructor(props: Partial<PhysicalBody> = {}) {
    Object.assign(this, props);
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
    // Apply gravity with mass
    this.applyForce(vector.scale(this.gravity, this.mass));
    
    // Apply drag
    if (this.drag > 0) {
      this.applyForce(vector.scale(this.velocity, 1 - this.drag * deltaTime));
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
    this.velocity = physics.applyThrust(this.velocity, force, angle, this.mass);
  }

  collideWithBody(other: PhysicalBody): boolean {
    const distance = vector.length(vector.subtract(other.position, this.position));
    if (distance > this.radius + other.radius) return false;

    // Calculate and apply collision response
    const [cv1, cv2] = physics.collide(
      this.velocity,
      other.velocity,
      this.position,
      other.position,
      this.mass,
      other.mass
    );

    this.velocity = vector.scale(cv1, this.elasticity);
    other.velocity = vector.scale(cv2, other.elasticity);

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
