// I want to extend LayerGroup but change it's methods' signatures, so instead I prentend to only implement L.Layer
type NamedLayerGroupBase = new () => L.Layer;
const NamedLayerGroupBase: NamedLayerGroupBase = L.LayerGroup;

/** LayerGroup whose layers are named */
export class NamedLayerGroup<P extends L.Layer = L.Layer> extends NamedLayerGroupBase {
  #layers = new Map<string, P>();

  addLayer(name: string, layer: P) {
    if (this.#layers.has(name)) throw new Error(`Layer named '${name}' already exists`);

    this.#layers.set(name, layer);
    return L.LayerGroup.prototype.addLayer.call(this, layer);
  }

  getLayer(name: string) {
    return this.#layers.get(name);
  }

  removeLayer(name: string) {
    const layer = this.#layers.get(name);

    if (!layer) return;

    this.#layers.delete(name);
    return L.LayerGroup.prototype.removeLayer.call(this, layer);
  }
}
