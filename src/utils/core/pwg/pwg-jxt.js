pwg = pwg || {};
pwg.jxt = function () {
    pwg.jxtSnapDistance = 20;
    pwg.jxtSnapDisplayScale = 0.5;
    pwg.jxtSnapDisplay = true;
    pwg.jxtSnapEnable = true;

    function JxtCanvas(container) {
        this._container = container;
        var canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.className = "overlay-canvas"; //
        canvas.width = parseInt(container.style.width) * pwg.DEVICE_PIXEL_RATIO;
        canvas.height = parseInt(container.style.height) * pwg.DEVICE_PIXEL_RATIO;
        canvas.style.width = container.style.width;
        canvas.style.height = container.style.height;
        container.appendChild(canvas);
        this.canvas = canvas;
        this.context = this;
        this.drawing = new pwg.ContextDrawing2D();
        this.drawing.annotationContext = new pwg.xlabel.AnnotationContext();
        this.uicontext = new pwg.UiContext(this);
        this.uicontext.uitool = this.uicontext.tools.editing;
        var that = this;
        this.workspace = new pwg.Workspace(this, "jxt");
        this.workspace.on = function (name, e) {
            if (that.on) {
                return that.on(name, e);
            }
        };
        this.uicontext.on = this.workspace.on;
        this.last_mouse_p = new pwg.point(0, 0);

        this.offset = {
            x: 10,
            y: 10
        };
        this.scale = 1;
        canvas.onmousedown = function (e) {
            e.type = "mousedown";
            that.onmouseevent(e);
            that.last_mouse_p.x = e.offsetX;
            that.last_mouse_p.y = e.offsetY;
        };
        canvas.onmousemove = function (e) {
            e.type = "mousemove";
            if (!that.onmouseevent(e)) {
                if (e.buttons == 1) {
                    var dx = e.offsetX - that.last_mouse_p.x;
                    var dy = e.offsetY - that.last_mouse_p.y;
                    that.offset.x += dx / that.scale;
                    that.offset.y += -dy / that.scale;
                    that.render();
                }
            } else {
                that.render();
            }

            that.last_mouse_p.x = e.offsetX;
            that.last_mouse_p.y = e.offsetY;
        };
        canvas.onmouseup = function (e) {
            e.type = "mouseup";
            if (that.onmouseevent(e)) {
                that.render();
            }
            that.last_mouse_p.x = e.offsetX;
            that.last_mouse_p.y = e.offsetY;
        };
        canvas.onmousewheel = function (e) {
            e.type = "mousewheel";
            var cp1 = that.pixelToGlobal(e.offsetX, e.offsetY);
            var d = e.wheelDelta || -e.deltaY + 40;
            that.scale *= (1 + d / 2400);
            that.scale = pwg.clamp(that.scale, 0.2, 16);
            var cp2 = that.pixelToGlobal(e.offsetX, e.offsetY);
            var dx = cp1.x - cp2.x;
            var dy = cp1.y - cp2.y;
            that.offset.x -= dx;
            that.offset.y -= dy;

            that.render();
        };
        canvas.oncontextmenu = function (e) {};
    }

    pwg.inherits(JxtCanvas, pwg.Object);
    pwg.defineClassId(JxtCanvas, "pwg.JxCanvas");

    JxtCanvas.prototype.pixelToGlobal = function (px, py) {
        if (!pwg.defined(py)) {
            py = px.y;
            px = px.x;
        }
        py = this.canvas.offsetHeight - py;
        var x = px / this.scale - this.offset.x;
        var y = py / this.scale - this.offset.y;
        return new pwg.point(x, y);
    };

    JxtCanvas.prototype.globalToPixel = function (x, y) {
        if (!pwg.defined(y)) {
            y = x.y;
            x = x.x;
        }
        var px = (x + this.offset.x) * this.scale;
        var py = (y + this.offset.y) * this.scale;
        py = this.canvas.offsetHeight - py;
        return new pwg.point(px, py);
    };

    JxtCanvas.prototype.lonlatToGlobal = function (lon, lat) {
        return lat ? new pwg.point(lon, lat) : new pwg.point(lon);
    };

    JxtCanvas.prototype.globalToLonlat = function (px, py) {

        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    JxtCanvas.prototype.localToGlobal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    JxtCanvas.prototype.globalToLocal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    JxtCanvas.prototype.get_zoom_level = function () {
        return this.scale;
    };
    JxtCanvas.prototype.get_point_adjust_ratio = function () {
        var ratio = this.scale;
        return ratio;
    };
    JxtCanvas.prototype.get_mini_adjust_ratio = function () {
        var ratio = this.scale;
        return ratio;
    };

    JxtCanvas.prototype.getExtent = function () {
        return null;
    };

    JxtCanvas.prototype.update = function () {
        this.viewport = new pwg.rectangle(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.zoom = Math.log(this.scale) / Math.log(2);
        this.pointAdjustRatio = this.get_point_adjust_ratio();
        this.miniAdjustRatio = this.get_mini_adjust_ratio();
    };

    function draw_arrow_part(drawing, p0, pa, length, angle) {
        var ax = pa.subtract(p0);
        ax = ax.normalize();
        ax = ax.rotate(angle);
        ax = ax.multiply(length);
        var pt = pa.add(ax);
        drawing.moveTo(pt.x, pt.y);
        drawing.lineTo(pa.x, pa.y);
    }

    function make_align_grid_lines(context) {
        var drawing = context.drawing;
        var vp = context.viewport;
        var upLeft = context.pixelToGlobal(0, 0);
        var bottomRight = context.pixelToGlobal(vp.width, vp.height);

        var x0 = Math.min(upLeft.x, bottomRight.x);
        var x1 = Math.max(upLeft.x, bottomRight.x);
        var y0 = Math.min(upLeft.y, bottomRight.y);
        var y1 = Math.max(upLeft.y, bottomRight.y);
        var snapDistance = pwg.jxtSnapDistance;
        x0 = Math.round(x0 / snapDistance - 1) * snapDistance;
        x1 = Math.round(x1 / snapDistance + 1) * snapDistance;
        y0 = Math.round(y0 / snapDistance - 1) * snapDistance;
        y1 = Math.round(y1 / snapDistance + 1) * snapDistance;

        for (var y = y0; y < y1; y += snapDistance) {
            var p0 = context.globalToPixel(x0, y);
            var p1 = context.globalToPixel(x1, y);
            drawing.moveTo(p0.x, p0.y);
            drawing.lineTo(p1.x, p1.y);
        }

        for (var x = x0; x < x1; x += snapDistance) {
            var p0 = context.globalToPixel(x, y0);
            var p1 = context.globalToPixel(x, y1);
            drawing.moveTo(p0.x, p0.y);
            drawing.lineTo(p1.x, p1.y);
        }
    }

    JxtCanvas.prototype.render = function (ectx) {
        var context = this.context;
        context.update();
        var ctx = ectx ? ectx : this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        context.drawing.setRenderContext2D(ctx);
        var p0 = this.globalToPixel(0, 0);
        var px = this.globalToPixel(100, 0);
        var py = this.globalToPixel(0, 100);
        var drawing = context.drawing;

        drawing.resetTransform();
        if (this.scale > pwg.jxtSnapDisplayScale && pwg.jxtSnapEnable && pwg.jxtSnapDisplay) {
            drawing.beginPath();
            drawing.stroke.setWidth(1.0);
            drawing.stroke.setColor('#999999');
            drawing.stroke.setType(1, 3);
            make_align_grid_lines(context);
            drawing.strokeExec();
        }

        drawing.stroke.setWidth(1.0);
        drawing.stroke.setColor('#333333');
        drawing.stroke.setType(0, 2);
        drawing.beginPath();

        drawing.moveTo(px.x, px.y);
        drawing.lineTo(p0.x, p0.y);
        drawing.lineTo(py.x, py.y);
        draw_arrow_part(drawing, p0, px, 10, -145);
        draw_arrow_part(drawing, p0, px, 10, 145);

        draw_arrow_part(drawing, p0, py, 10, -145);
        draw_arrow_part(drawing, p0, py, 10, 145);
        drawing.strokeExec();

        drawing.strokeRect(p0.x - 5, p0.y - 5, 10, 10);
        ctx.restore();
        ctx.save();
        if (this.workspace) {
            this.workspace.renderEx(context);
        }
        ctx.restore();
        ///////////////////////////////////////////////////////////
        ctx.save();
        this.uicontext.render(this.context);
        ctx.restore();
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

    JxtCanvas.prototype.onmouseevent = function (e) {
        var done = false;
        if (e.altKey)
            return done;
        var uihandler = this.uicontext;
        if (uihandler) {
            var etype = e.type;
            var ktype = etype === "mousemove" ? pwg.MOUSE_MOVE : (etype === "mousedown" ? pwg.MOUSE_DOWN : pwg.MOUSE_UP);
            var button = e.button;
            if (e.type == 'mousemove') {
                if (e.buttons & 0x1)
                    button = 0;
                else
                    button = pwg.MOUSE_BUTTON_NONE;
            }
            var px = new pwg.point(e.offsetX, e.offsetY);
            var global = this.pixelToGlobal(px);
            if (pwg.jxtSnapEnable) {
                var snapDistance = pwg.jxtSnapDistance;
                global.x = Math.round(global.x / snapDistance) * snapDistance;
                global.y = Math.round(global.y / snapDistance) * snapDistance;
            }

            var lnglat = global;

            var ee = create_mouse_event(ktype, button, px, lnglat, global, e.ctrlKey, e.shiftKey);
            if (etype == 'mousemove') {
                done = uihandler.onmousemove(ee);
            } else if (etype == 'mousedown') {
                this.last_mouse_p = ee.pixel;
                done = uihandler.onmousedown(ee);
            } else if (etype == 'mouseup') {
                done = uihandler.onmouseup(ee) || this.last_mouse_p.equals(ee.pixel);
            }
        }
        if (done) {
            this.canvas.style.cursor = 'crosshair';
            e.preventDefault();
        } else {
            this.canvas.style.cursor = 'default';
        }
        return done;
    };
    pwg.utils.injectTransformEx(JxtCanvas.prototype);
    pwg.JxtCanvas = JxtCanvas;
};