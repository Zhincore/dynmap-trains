import { TrackBlockRenderer } from "./renderers/TrackBlockRenderer";
import { IConfig } from "./types/IConfig";
import {
  BlocksAPIResponse,
  NetworkAPIResponse,
  SignalsAPIResponse,
  TrainObject,
  TrainsAPIResponse,
} from "./types/APITypes";
import { Renderer } from "./types/Renderer";
import { Stream } from "./Stream";
import { Unarray } from "./utils";
import { TrainRenderer } from "./renderers/TrainRenderer";

type AllAPIResponse = BlocksAPIResponse & TrainsAPIResponse & SignalsAPIResponse & NetworkAPIResponse;

type APIObjects = {
  [Key in keyof AllAPIResponse as AllAPIResponse[Key] extends TrainObject[] ? Key : never]: AllAPIResponse[Key];
};

export class RenderManager extends L.LayerGroup {
  #streams: {
    network: Stream<NetworkAPIResponse>;
    signals: Stream<SignalsAPIResponse>;
    blocks: Stream<BlocksAPIResponse>;
    trains: Stream<TrainsAPIResponse>;
  };

  #objects: { [Key in keyof APIObjects]: Map<string, L.Layer> } = {
    blocks: new Map(),
    signals: new Map(),
    stations: new Map(),
    trains: new Map(),
  };

  #layers: { [Key in keyof APIObjects]: L.LayerGroup } = {
    blocks: new L.LayerGroup(),
    signals: new L.LayerGroup(),
    stations: new L.LayerGroup(),
    trains: new L.LayerGroup(),
  };

  #cache: APIObjects = {
    blocks: [],
    signals: [],
    stations: [],
    trains: [],
  };

  #renderers: { [Key in keyof APIObjects]: Renderer<Unarray<APIObjects[Key]>> };

  constructor(dynmap: DynMap, config: IConfig) {
    super();

    // Add own layers
    for (const layer of Object.values(this.#layers)) {
      this.addLayer(layer);
    }

    // Create streams
    this.#streams = {
      network: new Stream(config.baseUrl + "/api/network.rt"),
      signals: new Stream(config.baseUrl + "/api/signals.rt"),
      blocks: new Stream(config.baseUrl + "/api/blocks.rt"),
      trains: new Stream(config.baseUrl + "/api/trains.rt"),
    };

    // Create renderers
    //@ts-ignore TODO
    this.#renderers = {
      blocks: new TrackBlockRenderer(dynmap, config),
      trains: new TrainRenderer(dynmap, config),
    };

    // Attach handlers
    this.#streams.blocks.onMessage(this.#createHandler("blocks"));
    this.#streams.trains.onMessage(this.#createHandler("trains"));
  }

  #createHandler<T extends keyof APIObjects>(type: T) {
    return (data: { [Key in T]: APIObjects[T] }) => {
      this.#cache[type] = data[type];

      this.updateLayer(type);
    };
  }

  updateLayer<T extends keyof APIObjects>(type: T) {
    const renderer = this.#renderers[type];
    const layer = this.#layers[type];

    for (const object of this.#cache[type] as Unarray<APIObjects[T]>[]) {
      let layerObj = this.#objects[type].get(object.id);
      if (!layerObj) {
        // Render layer if it doesn't exist
        layerObj = renderer.render(object);
        layer.addLayer(layerObj);
        this.#objects[type].set(object.id, layerObj);
      }

      // Update it either way
      renderer.update(object, layerObj);
    }
  }

  /** Re-render all layers  */
  rerender() {
    for (const key in this.#renderers) {
      const type = key as keyof APIObjects;

      this.#layers[type].clearLayers();
      this.#objects[type].clear();

      this.updateLayer(type);
    }
  }

  /** Connect all streams  */
  connect() {
    return Promise.all(Object.values(this.#streams).map((v) => v.connect()));
  }

  /** Disconnect all streams */
  disconnect() {
    Object.values(this.#streams).map((v) => v.disconnect());
  }
}
