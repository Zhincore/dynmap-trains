import { TrainStation } from "../types/APITypes";
import { Renderer } from "../types/Renderer";
import { Vector } from "../utils";

export class StationRenderer extends Renderer<TrainStation, L.Polygon> {
  render(station: TrainStation) {
    if (station.dimension != this.config.worlds[this.dynmap.world.name]) return;

    // Align a vector to the station
    const vector = new Vector(-1, 0, 0).rotate(-station.angle);

    // Calculate offsets
    const sideOffset = vector.multiply(2);
    const sideOffsetFlipped = sideOffset.toFlipped();
    const frontOffset = vector.toPerpendicular().multiply(1.5);
    const frontOffsetFlipped = frontOffset.toFlipped();

    const location = new Vector(station.location);

    const points = [
      location.add(sideOffset.add(frontOffset)),
      location.add(frontOffset.multiply(2)),
      location.add(sideOffsetFlipped.add(frontOffset)),
      location.add(sideOffsetFlipped.add(frontOffsetFlipped)),
      location.add(sideOffset.add(frontOffsetFlipped)),
    ];

    return L.polygon(
      points.map((v) => v.toLatLng(this.dynmap)),
      {
        fillColor: "var(--station-color)",
        fillOpacity: 0.5,
        color: "var(--station-outline)",
        pane: "ctm-stations",
      }
    );
  }

  update() {
    // Not needed
  }
}
