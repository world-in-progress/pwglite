/*
    pwg-canvas-render-engine.js
*/
if (typeof pwg == 'undefined')
    pwg = {};
pwg.drawing = function (paper) {

    function WorkerImageProxy() {
        this._src = null;
        this.id = null;
        this._width = 0;
        this._height = 0;
        this.onload = null;
    }
    WorkerImageProxy.prototype.constructor = WorkerImageProxy;
    WorkerImageProxy.prototype.done = function (image) {
        if (this.onload) {
            this.onload(image);
        }
    };
    WorkerImageProxy.prototype.requeset = function () {
        self.postMessage({ name: "request-image", id: this.id?this.id:this.src, src: this._src });
    };

    pwg.defineClassProperties(WorkerImageProxy, {
        src:
        {
            get: function () { return this._src; },
            set: function (v) {
                this._src = v;
                this.requeset();
            }
        }
    });
    //Image = typeof window != 'undefined' ? window.Image : WorkerImageProxy;
    if(typeof Image === 'undefined')
    {
        Image=WorkerImageProxy;
    }

    var that = pwg.drawing;
    that.paper = paper;

    paper.setup([1024, 1024]);
    paper.project.view.autoUpdate = false;

    that.default_paper_param = new paper.Base({
        offset: new paper.Point(0, 0),
        pixelRatio: pwg.DEVICE_PIXEL_RATIO,
        viewMatrix: null,
        matrices: [new paper.Matrix()],
        updateMatrix: true
    });
    ////////////////////////////////////////////////////////////////
    //TRS rotate->scale->translate                                //
    ////////////////////////////////////////////////////////////////
    function TRS() {
        // this.T = new pwg.matrix();
        // this.R = new pwg.matrix();
        // this.S = new pwg.matrix();
        this.M = new pwg.matrix();
    }
    TRS._T = new pwg.matrix();
    TRS._R = new pwg.matrix();
    TRS._S = new pwg.matrix();
    TRS._O = new pwg.matrix();
    TRS.prototype.constructor = TRS;
    TRS.prototype.make = function (t, r, s, o) {
        TRS._T.reset();
        TRS._R.reset();
        TRS._S.reset();
        TRS._O.reset();
        if (o) {
            TRS._O.translate(o.multiply(-1));
        }
        TRS._T.translate(t.x, t.y);
        TRS._R.rotate(r);
        if (typeof s.x === 'undefined')
            TRS._S.scale(s, s);
        else
            TRS._S.scale(s.x, s.y);

        this.M.reset();
        if (!TRS._T.isIdentity())
            this.M.append(TRS._T);
        this.M.append(TRS._R);
        this.M.append(TRS._S);
        if (!TRS._O.isIdentity())
            this.M.append(TRS._O);
        this.I = this.M.inverted();
    };

    // TRS.prototype.make = function (t, r, s, o) {
    //     TRS._T.reset();
    //     TRS._R.reset();
    //     TRS._S.reset();
    //     if (o) {
    //         t = t.subtract(o);
    //     }
    //     TRS._T.translate(t.x, t.y);
    //     TRS._R.rotate(r, o);
    //     if (typeof s.x === 'undefined')
    //         TRS._S.scale(s, s, o);
    //     else
    //         TRS._S.scale(s.x, s.y, o);

    //         this.M.reset();
    //     this.M.append(TRS._T);
    //     this.M.append(TRS._R);
    //     this.M.append(TRS._S);
    //     this.I = this.M.inverted();
    // };

    TRS.prototype.transform = function (x, y) {
        return this.M.transform(x, y);
    };
    TRS.prototype.invert = function (x, y) {
        return this.I.transform(x, y);
    };
    that.TRS = TRS;
    pwg.TRS = TRS;

    function formatARGB(c) {
        if(typeof(c) === 'string' || c instanceof String)
            return c;
        c = c | 0;
        if (formatARGB._cache[c])
            return formatARGB._cache[c];
        var a = (c & 0xFF000000) >> 24;
        if (a < 0)
            a += 256;
        a /= 255.0;
        c = c & 0xFFFFFF;
        var r = (c >> 16),
            g = ((c & 0xFF00) >> 8),
            b = (c & 0xFF);
        var ret = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        formatARGB._cache[c] = ret;
        return ret;
    }
    formatARGB._cache = [];
    that.formatARGB = formatARGB;

    function setColorOpacity(color, opacity) {
        var r = ((color & 0xFFFFFF) >> 16),
            g = ((color & 0xFF00) >> 8),
            b = (color & 0xFF);
        var a = 255 * opacity / 100;
        return a << 24 | r << 16 | g << 8 | b;
    }
    that.setColorOpacity = setColorOpacity;

    function InterpolateColor(c1, c2, op1, op2, percent) {
        var r1 = ((c1 & 0xFFFFFF) >> 16),
            g1 = ((c1 & 0xFF00) >> 8),
            b1 = (c1 & 0xFF);
        var r2 = ((c2 & 0xFFFFFF) >> 16),
            g2 = ((c2 & 0xFF00) >> 8),
            b2 = (c2 & 0xFF);
        var a1 = 255 * op1 / 100;
        var a2 = 255 * op2 / 100;
        var r = (r2 - r1) * percent + r1;
        var g = (g2 - g1) * percent + g1;
        var b = (b2 - b1) * percent + b1;
        var a = (a2 - a1) * percent + a1;
        return a << 24 | r << 16 | g << 8 | b;
    }
    that.InterpolateColor = InterpolateColor;
    that.interpolateColor = InterpolateColor;

    var ARGB = {
        create: function (a, r, g, b) {
            if (a <= 2.0) {
                a *= 255;
                a |= 0;
                r *= 255;
                r |= 0;
                g *= 255;
                g |= 0;
                b *= 255;
                b |= 0;
            }
            return a << 24 | r << 16 | g << 8 | b;
        },
        formatARGB: formatARGB,
        RED: 0xFFFF0000,
        GREEN: 0xFF00FF00,
        BLUE: 0xFF0000FF,
        YELLOW: 0xFFFFFF00,
        BLACK: 0xFF000000,
        WHITE: 0xFFFFFFFF,
        PINK: 0XFFFF00FF
    };
    that.ARGB = ARGB;
    pwg.colors = ARGB;
    ////////////////////////////////////////////
    //set paper style to drawing context      //
    ////////////////////////////////////////////
    function apply_style_to_context(style, matrix, ctx, param, viewMatrix) {
        if (style.hasFill()) {
            ctx.fillStyle = style.getFillColor().toCanvasStyle(ctx, matrix);
        }
        if (style.hasStroke()) {
            ctx.strokeStyle = style.getStrokeColor().toCanvasStyle(ctx, matrix);
            ctx.lineWidth = style.getStrokeWidth();
            var strokeJoin = style.getStrokeJoin(),
                strokeCap = style.getStrokeCap(),
                miterLimit = style.getMiterLimit();
            if (strokeJoin)
                ctx.lineJoin = strokeJoin;
            if (strokeCap)
                ctx.lineCap = strokeCap;
            if (miterLimit)
                ctx.miterLimit = miterLimit;
            //if (paper.support.nativeDash)
            {
                var dashArray = style.getDashArray(),
                    dashOffset = style.getDashOffset();
                if (dashArray && dashArray.length) {
                    if ('setLineDash' in ctx) {
                        ctx.setLineDash(dashArray);
                        ctx.lineDashOffset = dashOffset;
                    } else {
                        ctx.mozDash = dashArray;
                        ctx.mozDashOffset = dashOffset;
                    }
                }
            }
        }
        if (style.hasShadow()) {
            var pixelRatio = param.pixelRatio || 1,
                mx = viewMatrix._shiftless().prepend(
                    new Matrix().scale(pixelRatio, pixelRatio)),
                blur = mx.transform(new Point(style.getShadowBlur(), 0)),
                offset = mx.transform(this.getShadowOffset());
            ctx.shadowColor = style.getShadowColor().toCanvasStyle(ctx);
            ctx.shadowBlur = blur.getLength();
            ctx.shadowOffsetX = offset.x;
            ctx.shadowOffsetY = offset.y;
        }
        if (style.fontEnable || (param && param.fontStyle)) {
            ctx.font = style.getFontStyle();
            ctx.textAlign = style.getJustification();
        }
    }
    that.apply_style_to_context = apply_style_to_context;

    //////////////////////////////////////////////////
    //create a help object to operate stroke        //
    //////////////////////////////////////////////////
    function create_stroke_op(drawing) {
        var strokeOp = {};
        strokeOp.drawing = drawing;
        strokeOp.setType = function (type, p) {
            if (type == 0) {
                this.drawing.ctx.setLineDash([]);
            } else if (type == 1) {
                this.drawing.ctx.setLineDash([this.drawing.ctx.lineWidth * 2, this.drawing.ctx.lineWidth]);
            } else {
                if (p == 1)
                    this.drawing.ctx.setLineDash([5, 15, 10]); //todo redefine the pattern style
                else if (p == 2)
                    this.drawing.ctx.setLineDash([5, 5, 0]);
                else if (p == 3)
                    this.drawing.ctx.setLineDash([15, 15, 10]);
                else if (p == 4)
                    this.drawing.ctx.setLineDash([5, 25, 10]);
                else
                    this.drawing.ctx.setLineDash([25, 15, 20]);
            }
        };

        strokeOp.setColor = function (color) {
            if (this.drawing.ctx)
                this.drawing.ctx.strokeStyle = pwg.drawing.formatARGB(color);
        };

        strokeOp.setWidth = function (width) {
            if (this.drawing.ctx)
                this.drawing.ctx.lineWidth = width;
        };
        strokeOp.setLineJoin = function (join) {

        };
        strokeOp.setInnerJoin = function (join) {

        };
        strokeOp.setMiterLimit = function (miterLimit) {

        };
        return strokeOp;
    }

    ////////////////////////////////////////////////////////////
    //create a help object to opereate context brush          //
    ////////////////////////////////////////////////////////////
    function create_brush_op(drawing) {
        var brushOp = {};
        brushOp.drawing = drawing;
        brushOp.brushType = 0;
        brushOp.color = 0xffffffff;
        brushOp.linearGradient = [];
        brushOp.hatchType = 0;
        brushOp.dirty = true;
        brushOp.setType = function (type, p) {
            this.brushType = type;
            this.dirty = true;
        };
        brushOp.setColor = function (c) {
            this.brushType = 0;
            var cc = formatARGB(c);
            this.color = cc;
            this.dirty = true;
        };
        brushOp.clearGradient = function () {
            while (this.linearGradient.length > 0)
                this.linearGradient.pop();
            this.dirty = true;
        };
        brushOp.addGradient = function (c1, x, y) {
            this.linearGradient.push([formatARGB(c1), x, y]);
            this.dirty = true;
        };
        brushOp.setHatchType = function (tex) {
            this.hatchType = tex;
            this.dirty = true;
        };
        return brushOp;
    }

    ///////////////////////////////////////////////////////////
    //help object to drawing anything in the pwg scene       //
    ///////////////////////////////////////////////////////////
    function ContextDrawing2D(context) {
        if (context)
            this.setContext(context);
        this.stroke = create_stroke_op(this);
        this.brush = create_brush_op(this);
        this._temp_matrix = new pwg.matrix();
        this._hatch_cache = {};
        var viewMatrix = null;
        this.default_paper_param = new paper.Base({
            offset: new paper.Point(0, 0),
            pixelRatio: 1, //pwg.DEVICE_PIXEL_RATIO,
            viewMatrix: viewMatrix,
            matrices: [new paper.Matrix()],
            updateMatrix: true
        });
        pwg.drawing.default_paper_param = this.default_paper_param;
    }

    ContextDrawing2D.prototype.constructor = ContextDrawing2D;

    ContextDrawing2D.prototype.setRenderContext2D = function (ctx) {
        var ratio = pwg.DEVICE_PIXEL_RATIO; //pwg.defaultValue(ctx.devicePixelRatio, pwg.DEVICE_PIXEL_RATIO ? pwg.DEVICE_PIXEL_RATIO : 1);
        this._base_xform = new pwg.matrix(ratio, 0, 0, ratio, 0, 0);
        this.ctx = ctx;
    };

    ContextDrawing2D.prototype.begin = function () {
        this.ctx.save();
    };

    ContextDrawing2D.prototype.end = function () {
        this.ctx.restore();
    };

    ContextDrawing2D.prototype.setTransform = function (a, b, c, d, e, f) {
        var m = this._temp_matrix;
        m.set(a, b, c, d, e, f);
        m.prepend(this._base_xform);
        this.ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    };

    ContextDrawing2D.prototype.setMatrix = function (m) {
        this.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    };

    ContextDrawing2D.prototype.resetTransform = function () {
        var m = this._temp_matrix;
        m.reset();
        m.prepend(this._base_xform);
        this.ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    };

    ContextDrawing2D.prototype.beginPath = function () {
        if (this.ctx)
            this.ctx.beginPath();
    };

    ContextDrawing2D.prototype.strokeRect = function (x0, y0, x1, y1) {
        if (this.ctx)
            this.ctx.strokeRect(x0, y0, x1, y1);
    };

    ContextDrawing2D.prototype.fillRect = function (x0, y0, x1, y1) {
        if (this.ctx)
            this.ctx.fillRect(x0, y0, x1, y1);
    };
    ContextDrawing2D.prototype.moveTo = function (x, y) {
        if (this.ctx)
            pwg.defined(y)?this.ctx.moveTo(x, y):this.ctx.moveTo(x.x,x.y);
    };
    ContextDrawing2D.prototype.lineTo = function (x, y) {
        if (this.ctx)
            pwg.defined(y)?this.ctx.lineTo(x, y):this.ctx.lineTo(x.x,x.y);
    };
    ContextDrawing2D.prototype.bezierCurveTo = function (fcp1x, cp1y, cp2x, cp2y, x, y) {
        if (this.ctx)
            this.ctx.bezierCurveTo(fcp1x, cp1y, cp2x, cp2y, x, y);
    };
    ContextDrawing2D.prototype.quadraticCurveTo = function (qcpx, qcpy, qx, qy) {
        if (this.ctx)
            this.ctx.quadraticCurveTo(qcpx, qcpy, qx, qy);
    };
    ContextDrawing2D.prototype.arc = function (x, y, r, sAngle, eAngle, radius, counterclockwise) {
        if (!radius) {
            sAngle *= (Math.PI / 180);
            eAngle *= (Math.PI / 180);
        }
        if (this.ctx)
            this.ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    };
    ContextDrawing2D.prototype.arcTo = function (x1, y1, x2, y2, r) {
        if (this.ctx)
            this.ctx.arcTo(x1, y1, x2, y2, r);
    };
    ContextDrawing2D.prototype.closePath = function () {
        if (this.ctx)
            this.ctx.closePath();
    };

    ContextDrawing2D.prototype.strokeExec = function () {
        if (this.ctx)
            this.ctx.stroke();
    };

    ContextDrawing2D.prototype._update_brush = function () {
        var brush = this.brush;
        if (brush.dirty) {
            if (brush.brushType == 0 || brush.brushType == 1) {
                this.ctx.fillStyle = brush.color;
            } else if (brush.brushType == 1) {
                this.ctx.fillStyle = brush.color;
            } else if (brush.brushType == 2) {
                //var src = "/resources/hatch_" + brush.hatchType + ".png";
                if (!this.hatchCache[brush.color]) {
                    var img = new Image();
                    img.src = nkJB.utils.ImageHelper.buildGridFillImage(brush.color);
                    this.hatchCache[brush.color] = this.ctx.createPattern(img, "repeat");
                }
                this.ctx.fillStyle = this.hatchCache[brush.color];
                return;
            } else if (brush.brushType == 3) {
                var x1 = brush.linearGradient[0][1];
                var y1 = brush.linearGradient[0][2];
                var x2 = brush.linearGradient[1][1];
                var y2 = brush.linearGradient[1][2];
                var grd = this.ctx.createLinearGradient(x1, y1, x2, y2);
                grd.addColorStop(0, brush.linearGradient[0][0]);
                grd.addColorStop(1, brush.linearGradient[1][0]);
                this.ctx.fillStyle = grd;
            } else if (brush.brushType == 4) {
                var x0 = brush.linearGradient[0][1],
                    y0 = brush.linearGradient[0][2];
                var r = brush.linearGradient[1][1] > brush.linearGradient[1][2] ? brush.linearGradient[1][1] : brush.linearGradient[1][2];
                var style = this.ctx.createRadialGradient(x0, y0, 0, x0, y0, r);
                style.addColorStop(0.0, brush.linearGradient[0][0]);
                style.addColorStop(1.0, brush.linearGradient[1][0]);
                this.ctx.fillStyle = style;
            }
            brush.dirty = false;
        }
    };

    ContextDrawing2D.prototype.fillExec = function () {
        if (this.ctx) {
            this._update_brush();
            this.ctx.fill();
        }
    };

    ContextDrawing2D.prototype.styleApply = function (style, matrix) {
        apply_style_to_context(style, matrix, this.ctx, this.default_paper_param, null);
    };

    ContextDrawing2D.prototype.setFont = function (fontName, size, bold, italic) {
        if (fontName == "") fontName = "sans-serif";
        var font = size + "px " + fontName;
        if (italic != undefined) {
            font = italic + " " + font;
        }
        if (bold != undefined) {
            font = bold + " " + font;
        }
        if (this.ctx) {
            this.ctx.font = font;
        }
    };

    ContextDrawing2D.prototype.measureText = function (text, pWidth, pHeight) {
        if (!this.ctx)
            return;
        var rc = this.ctx.measureText(text);
        return rc;
    };

    ContextDrawing2D.prototype.strokeText = function (text, x, y, v_align) {
        if (!this.ctx)
            return;

        var ob = this.ctx.textBaseline;
        if (v_align != undefined)
            this.ctx.textBaseline = v_align;
        else
            this.ctx.textBaseline = "middle";
        this.ctx.strokeText(text, x, y);
        this.ctx.textBaseline = ob;
    };

    ContextDrawing2D.prototype.fillText = function (text, x, y, v_align) {
        if (!this.ctx)
            return;

        this._update_brush();
        var ob = this.ctx.textBaseline;
        if (v_align != undefined)
            this.ctx.textBaseline = v_align;
        else
            this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, x, y);
        this.ctx.textBaseline = ob;
    };

    ContextDrawing2D.prototype.drawImage = function (image, x, y, w, h, updown) {
        this.ctx.drawImage(image, x, y, w, h);
    };
    //////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * drawIconLine in canvasOverlayer, can mutate input line data !
     * @param {*array typed line vertex.} line 
     * @param {*enable animation of draw arrow..} enableAni 
     */
    ContextDrawing2D.prototype.drawLineEx = function (line, style, icon) {
        if (!line || line.length < 2)
            return;
        var ctx = this.ctx;
        if (style)
            apply_style_to_context(style, null, ctx, null, null);
        else {
            style_ = {
                color: '#FDFDFD',
                lineDash: [],
                shadow: false,
                shadowBlur: 4,
                shadowColor: '#eee'
            };
            _icon_draw_set_line_style(ctx, style_);
        }
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        var i = 1;
        while (i < line.length) {
            var p = line[i];
            if (p.c && p.c == "b3") {
                var p1 = line[i];
                ctx.lineTo(line[i].x, line[i].y);
                var c = line[i + 1];
                var p2 = line[i + 2];
                ctx.bezierCurveTo(c.x, c.y, c.x, c.y, p2.x, p2.y);
                i += 3;
            } else {
                ctx.lineTo(line[i].x, line[i].y);
                i++;
            }
        }
        if (line.closed) {
            ctx.closePath();
        }
        ctx.stroke();

        if (style && style.hasFill()) {
            ctx.fill();
        }
        icon = icon ? icon : style.icon;
        if (icon)
            drawIcon4Line(ctx, line, icon);
    };

    ContextDrawing2D.prototype.drawEx = ContextDrawing2D.prototype.drawLineEx;

    function _icon_draw_set_line_style(ctx, style) {
        ctx.strokeStyle = style.color;
        ctx.setLineDash(style.lineDash);
        ctx.globalAlpha = 0.95;
        ctx.globalCompositeOperation = 'source-over';
        if (style.shadow === true) {
            ctx.shadowBlur = style.shadowBlur;
            ctx.shadowColor = style.shadowColor;
        } else {
            ctx.shadowBlur = 0;
        }
        // ctx.strokeStyle = 'green';
        ctx.lineCap = "round"; // square
        ctx.lineJoin = 'round'; // bevel
        ctx.lineWidth = 8;
    }

    /**
     * return function to be debounced.
     * @param fn {Function}
     * @param delay {Number}
     * @return {Function}
     */
    function debounce(fn, delay) {
        var timer;
        // timer is closure in memory.. returned function will be debounced..
        return function () {
            var context = this;
            var args = arguments;
            // clear the previous timer to prevent the function call.
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(context, args);
            }, delay);
        };
    }

    /**
     * draw Icons on segments (---) of one line.
     * @param {*} ctx 
     * @param {*} line 
     */
    function drawIcon4Line(ctx, line, icon) {
        if (line.length < 2)
            return;
        var aniOffset = 0.5;
        aniOffset = aniOffset < 1 ? aniOffset + 0.01 : 0.5;
        for (var i = 1, l = line.length; i < l; i++) {
            drawIcon4Segment(ctx, line[i - 1], line[i], aniOffset, icon);
        }
        if (line.closed) {
            drawIcon4Segment(ctx, line[line.length - 1], line[0], aniOffset, icon);
        }
    }

    // var debDrawIcon4Line = function () {};
    // if (util) {
    //     debDrawIcon4Line = util.debounce(drawIcon4Line, 100);
    // }

    /**
     * draw Icons on single segment (-) of line.
     * @param {*} ctx 
     * @param {*} startPoint 
     * @param {*} endPoint 
     * @param {*} aniOffset 
     */
    function drawIcon4Segment(ctx, startPoint, endPoint, aniOffset, iconImg) {
        generatePoints(startPoint, endPoint, 15, ctx, aniOffset, iconImg);
    }
    /**
     * Generate segment Icon points by given stepSize
     * @param {*} startP 
     * @param {*} endP 
     * @param {* stepSize of line Icon in screen pixel, default:30px } stepSize . 
     * @param {*} ctx 
     * @param {* icon offset on line, for eg: set 1 for offset by one stepSize. } aniOffset 
     * @param {* icon img to render alongsize line: Image } img 
     */
    function generatePoints(startP, endP, stepSize, ctx, aniOffset, iconImg) {
        // calc icon rotate by line segment direction.
        var fwd = endP.subtract(startP).normalize();
        var radA = fwd.angleInRadians;
        var dist = startP.getDistance(endP);
        var steps = dist / stepSize;

        var drawImg = (pX, pY) => {
            if (iconImg && ctx) {
                ctx.save();
                ctx.translate(pX, pY); // consider img position and imgWidth/Height.
                ctx.rotate(radA);
                ctx.drawImage(iconImg, -iconImg.width / 2, -iconImg.width / 2);
                ctx.restore();
            }
        };
        for (var s = aniOffset; s <= steps; s += 1) {
            var p = startP.add(fwd.multiply(stepSize * s));
            drawImg(p.x, p.y);
        }
    }

    function calcDist(startP, endP) {
        return Math.sqrt((endP[1] - startP[1]) ** 2 + (endP[0] - startP[0]) ** 2);
    }

    ////////////////////////////////////////////////////////////////////////////////
    function _draw_ui_handle_rect(drawing, p, size, ec, fc) {
        size = size / 2;
        var px = p.x,
            py = p.y;
        drawing.beginPath();
        drawing.moveTo(px - size, py - size);
        drawing.lineTo(px + size, py - size);
        drawing.lineTo(px + size, py + size);
        drawing.lineTo(px - size, py + size);
        drawing.closePath();
        drawing.brush.setColor(fc);
        drawing.brush.setType(1);
        drawing.fillExec();

        drawing.stroke.setType(1);
        drawing.stroke.setColor(ec);
        drawing.stroke.setWidth(1);
        drawing.strokeExec();
    }

    function _draw_ui_handle_diamond(drawing, p, size, ec, fc) {
        size = size / 2;
        var px = p.x,
            py = p.y;
        drawing.beginPath();
        drawing.moveTo(px - size, py);
        drawing.lineTo(px, py - size);
        drawing.lineTo(px + size, py);
        drawing.lineTo(px, py + size);
        drawing.closePath();
        drawing.brush.setColor(fc);
        drawing.brush.setType(1);
        drawing.fillExec();

        drawing.stroke.setType(1);
        drawing.stroke.setColor(ec);
        drawing.stroke.setWidth(1);
        drawing.strokeExec();
    }

    function _draw_ui_handle_circle(drawing, p, size, ec, fc) {
        size = size / 2;
        var px = p.x,
            py = p.y;
        drawing.beginPath();
        drawing.arc(px, py, size, 0, 360);
        drawing.closePath();
        drawing.brush.setColor(fc);
        drawing.brush.setType(1);
        drawing.fillExec();

        drawing.stroke.setType(1);
        drawing.stroke.setColor(ec);
        drawing.stroke.setWidth(1);
        drawing.strokeExec();
    }

    ContextDrawing2D.prototype.draw_ui_handle_rect = function (p, size, fc, ec) {
        _draw_ui_handle_rect(this, p, size, ec, fc);
    };

    ContextDrawing2D.prototype.draw_ui_handle_diamond = function (p, size, fc, ec) {
        _draw_ui_handle_diamond(this, p, size, ec, fc);
    };

    ContextDrawing2D.prototype.draw_ui_handle_circle = function (p, size, fc, ec) {
        _draw_ui_handle_circle(this, p, size, ec, fc);
    };

    function _execute_draw_local_ppe_action(drawing, action) {

    }

    function _execute_draw_global_ppe_action(drawing, action) {

    }

    ContextDrawing2D.prototype.execute = function (action) {
        switch (action.type) {
            case "ppe.local": {

            }
                break;
            case "ppe.action": {

            }
                break;
        }
    };
    pwg.ContextDrawing2D = ContextDrawing2D;
    that.ContextDrawing2D = ContextDrawing2D;
    ////////////////////////////////////////////////////////////////////////
    //import svg                                                          //
    ////////////////////////////////////////////////////////////////////////
    that.SVGCache = {};
    that.svg_hitbox_color = new paper.Color(0, 0, 0, 0.01);
    pwg.drawing.use_paper_svg_rastering = true;
    that.import_paper_svg_item = function (id, url, s, callback) {
        if (!id)
            id = url;

        function onload(loaded) {

            if (!pwg.drawing.use_paper_svg_rastering) {
                var bounds = loaded.bounds;
                bounds = bounds.scale(1.001);
                var hitbox = new paper.Shape.Rectangle(bounds);
                hitbox.fillColor = that.svg_hitbox_color;
                loaded.addChild(hitbox);
                var matrix = new pwg.matrix();
                matrix.scale(s, s);
                loaded.matrix = matrix;
            } else {
                var bounds = loaded.bounds;
                loaded = loaded.rasterize(600);
            }

            var cache = new paper.SymbolDefinition(loaded);
            that.SVGCache[id] = cache;
            that.SVGCache[url] = cache;
            if (callback) {
                callback(defn);
            }
        }
        if (!that.SVGCache[url]) {
            that.SVGCache[url] = "loading";
            paper.project.importSVG(url, onload);
            return "loading";
        } else {
            if (that.SVGCache[url] !== "loading") {
                if (callback)
                    callback(that.SVGCache[url]);
                return that.SVGCache[url];
            } else {
                return "loading";
            }
        }
    };

    ////////////////////////////////////////////////////////
    function using_paper_item(owner, id, inlineMatrix) {
        this.owner = owner;
        this.id = id;
        this._matrix = null;
        this.inlineMatrix = inlineMatrix;
        this._TRS = new pwg.matrix();
        this.url = null;
        this._svg = null;
    }
    using_paper_item._matrices = [new paper.Matrix()];
    using_paper_item.prototype.constructor = using_paper_item;
    pwg.defineClassProperty(using_paper_item, "matrix", {
        get: function () {
            return this._matrix;
        },
        set: function (m) {
            this._matrix = m;
            this.matrixDirty = true;
        }
    });
    pwg.defineClassProperty(using_paper_item, "bounds", {
        get: function () {
            this._confirm();
            return this._svg ? this._svg.bounds : "";
        }
    });
    using_paper_item.svg_view_matrix = new pwg.matrix().scale(2, 2);
    using_paper_item.prototype._update_matrix = function () {
        if (this.matrixDirty) {
            this._TRS.reset();
            if (this._matrix)
                this._TRS.set(this._matrix.values);
            if (this.inlineMatrix && !this.inlineMatrix.isIdentity())
                this._TRS = this._TRS.append(this.inlineMatrix);
            this._TRS.prepend(using_paper_item.svg_view_matrix);
            this.matrixDirty = false;
        }
    };
    using_paper_item.prototype.updateMatrixOnly = function (param) {
        this._confirm();
        if (!this._svg)
            return;
        this._update_matrix();
        this._svg.applyMatrix = false;
        this._svg.matrix = this._TRS;
        this._svg.updateMatrixOnly(param);
    };
    using_paper_item.prototype._confirm = function () {
        if (!this._svg) {
            var svg = that.SVGCache[this.url];
            if ((typeof (svg) != 'string'))
                this._svg = new paper.SymbolItem(svg);
        }
    };

    using_paper_item.prototype.draw = function (ctx, param) {
        this._confirm();
        if (!this._svg)
            return;
        this._update_matrix();
        this._svg.applyMatrix = false;
        this._svg.matrix = this._TRS;
        this._svg.draw(ctx, param);
    };

    using_paper_item.prototype.hitTest = function (px, param) {
        if (this._svg) {
            px = px.multiply(2);
            this._svg.applyMatrix = false;
            this._svg.matrix = this._TRS;
            this._svg.updateMatrixOnly(param);
            this.updateMatrixOnly(param);
            return this._svg.hitTest(px);
        } else {
            return null;
        }
    };

    that.using = function (owner, id, url) {
        var using = new using_paper_item(owner, id);
        url = url ? url : id;
        using.url = url;
        if (!that.SVGCache[url]) {
            that.import_paper_svg_item(url, null);
        }
        return using;
    };

    that.register_paper_svg = function (uri, svg) {
        that.SVGCache[uri] = new paper.SymbolDefinition(svg);
    };

    function create_paper_image_item(url) {
        var image = new Image();
        var _id = `pwg_svg_inline_image${create_paper_image_item.__image_id++}`;
        image.src = url;
        image.id = _id;
        var raster = new paper.Raster(image);
        //raster.image = image;
        return raster;
    }
    create_paper_image_item.__image_id = 0;
    that._register_paper_image_item = function (id, url) {
        var image = create_paper_image_item(url);
        that.register_paper_svg(id, image);
    };

    function __is_image_url__(d) {
        return (d.match(/\.(jpeg|jpg|gif|png)$/i) != null);
    }

    function __is_svg_url(d) {
        return (d.match(/\.svg$/i) != null);
    }

    function __is_svg_base64(d) {
        return d.indexof("data:image/svg+xml;base64") != -1;
    }

    function __is_image_base64(d) {
        return (d.match(/data:image\/(jpeg|jpg|gif|png)/) == 0);
    }

    function define(id, d, s) {
        if (typeof d == "string") {
            if (__is_image_url__(d) || __is_image_base64(d))
                pwg.drawing._register_paper_image_item(id, d);
            else if (__is_svg_url(d) || __is_svg_base64(d))
                pwg.drawing.import_paper_svg_item(id, d, s ? s : 1);
        } else if (d instanceof paper.Item) {
            pwg.drawing.register_paper_svg(id, d, s);
        }
    }
    that.define = define;

    that.__image_cache__ = {};
    function ImageDefine(id, src, size) {
        this.id = id;
        this.url = src;
        this._size = size;
        this._bounds = null;
        this._image = new Image();
        this._image.id = id;
        var that = this;
        this._image.onload = function (image) {
            if (typeof window!='undefined') {
                if (size) {
                    this.width =  size.width;
                    this.height = size.height;
                } else {
                    that._size = new pwg.size(this.width, this.height);
                }
            }
            else {
                that._image = image;
                that._size = new pwg.size(image.width, image.height);
            }
        };
        this._image.src = src;
    }
    ImageDefine.prototype.constructor = ImageDefine;
    ImageDefine.prototype.done = function (image) {
        this._image.done(image);
    };
    pwg.defineClassProperties(ImageDefine, {
        "image": {
            get: function () {
                return this._image;
            }
        },
        "size": {
            get: function () {
                return this._size;
            }
        },
        "bounds": {
            get: function () {
                if (this._bounds)
                    return this._bounds;
                var bx = new pwg.rectangle(-this._size.width / 2, -this._size.height / 2, this._size.width, this._size.height);
                this._bounds = bx;
                return bx;
            }
        }
    });

    function define_image(id, url, size) {
        if (!url)
            url = id;
        var image = new ImageDefine(id, url, size);
        that.__image_cache__[id] = image;
        if (url != id) {
            that.__image_cache__[id] = image;
        }
        return image;
    }
    function using_image_item(owner, id) {
        this.owner = owner;
        this.id = id;
        this._define = null;
        this.inlineMatrix = null;
        this._matrix = null;
        this._matrixDirty = true;
        this._M = new pwg.matrix();
        this._I = null;
    }
    using_image_item.prototype.constructor = using_image_item;
    using_image_item.prototype._confirm = function () {
        if (!this._define) {
            this._define = that.__image_cache__[this.url];
        }
    };
    using_image_item.prototype.updateMatrixOnly = function () {

        if (this._matrixDirty) {
            this._M.reset();
            this._M.scale(pwg.DEVICE_PIXEL_RATIO);
            if (this._matrix)
                this._M.append(this._matrix);
            if (this.inlineMatrix) {
                this._M = this._M.append(this.inlineMatrix);
            }
            this._I = this._M.inverted();
            this._matrixDirty = false;
        }
    };
    using_image_item.prototype.hitTest = function (px, param) {
        this.updateMatrixOnly();
        var pp = px.clone();
        pp.x *= pwg.DEVICE_PIXEL_RATIO; pp.y *= pwg.DEVICE_PIXEL_RATIO;
        pp = this._I.transform(pp);
        return this.bounds.contains(pp);
    };
    using_image_item.prototype.draw = function (ctx, param) {
        this._confirm();
        this.updateMatrixOnly();
        if (this._define) {
            ctx.save();
            var def = this._define;
            var size = def.size;
            var m = this._M;
            ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
            ctx.drawImage(def.image, -size.width / 2, -size.height / 2, size.width, size.height);
            ctx.restore();
        }
    };
    pwg.defineClassProperties(using_image_item, {
        "bounds": {
            get: function () {
                this._confirm();
                return this._define ? this._define.bounds : null;
            }
        },
        "matrix": {
            get: function () {
                return this._matrix;
            },
            set: function (m) {
                this._matrix = m;
                this._matrixDirty = true;
            }
        }
    });

    that.usingx = function (owner, id, url) {
        var using = new using_image_item(owner, id);
        url = url ? url : id;
        using.url = url;
        if (!that.__image_cache__[url]) {
            that.define(id, url);
        }
        return using;
    };
    that.requestx = function (id, src) {
        var imagex = that.__image_cache__[id];
        if (imagex) {
            console.log("imagex:",imagex.id,imagex.url);
            var im =imagex.image;
            createImageBitmap(im,0,0,im.width,im.height).then(image => {
                pwg.worker.postMessage({ name: "image-load", id: id, image: image }, [image]);
            });
        }
    };
    that.definex = define_image;
    that.define = that.definex;
    that.using = that.usingx;
};