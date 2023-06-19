import { CurvePathData } from "@elfalem/leaflet-curve";
import { Renderer } from "../types/Renderer";
import { TrackBlock, TrainPoint } from "../types/APITypes";
import { pointToLatLng } from "../utils";
import { IConfig } from "../types/IConfig";

export class TrackBlockRenderer extends Renderer<TrackBlock, L.LayerGroup<L.LayerGroup<L.Path>>> {
  render(block: TrackBlock) {
    const group = new L.LayerGroup();

    // point to latLng
    const ll = (p: TrainPoint) => pointToLatLng(p, this.dynmap);

    // Generate lines for the block
    for (let i = 0; i < block.segments.length; i++) {
      const points = block.segments[i].path;

      // Generate line
      const commands: CurvePathData = [];
      if (points.length == 2) {
        // Straight line
        commands.push("M", ll(points[0]), "L", ll(points[1]));
      } else {
        // Bezier curve
        commands.push("M", ll(points[0]), "C", ll(points[1]), ll(points[2]), ll(points[3]));
      }

      // Create and add subgroup
      group.addLayer(
        new L.LayerGroup([
          // Shadow line
          L.curve(commands, {
            lineCap: "butt",
            color: "black",
            opacity: 0.25,
            weight: this.config.lineShadow,
          }),
          // The actual line
          L.curve(commands, {
            lineCap: "square",
          }),
        ]),
      );
    }

    return group;
  }

  update(block: TrackBlock, object: L.LayerGroup<L.LayerGroup<L.Path>>) {
    const curves = object.getLayers() as L.LayerGroup<L.Path>[];
    const lineWidth = this.dynmap.map.getZoom() * this.config.lineWidth;
    const shadowWidth = lineWidth * this.config.lineShadow;

    // Figure out line color
    let color = "var(--track-free)";
    if (block.occupied) color = "var(--track-occupied)";
    else if (block.reserved) color = "var(--track-reserved)";

    // Update each segment curve
    for (let i = 0; i < block.segments.length; i++) {
      const segment = block.segments[i];
      const curve = curves[i].getLayers() as L.Path[];

      if (segment.dimension != this.config.worlds[this.dynmap.world.name]) {
        curve.map((c) => c.setStyle({ stroke: false }));
      } else {
        curve[0].setStyle({ stroke: true, weight: shadowWidth });
        curve[1].setStyle({ stroke: true, color, weight: lineWidth });
      }
    }
  }
}
