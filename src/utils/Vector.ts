import { TrainPoint } from "../types/APITypes";

export type VectorInit = number | number[] | L.LatLng | TrainPoint;

/** Helper class for vector operations */
export class Vector implements TrainPoint {
  public x = 0;
  public y = 0;
  public z = 0;

  constructor(init?: VectorInit);
  constructor(x: number, y: number, z: number);
  constructor(init?: VectorInit, y?: number, z?: number) {
    if (init != undefined) {
      if (typeof init === "number") {
        if (y === undefined) {
          this.x = this.y = this.z = init;
        } else {
          this.x = init;
          this.y = y;
          this.z = z ?? 0;
        }
      } else if ("x" in init) {
        Object.assign(this, init);
      } else if ("lat" in init) {
        this.x = init.lat;
        this.y = init.alt ?? 0;
        this.z = init.lng;
      } else {
        this.x = init[0];
        this.y = init[1];
        this.z = init[2];
      }
    }
  }

  /** Always return a vector from given value */
  #coerce(init: VectorInit) {
    if (init instanceof Vector) return init;
    return new Vector(init);
  }

  /** Calculate the pythagoras length of the vector  */
  getLength() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  /** Convert this vector to a LatLng object on given Dynmap */
  toLatLng(dynmap: DynMap): L.LatLng {
    return dynmap.getProjection().fromLocationToLatLng(this);
  }

  /** Convert this vector to an array consting of lat and lng on given dynmap */
  toLatLngArray(dynmap: DynMap): [number, number] {
    const latLng = this.toLatLng(dynmap);
    return [latLng.lat, latLng.lng];
  }

  /** Return a copy of this vector but horizontally perpendicular to itself */
  toPerpendicular() {
    return new Vector(-this.z, this.y, this.x);
  }

  /** Returns a copy of the vector but horizontally flipped */
  toFlipped() {
    return this.multiply([-1, 1, -1]);
  }

  /** Return a new vector thats result of adding given vector/scalar to this vector */
  add(vector: VectorInit) {
    const _vector = this.#coerce(vector);
    return new Vector(this.x + _vector.x, this.y + _vector.y, this.z + _vector.z);
  }

  /** Return a new vector thats result of substracting given vector/scalar from this vector */
  substract(vector: VectorInit) {
    const _vector = this.#coerce(vector);
    return new Vector(this.x - _vector.x, this.y - _vector.y, this.z - _vector.z);
  }

  /** Return a new vector thats result of multipliying this vector by given vector/scalar */
  multiply(vector: VectorInit) {
    const _vector = this.#coerce(vector);
    return new Vector(this.x * _vector.x, this.y * _vector.y, this.z * _vector.z);
  }

  /** Return a new vector thats result of dividing this vector by given vector/scalar */
  divide(vector: VectorInit) {
    const _vector = this.#coerce(vector);
    return new Vector(this.x / _vector.x, this.y / _vector.y, this.z / _vector.z);
  }

  /** Returns whether or not is the vector equal to given vector */
  equals(vector: VectorInit) {
    const _vector = this.#coerce(vector);
    return this.x == _vector.x && this.y == _vector.y && this.z == _vector.z;
  }

  /** Rotate vector around the Y axis. Modifies IN PLACE and returns the same vector
   * @param angle The angle in degrees
   */
  rotate(angle: number) {
    // Convert to radians
    angle = -angle * (Math.PI / 180);

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = this.x;
    const z = this.z;

    this.x = x * cos - z * sin;
    this.z = x * sin + z * cos;

    return this;
  }

  /** Make this into a unit vector. Modifies IN PLACE and returns the same vector */
  normalise() {
    const length = this.getLength();

    this.x /= length;
    this.y /= length;
    this.z /= length;

    return this;
  }
}
