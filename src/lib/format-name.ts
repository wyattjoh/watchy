import type { Container } from "./docker";

export function formatName(container: Container): string | null {
  if (container.Names.length === 0) {
    return null;
  }

  const name = container.Names[0];
  if (!name) {
    return null;
  }

  return name.replace(/^\//, "");
}
