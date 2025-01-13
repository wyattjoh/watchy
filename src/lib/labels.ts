// Core types for the application structure
type ServiceConfig = {
  id: string;
  containerID: string;
  type: string | undefined;
  name: string | undefined;
  url: string | undefined;
  tags: string[] | undefined;
};

type ContainerConfig = {
  enable: boolean;
  service: Record<string, ServiceConfig>;
};

// Type guard to verify boolean strings
function isBooleanString(value: string): value is "true" | "false" {
  return value === "true" || value === "false";
}

/**
 * Parses Docker labels into a strongly-typed config structure
 * @param labels - Docker label key-value pairs
 * @returns Typed configuration object
 * @throws Error if required fields are missing or invalid
 */
export function parseLabels(labels: Record<string, string>): ContainerConfig {
  const config: ContainerConfig = {
    enable: false,
    service: {},
  };

  const PREFIX = "ca.wyattjoh.watchy";

  for (const [key, value] of Object.entries(labels)) {
    if (!key.startsWith(PREFIX)) continue;

    const parts = key.slice(PREFIX.length + 1).split(".");

    if (parts[0] === "enable") {
      if (!isBooleanString(value)) {
        throw new Error(`Invalid enable value: ${value}`);
      }
      config.enable = value === "true";
      continue;
    }

    if (parts[0] === "service" && parts.length === 3) {
      const serviceID = parts[1];
      const field = parts[2];
      if (!serviceID || !field) {
        continue;
      }

      // Initialize service config if it doesn't exist
      if (!config.service[serviceID]) {
        config.service[serviceID] = {
          containerID: serviceID,
          // Replaced with the service ID if provided.
          id: serviceID,
          type: undefined,
          name: undefined,
          url: undefined,
          tags: undefined,
        };
      }

      switch (field) {
        case "id":
          config.service[serviceID].id = value;
          break;
        case "name":
          config.service[serviceID].name = value;
          break;
        case "type":
          config.service[serviceID].type = value;
          break;
        case "url":
          try {
            new URL(value);
          } catch {
            console.error(`Invalid address: ${value}`);
            break;
          }

          config.service[serviceID].url = value;
          break;
        case "tags":
          config.service[serviceID].tags = value.split(",");
          break;
        default:
          break;
      }
    }
  }

  return config;
}
