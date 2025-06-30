if (typeof pwg === 'undefined')
    pwg = {};
//pwg.ol ={};
pwg.ol = function (ol) {
    that = pwg.ol;
    ///////////////////////////////////////////////////////////////////////
    //openlayers pwg map layer render,just as a proxy to layer   render  //
    ///////////////////////////////////////////////////////////////////////
    function PWGLayerRenderer(mapRender, layer) {
        ol.renderer.canvas.Layer.call(this, mapRender, layer);
        this.layer = layer;
    }
    ol.inherits(PWGLayerRenderer, ol.renderer.canvas.Layer);
    PWGLayerRenderer.prototype.composeFrame = function (frameState, layerState, context) {
        this.layer.render(context);
    };
    PWGLayerRenderer.prototype.prepareFrame = function (frameState, layerState, context) {
        return true;
    };
    PWGLayerRenderer.handles = function (type, layer) {
        return type === ol.renderer.Type.CANVAS && layer.getType() === PWGLayer.TYPE;
    };
    PWGLayerRenderer.create = function (mapRenderer, layer) {
        return new PWGLayerRenderer(mapRenderer, layer);
    };
    ol.plugins.registerMultiple(ol.PluginType.LAYER_RENDERER, [PWGLayerRenderer]);

    /////////////////////////////////////////////////////////////////////////////////
    function OpenLayerGraphicsContext() {}
    OpenLayerGraphicsContext.prototype.constuctor = OpenLayerGraphicsContext;
    OpenLayerGraphicsContext.prototype.pixelToGlobal = function (px, py) {
        var transform = this.map_.pixelToCoordinateTransform_;
        var p = py ? [px, py] : [px.x, px.y];
        ol.transform.apply(transform, p);
        return new pwg.point({
            x: p[0],
            y: p[1]
        });
    };
    OpenLayerGraphicsContext.prototype.globalToPixel = function (px, py) {
        var transform = this.map_.coordinateToPixelTransform_;
        var p = py ? [px, py] : [px.x, px.y];
        ol.transform.apply(transform, p);
        return new pwg.point({
            x: p[0],
            y: p[1]
        });
    };

    //!globe transform interface
    OpenLayerGraphicsContext.prototype.lonlatToGlobal = function (lon, lat) {
        var projection = this.map_.frameState_.viewState.projection;
        var lonlat = lat ? [lon, lat] : [lon.lon, lon.lat];
        var p = ol.proj.fromLonLat(lonlat, projection);
        return new pwg.point({
            x: p[0],
            y: p[1]
        });
    };

    OpenLayerGraphicsContext.prototype.globalToLonlat = function (px, py) {
        var projection = this.map_.frameState_.viewState.projection;
        var p = py ? [px, py] : [px.x, px.y];
        ll = ol.proj.toLonLat(p, projection);
        return new pwg.point(ll);
    };
    //!in global system the local and global are same
    OpenLayerGraphicsContext.prototype.localToGlobal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    OpenLayerGraphicsContext.prototype.globalToLocal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    OpenLayerGraphicsContext.prototype.getResolution = function () {
        return this.map_.frameState_.viewState.resolution;
    };

    OpenLayerGraphicsContext.prototype.getExtent = function () {
        return this.map_.getSize();
    };

    pwg.utils.injectTransformEx(OpenLayerGraphicsContext.prototype);

    //plotting layer
    function PWGLayer(opts) {
        ol.layer.Layer.call(this, opts);
        this.context = new OpenLayerGraphicsContext();
        this.context.drawing = new pwg.ContextDrawing2D();
        this.uicontext = new pwg.UiContext(this);
        this.uicontext.uitool = this.uicontext.tools.editing;
    }
    ol.inherits(PWGLayer, ol.layer.Layer);
    PWGLayer.TYPE = "PWG_LAYER";

    PWGLayer.prototype.setMap = function (map) {
        ol.layer.Layer.prototype.setMap.call(this, map);
        this.map_ = map;
        this.context.map_ = map;
    }
    PWGLayer.prototype.getMap = function () {
        return this.map_;
    };
    PWGLayer.prototype.getSourceState = function () {
        return "ready";
    };

    PWGLayer.prototype.render = function (context) {
        context.save();
        this.context.drawing.setRenderContext2D(context);
        if (this.workspace) {
            this.workspace.renderEx(this.context.drawing);
        }
        ///////////////////////////////////////////////////////////
        context.restore();
        context.save();
        this.uicontext.render(this.context);
        context.restore();
    };

    PWGLayer.prototype.getType = function () {
        return PWGLayer.TYPE;
    };

    /////////////////////////////////////////////////////////////////////
    function MouseEvent(type, button, pixel, lonlat, global,alt, ctrl, shift) {
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
    /**
        just for plotting
     */
    function PWGInteraction(layer) {
        this.owner = layer;
        this.uihandle = undefined;
        ol.interaction.Interaction.call(this, {
            handleEvent: PWGInteraction.handleEvent
        });
    }
    ol.inherits(PWGInteraction, ol.interaction.Interaction);
    var MapUiEvents = ol.MapBrowserEventType;

    function cvt_map_event_to_pwg_event(et) {
        if (et == MapUiEvents.POINTERDOWN)
            return pwg.MOUSE_DOWN;
        if (et == MapUiEvents.POINTERUP)
            return pwg.MOUSE_UP;
        if (et == MapUiEvents.POINTERMOVE)
            return pwg.MOUSE_MOVE;
        if (et == MapUiEvents.DBLCLICK)
            return pwg.MOUSE_UP;
        else
            return "none";
    }

    PWGInteraction.handleEvent = function (mapEvent) {
        var uihandle = this.uihandle ? this.uihandle : this.owner.uicontext;
        if (!uihandle)
            return true;
        var browserEvent = mapEvent.originalEvent;
        var done = false;
        var etype = cvt_map_event_to_pwg_event(mapEvent.type);
        if (etype != "none") {
            var map = mapEvent.map;
            var point = mapEvent.coordinate;
            var delta = browserEvent.shiftKey ? -this.delta_ : this.delta_;
            var pixel = mapEvent.pixel;
            var event = mapEvent.pointerEvent;

            var x = pixel[0];
            var y = pixel[1];
            var lonlat = this.owner.context.globalToLonlat(point[0], point[1]);
            var e = new MouseEvent(etype,
                event.button, new pwg.point(x, y),
                lonlat,
                new pwg.point(point[0], point[1]),
                event.altKey,event.ctrlKey, event.shiftKey);

            if (mapEvent.type == MapUiEvents.POINTERDOWN && uihandle.onmousedown) {
                done = uihandle.onmousedown(e);
            } 
            else
            if (mapEvent.type == MapUiEvents.POINTERMOVE && uihandle.onmousemove) {
                if (event.buttons != 0) {
                    e.button = event.buttons - 1;
                }
                done = uihandle.onmousemove(e);
            } 
            else
            if (mapEvent.type == MapUiEvents.POINTERUP && uihandle.onmouseup) {
                done = uihandle.onmouseup(e);
            } 
            else
            if (mapEvent.type == MapUiEvents.DBLCLICK && uihandle.ondblclick) {
                e.button = 2;
                done = uihandle.ondblclick(e);
            }
            this.owner.changed();
        }
        return !done;
    };
    that.Layer = PWGLayer;
    that.Interaction = PWGInteraction;
};