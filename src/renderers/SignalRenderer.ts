import { TrainSignalPair } from "../types/APITypes";
import { Renderer } from "../types/Renderer";
import { Vector } from "../utils";
import { NamedLayerGroup } from "../utils/NamedLayerGroup";

const SIGNAL_OFFSET = 2;
const SIGNAL_SCALE = 5;
const SIGNAL_DIRECTIONS = ["forward", "reverse"] as const;

export class SignalRenderer extends Renderer<TrainSignalPair, NamedLayerGroup<L.SVGOverlay>> {
  render(signalPair: TrainSignalPair) {
    const group = new NamedLayerGroup<L.SVGOverlay>();
    if (signalPair.dimension != this.config.worlds[this.dynmap.world.name]) return group;

    for (const direction of SIGNAL_DIRECTIONS) {
      const signal = signalPair[direction];
      if (!signal) continue;

      // Calculate offset vector from the tracks
      const offsetVector = new Vector(1, 0, 0).rotate(-signal.angle);

      // Calculate the offset itself and the final position
      const offset = offsetVector.multiply(SIGNAL_OFFSET);
      const position = new Vector(signalPair.location).add(offset);

      // Create the image
      const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute("viewBox", "-50 -50 150 150");
      svgElement.innerHTML = `
        <g stroke="black" transform="rotate(${signal.angle})" transform-origin="50 50">
          <circle cx="50" cy="50" r="40" stroke-width="10" style="transition: fill 0.3s" />
          <polyline points="15,90 85,90" stroke-width="15" stroke-linecap="round" /> 
        </g>
      `;

      const layer = L.svgOverlay(svgElement, position.toLatLng(this.dynmap).toBounds(SIGNAL_SCALE * 10000));

      // const layer = new L.LayerGroup([
      //   L.circle(this.ll(position), {
      //     radius: SIGNAL_RADIUS / BLOCK_SCALE / 2,
      //     weight: 2,
      //     fillOpacity: 1,
      //     color: "black",
      //   }),
      //   L.polyline(
      //     [underlinePos1, underlinePos2].map((v) => this.ll(addPoints(position, v))),
      //     {
      //       color: "black",
      //     }
      //   ),
      // ]);

      group.addLayer(direction, layer);
    }

    return group;
  }

  update(signalPair: TrainSignalPair, object: NamedLayerGroup<L.SVGOverlay>) {
    for (const direction of SIGNAL_DIRECTIONS) {
      const signal = signalPair[direction];
      if (!signal) continue;

      const svgOverlay = object.getLayer(direction);
      if (!svgOverlay) continue;

      const svgElement = svgOverlay.getElement();
      if (!svgElement) continue;

      const g = svgElement.children[0] as SVGGElement;

      g.style.fill = {
        GREEN: "var(--signal-green)",
        YELLOW: "var(--signal-yellow)",
        RED: "var(--signal-red)",
      }[signal.state];
    }
  }
}
