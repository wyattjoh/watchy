export type ContainerInfo = {
  Id: string;
  Config: {
    Labels: Record<string, string>;
  };
  Created: string;
  State?: {
    Status: "running" | "paused" | "restarting" | "exited" | "dead";
    Health?: {
      Status: "healthy" | "unhealthy" | "starting" | "none";
      Log: {
        Start: string;
        End: string;
        ExitCode: number;
        Output: string;
      }[];
    };
  };
};

export type ContainerHealthLog = {
  start: string;
  end: string;
  exitCode: number;
  output: string;
};

export type ContainerService = {
  /**
   * The Docker ID of the service
   */
  containerID: string;

  /**
   * The id of the service
   */
  id: string;

  /**
   * The type of the service
   */
  type: string | undefined;

  /**
   * The name of the service
   */
  name: string;

  /**
   * The URL of the service
   */
  url: string | undefined;

  /**
   * The status of the service
   */
  status: "running" | "paused" | "restarting" | "exited" | "dead" | undefined;

  /**
   * The health of the service
   */
  health: "healthy" | "unhealthy" | "starting" | "none" | undefined;

  /**
   * The health logs of the service
   */
  healthLogs: ContainerHealthLog[] | undefined;

  /**
   * The status text of the service
   */
  statusText: string | undefined;

  /**
   * The created at date of the service
   */
  createdAt: string;

  /**
   * The tags of the service
   */
  tags: string[] | undefined;
};

export type Events = {
  type: "update";
  data: ContainerService[];
};
