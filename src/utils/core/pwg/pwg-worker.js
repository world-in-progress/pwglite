// importScripts(new URL('./paper-core.js', import.meta.url));
// importScripts(new URL('./pwg-module.js', import.meta.url));
import paper from './paper-core.js';
import pwg from './pwg-module.js';

self.onmessage = function (message) {
    message = message.data;
    if (message.name == "image-load") {
        pwg.drawing.__image_cache__[message.id].done(message.image);
    }
    else if (message.name == "update-map-frame") {
        var stime = message.time;
        var ntime = Date.now();
        if(!self.data_dirty && ntime-stime>50)
        {
            console.log("time suspend,skip the frame!");
            return; 
        }
        var context = self.context;
        var viewport = new pwg.rectangle(message.viewport);
        var zoom = message.zoom;
        var bounds = new pwg.rectangle(message.bounds);
        if (!self.data_dirty && bounds.equals(context.bounds) && viewport.equals(context.viewport) && zoom == context.zoom) {
            return;
        }
        if(!viewport.equals(context.viewport))
        {
            self.canvas = null;   
        }
        var __runtime_lonlat_bounding_box = new pwg.rectangle(message.__runtime_lonlat_bounding_box);
        context.bounds = bounds;
        context.viewport = viewport;
        context.zoom = zoom;
        context.__runtime_lonlat_bounding_box=__runtime_lonlat_bounding_box;

        pwg.DEVICE_PIXEL_RATIO = message.pixelRatio;
        pwg.pointMinAdjustRatio = message.pointMinAdjustRatio;
        pwg.pointAdjustEnableLevel = message.pointAdjustEnableLevel;
        pwg.miniEnableLevel = message.miniEnableLevel;
        context.update();
        if (!self.canvas || viewport) {
            self.canvas = new OffscreenCanvas(viewport.width * pwg.DEVICE_PIXEL_RATIO, viewport.height * pwg.DEVICE_PIXEL_RATIO);
        }
        var ctx = self.canvas.getContext("2d");
        ctx.clearRect(0, 0, viewport.width, viewport.height);
        ctx.save();
        this.context.drawing.setRenderContext2D(ctx);
        if (this.workspace) {
            this.workspace.renderEx(this.context);
        }
        ctx.restore();
        var frame = self.canvas.transferToImageBitmap();
        self.data_dirty=false;
        self.postMessage({ name: "on-map-frame-updated", image: frame, viewport: context.viewport, bounds: context.bounds }, [frame]);
    }
    else if (message.name == "load-scene") {
        var data = message.data;
        var workspace = self.workspace;
        var scene = workspace.createScene(message.sceneid, true);
        scene.load(data);
        self.data_dirty=true;
        self.postMessage({ name: "on-worker-data-dirty"});
    }   
    else if(message.name == "unload-scene")
    {
        var id = message.sceneid;
        var workspace = self.workspace;
        var scene = workspace.getSceneById(id);
        if(scene)
        {
            workspace.remove(scene);
        }

        self.data_dirty=true;
        self.postMessage({ name: "on-worker-data-dirty"});
    }
    else if(message.name =="get-scene-json")
    { 
        var id = message.sceneid;
        var workspace = self.workspace;
        var scene = workspace.getSceneById(id);
        if(scene)
        {
            var json = scene.save();
            self.postMessage({ name:"post-scene-json",data:json,sceneid:id});
        }
    }
    else if(message.name == "get-scene-list")
    {
        var workspace = self.workspace;
        var scenes = workspace.scenes;
        var lst=[];
        for(var i=0,length = scenes.length;i<length;i++)
        {   
            var scene = scenes[i];
            lst.push(scene.id);
        }
        self.postMessage({ name:"post-scene-list",scenes:lst});
    }
    // else if (message.name == "transfer-scene") {
    //     var data = message.data;
    //     var workspace = self.workspace;
    //     var scene = workspace.createScene(message.sceneid, true);
    //     scene.load(data);
    // }
    // else if (message.name == "create-scene") {
    //     var olayer = self;
    //     var scene = olayer.workspace.createScene("abc", true);
    //     var context = olayer.context;
    //     var xx = self.xx;
    //     self.xx += 0.01;
    //     var towerBuild = pwg.graphics.getBuild("钢管杆(耐张)");
    //     for (var i = 0; i < 10; i++) {
    //         var locations = [];
    //         for (var y = 0; y < 100; y++) {
    //             var x = 119.5 + i * 0.001 + Math.random() * 0.0001+xx;
    //             var yz = 32.4 + y * 0.0001 + Math.random() * 0.0001;
    //             var loc = context.makeLocationFrom({ lon: x, lat: yz }, "lonlat");
    //             var tower = towerBuild.create(scene, loc);
    //             scene.addChild(tower);
    //             locations.push(tower.getLocation("joint-C"));
    //         }
    //         var routeBuild = pwg.graphics.getBuild("线路(地上)");
    //         var route = routeBuild.create(scene, locations);
    //         scene.addChild(route);
    //     }
    // }
};
/*
    worker:request-image  / image-load
    main:get-scene-json   / post-scene-json
    main:save-scene-json  / 
    main:set-active-scene / 
    main:update-map-frame 
    worker:on-map-frame-updated  
*/
//var canvas = new OffscreenCanvas(256,256);
//console.log(canvas);
pwg.initialize(paper);
pwg.DEVICE_PIXEL_RATIO = 2;

const earthRadius = 6371008.8;
/////////////////////////////////////////////
/*
 * The average circumference of the world in meters.
 */
const earthCircumference = 2 * Math.PI * earthRadius; // meters

/*
 * The circumference at a line of latitude in meters.
 */
function circumferenceAtLatitude(latitude) {
    return earthCircumference * Math.cos(latitude * Math.PI / 180);
}

function mercatorXfromLng(lng) {
    return (180 + lng) / 360;
}

function mercatorYfromLat(lat) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

function mercatorZfromAltitude(altitude, lat) {
    return altitude / circumferenceAtLatitude(lat);
}

function lngFromMercatorX(x) {
    return x * 360 - 180;
}

function latFromMercatorY(y) {
    const y2 = 180 - y * 360;
    return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
}

function altitudeFromMercatorZ(z, y) {
    return z * circumferenceAtLatitude(latFromMercatorY(y));
}

const MAX_MERCATOR_LATITUDE = 85.051129;

/**
 * Determine the Mercator scale factor for a given latitude, see
 * https://en.wikipedia.org/wiki/Mercator_projection#Scale_factor
 *
 * At the equator the scale factor will be 1, which increases at higher latitudes.
 *
 * @param {number} lat Latitude
 * @returns {number} scale factor
 * @private
 */
function mercatorScale(lat) {
    return 1 / Math.cos(lat * Math.PI / 180);
}

// self.images = {};
function WorkerContext() {
    this.bounds = null;
    this.viewport = null;
}
WorkerContext.prototype.constructor = WorkerContext;
WorkerContext.prototype.globalToPixel = function (px, py) {
    if (typeof py == "undefined") {
        py = px.y;
        px = px.x;
    }
    var bounds = this.bounds;
    px = (px - bounds.x) / bounds.width;
    py = (py - bounds.y) / bounds.height;
    var vp = this.viewport;
    var x = vp.x + vp.width * px;
    var y = vp.y + vp.height * py;
    return new pwg.point(x, y);
};

WorkerContext.prototype.pixelToGlobal = function (px, py) {
    if (typeof py == "undefined") {
        py = px.y;
        px = px.x;
    }
    var viewport = this.viewport;
    px = (px - viewport.x) / viewport.width;
    py = (py - viewport.y) / viewport.height;
    var bounds = this.bounds;
    var x = bounds.x + bounds.width * px;
    var y = bounds.y + bounds.height * py;
    return new pwg.point(x, y);
};
/////////////////////////////////////
//!globe transform interface
WorkerContext.prototype.lonlatToGlobal = function (lon, lat) {
    if (!pwg.defined(lat)) {
        lat = lon.y || lon.lat;
        lon = lon.x || lon.lon;
    }
    var x = mercatorXfromLng(lon);
    var y = mercatorYfromLat(lat);
    return new pwg.point(x, y);
};

WorkerContext.prototype.globalToLonlat = function (px, py) {
    if (typeof py == "undefined") {
        py = px.y;
        px = px.x;
    }
    px = lngFromMercatorX(px);
    py = latFromMercatorY(py);
    return new pwg.point(px, py);
};

//!in global system the local and global are same
WorkerContext.prototype.localToGlobal = function (px, py) {
    return py ? new pwg.point(px, py) : new pwg.point(px);
};

WorkerContext.prototype.globalToLocal = function (px, py) {
    return py ? new pwg.point(px, py) : new pwg.point(px);
};

pwg.pointMinAdjustRatio = 0.2;
pwg.pointAdjustEnableLevel = 20;
WorkerContext.prototype.get_point_adjust_ratio = function () {
    if (this.zoom < pwg.pointAdjustEnableLevel) {
        var ratio = 1.0 / Math.pow(2, pwg.pointAdjustEnableLevel - this.zoom);
        return ratio < pwg.pointMinAdjustRatio ? pwg.pointMinAdjustRatio : ratio;
    }
    else {
        return 1;
    }
};
pwg.miniEnableLevel = 18;
WorkerContext.prototype.get_mini_adjust_ratio = function () {
    if (this.zoom < pwg.miniEnableLevel)
        return Math.pow(2, pwg.miniEnableLevel - this.zoom);
    else
        return 1;
};

WorkerContext.prototype.getExtent = function () {
    return null;
};

WorkerContext.prototype.update = function () {
    this.pointAdjustRatio = this.get_point_adjust_ratio();
    this.miniAdjustRatio = this.get_mini_adjust_ratio();
};

pwg.utils.injectTransformEx(WorkerContext.prototype);

self.init =function()
{ 
        if (!self.context) {
            self.context = new WorkerContext();
            self.context.drawing = new pwg.ContextDrawing2D();
            self.workspace = new pwg.Workspace(self.context, 'yz-worker');
        } 
};
self.init();

/*
CanvasOverLayer.prototype.render = function () {

    var context = this.context;
    context.update();
    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.resetTransform();
    if (this.workerFrame) {
        var wkf = this.workerFrame;
        var bounds = wkf.bounds;
        var vp = wkf.viewport;
        var minp = context.globalToPixel(bounds.x, bounds.y);
        var maxp = context.globalToPixel(bounds.x + bounds.width, bounds.y + bounds.height);
        var w = maxp.x - minp.x;
        var h = maxp.y - minp.y;
        var ratio = pwg.DEVICE_PIXEL_RATIO;
        ctx.drawImage(wkf.image, minp.x * ratio, minp.y * ratio, w * ratio, h * ratio);
    }
    ctx.restore();
    ctx.save();
    context.drawing.setRenderContext2D(ctx);
    if (this.workspace) {
        this.workspace.renderEx(context.drawing);
    }
    ctx.restore();
    ///////////////////////////////////////////////////////////
    ctx.save();
    this.uicontext.render(this.context);
    ctx.restore();
    if (pwg.worker) {
        var viewport = context.viewport.clone();
        var minp = context.pixelToGlobal(0, 0);
        var maxp = context.pixelToGlobal(viewport.width, viewport.height);
        var bounds = new pwg.rectangle({ x: minp.x, y: minp.y, width: maxp.x - minp.x, height: maxp.y - minp.y });
        var ratio = pwg.DEVICE_PIXEL_RATIO;
        var message = { 
                        name: "update-map-frame",
                        pixelRatio:ratio,
                        pointMinAdjustRatio:pwg.pointMinAdjustRatio,
                        pointAdjustEnableLevel:pwg.pointAdjustEnableLevel,
                        miniEnableLevel:pwg.miniEnableLevel,
                        zoom: context.zoom, 
                        viewport: viewport, 
                        bounds: bounds
                        };
        this.last_post_message = message;
        var that = this;
        setTimeout(function () {
            var lm = that.last_post_message;
            if ((lm.zoom == message.zoom
                && lm.viewport.equals(message.viewport)
                && lm.bounds.equals(message.bounds)))//||Math.random()>0.9
                {
                    message.time = Date.now();
                    pwg.worker.postMessage(message);
                }
        }, 50);
    }
};
*/