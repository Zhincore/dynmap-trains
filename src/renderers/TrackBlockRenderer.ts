import { CurvePathData } from "@elfalem/leaflet-curve";
import { Renderer } from "../types/Renderer";
import { TrackBlock, TrainPoint } from "../types/APITypes";
import { pointsToLatLng } from "../utils";

export class TrackBlockRenderer extends Renderer<TrackBlock, L.LayerGroup> {
  render(block: TrackBlock) {
    const group = new L.LayerGroup();

    for (const segment of block.segments) {
      const curve = L.curve(this.#generateLine(segment.path), {
        lineCap: "butt",
      });
      group.addLayer(curve);
    }

    return group;
  }

  #generateLine(path: TrainPoint[]) {
    const points = pointsToLatLng(path, this.dynmap);

    const commands: CurvePathData = ["M", points.shift()!];
    // Straight line
    if (points.length == 1) commands.push("L", points[0]);
    // Bezier czrve
    else commands.push("C", ...points);

    return commands;
  }

  update(block: TrackBlock, object: L.LayerGroup) {
    const curves = object.getLayers() as L.Curve[];

    // Figure out line color
    let color = "var(--track-free)";
    if (block.occupied) color = "var(--track-occupied)";
    else if (block.reserved) color = "var(--track-reserved)";

    // Update each segment curve
    for (let i = 0; i < block.segments.length; i++) {
      const segment = block.segments[i];
      const curve = curves[i];

      if (segment.dimension != this.config.worlds[this.dynmap.world.name]) {
        curve.setStyle({ stroke: false });
      } else {
        curve.setStyle({ color, stroke: true });
      }
    }
  }
}
