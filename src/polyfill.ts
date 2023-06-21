// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).require = (module: string) => {
  return {
    leaflet: L,
    jquery: $,
  }[module];
};
