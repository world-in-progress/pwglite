import pwg from "./pwg/pwg-module";
import paper from "./pwg/paper-core";
import mapboxgl from "mapbox-gl";

let pwgInitialized = false;

export default class PWGDraw {
  _overLayer = null;
  _scene = null;
  _uicontext = null;
  _builds = [];

  _createCallback = null;
  _removeCallback = null;
  _activeCallback = null;

  _activeFeature = null;

  constructor(map) {
    // 确保pwg为单例
    if (!pwgInitialized) {
      pwg.ROOT_PATH = "";
      pwg.initialize(paper);
      pwg.mapbox(mapboxgl);

      pwg.DEVICE_PIXEL_RATIO = 2; // ol.has.DEVICE_PIXEL_RATIO;
      pwg.POINT_MIN_SCALE = 0.25;

      pwgInitialized = true;
    }

    this._overLayer = new pwg.mapbox.Layer({ map: map });
    this._scene = this._overLayer.workspace.createScene("test", true);
    this._uicontext = this._overLayer.uicontext;
    this._overLayer.scene = this._scene;
    this._overLayer.uicontext.container = this._scene;
    this._builds = pwg.graphics.builds;

    this._uicontext.uitool = this._uicontext.tools["editing"];
    this._overLayer.on = (n, e) => {
      console.log(n, e);
      if (n === "child-added") {
        if (this._createCallback) {
          this._createCallback({ featureId: e.child.id });
        }
      }
      if (n === "child-removed") {
        if (this._removeCallback) {
          this._removeCallback({ featureId: e.child.id });
        }
      }
      if (n === "ui.ActiveObjectChanged") {
        if (this._activeCallback) {
          this._activeCallback({
            featureId: e.current === null ? null : e.current.id,
          });
        }
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
      return { name: build.title, class: build.constructor.name  };
    });
  }

  _activateBuild(name) {
    console.log(this._builds)
    const build = this._builds.find((item) => item.title === name);
    let uicontext = this._uicontext;
    uicontext.creatingBuild = build;
    this._setUiTool("creating");
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
  }

  removeFeatureById(id) {
    let feature = this._scene.children.find((item) => item.id === id);
    if (feature) {
      var result = this._scene.tryDeleteObject(feature);
      if (!result.succeed) {
        console.warn("DELETE FAILED:" + result.message);
        return false;
      } else {
        let activeObject = this._uicontext.activeObject;
        if (activeObject && activeObject.id === id) {
          this._uicontext.activeObject = null;
        }
        this._overLayer.render();
        return true;
      }
    }
  }

  on(eventName, callback) {
    if (eventName === "draw.create") {
      this._createCallback = callback;
    }
    if (eventName === "draw.remove") {
      this._removeCallback = callback;
    }
    if (eventName === "draw.select") {
      this._activeCallback = callback;
    }
  }

  changeMode(mode, options = {}) {
    if (mode === "create") {
      if (options.name) {
        this._uicontext.activeObject = null;
        this._activateBuild(options.name);
      }
    }
    if (mode === "edit") {
      if (options.featureId) {
        let feature = this._scene.children.find(
          (item) => item.id === options.featureId
        );
        if (feature) {
          this._setUiTool("editing");
          this._uicontext.activeObject = feature;
          this._overLayer.render();
        }
      }
    }
    if (mode === "none") {
      this._setUiTool("info");
      this._overLayer.render();
    }
  }

  loadGeojson(geojson) {
    if (!geojson) return;
    if (
      geojson.type === "FeatureCollection" &&
      Array.isArray(geojson.features)
    ) {
      geojson.features.forEach((feature) => {
        this._loadSingleFeature(feature);
      });
    } else if (geojson.type === "Feature") {
      this._loadSingleFeature(geojson);
    } else {
      console.warn("请上传合法geojson!");
    }
  }

  _loadSingleFeature(feature) {
    if (
      feature &&
      feature.type === "Feature" &&
      feature.geometry &&
      feature.geometry.type === "Point" &&
      Array.isArray(feature.geometry.coordinates)
    ) {
      const [lon, lat] = feature.geometry.coordinates;
      var lnglat = new pwg.lonlat(lon, lat);
      var global = this._overLayer.context.lonlatToGlobal(lnglat);
      var pixel = this._overLayer.context.globalToPixel(lnglat);

      this._activateBuild("钢管塔(耐张)");
      console.log(this._uicontext.creatingBuild);
      if (!this._uicontext.creatingBuild) {
        console.error("没有相应的图形!");
      }
      this._uicontext.creatingBuild.addFromData({
        lnglat,
        global,
        pixel,
        scale: feature.properties.scale,
        rotation: feature.properties.rotation,
      });
    } else {
      console.warn("请上传合法的Point类型Feature!");
    }
  }
}
