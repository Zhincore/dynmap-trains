import { TrainPortal } from "../types/APITypes";
import { Renderer } from "../types/Renderer";
import { Vector } from "../utils";

export class PortalRenderer extends Renderer<TrainPortal, L.ImageOverlay> {
  render(portal: TrainPortal) {
    if (portal.from.dimension != this.config.worlds[this.dynmap.world.name]) return;

    const position = new Vector(portal.from.location).toLatLng(this.dynmap);

    const img = L.imageOverlay(this.dynmap.options.url.markers + "_markers_/portal.png", position.toBounds(60000), {
      pane: "markerPane",
      alt: "Portal",
      interactive: true,
    });

    const targetName = Object.entries(this.config.worlds).find(([_, v]) => v == portal.to.dimension)?.[0];
    const target = targetName ? this.dynmap.worlds[targetName] : null;

    img.bindTooltip(this.config.labels.portal + target?.title ?? portal.to.dimension, {});

    if (target) {
      img.on("click", () => {
        this.dynmap.selectMapAndPan(
          target.maps[this.dynmap.maptype.options.name] ?? target.maps[Object.keys(target.maps)[0]],
          portal.to.location
        );
      });
    }

    return img;
  }

  update() {
    // not needed
  }
}
