const icons = import.meta.glob(
  "../assets/*.svg",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

export const typeIcons = Object.fromEntries(
  Object.entries(icons).map(([path, url]) => {
    const type = path
      .split("/")
      .pop()
      .replace(".svg", "");

    return [type, url];
  })
);