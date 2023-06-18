import { TrainPoint, TrainsResponse } from "../types/APITypes";
import { TrainLayer } from "../TrainLayer";
import { Config } from "../types/Config";
import { addPoints, multPoints } from "../utils";

export class TrainsTrainLayer extends TrainLayer<TrainsResponse> {
  constructor(dynmap: DynMap, private readonly config: Config) {
    super(config.baseUrl + "/api/trains.rt", dynmap);
  }

  onUpdate(data: TrainsResponse) {
    this.clearLayers();

    for (const train of data.trains) {
      for (const car of train.cars) {
        if (
          car.leading.dimension != this.config.worlds[this.dynmap.world.name] ||
          car.trailing.dimension != this.config.worlds[this.dynmap.world.name]
        )
          continue;

        // Create perpendicular delta vector (-dy, dx)
        const delta = {
          x: -car.leading.location.z + car.trailing.location.z,
          y: car.leading.location.y - car.trailing.location.y,
          z: car.leading.location.x - car.trailing.location.x,
        };
        // Normalize it and scale it by thickness
        const deltaLength = Math.sqrt(delta.x ** 2 + delta.y ** 2 + delta.z ** 2);
        delta.x /= deltaLength / (this.config.trainWidth * 0.5);
        delta.y /= deltaLength / (this.config.trainWidth * 0.5);
        delta.z /= deltaLength / (this.config.trainWidth * 0.5);

        const negDelta = multPoints(delta, { x: -1, y: -1, z: -1 });

        // Create the polygon
        const toLatLng = (point: TrainPoint): L.LatLng => this.dynmap.getProjection().fromLocationToLatLng(point);
        const points = [
          addPoints(car.leading.location, delta),
          addPoints(car.leading.location, negDelta),
          addPoints(car.trailing.location, negDelta),
          addPoints(car.trailing.location, delta),
        ].map(toLatLng);

        const polygon = new L.Polygon(points, { fillColor: "var(--train-color)", fillOpacity: 1, weight: 0 });
        this.addLayer(polygon);
      }
    }
  }
}
