if (typeof pwg == "undefined")
    pwg = {};
pwg.simplePoint = function () {
    /*
 
    */
    function SimplePoint(container, id, options) {
        var icon = options.icon;
        icon = typeof icon == "string" ? pwg.drawing.using(this, id, icon) : icon;

        var bounds, inlineMatrix;
        if (options.bounds) {
            bounds = options.bounds;
            inlineMatrix = pwg.utils.build_icon_inline_matrix(options.bounds, icon.bounds);
        }
        else {
            var inlineTRS = new pwg.TRS();
            bounds = icon.bounds;
            inlineTRS.make(bounds.center.multiply(-1), 0, 1, bounds.center);
            inlineMatrix = inlineTRS.M;
            bounds = new pwg.rectangle(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        }
        icon.inlineMatrix = inlineMatrix;
        this._icon = icon;
        this.xdata = options.xdata;
        bounds = new pwg.rect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        var pivot = {
            name: "default",
            point: new pwg.point(0, 0),
            rotate0: new pwg.point(0, bounds.height / 2),
            sizeA: new pwg.point(bounds.width / 2, bounds.height / 2),
            sizeB: new pwg.point(bounds.width / 2, 0),
            location: "joint"
        };
        pwg.super(this, pwg.PointGraphics, container, id, bounds, [pivot]);
        // 只保留中间的捕捉点（_jointC）
        this._jointC = new pwg.AbsoluteLocation(this, "joint-C", "pixel");
        this._jointC.joint = new pwg.Joint("point");
        this._jointC._counter = 0;

        // 将_joints数组只包含中间的捕捉点
        this._joints = [this._jointC];
        this.groupAdjustRatio = 1.0;
        this.groupAlineAngle = 0.0;
        this._handles[0].locationMode = "joint";
    };
    //////////////////////////////////////////////////////////////////////////////
    pwg.inherits(SimplePoint, pwg.PointGraphics);
    pwg.defineClassId(SimplePoint, "pwg.SimplePoint");
    SimplePoint.prototype.update = function (all) {
        var interval = this._interval0;
        if (this.owner && this.owner.classid == SimplePointAlineGroup.classid) {
            this.offset.r = this.groupAlineAngle;
            this.offset.s = 1.0;
            interval *= this.groupAdjustRatio;
        }
        pwg.PointGraphics.prototype.update.call(this, all);

        // 只更新中间捕捉点//
        var joint = this._jointC;
        if (all || joint._use_counter > 0) {
            joint.point = this.baseToPixel(new pwg.point(0, 0)); // 将点定位在中心
            joint.angle = this.offset.angle;
            joint.update();
        }
    };
    SimplePoint.prototype.updateForceJoint = function () {
        this.update(true);
    };
    SimplePoint.prototype._use_location = function (loc) {
        loc._counter++;
    };

    SimplePoint.prototype._release_location = function (loc) {
        loc._counter--;
    };

    SimplePoint.prototype.updateOnlyLocation = function () {
        pwg.PointGraphics.prototype.updateOnlyLocation.call(this);
    };

    SimplePoint.prototype._get_handles = function () {
        var handles = this._handles;
        if (this.owner && this.owner.classid == SimplePointAlineGroup.classid) {
            return [handles[0], this._annotation._handles[1]];
        } else {
            return [this._annotation._handles[1]].concat(handles);
        }
    };

    SimplePoint.prototype.hitTest = function (e, option) {
        if (!this._visibility)
            return;
        var hit = this._icon.hitTest(e.pixel, pwg.drawing.default_paper_param);
        if (hit) {
            return {
                succeed: true,
                distance: pwg.UI_HITTEST_TOLERENCE * 0.8,
                object: this
            };
        } else {
            return null;
        }
    };

    SimplePoint.prototype.render = function (drawing, pass) {
        if (!this._visibility)
            return;
        this._annotation.render(drawing, pass);
        if (pass == "entity") {
            drawing.begin();
            var param = drawing.default_paper_param;
            this._icon.matrix = this._TRS.M;
            this._icon.draw(drawing.ctx, param);
            drawing.end();
        }
        else if (pass == "ui" || pass == "hot" || pass == "debug") {
            this.updateForceJoint();
            drawing.begin();
            drawing.resetTransform();

            // 只绘制中间捕捉点
            var p = this._jointC.pixel;
            drawing.draw_ui_handle_circle(p, 4, 0xFF00FF00, 0xFF00FFFF);

            var p = this.location.pixel;
            drawing.draw_ui_handle_rect(p, 4, 0xFF00FFFF, 0xFF00FFFF);
            drawing.end();
        }
    };

    SimplePoint.prototype.tryGetLocation = function (e, type) {
        this.updateForceJoint();
        if (type == "joint" || !pwg.defined(type)) {
            var D = pwg.UI_HITTEST_TOLERENCE * 2;
            // 只检测中间捕捉点
            var p = this._jointC.pixel;
            var d = p.getDistance(e.pixel);
            if (d < D) {
                return this._jointC;
            }
        }
        return null;
    };

    SimplePoint.prototype.getLocation = function (id) {
        // 只检查中间捕捉点
        if (this._jointC.id == id)
            return this._jointC;
        return null;
    };

    SimplePoint.prototype.tryGetUiCommand = function (e, handle) {
        if (this.owner && this.owner.classid == SimplePointAlineGroup.classid) {
            return [new pwg.UiCommand(this, "remove-from-group", null, "从分组中移除", "simple")];
        }
        return null;
    };

    SimplePoint.prototype.setScale = function (s) {
        let scale = Number(s);
        if (isNaN(scale) || scale <= 0) {
            scale = 1
        }
        this._offset_location.offset.s = scale
    }

    SimplePoint.prototype.setRotation = function (r) {
        let rotation = Number(r);
        if (isNaN(rotation)) {
            rotation = 0;
        }
        // 规范到-180~180
        rotation = ((rotation + 180) % 360 + 360) % 360 - 180;
        this._offset_location.offset.r = rotation;
    }

    SimplePoint.prototype._execute_ui_command = function (command) {
        if (command.id == "remove-from-group") {
            var container = this.container;
            var owner = this.owner;
            owner.remove(this);
            container.addChild(this);
        }
    };

    SimplePoint.prototype.__save__ = function (json) {
        json = pwg.PointGraphics.prototype.__save__.call(this, json);
        return json;
    };

    SimplePoint.prototype.__load__ = function (json, context) {
        pwg.PointGraphics.prototype.__load__.call(this, json, context);
    };
    pwg.registerClass(SimplePoint);
    pwg.SimplePoint = SimplePoint;
    ////////////////////////////////////////////////////////////////
    function SimplePointXBuild(type, name, options) {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._type = type;
        this._options = options;
        this._creating = null;
        var that = this;
        pwg.json.registerCreator("SimplePoint:" + type, function (container, id, json) {
            return that.createJSON(container, id, json);
        });

    }
    pwg.inherits(SimplePointXBuild, pwg.BaseBuild);
    SimplePointXBuild.prototype.getLocationMode = function () {
        return this._options.locationMode;
    };

    SimplePointXBuild.prototype.addFromData = function (e) {
        let creating = this.create(this._context.container, e)
        this._context.container.addChild(creating);
        creating.setScale(e.scale)
        creating.setRotation(e.rotation)
    }

    SimplePointXBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(SimplePoint.classid, this._options);
                this._creating.__json_creator__ = "SimplePoint:" + this._type;
                this._creating.setLocation(e);
            }
        } else if (action == "move") {
            if (this._creating) {
                this._creating.setLocation(e);
            }
        } else if (action == "up" || action == "post") {
            if (this._creating) {
                this._creating.setLocation(e);
                this._context.container.addChild(this._creating);
                this._creating = null;
            }
        }
    };
    SimplePointXBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating = null;
        }
    };

    SimplePointXBuild.prototype.create = function (container, e) {
        var creating = container.createGraphics(SimplePoint.classid, this._options);
        creating.__json_creator__ = "SimplePoint:" + this._type;
        creating.setLocation(e);
        return creating;
    };
    SimplePointXBuild.prototype.createJSON = function (container, id, json) {
        var creating = new SimplePoint(container, id, this._options);
        creating.__json_creator__ = "SimplePoint:" + this._type;
        return creating;
    };

    SimplePointXBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "entity"); //TODO:for other render 
        }
    };

    function registerSimplePointXBuild(type, name, options) {
        var icon = options.icon;
        var bounds = options.bounds;
        var uri = "SimplePoint:" + icon;
        var xdata = options.xdata || {};
        xdata.CN = xdata.CN || name;
        xdata.type = "SimplePoint:" + type;
        pwg.drawing.define(uri, icon);
        var xoptions =
        {
            icon: uri,
            bounds: bounds,
            xdata: xdata
        };
        var build = new SimplePointXBuild(type, name, xoptions);
        console.log(name,build);
        pwg.graphics.registerBuild(name, build);
    }
    ///////////////////////////////////////////////////////
    function SimplePointAlineGroup(container, id) {
        pwg.super(this, pwg.Group, container, id);
        this._SimplePoints = [];
        this._outline = [];

        this._add_head_handle = new pwg.UiHandle(this, "handle.add", "joint.add-head", "continuous");
        this._add_head_handle.locationMode = "joint";
        this._add_tail_handle = new pwg.UiHandle(this, "handle.add", "joint.add-tail", "continuous");
        this._add_tail_handle.locationMode = "joint";
        this._handle_move_insert = new pwg.UiHandle(this, "handle.move", "", "simple");
        this._handle_move_insert.locationMode = "joint";
        this._handles = [this._add_head_handle, this._add_tail_handle];
        this._hash_locations = new pwg.point();
    }
    pwg.inherits(SimplePointAlineGroup, pwg.Group);
    pwg.defineClassId(SimplePointAlineGroup, "pwg.SimplePointAlineGroup");
    SimplePointAlineGroup.prototype.add = function (SimplePoint, iloc) {
        if (!SimplePoint.owner /*TODO*/) {
            var b = this.addChild(SimplePoint);
            if (b)
                if (pwg.defined(iloc)) {
                    if (iloc == -1) {
                        this._SimplePoints.unshift(SimplePoint);
                    } else
                        this._SimplePoints.splice(iloc, 0, SimplePoint);
                }
                else {
                    this._SimplePoints.push(SimplePoint);
                }
            return b;
        }
        return false;
    };

    SimplePointAlineGroup.prototype.removeChild = function (o) {

        var b = pwg.Group.prototype.removeChild.call(this, o);
        var ix;
        if ((ix = this._SimplePoints.indexOf(o)) != -1) {
            this._SimplePoints.splice(ix, 1);
        }
        return b;
    };

    SimplePointAlineGroup.prototype.makeInlineRoute = function (nloc, routeType) {
        var SimplePoints = this._SimplePoints;
        //var route =  this.container.createGraphics(pwg.Route.classid);
        var route = pwg.graphics.getBuild(routeType).create(this.container, []);
        for (var i = 0, l = SimplePoints.length; i < l; i++) {
            var SimplePoint = SimplePoints[i];
            route.add(SimplePoint.getLocation(nloc));
        }
        this.addChild(route);
    };

    //////////////////////////////////////////////////////////
    var bounds = new pwg.rectangle(-32, -32, 64, 64);
    registerSimplePointXBuild("简单点要素", "简单点要素", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/坐标.svg", bounds: bounds });

    SimplePoint.defaultBuild = pwg.graphics.getBuild("坐标");
};