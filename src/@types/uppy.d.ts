declare module "@uppy/react" {
  import { ComponentType } from "react";
  import Uppy from "@uppy/core";

  export interface DashboardProps {
    uppy: Uppy;
    proudlyDisplayPoweredByUppy?: boolean;
    height?: number | string;
    width?: number | string;
    note?: string;
    showProgressDetails?: boolean;
    showRemoveButtonAfterComplete?: boolean;
    theme?: "light" | "dark" | "auto";
  }

  export const Dashboard: ComponentType<DashboardProps>;
}

declare module "@uppy/core" {
  export default class Uppy {
    constructor(options?: any);
    use(plugin: any, options?: any): this;
    on(event: string, callback: (...args: any[]) => void): this;
    close(): void;
    retryAll(): void;
  }

  // Export the instance type
  export type UppyInstance = InstanceType<typeof Uppy>;
}

declare module "@uppy/aws-s3-multipart" {
  const AwsS3Multipart: any;
  export default AwsS3Multipart;
}
