declare module "@/utils/core/pwg/pwglite" {
  export default class PWGLite {
    constructor(map: any);
    getAllBuilds(): { name: string; label: string }[];
    getAllFeatures(): any[];
    changeMode(mode: string, options: { name?: string; featureId?: any }): void;
    on(event: string, callback: (e: any) => void): void;
  }
}