import mapboxgl from "mapbox-gl";

export interface Feature {
  id: string;
  type: string;
}

export type DrawEventCallback = (event: { featureId: string | null }) => void;

export type PWGMode = "create" | "edit" | "none";
export type PWGEvent = "draw.create" | "draw.remove" | "draw.select";

export default class PWGDraw {
  constructor(map: mapboxgl.Map);

  /**
   * 获取所有构建项（构造器名称和显示名称）
   */
  getAllBuilds(): { name: string; label: string }[];

  /**
   * 获取所有图形要素
   */
  getAllFeatures(): Feature[];

  /**
   * 根据ID移除图形要素
   * @returns 是否成功删除
   */
  removeFeatureById(id: string): boolean;

  /**
   * 事件绑定（draw.create、draw.remove、draw.select）
   */
  on(eventName: PWGEvent, callback: DrawEventCallback): void;

  /**
   * 切换编辑模式
   */
  changeMode(mode: PWGMode, options?: object): void;
}
