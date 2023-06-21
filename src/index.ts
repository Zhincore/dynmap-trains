import "./polyfill";
import "@elfalem/leaflet-curve";
import "jquery";
import { InputConfig, IConfig } from "./types/IConfig";
import { RenderManager } from "./RenderManager";
import { APILayers } from "./types/APITypes";

const DEFAULT_WORLDS = {
  world: "minecraft:overworld",
  "DIM-1": "minecraft:the_nether",
  DIM1: "minecraft:the_end",
};

const DEFAULT_LABELS: Record<APILayers, string> = {
  trains: "Trains",
  blocks: "Train Tracks",
  signals: "Train Signals",
  stations: "Train Stations",
  portals: "Train Portals",
};

componentconstructors["trains"] = function (dynmap: DynMap, inConfig: InputConfig) {
  const config: IConfig = {
    baseUrl: inConfig["base-url"] || "",
    worlds: Object.assign({}, DEFAULT_WORLDS, inConfig.worlds || {}),
    layers: Object.entries(DEFAULT_LABELS).reduce((acc, [layer, defLabel]) => {
      const _layer = layer as keyof IConfig["layers"];
      const conf = inConfig["layers"]?.[_layer];
      acc[_layer] = {
        hidden: conf?.["hidden"] ?? false,
        label: conf?.["label"] ?? defLabel,
      };
      return acc;
    }, {} as IConfig["layers"]),
    trainWidth: inConfig["train-width"] ?? 3,
    trackWidth: inConfig["track-width"] || 0.75,
    trackOutline: inConfig["track-outline"] || 1,
    trackSeparationOutline: inConfig["track-separation-outline"] ?? true,
    updateInterval: inConfig["update-interval"] || 0.5,
    labels: {
      portal: inConfig["labels"]?.portal ?? "Portal to ",
    },
  };

  // Load styles
  loadcss(config.baseUrl + "/api/style.css", () => null);

  // Create rendering
  const renderer = new RenderManager(dynmap, config);

  // React to map changes
  $(dynmap).on("mapchanged worldchanged", () => renderer.rerender());

  // Connect/disconnect when some/all layers are shown/hidden
  let shownLayers = 0;
  const onAdd = () => {
    shownLayers++;
    if (shownLayers == 1) renderer.connect();
  };
  const onRemove = () => {
    shownLayers--;
    if (shownLayers == 0) renderer.disconnect();
  };

  // Add all layers to dynmap
  const layers = Object.entries(renderer.getLayers()) as [keyof IConfig["layers"], L.Layer][];
  for (let i = 0; i < layers.length; i++) {
    const [layerName, layer] = layers[i];
    const layerConf = config.layers[layerName];

    layer.on("add", onAdd);
    layer.on("remove", onRemove);

    if (!layerConf.hidden) dynmap.map.addLayer(layer);
    dynmap.addToLayerSelector(layer, layerConf.label, i + 1);
  }
};
