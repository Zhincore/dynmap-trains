import { TrainPoint } from "./types/APITypes";

export function pointsToLatLng(points: TrainPoint[], dynmap: DynMap) {
  return points.map((v) => {
    const latLng: L.LatLng = dynmap.getProjection().fromLocationToLatLng(v);
    return [latLng.lat, latLng.lng] as [number, number];
  });
}

export function addPoints(point1: TrainPoint, point2: TrainPoint): TrainPoint {
  return { x: point1.x + point2.x, y: point1.y + point2.y, z: point1.z + point2.z };
}

export function multPoints(point1: TrainPoint, point2: TrainPoint): TrainPoint {
  return { x: point1.x * point2.x, y: point1.y * point2.y, z: point1.z * point2.z };
}
