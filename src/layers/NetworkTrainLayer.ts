import { BlocksAPIResponse, TrackBlock, TrackSegment } from "../types/APITypes";
import { TrainLayer } from "../TrainLayer";
import { Config } from "../types/Config";
import { CurvePathData } from "@elfalem/leaflet-curve";
import { pointsToLatLng } from "../utils";

export class NetworkTrainLayer extends TrainLayer<BlocksAPIResponse> {
  readonly #blocks = new Map<string, L.Curve[]>();

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

  private createBlockCurves(block: TrackBlock) {
    const curves: L.Curve[] = [];

    for (const segment of block.segments) {
      const points = pointsToLatLng(segment.path, this.dynmap);

      const commands: CurvePathData = ["M", points.shift()!];
      // Straight line
      if (points.length == 1) commands.push("L", points[0]);
      // Bezier czrve
      else commands.push("C", ...points);

      const curve = L.curve(commands, {});
      curves.push(curve);
    }

    this.#blocks.set(block.id, curves);
    return curves;
  }

  protected onUpdate(data: BlocksAPIResponse) {
    this.clearLayers();

    for (const block of data.blocks) {
      // Get the layer of the block or create it
      let curves = this.#blocks.get(block.id);
      if (!curves) curves = this.createBlockCurves(block);

      // Figure out line color
      let color = "var(--track-free)";
      if (block.occupied) color = "var(--track-occupied)";
      else if (block.reserved) color = "var(--track-reserved)";

      // Update each segment curve
      for (let i = 0; i < block.segments.length; i++) {
        const segment = block.segments[i];
        const curve = curves[i];

        if (segment.dimension != this.config.worlds[this.dynmap.world.name]) {
          this.removeLayer(curve);
        } else {
          curve.setStyle({ color });
          this.addLayer(curve);

          // Otherwise it overlays trains
          curve.bringToBack();
        }
      }
    }
  }
}
