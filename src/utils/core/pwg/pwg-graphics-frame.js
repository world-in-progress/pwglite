if (typeof pwg == "undefined")
    pwg = {};
if (!pwg.graphics)
    pwg.graphics = {};
pwg.graphics.frame = function () {
    ////////////////////////////////////////////////////////
    //一个局部坐标系                                        //
    ////////////////////////////////////////////////////////
    function FrameContext(owner, location, mode) {
        this._owner = owner;
        this._location_point = location;
        this._frameTRS = new pwg.TRS();
        this._mode = mode;
    }
    FrameContext.prototype.constructor = FrameContext;
    function make_min_adjust_ratio(level,zoom)
    {
        if(zoom<level) 
           return Math.pow(2,level-zoom); 
        else 
           return 1; 
    }
    FrameContext.prototype.update = function () {
        var location = this._location_point;
        var ccontext = this._owner.getContainerContext();
        this.zoom = ccontext.zoom;
        var mode = this._mode;
        if (mode == "pixel") {
            this._frameTRS.make(location.pixel, location.angle, location.scale);
            this.pointAdjustRatio = location.scale;
        }
        else {
            this.miniAdjustRatio = ccontext.miniAdjustRatio ;//make_min_adjust_ratio(18,this.zoom);
            this._frameTRS.make(location.local, location.angle, location.scale*this.miniAdjustRatio);
            this.pointAdjustRatio = location.scale*ccontext.pointAdjustRatio;
        }
    };

    FrameContext.prototype.localToGlobal = function (px, py) {
        var p = pwg.point.readx(px, py);
        p = this._frameTRS.M.transform(p);
        var cc = this._owner.getContainerContext();
        return this._mode == "pixel" ? cc.pixelToGlobal(p) : p;
    };

    FrameContext.prototype.globalToLocal = function (px, py) {
        var p = pwg.point.readx(px, py);
        var cc = this._owner.getContainerContext();
        if (this._mode == "pixel")
            p = cc.globalToPixel(p);
        return this._frameTRS.I.transform(p);
    };

    FrameContext.prototype.pixelToGlobal = function (px, py) {
        var p = pwg.point.readx(px, py);
        var cc = this._owner.getContainerContext();
        return cc.pixelToGlobal(p);
    };

    FrameContext.prototype.globalToPixel = function (px, py) {
        var cc = this._owner.getContainerContext();
        return cc.globalToPixel(px, py);
    };

    FrameContext.prototype.lonlatToGlobal = function (lon, lat) {
        var cc = this._owner.getContainerContext();
        return cc.lonlatToGlobal(lon, lat);
    };

    FrameContext.prototype.globalToLonlat = function (px, py) {
        var cc = this._owner.getContainerContext();
        return cc.globalToLonlat(px, py);
    };
    pwg.defineClassProperty(FrameContext, "drawing", {
        get: function () {
            return this._owner.getContainerContext().drawing;
        }
    });
    pwg.defineClassProperty(FrameContext, "viewport", {
        get: function () {
            return this._owner.getContainerContext().viewport;
        }
    });
    pwg.utils.injectTransformEx(FrameContext.prototype);

    function __define_frame_inline_pivot_icon(size) {
        pwg.drawing.define("frame",'/pwg/svg/frame.svg',new pwg.size(64,64));
    }
    var _frame_size = 32;
    __define_frame_inline_pivot_icon(_frame_size);
    ///////////////////////////////////////////////////////////
    //框架图形,提供子图的基础支持
    ///////////////////////////////////////////////////////////
    function FrameContainer(container, id, mode, graphics0) {
        pwg.super(this, pwg.GraphicsContainer, container, id);
        var icon =  pwg.drawing.using(this, "frame");
        this._pivot_icon =icon;
        var rc = this._pivot_icon.bounds;
        this._location_point = new pwg.PointGraphics(container, "frame-location", rc,
            [{
                point: new pwg.point(0, 0),
                rotate0: new pwg.point(0, rc.bottom),
                sizeA: new pwg.point(rc.right, rc.bottom),
                sizeB: new pwg.point(rc.right, 0)
            }], "pixel");
        this._context = new FrameContext(this, this._location_point._offset_location, mode);
        this._graphics0 = graphics0;
        if (graphics0) {
            graphics0.container = this;
            graphics0.owner = this;
            graphics0.id = id;//
        }
    }
    pwg.inherits(FrameContainer, pwg.GraphicsContainer);
    pwg.defineClassId(FrameContainer, "pwg.FrameContainer");
    pwg.FrameContainer = FrameContainer;
    FrameContainer.prototype._get_handles = function () {
        var handles = [this._location_point.handles[0]];
        if (this._graphics0) {
            if (this._context._mode == "pixel") {
                handles = handles.concat([this._location_point.handles[2], this._graphics0.handles[1]]);
            } else {
                handles = handles.concat(this._location_point.handles[3], this._graphics0.handles);
            }
        }
        return handles;
    };

    FrameContainer.prototype.getContext = function () {
        return this._context;
    };

    FrameContainer.prototype.update = function (all) {
        this._location_point.update(all);
        this._context.update(all);
        if (this._graphics0)
            this._graphics0.update(true);
        pwg.GraphicsContainer.prototype.update.call(this,all);
    };

    FrameContainer.prototype.hitTest = function (e, options) {
        var hit = pwg.GraphicsContainer.prototype.hitTest.call(this, e, options);
        if (hit)
            return hit;
        if (this._graphics0)
            hit = this._graphics0.hitTest(e, options);
        if (hit) {
            hit.object = this;
            return hit;
        }
        this._pivot_icon.matrix = this._location_point._TRS.M;
        hit = this._pivot_icon.hitTest(e.pixel, pwg.drawing.default_paper_param);
        if (hit) {
            return {
                succeed: true,
                distance: 0,
                object: this
            };
        }
        return null;
    };

    FrameContainer.prototype.tryGetLocation = function (e, mode) {
        if (this._graphics0)
            return this._graphics0.tryGetLocation(e, mode);
    };
    FrameContainer.prototype.getLocation = function (n) {
        if (this._graphics0)
            return this._graphics0.getLocation(n);
    };

    FrameContainer.prototype.render = function (drawing, pass) {
        var context = this._context;
        if (context._mode == "local") {
            if (context.miniAdjustRatio == 1) {
                if (this._graphics0) {
                    if (pass == "frame")
                        this._graphics0.render(drawing, "entity");
                    if (pass == "ui" || pass == "hot" || pass == "debug")
                        this._graphics0.render(drawing, pass);
                }
                if (pass == "ui") {
                    drawing.begin();
                    this._pivot_icon.matrix = this._location_point._TRS.M;
                    this._pivot_icon.draw(drawing.ctx, drawing.default_paper_param);
                    drawing.end();
                }
            }
            else {
                if (pass == "frame")
                    this._graphics0.render(drawing, "mini");
                if (pass == "ui" || pass == "hot" || pass == "debug") {
                    if (this._graphics0)
                        this._graphics0.render(drawing, pass);
                }
            }
            if (pass != "ui" && pass != 'hot' && pass != 'debug')
                pwg.GraphicsContainer.prototype.render.call(this, drawing, pass);
        }
        else {
            if (this._graphics0) {
                if (pass == "frame")
                    this._graphics0.render(drawing, "entity");
                if (pass == "ui" || pass == "hot" || pass == "debug") {
                    this._graphics0.render(drawing, pass);
                }
            }
            if (pass == "ui") {
                drawing.begin();
                this._pivot_icon.matrix = this._location_point._TRS.M;
                this._pivot_icon.draw(drawing.ctx, drawing.default_paper_param);
                drawing.end();
            }
            if (pass != "ui" && pass != 'hot' && pass != 'debug')
                pwg.GraphicsContainer.prototype.render.call(this, drawing, pass);
        }
    };
    FrameContainer.prototype.__save__ = function (json) {
        json = pwg.GraphicsContainer.prototype.__save__.call(this, json);
        json.location = this._location_point.__save__();
        json.szmode = this._size_mode;
        if (this._graphics0) {
            this._graphics0.owner = null; //forbiden graphics be insert into chidren list
            json.graphics0 = this._graphics0.__save__();
            this._graphics0.owner = this;
        }
        return json;
    };
    FrameContainer.prototype.__load__ = function (json, context) {
        pwg.GraphicsContainer.prototype.__load__.call(this, json, context);
        this._location_point.__load__(json.location,context);
        this._size_mode=json.szmode;
        if (this._graphics0)
            this._graphics0.__load__(json.graphics0,context);
    };

    pwg.defineClassProperties(FrameContainer, {
        "location": { get: function () { return this._location_point.location; } }
    });

    pwg.json.registerCreator("pwg.FrameContainer.creator", function (container, id, json) {
        var graphics0;
        if (json.graphics0) {
            var jgraphics0 = json.graphics0;
            if (jgraphics0.__json_creator__)
                graphics0 = pwg.json.create(container, jgraphics0.id, jgraphics0);
            else {
                graphics0 = pwg.createObject(jgraphics0.classid, null, jgraphics0.id);
            }
        }
        var frame = new FrameContainer(container, id, json.szmode, graphics0);
        return frame;
    });


    pwg.registerClass(FrameContainer);
    ///////////////////////////////////////////////////////////////
    function RectangleFrameBuild(mode) {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._down_e = null;
        this._mode = mode;
    }
    pwg.inherits(RectangleFrameBuild, pwg.BaseBuild);
    RectangleFrameBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(pwg.Rectangle.classid, this._mode);
                this._creating.min.set(e);
            }
            this._down_e = e;
            return true;
        } else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                creating._do_ui_handle_update(creating._maxp_handle, e);
                return true;
            }
        } else if (action == "up" || action == "post") {
            if (!this._down_e || this._down_e.pixel.equals(e.pixel)) {
                this.cancel();
            } else {
                return this.post();
            }
        }
    };
    RectangleFrameBuild.prototype.post = function () {
        if (this._creating) {
            var graphics0 = this._creating;
            graphics0.update();
            //the frame object always should be created in scene as a 2nd container object
            var frame = this._context.scene.createGraphics(FrameContainer.classid, this._mode, graphics0);
            graphics0._style.fillColor = "rgba(255,255,255,0.8)";
            if (this._mode == "pixel") {
                var e = {
                    global: graphics0.min.global
                };
                frame.location.set(e);
                graphics0.min.point = new pwg.point(0, 0);
                graphics0.max.mode = "local";
                graphics0._mode = 'local';
            } else {
                graphics0._min_location.point.xy = new pwg.point(graphics0._size).multiply(-0.5);
                var minp = graphics0._min_location.global;
                var maxp = graphics0._max_location.global;
                var p0 = minp.add(maxp).multiply(0.5);
                var e = {
                    global: p0
                };
                frame.location.set(e);
                minp = graphics0._min_location.pixel.clone();
                maxp = graphics0._max_location.pixel.clone();
                frame.update();
                minp = frame.getContext().pixelToLocal(minp);
                maxp = frame.getContext().pixelToLocal(maxp);
                graphics0.min.set(minp);
                graphics0.size.set(maxp.subtract(minp));
            }
            frame.__json_creator__ = "pwg.FrameContainer.creator";
            this._context.scene.addChild(frame);
            this._creating = null;
            return "stop";
        }
    };
    RectangleFrameBuild.prototype.cancel = function () {
        this._creating = null;
    };
    RectangleFrameBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    RectangleFrameBuild.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating) {
            this._creating.update();
            this._creating.render(drawing, "entity");
        }
    };
    pwg.graphics.registerBuild("局部坐标系(地理)", new RectangleFrameBuild('local'));
    pwg.graphics.registerBuild("局部坐标系(像素)", new RectangleFrameBuild('pixel'));
};