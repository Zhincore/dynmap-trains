import "./polyfill";
import "@elfalem/leaflet-curve";
import "jquery";
import { InputConfig, IConfig } from "./types/IConfig";
import { RenderManager } from "./RenderManager";

const DEFAULT_WORLDS = {
  world: "minecraft:overworld",
  "DIM-1": "minecraft:the_nether",
  DIM1: "minecraft:the_end",
};

componentconstructors["trains"] = function (dynmap: DynMap, inConfig: InputConfig) {
  const config: IConfig = {
    hidden: inConfig["hidden"] ?? false,
    baseUrl: inConfig["base-url"] || "",
    worlds: Object.assign({}, DEFAULT_WORLDS, inConfig.worlds || {}),
    label: inConfig["label"] || "Trains",
    trainWidth: inConfig["train-width"] ?? 3,
    lineWidth: inConfig["line-width"] || 0.75,
    lineShadow: inConfig["line-shadow"] || 2,
  };

  // Load styles
  loadcss(config.baseUrl + "/api/style.css", () => null);

  // Create rendering
  const renderer = new RenderManager(dynmap, config);

  // React to map changes
  $(dynmap).on("mapchanged worldchanged", () => renderer.rerender());

  // Connect/disconnect when shown/hidden
  renderer.addEventListener("add", () => renderer.connect());
  renderer.addEventListener("remove", () => renderer.disconnect());

  // Add to dynmap
  if (!config.hidden) dynmap.map.addLayer(renderer);
  dynmap.addToLayerSelector(renderer, config.label, 0);
};
