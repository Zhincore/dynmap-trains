import { CurvePathData } from "@elfalem/leaflet-curve";
import { Renderer } from "../types/Renderer";
import { Train, TrainPoint } from "../types/APITypes";
import { NEG_POS, addPoints, getDirectionalVector, getPerpendicularVector, multPoints, pointsToLatLng } from "../utils";

export class TrainRenderer extends Renderer<Train, L.LayerGroup<L.Polygon>> {
  render(_train: Train) {
    return new L.LayerGroup();
  }

  update(train: Train, object: L.LayerGroup<L.Polygon>) {
    const polygons = object.getLayers();

    for (let i = 0; i < train.cars.length; i++) {
      const car = train.cars[i];

      // Use existing polygon or create new one
      let polygon = polygons[i] as L.Polygon | undefined;
      if (!polygon) {
        polygon = new L.Polygon([], {
          color: "var(--train-color)",
          fillOpacity: 0.9,
          stroke: false,
        });
        object.addLayer(polygon);
      }

      if (
        car.leading.dimension != this.config.worlds[this.dynmap.world.name] ||
        car.trailing.dimension != this.config.worlds[this.dynmap.world.name]
      )
        continue;

      // Create a delta vector
      const delta = getDirectionalVector(car.leading.location, car.trailing.location, this.config.trainWidth * 0.5);

      // Substract one block of height so the train doesnt float above tracks
      delta.y -= 1;

      // Create a perpendicular vector
      const deltaPerp = getPerpendicularVector(delta);

      // Create negative  perpendicular vector
      const negDeltaPerp = multPoints(deltaPerp, NEG_POS);

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
          points.splice(4, 0, addPoints(car.trailing.location, multPoints(delta, NEG_POS)));
        } else if (i == 0) {
          points.splice(1, 0, addPoints(car.leading.location, delta));
        }
      }

      // Create the polygon
      const toLatLng = (point: TrainPoint): L.LatLng => this.dynmap.getProjection().fromLocationToLatLng(point);
      polygon.setLatLngs(points.map(toLatLng));
    }
  }
}
