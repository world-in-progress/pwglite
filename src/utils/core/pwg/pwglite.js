import pwg from "./pwg-module";
import paper from "./paper-core";
import mapboxgl from "mapbox-gl";

export default class pwglite {
  _overLayer = null;
  _scene = null;
  _uicontext = null;
  _builds = [];
  _createCallback = null;
  _activeFeature = null;

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
      if (n === "child-added") {
        that._createCallback({featureId: e.child.id});
      }
      if (n === "child-removed") {
        that._removeCallback(e);
      }
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
    return this._builds.map((build) => {
      return { name: build.constructor.name, label: build.title };
    });
  }

  _activateBuild(name) {
    const build = this._builds.find((item) => item.constructor.name === name);
    let uicontext = this._uicontext;
    uicontext.creatingBuild = build;
    this._setUiTool("creating")
  }

  _setUiTool(name) {
    if (this._uicontext.tools[name]) {
      this._uicontext.uitool = this._uicontext.tools[name];
    }
  }

  getAllFeatures() {
    return this._scene.children.map((item) => {
      return {
        id: item.id,
        type: item.constructor.name,
      };
    });
    // return this._scene.children.map(item => item)
  }

  on(eventName, callback) {
    if (eventName === "draw.create") {
      this._createCallback = callback;
    }
    if (eventName === "draw.remove") {
      this._removeCallback = callback;
    }
  }

  changeMode(mode, options = {}) {
    if (mode === "create") {
      if (options.name) {
        this._setUiTool("creating")
        this._activateBuild(options.name);
      }
    }
    if (mode === "edit") {
      if (options.featureId) {
        let feature = this._scene.children.find(
          (item) => item.id === options.featureId
        );
        if (feature) {
          this._setUiTool("editing")
          this._uicontext.activeObject = feature;
        }
      }
    }
  }
}
