import { CurvePathData } from "@elfalem/leaflet-curve";
import { Renderer } from "../types/Renderer";
import { Train, TrainPoint } from "../types/APITypes";
import {
  NEG_POS,
  addPoints,
  getDirectionalVector,
  getPerpendicularVector,
  latLngAsPoint,
  multPoints,
  pointsToLatLng,
} from "../utils";

export class TrainRenderer extends Renderer<Train, L.SVGOverlay> {
  render(_train: Train) {
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.setAttribute("viewBox", "0 0 200 200");
    svgElement.innerHTML = '<g><g transform="rotate(-90)"></g></g>';

    const object = L.svgOverlay(
      svgElement,
      [
        [0, 0],
        [0, 0],
      ],
      {
        interactive: true,
      },
    );

    return object;
  }

  update(train: Train, object: L.SVGOverlay) {
    const svgElement = object.getElement()!;
    const outerG = svgElement.childNodes[0] as SVGGElement;
    const innerG = outerG.childNodes[0] as SVGGElement;

    const ll = (point: TrainPoint): L.LatLng => this.dynmap.getProjection().fromLocationToLatLng(point);

    for (let i = 0; i < train.cars.length; i++) {
      const car = train.cars[i];

      if (
        car.leading.dimension != this.config.worlds[this.dynmap.world.name] ||
        car.trailing.dimension != this.config.worlds[this.dynmap.world.name]
      )
        continue;

      // This element is used for displaying animated train
      let viewPath = innerG.childNodes[i * 2] as SVGPathElement;
      // This element is used to properly calulate the bounding box
      let calcPath = innerG.childNodes[i * 2 + 1] as SVGPathElement;
      // If the car wasn't rendered yet, create the elements
      if (!viewPath) {
        viewPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        calcPath = viewPath.cloneNode() as SVGPathElement;

        viewPath.style.transition = "d 0.5s linear";
        calcPath.style.opacity = "0";

        innerG.appendChild(viewPath);
        innerG.appendChild(calcPath);
      }

      // Translate points
      const leading = car.leading.location;
      const trailing = car.trailing.location;

      // Create a delta vector
      const offset = getDirectionalVector(leading, trailing, this.config.trainWidth * 0.5);

      // Substract one block of height so the train doesnt float above tracks
      offset.y -= 1;

      // Create a perpendicular vector
      const offsetPerp = getPerpendicularVector(offset);

      // Create negative  perpendicular vector
      const negOffsetPerp = multPoints(offsetPerp, NEG_POS);

      // Create the polygon points
      const points = [
        addPoints(leading, offsetPerp),
        addPoints(leading, negOffsetPerp),
        addPoints(trailing, negOffsetPerp),
        addPoints(trailing, offsetPerp),
      ];

      // Add direction arrow
      let isLead = false;
      if (!train.stopped) {
        if (train.backwards && i == train.cars.length - 1) {
          points.splice(4, 0, addPoints(trailing, multPoints(offset, NEG_POS)));
          isLead = true;
        } else if (i == 0) {
          points.splice(1, 0, addPoints(leading, offset));
          isLead = true;
        }
      }

      // Update the shape
      const d = points
        .map((v, i) => {
          const _v = ll(v);
          return `${i ? "L" : "M"} ${_v.lat},${_v.lng}`;
        })
        .join(" ");
      viewPath.setAttribute("d", d);
      calcPath.setAttribute("d", d);

      viewPath.style.fill = isLead ? "var(--lead-car-color)" : "var(--train-color)";
    }

    // Calculate needed space and location
    const startLatLng = ll(train.cars[0].leading.location);
    const outerBox = outerG.getBBox();
    const innerBbox = innerG.getBBox();

    // Update svg viewBox
    svgElement.setAttribute("viewBox", `${outerBox.x} ${outerBox.y} ${outerBox.width} ${outerBox.height}`);

    // Update rotation center
    outerG.setAttribute(
      "transform-origin",
      `${innerBbox.x + innerBbox.width / 2} ${innerBbox.y + innerBbox.height / 2}`,
    );

    // Update svg location
    object.setBounds(
      L.latLngBounds([
        L.latLng(innerBbox.x, innerBbox.y, startLatLng.alt),
        L.latLng(innerBbox.x + innerBbox.width, innerBbox.y + innerBbox.height, startLatLng.alt),
      ]),
    );
  }
}
