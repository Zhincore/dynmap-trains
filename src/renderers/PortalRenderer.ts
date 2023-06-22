import { TrainPortal } from "../types/APITypes";
import { Renderer } from "../types/Renderer";
import { Vector, getMapForDimension } from "../utils";

export class PortalRenderer extends Renderer<TrainPortal, L.ImageOverlay> {
  render(portal: TrainPortal) {
    if (portal.from.dimension != this.config.worlds[this.dynmap.world.name]) return;

    const position = new Vector(portal.from.location).toLatLng(this.dynmap);

    const img = L.imageOverlay(this.dynmap.options.url.markers + "_markers_/portal.png", position.toBounds(60000), {
      pane: "markerPane",
      alt: "Portal",
      interactive: true,
    });

    const target = getMapForDimension(portal.to.dimension, this.dynmap, this.config);

    img.bindTooltip(this.config.labels.portal + target?.options.world.title ?? portal.to.dimension, {});

    if (target) {
      img.on("click", () => {
        this.dynmap.selectMapAndPan(target, portal.to.location);
      });
    }

    return img;
  }

  update() {
    // not needed
  }
}
