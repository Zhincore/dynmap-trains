import { CurvePathData } from "@elfalem/leaflet-curve";
import { Renderer } from "../types/Renderer";
import { TrackBlock, TrainPoint } from "../types/APITypes";
import { pointToLatLng, pointsEqual } from "../utils";
import { IConfig } from "../types/IConfig";

export class TrackBlockRenderer extends Renderer<TrackBlock, L.LayerGroup<L.Path>> {
  render(block: TrackBlock) {
    // point to latLng
    const ll = (p: TrainPoint) => pointToLatLng(p, this.dynmap);

    const commands: CurvePathData = [];
    let lastPoint: TrainPoint | null = null;

    // Generate lines for the block
    for (const segment of block.segments) {
      const points = segment.path;

      // Don't render trakcs in other dimension
      if (segment.dimension != this.config.worlds[this.dynmap.world.name]) continue;

      // Reuse last point if it matches
      if (!lastPoint || !pointsEqual(lastPoint, points[0])) {
        // Move "pencil"
        commands.push("M", ll(points[0]));
      }

      // Generate stroke
      if (points.length == 2) {
        // Straight line
        commands.push("L", ll(points[1]));
        lastPoint = points[1];
      } else {
        // Bezier curve
        commands.push("C", ll(points[1]), ll(points[2]), ll(points[3]));
        lastPoint = points[3];
      }
    }

    // Don't render lines if empty
    if (!commands.length) return new L.LayerGroup();

    // Create the lines and return
    return new L.LayerGroup([
      // Shadow line
      L.curve(commands, {
        lineCap: this.config.trackSeparationOutline ? "square" : "butt",
        color: "black",
        opacity: 0.25,
      }),
      // The actual line
      L.curve(commands, {
        lineCap: "square",
      }),
    ]);
  }

  update(block: TrackBlock, object: L.LayerGroup<L.Path>) {
    const curves = object.getLayers() as L.Path[];

    // Don't update lines if empty
    if (!curves.length) return;

    // Figure out line color
    let color = "var(--track-free)";
    if (block.occupied) color = "var(--track-occupied)";
    else if (block.reserved) color = "var(--track-reserved)";

    // Caluclate line widths
    const lineWidth = this.dynmap.map.getZoom() * this.config.trackWidth;
    const shadowWidth = this.dynmap.map.getZoom() * (this.config.trackWidth + this.config.trackOutline);

    // Update the shadow curve
    curves[0].setStyle({ weight: shadowWidth });
    // Update the curve
    curves[1].setStyle({ color, weight: lineWidth });
  }
}
