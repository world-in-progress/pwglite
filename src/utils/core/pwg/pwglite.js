import pwg from "./pwg-module";
import paper from "./paper-core";
import mapboxgl from "mapbox-gl";

export default class pwglite {
  constructor(map) {
    pwg.ROOT_PATH = "";
    pwg.initialize(paper);
    pwg.mapbox(mapboxgl);

    pwg.DEVICE_PIXEL_RATIO = 2; // ol.has.DEVICE_PIXEL_RATIO;
    pwg.POINT_MIN_SCALE = 0.25;

    this._overLayer = new pwg.mapbox.Layer({ map: map });
    this._scene = this._overLayer.workspace.createScene("test", true);
    this._uicontext = this._overLayer.uicontext;
    this._overLayer.scene = this._scene;
    this._overLayer.uicontext.container = this._scene;
    this._builds = pwg.graphics.builds;

    this._uicontext.uitool = this._uicontext.tools["editing"];
    this._overLayer.on = function (n, e) {
      console.log(n, e);
    };
    pwg.worker = new Worker(new URL("./pwg-worker.js", import.meta.url), {
      type: "module",
    });
    let that = this;
    pwg.worker.onmessage = function (msg) {
      msg = msg.data;
      if (msg.name == "request-image") {
        pwg.drawing.requestx(msg.id, msg.src);
      } else if (msg.name == "on-map-frame-updated") {
        that._overLayer.workerFrame = msg;
        that._overLayer.render();
      } else if (msg.name == "post-scene-list") {
        alert(msg.scenes);
      } else if (msg.name == "post-scene-json") {
        alert(msg.sceneid + ":" + msg.data);
      } else if (msg.name == "on-worker-data-dirty") {
        that._overLayer.render();
        //setTimeout(function(){
        //},1000);
      }
    };
  }

  getAllBuilds() {
    return this._builds.map((build) => build.title);
  }

  activateBuild(name) {
    const build = this._builds.find((item) => item.title === name);
    let uicontext = this._uicontext;
    uicontext.creatingBuild = build;
    uicontext.uitool = uicontext.tools["creating"];
  }
}
