if (typeof pwg == "undefined")
    pwg = {};
pwg.mapbox = function (mapbox) {
    var that = pwg.mapbox;

    function OverLayerBase(opts) {
        if (opts && opts.map)
            this.map = opts.map || undefined;
    }
    pwg.inherits(OverLayerBase, pwg.Object);
    OverLayerBase.prototype.setMap = function (map) {
        this.map = map;
        this.t = this.map.transform;
        return this;
    };
    OverLayerBase.prototype.lnglat2pix = function (lng, lat) {
        if (this.map != undefined && this.map.project instanceof Function) {
            var lnglat = this.map.project(new mapboxgl.LngLat(
                lng, lat));
            return [lnglat.x, lnglat.y];
        }
        return [lng, lat];
    };
    ///////////////////////////////////////////////////////////////
    function GraphicsMapboxContext() { }
    GraphicsMapboxContext.prototype.constuctor = GraphicsMapboxContext;
    GraphicsMapboxContext._coordinate = new mapbox.MercatorCoordinate(0, 0, 0);
    GraphicsMapboxContext._lnglat = new mapbox.LngLat(0, 0, 0);
    const using_mapbox_mercator=false;
    const earthRadius = 6378137;
    const earthCircumference = 2 * Math.PI * earthRadius; // meters
    const minbb=[-20037508.34,-20048966.1];
    const maxbb=[20037508.34, 20048966.1];
    const xlength = earthCircumference;//maxbb[0]-minbb[0];
    const ylength = earthCircumference;//maxbb[1]-minbb[1];
    function from_mapbox_coordinate(p) {
        p.x=(p.x-0.5)*xlength;
        p.y=(0.5-p.y)*ylength;
        return p;
    };
    
    function to_mapbox_coordinate(p)
    {
        p.x=p.x/xlength+0.5;
        p.y=0.5-p.y/ylength;
        return p;
    }

    GraphicsMapboxContext.prototype.pixelToGlobal = function (px, py) {
        var t = this.t;
        var p = pwg.defined(py) ? { x: px, y: py } : px;
        p = t.pointCoordinate(p);
        if(!using_mapbox_mercator)
        {
            p = from_mapbox_coordinate(p);   
        }
        return new pwg.point(p);
    };

    GraphicsMapboxContext.prototype.globalToPixel = function (px, py) {
        var t = this.t;
        var coord = GraphicsMapboxContext._coordinate;
        if (pwg.defined(py)) {
            coord.x = px;
            coord.y = py;
        }
        else {
            coord.x = px.x;
            coord.y = px.y;
        }
        if(!using_mapbox_mercator)
        {
            coord = to_mapbox_coordinate(coord);   
        }
        var p = t._coordinatePoint(coord);
        return new pwg.point(p);
    };

    // GraphicsMapboxContext.prototype.globalToPixel = function (px, py) {
    //     if (typeof py == "undefined") {
    //         py = px.y;
    //         px = px.x;
    //     }
    //     var bounds = this.bounds;
    //     px = (px - bounds.x) / bounds.width;
    //     py = (py - bounds.y) / bounds.height;
    //     var vp = this.viewport;
    //     px = vp.x + vp.width * px; 
    //     py = vp.y + vp.height * py;
    //     return new pwg.point(px, py);
    // };

    // GraphicsMapboxContext.prototype.pixelToGlobal = function (px, py) {
    //     if (typeof py == "undefined") {
    //         py = px.y;
    //         px = px.x;
    //     }
    //     var viewport = this.viewport;
    //     px = (px - viewport.x) / viewport.width;
    //     py = (py - viewport.y) / viewport.height;
    //     var bounds = this.bounds;
    //     px = bounds.x + bounds.width * px;
    //     py = bounds.y + bounds.height * py;
    //     return new pwg.point(px, py);
    // };


    //!globe transform interface
    GraphicsMapboxContext.prototype.lonlatToGlobal = function (lon, lat) {
        var t = this.t;
        var lnglat = GraphicsMapboxContext._lnglat;
        if (pwg.defined(lat)) {
            lnglat.lng = lon;
            lnglat.lat = lat;
        }
        else {
            lnglat.lng = lon.x;
            lnglat.lat = lon.y;
        }
        var p = t.locationCoordinate(lnglat);
        if(!using_mapbox_mercator)
        {
            p = from_mapbox_coordinate(p);
        }
        return new pwg.point(p);
    };

    GraphicsMapboxContext.prototype.globalToLonlat = function (px, py) {
        var t = this.t;
        var coord = GraphicsMapboxContext._coordinate;
        if (pwg.defined(py)) {
            coord.x = px;
            coord.y = py;
        }
        else {
            coord.x = px.x;
            coord.y = px.y;
        }
        if(!using_mapbox_mercator)
        {
            p = to_mapbox_coordinate(coord);
        }
        var p = t.coordinateLocation(coord);
        return new pwg.point(p.lng, p.lat);
    };

    //!in global system the local and global are same
    GraphicsMapboxContext.prototype.localToGlobal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    GraphicsMapboxContext.prototype.globalToLocal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };


    GraphicsMapboxContext.prototype.get_zoom_level = function () {
        return this.t.zoom;
    };
    pwg.pointMinAdjustRatio = 0.2;
    pwg.pointAdjustEnableLevel = 16;
    pwg.miniEnableLevel = 16;
    GraphicsMapboxContext.prototype.get_point_adjust_ratio = function () {
        var t = this.t;
        if (t.zoom < pwg.pointAdjustEnableLevel) {
            var ratio = 1.0 / Math.pow(2, pwg.pointAdjustEnableLevel - t.zoom);
            return ratio < pwg.pointMinAdjustRatio ? pwg.pointMinAdjustRatio : ratio;
        }
        else {
            return 1;
        }
    };
    GraphicsMapboxContext.prototype.get_mini_adjust_ratio = function () {
        var t = this.t;
        if (t.zoom < pwg.miniEnableLevel)
            return Math.pow(2, pwg.miniEnableLevel - t.zoom);
        else
            return 1;
    };

    GraphicsMapboxContext.prototype.getExtent = function () {
        return null;
    };

    GraphicsMapboxContext.prototype.update = function () {
        var t = this.t;
        this.viewport = new pwg.rectangle(0, 0, t.size.x, t.size.y);
        this.zoom = this.get_zoom_level();
        this.pointAdjustRatio = this.get_point_adjust_ratio();
        this.miniAdjustRatio = this.get_mini_adjust_ratio();
        var minp = this.pixelToGlobal({ x: 0, y: 0 });//t.pointCoordinate({ x: 0, y: 0 });
        var maxp = this.pixelToGlobal(t.size);//t.pointCoordinate(t.size);
        //this.bounds = new pwg.rectangle(minp.x, minp.y, maxp.x - minp.x, maxp.y - minp.y);
        this.bounds = new pwg.rectangle(minp,maxp);
        var p1 = this.globalToLonlat(minp.x,minp.y);
        var p2 = this.globalToLonlat(maxp.x,maxp.y);
        this.__runtime_lonlat_bounding_box = new pwg.rectangle(p1,p2);
    };

    GraphicsMapboxContext.prototype.lnglat2pix = function (lon, lat) {
        var p = this.lonlatToGlobal(lon, lat);
        var px = this.globalToPixel(p.x, p.y);
        return px;
    };

    pwg.defineClassProperties(GraphicsMapboxContext, {
        // zoom:{get:function(){return this.get_zoom_level();}},
        // pointAdjustRatio:{get:function(){return this.get_point_adjust_ratio();}},
        // miniAdjustRatio:{get:function(){return this.get_mini_adjust_ratio();}}
    });

    pwg.utils.injectTransformEx(GraphicsMapboxContext.prototype);

    ///////////////////////////////////////////////////////////////
    function CanvasOverLayer(_opts) {
        pwg.super(this, OverLayerBase, _opts);
        this.canvas = this._init();
        if (_opts && _opts.map) {
            this.setMap(_opts.map);
            console.warn(`register map moveend rerender handler..`);
            _opts.map.on("move", () => {
                this.render();
            });
        }
    }
    pwg.inherits(CanvasOverLayer, OverLayerBase);
    CanvasOverLayer.prototype._init = function () {
        var canvasContainer = this.map._canvasContainer,
            mapboxCanvas = this.map._canvas,
            canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.className = "overlay-canvas";
        canvas.width = parseInt(mapboxCanvas.style.width) * pwg.DEVICE_PIXEL_RATIO;
        canvas.height = parseInt(mapboxCanvas.style.height) * pwg.DEVICE_PIXEL_RATIO;
        canvas.style.width = mapboxCanvas.style.width;
        canvas.style.height = mapboxCanvas.style.height;
        canvasContainer.appendChild(canvas);
        this.canvas = canvas;

        this.context = new GraphicsMapboxContext();
        this.context.t = this.map.transform;
        this.context.drawing = new pwg.ContextDrawing2D();
        this.context.drawing.annotationContext=new pwg.xlabel.AnnotationContext();
        this.uicontext = new pwg.UiContext(this);
        this.uicontext.uitool = this.uicontext.tools.editing;
        var that = this;
        this.workspace = new pwg.Workspace(this.context, "yz");
        this.workspace.on = function (name, e) {
            if (that.on) {
                return that.on(name, e);
            }
        };
        this.uicontext.on = this.workspace.on;
        this._last_down_p = null;
        var map = this.map;
        map.on('mousedown', function (e) { that.onmouseevent(e); });
        map.on('mouseup', function (e) { that.onmouseevent(e); });
        map.on('mousemove', function (e) { that.onmouseevent(e); });
        return canvas;
    };

    CanvasOverLayer.prototype.render = function (ectx) {

        var context = this.context;
        context.update();
        var ctx = ectx?ectx:this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    };
    
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
            this.workspace.renderEx(context);
        }
        ctx.restore();
        ///////////////////////////////////////////////////////////
        ctx.save();
        this.uicontext.render(this.context);
        ctx.restore();
        if (pwg.worker) {
            var viewport = context.viewport.clone();
            //var minp = context.pixelToGlobal(0, 0);
            //var maxp = context.pixelToGlobal(viewport.width, viewport.height);
            //var bounds2 = new pwg.rectangle({ x: minp.x, y: minp.y, width: maxp.x - minp.x, height: maxp.y - minp.y });
            var bounds = context.bounds;
            var __runtime_lonlat_bounding_box=context.__runtime_lonlat_bounding_box;
            var ratio = pwg.DEVICE_PIXEL_RATIO;
            var message = { 
                            name: "update-map-frame",
                            pixelRatio:ratio,
                            pointMinAdjustRatio:pwg.pointMinAdjustRatio,
                            pointAdjustEnableLevel:pwg.pointAdjustEnableLevel,
                            miniEnableLevel:pwg.miniEnableLevel,
                            zoom: context.zoom, 
                            viewport: viewport, 
                            bounds: bounds,
                            __runtime_lonlat_bounding_box:__runtime_lonlat_bounding_box
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

    function create_mouse_event(type, button, pixel, lonlat, global, alt, ctrl, shift) {
        var e = {
            type: type,
            button: button,
            pixel: pixel,
            lonlat: lonlat,
            global: global,
            world: global,
            alt: alt,
            ctrl: ctrl,
            shift: shift
        };
        return e;
    }

    CanvasOverLayer.prototype.tryGetUiCommand = function (e) {
        var px = new pwg.point(e.offsetX, e.offsetY);
        var global = this.context.pixelToGlobal(px);
        var lnglat = this.context.globalToLonlat(global);
        var ee = create_mouse_event("context-menu", 0, px, lnglat, global, false, false);
        return this.uicontext.tryGetUiCommand(ee);
    };

    CanvasOverLayer.prototype.onmouseevent = function (e) {
        var done = false;
        var xe = e.originalEvent;
        if (xe.altKey)
            return done;
        var uihandler = this.uicontext;
        if (uihandler) {
            var etype = e.type;
            var ktype = etype === "mousemove" ? pwg.MOUSE_MOVE : (etype === "mousedown" ? pwg.MOUSE_DOWN : pwg.MOUSE_UP);
            var button = xe.button;
            if (e.type == 'mousemove') {
                if (xe.buttons & 0x1)
                    button = 0;
                else
                    button = pwg.MOUSE_BUTTON_NONE;
            }
            var px = new pwg.point(xe.offsetX, xe.offsetY);
            var lnglat = new pwg.lonlat(e.lngLat.lng, e.lngLat.lat);
            var global = this.context.lonlatToGlobal(lnglat);
            var ee = create_mouse_event(ktype, button, px, lnglat, global, xe.ctrlKey, xe.shiftKey);
            if (etype == 'mousemove') {
                done = uihandler.onmousemove(ee);
            }
            else if (etype == 'mousedown') {
                this._last_down_p = ee.pixel;
                done = uihandler.onmousedown(ee);
            }
            else if (etype == 'mouseup') {
                done = uihandler.onmouseup(ee) || this._last_down_p.equals(ee.pixel);
            }
        }
        if (done) {
            this.canvas.style.cursor = 'crosshair';
            this.map.getCanvas().style.cursor = 'crosshair';
            e.preventDefault();
            this.render();
        }
        else {
            this.map.getCanvas().style.cursor = 'default';
            this.canvas.style.cursor = 'default';
        }
    };
    pwg.mapbox.Layer = CanvasOverLayer;
};