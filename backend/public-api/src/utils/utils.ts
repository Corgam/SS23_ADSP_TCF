// Parses path like "foo.bar[0]" into "foo.bar.0"
export const parsePath = (path: string) => {
  return path.replace(/\[(\d+)\]/g, ".$1");
};
