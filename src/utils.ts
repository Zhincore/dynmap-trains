import { TrainPoint } from "./types/APITypes";

export type Unarray<T extends readonly unknown[]> = T extends readonly (infer P)[] ? P : never;

/** Vector for negating positions horizontally by multiplication */
export const NEG_POS: TrainPoint = { x: -1, y: 1, z: -1 };

export function pointToLatLng(point: TrainPoint, dynmap: DynMap) {
  const latLng: L.LatLng = dynmap.getProjection().fromLocationToLatLng(point);
  return [latLng.lat, latLng.lng] as [number, number];
}

export function pointsToLatLng(points: TrainPoint[], dynmap: DynMap) {
  return points.map((v) => pointToLatLng(v, dynmap));
}

export function addPoints(point1: TrainPoint, point2: TrainPoint): TrainPoint {
  return { x: point1.x + point2.x, y: point1.y + point2.y, z: point1.z + point2.z };
}

export function multPoints(point1: TrainPoint, point2: TrainPoint | number): TrainPoint {
  if (typeof point2 == "number") point2 = { x: point2, y: point2, z: point2 };
  return { x: point1.x * point2.x, y: point1.y * point2.y, z: point1.z * point2.z };
}

export function getDirectionalVector(point1: TrainPoint, point2: TrainPoint, scale = 1) {
  // Create a delta vector
  const delta = {
    x: point1.x - point2.x,
    y: point1.y - point2.y,
    z: point1.z - point2.z,
  };

  // Normalize it and scale it
  const deltaLength = Math.sqrt(delta.x ** 2 + delta.y ** 2 + delta.z ** 2);
  const deltaFactor = 1 / (deltaLength / scale);
  delta.x *= deltaFactor;
  delta.y *= deltaFactor;
  delta.z *= deltaFactor;

  return delta;
}

export function getPerpendicularVector(vector: TrainPoint) {
  return { x: -vector.z, y: vector.y, z: vector.x };
}
