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
    trainWidth: inConfig["train-width"] || 3,
  };

  // Load styles
  loadcss(config.baseUrl + "/api/style.css", () => null);

  // Prepare layers
  const networkLayer = new NetworkTrainLayer(dynmap, config);
  const trainLayer = new TrainsTrainLayer(dynmap, config);

  // Orchestrate connecting
  networkLayer.connect().then(() => trainLayer.connect());

  // Group layers and add to dynmap
  const masterLayer = new L.LayerGroup([networkLayer, trainLayer]);
  dynmap.map.addLayer(masterLayer);
  dynmap.addToLayerSelector(masterLayer, config.label, 0);
};
