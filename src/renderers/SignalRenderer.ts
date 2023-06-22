import { TrainSignalPair } from "../types/APITypes";
import { Renderer } from "../types/Renderer";
import { Vector } from "../utils";
import { NamedLayerGroup } from "../utils/NamedLayerGroup";

const SIGNAL_SCALE = 5;
const SIGNAL_DIRECTIONS = ["forward", "reverse"] as const;

export class SignalRenderer extends Renderer<TrainSignalPair, NamedLayerGroup<L.SVGOverlay>> {
  render(signalPair: TrainSignalPair) {
    if (signalPair.dimension != this.config.worlds[this.dynmap.world.name]) return;

    const group = new NamedLayerGroup<L.SVGOverlay>();

    for (const direction of SIGNAL_DIRECTIONS) {
      const signal = signalPair[direction];
      if (!signal) continue;

      const vector = new Vector(1, 0, 0).rotate(-signal.angle);

      // Calculate offset vector from the tracks
      const offset = vector.multiply(2).substract(vector.toPerpendicular());

      // Calculate the final position
      const position = new Vector(signalPair.location).add(offset);

      // Calculate the angle for 3D view
      const location = new Vector(new Vector(signalPair.location).toLatLng(this.dynmap));
      const offsettedLoc = new Vector(new Vector(signalPair.location).add(vector).toLatLng(this.dynmap));
      const angle3d = offsettedLoc.substract(location).getAngle();

      // Create the image
      const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgElement.setAttribute("viewBox", "0 0 150 150");
      svgElement.innerHTML = `
        <g stroke="black" transform="rotate(${-angle3d})" transform-origin="75 75">
          <circle cx="75" cy="75" r="40" stroke-width="10" style="transition: fill 0.3s" />
          <polyline points="35,115 115,115" stroke-width="15" stroke-linecap="round" /> 
        </g>
      `;

      const layer = L.svgOverlay(svgElement, position.toLatLng(this.dynmap).toBounds(SIGNAL_SCALE * 10000));

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
