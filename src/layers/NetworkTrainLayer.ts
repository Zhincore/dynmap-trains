import { BlocksResponse } from "../types/APITypes";
import { TrainLayer } from "../TrainLayer";
import { Config } from "../types/Config";
import { CurvePathData } from "@elfalem/leaflet-curve";
import { pointsToLatLng } from "../utils";

export class NetworkTrainLayer extends TrainLayer<BlocksResponse> {
  constructor(dynmap: DynMap, private readonly config: Config) {
    super(config.baseUrl + "/api/blocks.rt", dynmap);

    $(dynmap).on("zoomchanged", () => {
      // Scale against zoom, cuz we dont need thickness when zoomed out
      const zoom = dynmap.map.getZoom();
      for (const line of this.getLayers() as L.Curve[]) {
        line.setStyle({ weight: zoom });
      }
    });
  }

  onUpdate(data: BlocksResponse) {
    this.clearLayers();

    for (const block of data.blocks) {
      // Figure out line color
      let color = "var(--track-free)";
      if (block.occupied) color = "var(--track-occupied)";
      else if (block.reserved) color = "var(--track-reserved)";

      for (const segment of block.segments) {
        if (segment.dimension != this.config.worlds[this.dynmap.world.name]) continue;

        const points = pointsToLatLng(segment.path, this.dynmap);

        const commands: CurvePathData = ["M", points.shift()!];
        // Straight line
        if (points.length == 1) commands.push("L", points[0]);
        // Curved bezier line
        else commands.push("C", ...points);

        const spline = L.curve(commands, { color });
        this.addLayer(spline);
      }
    }
  }
}
