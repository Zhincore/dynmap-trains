import { IConfig } from "./types/IConfig";
import {
  APILayers,
  APIObjects,
  BlocksAPIResponse,
  NetworkAPIResponse,
  SignalsAPIResponse,
  TrainsAPIResponse,
} from "./types/APITypes";
import { Renderer } from "./types/Renderer";
import { Stream } from "./Stream";
import { Unarray, getMapForDimension } from "./utils";
import { TrackBlockRenderer } from "./renderers/TrackBlockRenderer";
import { TrainRenderer } from "./renderers/TrainRenderer";
import { SignalRenderer } from "./renderers/SignalRenderer";
import { PortalRenderer } from "./renderers/PortalRenderer";
import { StationRenderer } from "./renderers/StationRenderer";

interface DynMapLocation {
  world?: string;
  x: number;
  y: number;
  z: number;
}

export class RenderManager {
  #streams: {
    network: Stream<NetworkAPIResponse>;
    signals: Stream<SignalsAPIResponse>;
    blocks: Stream<BlocksAPIResponse>;
    trains: Stream<TrainsAPIResponse>;
  };

  #objects: { [Key in APILayers]: Map<string, L.Layer> } = {
    blocks: new Map(),
    signals: new Map(),
    stations: new Map(),
    trains: new Map(),
    portals: new Map(),
  };

  #layers: { [Key in APILayers]: L.LayerGroup } = {
    blocks: L.layerGroup(),
    signals: L.layerGroup(),
    stations: L.layerGroup(),
    trains: L.layerGroup(),
    portals: L.layerGroup(),
  };

  #cache: APIObjects = {
    blocks: [],
    signals: [],
    stations: [],
    trains: [],
    portals: [],
  };

  #renderers: { [Key in APILayers]: Renderer<Unarray<APIObjects[Key]>> };

  #lastTrainsUpdate = 0;

  constructor(dynmap: DynMap, config: IConfig) {
    // Create streams
    this.#streams = {
      network: new Stream(config.baseUrl + "/api/network.rt"),
      signals: new Stream(config.baseUrl + "/api/signals.rt"),
      blocks: new Stream(config.baseUrl + "/api/blocks.rt"),
      trains: new Stream(config.baseUrl + "/api/trains.rt"),
    };

    // Create renderers
    this.#renderers = {
      signals: new SignalRenderer(dynmap, config),
      stations: new StationRenderer(dynmap, config),
      blocks: new TrackBlockRenderer(dynmap, config),
      trains: new TrainRenderer(dynmap, config),
      portals: new PortalRenderer(dynmap, config),
    };

    // Attach handlers
    this.#streams.signals.onMessage(this.#createHandler("signals"));
    this.#streams.blocks.onMessage(this.#createHandler("blocks"));
    this.#streams.trains.onMessage(this.#createHandler("trains"));

    // Special updates
    this.#streams.network.onMessage((data) => {
      this.#cache.portals = data.portals;
      this.#cache.stations = data.stations;

      this.rerender();
    });

    // Measure update interval
    this.#streams.trains.onMessage(() => {
      const time = Date.now();
      if (this.#lastTrainsUpdate) {
        const delta = time - this.#lastTrainsUpdate;
        if (delta) {
          const weightedSum = (delta / 1000) * 0.25 + config.updateInterval * 0.75;

          config.updateInterval = Math.trunc(weightedSum * 100) / 100;
        }
      }
      this.#lastTrainsUpdate = time;
    });

    // Update on zoom
    $(dynmap).on("zoomchanged", () => {
      this.update();
    });

    // Create sidebar lists
    const trainSection = SidebarUtils.createListSection(config.layers.trains.label);
    trainSection.section.appendTo(dynmap.sidebarPanel);
    dynmap.sidebarSections.push(trainSection);
    const trainList = trainSection.content as HTMLElement;
    $(trainList).addClass("playerlist");

    this.#streams.trains.onMessage((data) => {
      for (const train of data.trains) {
        const position = train.cars[0].leading;
        const trainLocation: DynMapLocation = { ...position.location };
        const map = getMapForDimension(position.dimension, dynmap, config);

        if (map?.options.world.name) {
          trainLocation.world = map.options.world.name;
        }

        let $el = $("#train-" + train.id);
        if (!$el.length) {
          $el = $("<li>")
            .attr("id", "train-" + train.id)
            .addClass("player")
            .append($("<a>").attr("href", "#").text(train.name))
            .appendTo(trainList);
        }
        $el.off();
        $el.on("click", () => {
          if (dynmap.world.name == map?.options.world.name) dynmap.panToLocation(trainLocation);
          else dynmap.selectMapAndPan(map, trainLocation);
        });
      }
    });
  }

  #createHandler<T extends APILayers>(type: T) {
    return (data: { [Key in T]: APIObjects[T] }) => {
      this.#cache[type] = data[type];

      this.#updateLayer(type);
    };
  }

  #updateLayer<T extends APILayers>(type: T) {
    const renderer = this.#renderers[type];
    const layer = this.#layers[type];
    const cache = this.#cache[type];

    for (let i = 0; i < cache.length; i++) {
      const object = cache[i] as Unarray<APIObjects[T]>;
      const id = "id" in object ? object.id : i + "";

      let layerObj = this.#objects[type].get(id);

      if (!layerObj) {
        // Render layer if it doesn't exist
        layerObj = renderer.render(object);

        if (!layerObj) continue; // Renderer decided not to render this object

        layer.addLayer(layerObj);
        this.#objects[type].set(id, layerObj);
      }

      // Update it either way
      renderer.update(object, layerObj);
    }
  }

  /** Update all layers  */
  update() {
    for (const key in this.#renderers) {
      this.#updateLayer(key as keyof APIObjects);
    }
  }

  /** Re-render all layers  */
  rerender() {
    for (const key in this.#renderers) {
      const type = key as keyof APIObjects;

      this.#layers[type].clearLayers();
      this.#objects[type].clear();

      this.#updateLayer(type);
    }
  }

  getLayers() {
    return { ...this.#layers };
  }

  /** Connect all streams  */
  async connect() {
    return Promise.resolve()
      .then(() => this.#streams.network.connect())
      .then(() => this.#streams.blocks.connect())
      .then(() => this.#streams.trains.connect())
      .then(() => this.#streams.signals.connect());
  }

  /** Disconnect all streams */
  disconnect() {
    Object.values(this.#streams).map((v) => v.disconnect());
  }
}
