if (typeof pwg == "undefined")
    pwg = {};
if (!pwg.cad) {
    pwg.cad = function () {

        function render_line_string(vs, context, trs, drawing, style, closed) {
            var cc = context;

            drawing.begin();
            drawing.resetTransform();
            var width = style.strokeWidth;
            if (Array.isArray(trs)) {
                drawing.setTransform(trs[0], trs[1], trs[2], trs[3], trs[4], trs[5]);
                style.strokeWidth /= Math.max(Math.abs(trs[0]), Math.abs(trs[1]), Math.abs(trs[2]), Math.abs(trs[3]));
                trs = null;
            }
            drawing.styleApply(style);

            drawing.beginPath();
            if (trs) {
                var p0 = trs.transform(vs[0]);
                p0 = cc.globalToPixel(p0);
                drawing.moveTo(p0.x, p0.y);
                for (var i = 1, length = vs.length; i < length; i++) {
                    p0 = trs.transform(vs[i]);
                    p0 = cc.globalToPixel(p0);
                    drawing.lineTo(p0.x, p0.y);
                }
            } else {
                drawing.moveTo(vs[0][0], vs[0][1]);
                for (var i = 1, length = vs.length; i < length; i++) {
                    drawing.lineTo(vs[i][0], vs[i][1]);
                }
            }
            if (closed)
                drawing.closePath();
            if (style.hasFill())
                drawing.ctx.fill();
            if (style.hasStroke())
                drawing.ctx.stroke();

            style.strokeWidth = width;
            drawing.end();
        };

        function render_geometry(geometry, context, trs, drawing, style) {
            style = geometry.style || style;
            if (geometry.type.toUpperCase() == "LINESTRING") {
                render_line_string(geometry.coordinates, context, trs, drawing, style);
            } else if (geometry.type.toUpperCase() == "POLYGON" || geometry.type.toUpperCase() == "MULTILINESTRING") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    render_line_string(geometry.coordinates[i], context, trs, drawing, style, geometry.type == "POLYGON");
                }
            } else if (geometry.type.toUpperCase() == "MULTIPOLYGON") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    var polygon = geometry.coordinates[i];
                    for (var j = 0; j < polygon.length; j++)
                        render_line_string(polygon[i], context, trs, drawing, style, true);
                }
            }
        };


        function render_geometries(context, trs, drawing, geomertries, style) {
            for (var i = 0, length = geomertries.length; i < length; i++) {
                render_geometry(geomertries[i], context, trs, drawing, style);
            }
        }

        function AffineSolver(X, Y, XP, YP) {
            var AtoF = [];
            AtoF[0] = (XP[1] * Y[0] - XP[2] * Y[0] - XP[0] * Y[1] + XP[2] * Y[1] + XP[0] * Y[2] - XP[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);

            AtoF[1] = (XP[1] * X[0] - XP[2] * X[0] - XP[0] * X[1] + XP[2] * X[1] + XP[0] * X[2] - XP[1] * X[2]) /
                (-X[1] * Y[0] + X[2] * Y[0] + X[0] * Y[1] - X[2] * Y[1] - X[0] * Y[2] + X[1] * Y[2]);

            AtoF[2] = (YP[1] * Y[0] - YP[2] * Y[0] - YP[0] * Y[1] + YP[2] * Y[1] + YP[0] * Y[2] - YP[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);

            AtoF[3] = (YP[1] * X[0] - YP[2] * X[0] - YP[0] * X[1] + YP[2] * X[1] + YP[0] * X[2] - YP[1] * X[2]) /
                (-X[1] * Y[0] + X[2] * Y[0] + X[0] * Y[1] - X[2] * Y[1] - X[0] * Y[2] + X[1] * Y[2]);

            AtoF[4] = (XP[2] * X[1] * Y[0] - XP[1] * X[2] * Y[0] - XP[2] * X[0] * Y[1] + XP[0] * X[2] * Y[1] +
                    XP[1] * X[0] * Y[2] - XP[0] * X[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);

            AtoF[5] = (YP[2] * X[1] * Y[0] - YP[1] * X[2] * Y[0] - YP[2] * X[0] * Y[1] + YP[0] * X[2] * Y[1] + YP[1] * X[0] * Y[2] - YP[0] * X[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);
            return AtoF;
        }

        function affineFrom3PS(p1, p2, p3, pp1, pp2, pp3) {
            var m = AffineSolver([p1.x, p2.x, p3.x], [p1.y, p2.y, p3.y], [pp1.x, pp2.x, pp3.x], [pp1.y, pp2.y, pp3.y])
            return [m[0], m[2], m[1], m[3], m[4], m[5]];
        }

        //////////////////////////////////////////////////////////////////

        function FrameCAD(container, id, mode) {
            pwg.super(this, pwg.Graphics, container, id);
            this.location_center = new pwg.AbsoluteLocation(this, "location.center", "global");
            this.location_top = new pwg.AbsoluteLocation(this, "location.top", "global");
            this.location_left = new pwg.AbsoluteLocation(this, "location.left", "global");
            this.location_bottom = new pwg.AbsoluteLocation(this, "location.bottom", "global");
            this.location_right = new pwg.AbsoluteLocation(this, "location.right", "global");
            this.locaiton_rotation = new pwg.AbsoluteLocation(this, "location.rotation", "global");

            this.location_lb = new pwg.AbsoluteLocation(this, "location.left-bottom", "global");
            this.location_rb = new pwg.AbsoluteLocation(this, "location.right-bottom", "global");
            this.location_rt = new pwg.AbsoluteLocation(this, "location.right-top", "global");
            this.location_lt = new pwg.AbsoluteLocation(this, "location.left-top", "global");


            this.handle_center = new pwg.UiHandle(this, "handle.move", "handle.center", "simple");
            this.handle_center.location = this.location_center;
            this.handle_top = new pwg.UiHandle(this, "handle.move", "handle.top", "simple");
            this.handle_top.location = this.location_top;
            this.handle_left = new pwg.UiHandle(this, "handle.move", "handle.left", "simple");
            this.handle_left.location = this.location_left;
            this.handle_bottom = new pwg.UiHandle(this, "handle.move", "handle.bottom", "simple");
            this.handle_bottom.location = this.location_bottom;
            this.handle_right = new pwg.UiHandle(this, "handle.move", "handle.right", "simple");
            this.handle_right.location = this.location_right;
            this.handle_rb = new pwg.UiHandle(this, "handle.move", "handle.rb", "simple");
            this.handle_rb.location = this.location_rb;
            this.handle_rotation = new pwg.UiHandle(this, "handle.rotation", "handle.rotation", "simple");
            this.handle_rotation.location = this.locaiton_rotation;

            this._frameTRS = new pwg.TRS();
            this._finalTRS = new pwg.TRS();;

            this.dataURL = "";
            this.graphics = null;
            this._offset0 = 0;
            this._size0 = 0;
            this._center = null;
            this._offset = new pwg.point(0, 0);
            this._size = new pwg.size(1, 1);
            this._scale = new pwg.point(1, 1);
            this._angle = 0;

            this._handles = [this.handle_center, this.handle_top, this.handle_left, this.handle_right, this.handle_bottom, this.handle_rb, this.handle_rotation];
            this._style = new paper.Style();
            this._style.strokeColor = 'red';
            this._style.strokeWidth = 1.0;
            this._style.fillColor = 'rgba(0,0,0,.01)';

            this._style_geometry_default = new paper.Style();
            this._style_geometry_default.strokeColor = 'yellow';
            this._style_geometry_default.strokeWidth = 1.0;
            this._style_geometry_default.fillColor = 'rgba(0,0,0,0.01)';
        }
        pwg.inherits(FrameCAD, pwg.Graphics);
        pwg.defineClassId(FrameCAD, "pwg.FrameCAD");

        FrameCAD.prototype.update = function () {
            this.location_center.update();
            this._center = this.location_center.global;
            var size = this._size;
            if (this.graphics)
                this._bounds = this.graphics.bounds ? this.graphics.bounds : this.graphics;
            else
                this._bounds = new pwg.rectangle(0, 0, size.width * 2, size.height * 2);
            this._offset0 = this._bounds.point;
            this._size0 = this._bounds.size;

            this._frameTRS.make(this._center, this._angle, 1);
            var trs = this._frameTRS;
            this.location_top.point = trs.transform(new pwg.point(0, size.height));
            this.location_top.update();
            this.location_left.point = trs.transform(new pwg.point(-size.width, 0));
            this.location_left.update();
            this.location_bottom.point = trs.transform(new pwg.point(0, -size.height));
            this.location_bottom.update();
            this.location_right.point = trs.transform(new pwg.point(size.width, 0));
            this.location_right.update();
            this.location_lb.point = trs.transform(new pwg.point(-size.width, -size.height));
            this.location_lb.update();
            this.location_rb.point = trs.transform(new pwg.point(size.width, -size.height));
            this.location_rb.update();
            this.location_rt.point = trs.transform(new pwg.point(size.width, size.height));
            this.location_rt.update();
            this.location_lt.point = trs.transform(new pwg.point(-size.width, size.height));
            this.location_lt.update();
            this.locaiton_rotation.point = trs.transform(new pwg.point(size.width * 1.05, 0));
            this.locaiton_rotation.update();

            this._scale = new pwg.point(size.width / this._size0.width * 2, size.height / this._size0.height * 2);
            this._finalTRS.make(this.location_lb.point, this._angle, this._scale, this._offset0);
            if (this.graphics && this.graphics.geomertries && !this.graphics.offset0) {
                this.graphics.offset0 = true;
            }
            this._vs = [this.location_lb.pixel, this.location_rb.pixel, this.location_rt.pixel, this.location_lt.pixel]
        }

        FrameCAD.prototype._do_ui_handle_update = function (handle, e) {
            if (handle == this.handle_center) {
                this.location_center.set(e);
                return true;
            } else if (handle == this.handle_left || handle == this.handle_right) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.width = Math.abs(p.x);
                return true;
            } else if (handle == this.handle_top || handle == this.handle_bottom) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.height = Math.abs(p.y);
                return true;
            } else if (handle == this.handle_rb) {
                var p = this._frameTRS.I.transform(e.global);
                var size = this._size;
                var sizeP = new pwg.point(size.width, size.height);
                sizeP = sizeP.normalize();
                sizeP = sizeP.multiply(p.length);
                this._size.width = sizeP.x;
                this._size.height = sizeP.y;
                return true;
            } else if (handle == this.handle_rotation) {
                var pp = e.global.subtract(this._center);
                this._angle = pp.getAngle();
                return true;
            } else
                return false;
        };

        FrameCAD.prototype.hitTest = function (e, options) {
            var p = e.global;
            p = this._frameTRS.I.transform(p);
            if (p.x >= -this._size.width && p.y >= -this._size.height && p.x < this._size.width && p.y < this._size.height) {
                pwg.cad.currentFrame = this;
                return {
                    succeed: true,
                    distance: 0,
                    object: this
                };
            } else
                return null;
        };


        FrameCAD.prototype.render = function (drawing, pass) {
            if (pass == "entity" || pass == "mini") { //TODO:prepare
                var vs = this._vs;
                var cc = this.getContainerContext();

                drawing.begin();
                drawing.resetTransform();
                drawing.styleApply(this._style);

                drawing.beginPath();
                drawing.moveTo(vs[0]);
                drawing.lineTo(vs[1]);
                drawing.lineTo(vs[2]);
                drawing.lineTo(vs[3]);
                drawing.closePath();

                if (this._style.hasFill())
                    drawing.ctx.fill();
                if (this._style.hasStroke())
                    drawing.ctx.stroke();
                drawing.end();

                if (this.graphics && this.graphics.geometries) {
                    var geometries = this.graphics.geometries;
                    if (!this.graphics.offset0) {
                        var offset0 = this._offset0;

                        function tx(coords) {
                            for (var i = 0, length = coords.length; i < length; i++) {
                                coords[i][0] -= offset0.x;
                                coords[i][1] -= offset0.y;
                            }
                        }
                        var transform = {
                            transformCoordinates: tx
                        };
                        for (var i = 0; i < geometries.length; i++) {
                            transformGeometry(geometries[i], transform);
                        }
                        this.graphics.offset0 = true;
                    }
                    var trs = new pwg.TRS();
                    trs.make(this._offset, this._angle, this._scale);
                    var p0 = new pwg.point(0, 0);
                    var pp0 = cc.globalToPixel(trs.transform(p0));
                    var p1 = p0.add(this._size0.width, 0);
                    var pp1 = cc.globalToPixel(trs.transform(p1));
                    var p2 = p0.add(this._size0.width / 2, this._size0.height);
                    var pp2 = cc.globalToPixel(trs.transform(p2));
                    trs = affineFrom3PS(p0, p1, p2, pp0, pp1, pp2);
                    render_geometries(cc, trs, drawing, geometries, this._style_geometry_default);
                }
            }
        };
        pwg.defineClassProperties(FrameCAD, {
            // "point": {
            //     get: function () {
            //         return this._min_location;
            //     }
            // },
            // "size": {
            //     get: function () {
            //         return this._size;
            //     },
            //     set: function (sz) {
            //         this._size = new pwg.size(sz);
            //     }

            // },
            // "min": {
            //     get: function () {
            //         return this._min_location;
            //     }
            // },
            // "max": {
            //     get: function () {
            //         return this._max_location;
            //     }
            // },
            "mode": {
                get: function () {
                    return this._mode;
                }
            }
        });

        FrameCAD.prototype.__save__ = function (json) {
            json = pwg.Graphics.prototype.__save__.call(this, json);
            //json.location = this._min_location.__save__();
            // json.size = pwg.json.formats[pwg.size].save(this._size);
            // json.style = pwg.json.formats[pwg.style].save(this._style);
            json.__json_creator__ = "pwg.FrameCAD.creator";
            return json;
        };

        FrameCAD.prototype.__load__ = function (json, context) {
            pwg.Graphics.prototype.__load__.call(this, json, context);
            // this._min_location.__load__(json.location, context);
            // pwg.json.formats[pwg.size].load(json.size, this._size);
            // pwg.json.formats[pwg.style].load(json.style, this._style);
        };

        FrameCAD.prototype.transformCoordinates = function (coordinates) {
            var cc = this.getContainerContext();
            var trs = this._finalTRS;
            for (var i = 0; i < coordinates.length; i++) {
                var pp = coordinates[i];
                var p0 = trs.transform(pp);
                p0 = cc.globalToLonlat(p0);
                pp[0] = p0.x;
                pp[1] = p0.y;
            }
            return coordinates;
        }
        FrameCAD.prototype.transformData = function () {
            var trs = this._finalTRS;
            var p0 = this._offset0;
            var size0 = this._size0;
            var pp0 = trs.transform(p0);
            var p1 = p0.add(size0.width, 0);
            var pp1 = trs.transform(p1);
            var p2 = p0.add(size0.width, size0.height);
            var pp2 = trs.transform(p2);
            var p3 = p0.add(0, size0.height);
            var pp3 = trs.transform(p3);

            return ([
                p0.x, p0.y, pp0.x, pp0.y,
                p1.x, p1.y, pp1.x, pp1.y,
                p2.x, p2.y, pp2.x, pp2.y,
                p3.x, p3.y, pp3.x, pp3.y
            ]);
        }

        pwg.json.registerCreator("pwg.FrameCAD.creator", function (container, id, json) {
            return new FrameCAD(container, id, json.lxmode, json.szmode);
        });

        pwg.registerClass(FrameCAD);
        pwg.FrameCAD = FrameCAD;

        ///////////////////////////////////////////////////////////////
        function FrameCADBuild(mode) {
            pwg.super(this, pwg.BaseBuild, "simple");
            this._mode = mode;
        }
        pwg.inherits(FrameCADBuild, pwg.BaseBuild);
        FrameCADBuild.prototype.update = function (e, action) {
            if (action == "down") {
                if (this._creating == null) {
                    this._creating = this._context.container.createGraphics(FrameCAD.classid, "local", this._mode);
                    this.point0 = e.global;
                    this._creating.location_center.set(e);
                    this._creating._size = new pwg.size(0, 0);
                    this._creating._style.strokeColor = 'red';
                    this._creating._style.strokeWidth = 2;
                    this._creating._style.dasharray = [10, 4, 10, 4];
                    //this._creating.graphics = new pwg.rectangle(0, 0, 1, 1);
                    this._creating.update();
                }
                return true;
            } else if (action == "move") {
                var creating = this._creating;
                if (creating) {
                    var size = e.global.subtract(this.point0);
                    var center = this.point0.add(e.global).divide(2);
                    size = size.divide(2);
                    this._creating.location_center.point = center;
                    this._creating._size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    //this._creating.update();
                    return true;
                }
            } else if (action == "up" || action == "post") {
                var creating = this._creating;
                if (creating) {
                    creating._style.strokeColor = 'red';
                    creating._style.strokeWidth = 2;
                    creating._style.dasharray = [];

                    var size = e.global.subtract(this.point0);
                    var center = this.point0.add(e.global).divide(2);
                    size = size.divide(2);
                    this._creating.location_center.point = center;
                    this._creating._size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    //this._creating.update();
                    this.post();
                }
            }
        };
        FrameCADBuild.prototype.post = function () {
            if (this._creating) {
                pwg.cad.currentFrame = this._creating;
                this._creating.graphics = pwg.cad.currentGraphics;
                this._context.container.addChild(this._creating);
                this._creating = null;
            }
        };
        FrameCADBuild.prototype.cancel = function () {
            this._creating = null;
        };
        FrameCADBuild.prototype.getLocationMode = function () {
            return "joint";
        };
        FrameCADBuild.prototype.render = function (context) {
            var drawing = context.drawing;
            if (this._creating) {
                this._creating.update();
                this._creating.render(drawing, "entity");
            }
        };
        pwg.graphics.registerBuild("FrameCAD", new FrameCADBuild("global"));

        ///////////////////////////////////////////////////////////////////////////
        function FrameCADL(container, id, mode) {
            pwg.super(this, pwg.Graphics, container, id);
            this.location_offset = new pwg.AbsoluteLocation(this, "location.offset", "global");
            this.location_center = new pwg.AbsoluteLocation(this, "location.center", "global");
            this.location_top = new pwg.AbsoluteLocation(this, "location.top", "global");
            this.location_left = new pwg.AbsoluteLocation(this, "location.left", "global");
            this.location_bottom = new pwg.AbsoluteLocation(this, "location.bottom", "global");
            this.location_right = new pwg.AbsoluteLocation(this, "location.right", "global");
            this.locaiton_rotation = new pwg.AbsoluteLocation(this, "location.rotation", "global");
            this.locaiton_rotation2 = new pwg.AbsoluteLocation(this, "location.rotation2", "global");

            this.location_lb = new pwg.AbsoluteLocation(this, "location.left-bottom", "global");
            this.location_rb = new pwg.AbsoluteLocation(this, "location.right-bottom", "global");
            this.location_rt = new pwg.AbsoluteLocation(this, "location.right-top", "global");
            this.location_lt = new pwg.AbsoluteLocation(this, "location.left-top", "global");

            this.handle_offset = new pwg.UiHandle(this, "handle.move", "handle.offset", "simple");
            this.handle_offset.location = this.location_offset;

            this.handle_center = new pwg.UiHandle(this, "handle.move", "handle.center", "simple");
            this.handle_center.location = this.location_center;

            this.handle_top = new pwg.UiHandle(this, "handle.move", "handle.top", "simple");
            this.handle_top.location = this.location_top;
            this.handle_left = new pwg.UiHandle(this, "handle.move", "handle.left", "simple");
            this.handle_left.location = this.location_left;
            this.handle_bottom = new pwg.UiHandle(this, "handle.move", "handle.bottom", "simple");
            this.handle_bottom.location = this.location_bottom;
            this.handle_right = new pwg.UiHandle(this, "handle.move", "handle.right", "simple");
            this.handle_right.location = this.location_right;

            this.handle_rt = new pwg.UiHandle(this, "handle.move", "handle.rt", "simple");
            this.handle_rt.location = this.location_rt;
            this.handle_rb = new pwg.UiHandle(this, "handle.move", "handle.rb", "simple");
            this.handle_rb.location = this.location_rb;
            this.handle_lt = new pwg.UiHandle(this, "handle.move", "handle.lt", "simple");
            this.handle_lt.location = this.location_lt;

            this.handle_rotation = new pwg.UiHandle(this, "handle.rotation", "handle.rotation", "simple");
            this.handle_rotation.location = this.locaiton_rotation;
            this.handle_rotation2 = new pwg.UiHandle(this, "handle.rotation", "handle.rotation2", "simple");
            this.handle_rotation2.location = this.locaiton_rotation2;


            this._frameTRS = new pwg.TRS();
            this._finalTRS = new pwg.TRS();;

            this.dataURL = "";
            this.graphics = null;
            this._offset0 = 0;
            this._size0 = 0;
            this._offset = new pwg.point(0, 0);
            this._size = new pwg.size(1, 1);
            this._scale = new pwg.point(1, 1);
            this._angle = 0;

            this._handles = [this.handle_offset, this.handle_center, this.handle_top, this.handle_right, this.handle_left, this.handle_bottom, this.handle_rt, this.handle_rb, this.handle_lt, this.handle_rotation, this.handle_rotation2];
            this._style = new paper.Style();
            this._style.strokeColor = 'red';
            this._style.strokeWidth = 1.0;
            this._style.fillColor = 'rgba(0,0,0,.01)';

            this._style_geometry_default = new paper.Style();
            this._style_geometry_default.strokeColor = 'yellow';
            this._style_geometry_default.strokeWidth = 1.0;
            this._style_geometry_default.fillColor = 'rgba(0,0,0,0.01)';
        }
        pwg.inherits(FrameCADL, pwg.Graphics);
        pwg.defineClassId(FrameCADL, "pwg.FrameCADL");

        FrameCADL.prototype.update = function () {
            this.location_offset.update();
            this._offset = this.location_offset.global;
            var size = this._size;
            if (this.graphics)
                this._bounds = this.graphics.bounds ? this.graphics.bounds : this.graphics;
            else
                this._bounds = new pwg.rectangle(0, 0, size.width * 2, size.height * 2);
            this._offset0 = this._bounds.point;
            this._size0 = this._bounds.size;

            this._frameTRS.make(this._offset, this._angle, 1);
            var trs = this._frameTRS;
            this.location_top.point = trs.transform(new pwg.point(size.width / 2, size.height));
            this.location_top.update();
            this.location_left.point = trs.transform(new pwg.point(0, size.height / 2));
            this.location_left.update();
            this.location_bottom.point = trs.transform(new pwg.point(size.width / 2, 0));
            this.location_bottom.update();
            this.location_right.point = trs.transform(new pwg.point(size.width, size.height / 2));
            this.location_right.update();

            this.location_center.point = trs.transform(new pwg.point(size.width / 2, size.height / 2));
            this.location_center.update();

            this.location_lb = this.location_offset;

            this.location_rb.point = trs.transform(new pwg.point(size.width, 0));
            this.location_rb.update();
            this.location_rt.point = trs.transform(new pwg.point(size.width, size.height));
            this.location_rt.update();
            this.location_lt.point = trs.transform(new pwg.point(0, size.height));
            this.location_lt.update();

            this.locaiton_rotation.point = trs.transform(new pwg.point(size.width * 1.05, 0));
            this.locaiton_rotation.update();
            this.locaiton_rotation2.point = trs.transform(new pwg.point(size.width * 1.05, size.height / 2));
            this.locaiton_rotation2.update();

            this._scale = new pwg.point(size.width / this._size0.width, size.height / this._size0.height);
            this._finalTRS.make(this.location_lb.point, this._angle, this._scale, this._offset0);
            this._vs = [this.location_lb.pixel, this.location_rb.pixel, this.location_rt.pixel, this.location_lt.pixel]
        }
        const size_ratio_reserved = true;
        FrameCADL.prototype._do_ui_handle_update = function (handle, e) {
            if (handle == this.handle_offset) {
                // this.location_offset.set(e);
                // return true;
                if (size_ratio_reserved) {
                    var p0 = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeO = new pwg.point(size.width, size.height);
                    var p = sizeO.subtract(p0);
                    var sizeN = sizeO.normalize();
                    var sizeA = sizeN.multiply(p.length);
                    this._size = new pwg.size(sizeA.x, sizeA.y);
                    var sizeB = sizeN.multiply(sizeO.length - p.length);
                    var offset = this._frameTRS.M.transform(sizeB);
                    this.location_offset.point = offset;
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    //sizeP = sizeP.normalize();
                    //sizeP = sizeP.multiply(p.length);
                    this._size = size.subtract(p);
                    this.location_offset.set(e);
                }
                return true;
            } else if (handle == this.handle_center) {
                var pc = this._frameTRS.M.transform(new pwg.point(this._size.width / 2, this._size.height / 2));
                var po = this._frameTRS.M.transform(new pwg.point(0, 0));
                var dp = po.subtract(pc);
                var offset = e.global.add(dp);
                this.location_offset.point = offset;
                return true;
            } else if (handle == this.handle_right) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.width = Math.abs(p.x);
                return true;
            } else if (handle == this.handle_left) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.width -= p.x; //Math.abs(p.x);
                p = this._frameTRS.M.transform(new pwg.point(-p.x, 0));
                p = p.subtract(this._offset);
                p = this._offset.subtract(p);
                this.location_offset.point = p;
                return true;
            } else if (handle == this.handle_bottom) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.height -= p.y; //Math.abs(p.x);
                p = this._frameTRS.M.transform(new pwg.point(0, -p.y));
                p = p.subtract(this._offset);
                p = this._offset.subtract(p);
                this.location_offset.point = p;
                return true;
            } else if (handle == this.handle_top) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.height = Math.abs(p.y);
                return true;
            } else if (handle == this.handle_rt) {
                if (size_ratio_reserved) {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeP = new pwg.point(size.width, size.height);
                    sizeP = sizeP.normalize();
                    sizeP = sizeP.multiply(p.length);
                    this._size.width = sizeP.x;
                    this._size.height = sizeP.y;
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    this._size.width = p.x;
                    this._size.height = p.y;
                }
                return true;
            } else if (handle == this.handle_rb) {
                if (size_ratio_reserved) {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var pp = new pwg.point(p.x, size.height - p.y);
                    var sizeO = new pwg.point(size.width, size.height);
                    var sizeA = sizeO.normalize().multiply(pp.length);
                    this._size = new pwg.size(sizeA.x, sizeA.y);
                    var offset = new pwg.point(0, size.height - sizeA.y);
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeP = new pwg.point(p.x, size.height - p.y);
                    var offset = new pwg.point(0, p.y);
                    //offset = this._frameTRS.M.transform(offset);
                    this._size.width = sizeP.x;
                    this._size.height = sizeP.y;
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                }
                return true;
            } else if (handle == this.handle_lt) {
                if (size_ratio_reserved) {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var pp = new pwg.point(size.width - p.x, p.y);
                    var sizeO = new pwg.point(size.width, size.height);
                    var sizeA = sizeO.normalize().multiply(pp.length);
                    this._size = new pwg.size(sizeA.x, sizeA.y);
                    var offset = new pwg.point(size.width - sizeA.x, 0);
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeP = new pwg.point(size.width - p.x, p.y);
                    var offset = new pwg.point(p.x, 0);
                    this._size.width = sizeP.x;
                    this._size.height = sizeP.y;
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                }
                return true;
            } else if (handle == this.handle_rotation) {
                var pp = e.global.subtract(this._offset);
                this._angle = pp.getAngle();
                return true;
            } else if (handle == this.handle_rotation2) {
                var pp = e.global.subtract(this.location_center.point);
                this._angle = pp.getAngle();
                var tmpTRS = new pwg.TRS();
                tmpTRS.make(this.location_center.point, this._angle, 1);
                var pp = tmpTRS.M.transform(new pwg.point(-this._size.width / 2, -this._size.height / 2));
                this.location_offset.point = pp;
                return true;
            } else
                return false;
        };

        FrameCADL.prototype.hitTest = function (e, options) {
            var p = e.global;
            p = this._frameTRS.I.transform(p);
            if (p.x >= 0 && p.y >= 0 && p.x < this._size.width && p.y < this._size.height) {
                pwg.cad.currentFrame = this;
                return {
                    succeed: true,
                    distance: 0,
                    object: this
                };
            } else
                return null;
        };
        pwg.cad.offset_auto_remove = true;
        pwg.cad.use_h5_transform = true;

        FrameCADL.prototype.render = function (drawing, pass) {
            if (pass == "entity" || pass == "mini") { //TODO:prepare
                var vs = this._vs;
                var cc = this.getContainerContext();

                drawing.begin();
                drawing.resetTransform();
                drawing.styleApply(this._style);

                drawing.beginPath();
                drawing.moveTo(vs[0]);
                drawing.lineTo(vs[1]);
                drawing.lineTo(vs[2]);
                drawing.lineTo(vs[3]);
                drawing.closePath();

                if (this._style.hasFill())
                    drawing.ctx.fill();
                if (this._style.hasStroke())
                    drawing.ctx.stroke();
                drawing.end();

                if (this.graphics && this.graphics.geometries) {
                    var geometries = this.graphics.geometries;
                    if (!this.graphics.offset0 && pwg.cad.offset_auto_remove) {
                        var offset0 = this._offset0;

                        function tx(coords) {
                            for (var i = 0, length = coords.length; i < length; i++) {
                                coords[i][0] -= offset0.x;
                                coords[i][1] -= offset0.y;
                            }
                        }
                        var transform = {
                            transformCoordinates: tx
                        };
                        for (var i = 0; i < geometries.length; i++) {
                            transformGeometry(geometries[i], transform);
                        }
                        this.graphics.offset0 = true;
                    }
                    var trs;
                    if (pwg.cad.offset_auto_remove) {
                        trs = new pwg.TRS();
                        trs.make(this._offset, this._angle, this._scale);
                    } else {
                        trs = this._finalTRS;
                    }
                    var p0 = new pwg.point(0, 0);
                    var pp0 = cc.globalToPixel(trs.transform(p0));
                    var p1 = p0.add(this._size0.width, 0);
                    var pp1 = cc.globalToPixel(trs.transform(p1));
                    var p2 = p0.add(this._size0.width / 2, this._size0.height);
                    var pp2 = cc.globalToPixel(trs.transform(p2));
                    if (pwg.cad.use_h5_transform)
                        trs = affineFrom3PS(p0, p1, p2, pp0, pp1, pp2);
                    render_geometries(cc, trs, drawing, geometries, this._style_geometry_default);
                }
            }
        };
        pwg.defineClassProperties(FrameCADL, {
            "offset": {
                get: function () {
                    return this.location_offset.point;
                },
                set: function (offset) {
                    this.location_offset.point = offset;
                }
            },
            "size": {
                get: function () {
                    return this._size;
                },
                set: function (sz) {
                    this._size = new pwg.size(sz);
                }
            },

            "angle": {
                get: function () {
                    return this._angle;
                },

                set: function (a) {
                    this._angle = a;
                },
            },
            "mode": {
                get: function () {
                    return this._mode;
                }
            }
        });

        FrameCADL.prototype.__save__ = function (json) {
            json = pwg.Graphics.prototype.__save__.call(this, json);
            //json.location = this._min_location.__save__();
            // json.size = pwg.json.formats[pwg.size].save(this._size);
            // json.style = pwg.json.formats[pwg.style].save(this._style);
            json.__json_creator__ = "pwg.FrameCADL.creator";
            return json;
        };

        FrameCADL.prototype.__load__ = function (json, context) {
            pwg.Graphics.prototype.__load__.call(this, json, context);
            // this._min_location.__load__(json.location, context);
            // pwg.json.formats[pwg.size].load(json.size, this._size);
            // pwg.json.formats[pwg.style].load(json.style, this._style);
        };

        FrameCADL.prototype.transformCoordinates = function (coordinates) {
            var cc = this.getContainerContext();
            var trs = this._finalTRS;
            for (var i = 0; i < coordinates.length; i++) {
                var pp = coordinates[i];
                var p0 = trs.transform(pp);
                p0 = cc.globalToLonlat(p0);
                pp[0] = p0.x;
                pp[1] = p0.y;
            }
            return coordinates;
        }
        FrameCADL.prototype.transformData = function () {
            var trs = this._finalTRS;
            var p0 = this._offset0;
            var size0 = this._size0;
            var pp0 = trs.transform(p0);
            var p1 = p0.add(size0.width, 0);
            var pp1 = trs.transform(p1);
            var p2 = p0.add(size0.width, size0.height);
            var pp2 = trs.transform(p2);
            var p3 = p0.add(0, size0.height);
            var pp3 = trs.transform(p3);

            return ([
                p0.x, p0.y, pp0.x, pp0.y,
                p1.x, p1.y, pp1.x, pp1.y,
                p2.x, p2.y, pp2.x, pp2.y,
                p3.x, p3.y, pp3.x, pp3.y
            ]);
        }

        pwg.json.registerCreator("pwg.FrameCADL.creator", function (container, id, json) {
            return new FrameCADL(container, id, json.lxmode, json.szmode);
        });

        pwg.registerClass(FrameCADL);
        pwg.FrameCADL = FrameCADL;

        ///////////////////////////////////////////////////////////////
        function FrameCADLBuild(mode) {
            pwg.super(this, pwg.BaseBuild, "simple");
            this._mode = mode;
        }
        pwg.inherits(FrameCADLBuild, pwg.BaseBuild);
        FrameCADLBuild.prototype.update = function (e, action) {
            if (action == "down") {
                if (this._creating == null) {
                    this._creating = this._context.container.createGraphics(FrameCADL.classid, "local", this._mode);
                    this.point0 = e.global;
                    this._creating.location_offset.set(e);
                    this._creating._size = new pwg.size(0, 0);
                    this._creating._style.strokeColor = 'red';
                    this._creating._style.strokeWidth = 2;
                    this._creating._style.dasharray = [10, 4, 10, 4];
                    //this._creating.graphics = new pwg.rectangle(0, 0, 1, 1);
                    this._creating.update();
                }
                return true;
            } else if (action == "move") {
                var creating = this._creating;
                if (creating) {
                    var nowp = e.global;
                    var size = nowp.subtract(this.point0);
                    size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    var offset = new pwg.point(Math.min(this.point0.x, nowp.x), Math.min(this.point0.y, nowp.y));
                    this._creating.location_offset.point = offset;
                    this._creating._size = size;
                    this._creating.update();
                    return true;
                }
            } else if (action == "up" || action == "post") {
                var creating = this._creating;
                if (creating) {
                    creating._style.strokeColor = 'red';
                    creating._style.strokeWidth = 2;
                    creating._style.dasharray = [];

                    var nowp = e.global;
                    var size = nowp.subtract(this.point0);
                    size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    var offset = new pwg.point(Math.min(this.point0.x, nowp.x), Math.min(this.point0.y, nowp.y));
                    this._creating.location_offset.point = offset;
                    this._creating._size = size;
                    this.post();
                }
            }
        };
        FrameCADLBuild.prototype.post = function () {
            if (this._creating) {
                pwg.cad.currentFrame = this._creating;
                this._creating.graphics = pwg.cad.currentGraphics;
                this._context.container.addChild(this._creating);
                this._creating = null;
            }
        };
        FrameCADLBuild.prototype.cancel = function () {
            this._creating = null;
        };
        FrameCADLBuild.prototype.getLocationMode = function () {
            return "joint";
        };
        FrameCADLBuild.prototype.render = function (context) {
            var drawing = context.drawing;
            if (this._creating) {
                this._creating.update();
                this._creating.render(drawing, "entity");
            }
        };
        pwg.graphics.registerBuild("FrameCADL", new FrameCADLBuild("global"));

        function OutlinesFind() {
            this.outlines = [];
            this.insertLine = function (line) {
                var outlines = this.outlines;
                if (outlines.length < 4) {
                    outlines.push(line);
                } else {
                    for (var i = 0; i < 4; i++) {
                        if (line.length > outlines[i].length) {
                            line1 = outlines[i];
                            outlines[i] = line;
                            line = line1;
                        }
                    }
                }
            }
            this.insertGeometry = function (geometry) {
                var points = null;
                if (geometry.type == "LineString")
                    points = geometry.coordinates;
                if (geometry.type == "Polygon")
                    points = geometry.coordinates[0];
                if (points.length < 6) {
                    var p1 = points[0];
                    var p2 = points[1];
                    var E = 0.0001;
                    if (Math.abs(p1[0] - p2[0]) < E || Math.abs(p1[1] - p2[1]) < E) {
                        this.insertLine(new pwg.line(p1[0], p1[1], p2[0], p2[1]));
                    }

                    if (points.length > 2) {
                        p1 = points[1];
                        p2 = points[2];
                        if (Math.abs(p1[0] - p2[0]) < E || Math.abs(p1[1] - p2[1]) < E) {
                            this.insertLine(new pwg.line(p1[0], p1[1], p2[0], p2[1]));
                        }
                    }
                }
            }
            this.bounds = function () {
                var outlines = this.outlines;
                var l = outlines[0];
                var rc = new pwg.rectangle(l.point, new pwg.size(1, 1));
                rc = rc.include(l.point.add(l.vector));
                for (var i = 1; i < this.outlines.length; i++) {
                    var l = outlines[i];
                    rc = rc.include(l.point);
                    rc = rc.include(l.point.add(l.vector));
                }
                return rc;
            }
        }

        pwg.cad.OutlinesFind = OutlinesFind;

        function transformGeometry(geometry, transform) {
            if (geometry.type.toUpperCase() == "LINESTRING") {
                transform.transformCoordinates(geometry.coordinates);
            } else if (geometry.type.toUpperCase() == "POLYGON" || geometry.type.toUpperCase() == "MULTILINESTRING") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    transform.transformCoordinates(geometry.coordinates[i]);
                }
            } else if (geometry.type.toUpperCase() == "MULTIPOLYGON") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    var polygon = geometry.coordinates[i];
                    for (var j = 0; j < polygon.length; j++)
                        transform.transformCoordinates(polygon[j])
                }
            }
        }
        pwg.cad.transformGeometry = transformGeometry;
        pwg.cad.createFrameL=function(container,id,offset,angle,size,graphics)
        {
            var cad = new pwg.FrameCADL(container,id,"global");
            cad.offset =offset;
            cad.size = size;
            cad.angle = angle;
            cad.graphics = graphics;
            return cad;
        }
    }
}