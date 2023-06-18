(window as any).require = (module: string) => {
  return {
    leaflet: L,
    jquery: $,
  }[module];
};
