import "./polyfill";
import "@elfalem/leaflet-curve";
import "jquery";
import { NetworkTrainLayer } from "./layers/NetworkTrainLayer";
import { InputConfig, Config } from "./types/Config";
import { TrainsTrainLayer } from "./layers/TrainsTrainLayer";

const DEFAULT_WORLDS = {
  world: "minecraft:overworld",
};

componentconstructors["trains"] = function (dynmap: DynMap, inConfig: InputConfig) {
  const config: Config = {
    baseUrl: inConfig["base-url"] || "",
    worlds: Object.assign({}, DEFAULT_WORLDS, inConfig.worlds || {}),
    label: inConfig["label"] || "Trains",
    trainWidth: inConfig["train-width"] ?? 3,
    hidden: inConfig["hidden"] ?? false,
  };

  // Load styles
  loadcss(config.baseUrl + "/api/style.css", () => null);

  // Prepare layers
  const networkLayer = new NetworkTrainLayer(dynmap, config);
  const trainLayer = new TrainsTrainLayer(dynmap, config);

  // Orchestrate connecting
  const reset = () => networkLayer.connect().then(() => trainLayer.connect());

  // Function for showing/hiding
  const hide = () => dynmap.map.removeLayer(masterLayer);
  const show = () => {
    reset();
    dynmap.map.addLayer(masterLayer);
  };

  // Group layers and add to dynmap
  const masterLayer = new L.LayerGroup([networkLayer, trainLayer]);
  if (!config.hidden) show();
  dynmap.addToLayerSelector(masterLayer, config.label, 0);

  // Reset on changes

  $(dynmap).on("mapchanging worldchanging", hide);
  $(dynmap).on("mapchanged worldchanged", show);
};
