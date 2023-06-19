# DynMap Trains

Dynmap integration for [Create Track Map](https://modrinth.com/mod/create-track-map).

## Features

- Same as CTM's frontend; near-realtime updates, configurable colors, etc.
- Works surprisingly good in 3D view
- ~~Smooth transitions for moving trains~~ soon:tm:

## REe

## Installation

1. Drop `trains.js` into `<your server path>/dynmap/web/js/`.
2. Add these lines in `dynmap/configuration.txt` under the `components:` section:
    ```yaml
    - class: org.dynmap.ClientComponent
      type: trains
    ```
3. Done! But you should probably [configure it](#configuration).

## Configuration

// TODO

## TODO

[ ] **Optimise updates** - Don't re-render everything on every change
[ ] **Document stuff**
