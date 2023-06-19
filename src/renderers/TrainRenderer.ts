import { CurvePathData } from "@elfalem/leaflet-curve";
import { Renderer } from "../types/Renderer";
import { Train, TrainPoint } from "../types/APITypes";
import { addPoints, multPoints, pointsToLatLng } from "../utils";

export class TrainRenderer extends Renderer<Train, L.LayerGroup<L.Polygon>> {
  render(_train: Train) {
    return new L.LayerGroup();
  }

  update(train: Train, object: L.LayerGroup<L.Polygon>) {
    object.clearLayers();

    for (let i = 0; i < train.cars.length; i++) {
      const car = train.cars[i];

      if (
        car.leading.dimension != this.config.worlds[this.dynmap.world.name] ||
        car.trailing.dimension != this.config.worlds[this.dynmap.world.name]
      )
        continue;

      // Create a delta vector
      const delta = {
        x: car.leading.location.x - car.trailing.location.x,
        y: car.leading.location.y - car.trailing.location.y,
        z: car.leading.location.z - car.trailing.location.z,
      };

      // Normalize it and scale it by thickness
      const deltaLength = Math.sqrt(delta.x ** 2 + delta.y ** 2 + delta.z ** 2);
      const deltaFactor = 1 / (deltaLength / (this.config.trainWidth * 0.5));
      delta.x *= deltaFactor;
      delta.y *= deltaFactor;
      delta.z *= deltaFactor;

      // Substract one block of height so the train doesnt float above tracks
      delta.y -= 1;

      // Create a perpendicular vector
      const deltaPerp = { x: -delta.z, y: delta.y, z: delta.x };

      // Create negative  perpendicular vector
      const negPoint = { x: -1, y: 1, z: -1 };
      const negDeltaPerp = multPoints(deltaPerp, negPoint);

      // Create the polygon points
      const points = [
        addPoints(car.leading.location, deltaPerp),
        addPoints(car.leading.location, negDeltaPerp),
        addPoints(car.trailing.location, negDeltaPerp),
        addPoints(car.trailing.location, deltaPerp),
      ];

      // Add direction arrow
      if (!train.stopped) {
        if (train.backwards && i == train.cars.length - 1) {
          points.splice(4, 0, addPoints(car.trailing.location, multPoints(delta, negPoint)));
        } else if (i == 0) {
          points.splice(1, 0, addPoints(car.leading.location, delta));
        }
      }

      // Create the polygon
      const toLatLng = (point: TrainPoint): L.LatLng => this.dynmap.getProjection().fromLocationToLatLng(point);
      // Create empty polygon
      const polygon = new L.Polygon(points.map(toLatLng), {
        color: "var(--train-color)",
        fillOpacity: 0.9,
        stroke: false,
      });
      object.addLayer(polygon);
    }
  }
}
