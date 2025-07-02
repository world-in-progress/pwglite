declare module "@/utils/core/pwg/pwg-draw" {
  export type PWGMode = "create" | "edit" | "none";
  export type PWGEvent = "draw.create" | "draw.remove" | "draw.select";

  export default class PWGDraw {
    constructor(map: mapboxgl.Map);
    getAllBuilds(): { name: string; label: string }[];
    getAllFeatures(): { id: string; type: string }[];
    removeFeatureById(id: string): boolean;
    changeMode(mode: PWGMode, options?: object): void;
    on(event: PWGEvent, callback: (e: { featureId: string }) => void): void;
  }
}
