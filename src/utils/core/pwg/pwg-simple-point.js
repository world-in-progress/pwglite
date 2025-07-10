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
        this._interval0 = bounds.width / 2.0;
        this._jointA = new pwg.AbsoluteLocation(this, "joint-A", "pixel");
        this._jointA.joint = new pwg.Joint("point");
        this._jointA._counter = 0;
        this._jointB = new pwg.AbsoluteLocation(this, "joint-B", "pixel");
        this._jointB.joint = new pwg.Joint("point");
        this._jointB._counter = 0;
        this._jointC = new pwg.AbsoluteLocation(this, "joint-C", "pixel");
        this._jointC.joint = new pwg.Joint("point");
        this._jointC._counter = 0;

        this._joints = [this._jointA, this._jointC, this._jointB];
        this.groupAdjustRatio = 1.0;
        this.groupAlineAngle = 0.0;
        this._handles[0].locationMode = "joint";
    };
    //////////////////////////////////////////////////////////////////////////////
    pwg.inherits(Tower, pwg.PointGraphics);
    pwg.defineClassId(Tower, "pwg.Tower");
    Tower.prototype.update = function (all) {
        var interval = this._interval0;
        if (this.owner && this.owner.classid == TowerAlineGroup.classid) {
            this.offset.r = this.groupAlineAngle;
            this.offset.s = 1.0;
            interval *= this.groupAdjustRatio;
        }
        pwg.PointGraphics.prototype.update.call(this, all);
        var x = -interval;
        for (var i = 0; i < 3; i++) {
            var joint = this._joints[i];
            if (all || joint._use_counter > 0) {
                joint.point = this.baseToPixel(new pwg.point(x, 0));
                joint.angle = this.offset.angle;
                joint.update();
            }
            x += interval;
        }
    };
    Tower.prototype.updateForceJoint = function () {
        this.update(true);
    };
    Tower.prototype._use_location = function (loc) {
        loc._counter++;
    };

    Tower.prototype._release_location = function (loc) {
        loc._counter--;
    };

    Tower.prototype.updateOnlyLocation = function () {
        pwg.PointGraphics.prototype.updateOnlyLocation.call(this);
    };

    Tower.prototype._get_handles = function () {
        var handles = this._handles;
        if (this.owner && this.owner.classid == TowerAlineGroup.classid) {
            return [handles[0], this._annotation._handles[1]];
        } else {
            return [this._annotation._handles[1]].concat(handles);
        }
    };

    Tower.prototype.hitTest = function (e, option) {
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

    Tower.prototype.render = function (drawing, pass) {
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
            var joints = this._joints;
            for (var i = 0; i < 3; i++) {
                var p = joints[i].pixel;
                drawing.draw_ui_handle_circle(p, 4, 0xFF00FF00, 0xFF00FFFF);
            }
            var p = this.location.pixel;
            drawing.draw_ui_handle_rect(p, 4, 0xFF00FFFF, 0xFF00FFFF);
            drawing.end();
        }
    };

    Tower.prototype.tryGetLocation = function (e, type) {
        this.updateForceJoint();
        if (type == "joint" || !pwg.defined(type)) {
            var D = pwg.UI_HITTEST_TOLERENCE * 2;
            var joint = null;
            var joints = this._joints;
            for (var i = 0; i < 3; i++) {
                var p = joints[i].pixel;
                var d = p.getDistance(e.pixel);
                if (d < D) {
                    D = d;
                    joint = joints[i];
                }
            }
            return joint;
        }
        return null;
    };

    Tower.prototype.getLocation = function (id) {
        if (this._jointA.id == id)
            return this._jointA;
        if (this._jointB.id == id)
            return this._jointB;
        if (this._jointC.id == id)
            return this._jointC;
        return null;
    };

    Tower.prototype.tryGetUiCommand = function (e, handle) {
        if (this.owner && this.owner.classid == TowerAlineGroup.classid) {
            return [new pwg.UiCommand(this, "remove-from-group", null, "从分组中移除", "simple")];
        }
        return null;
    };

    Tower.prototype.setScale = function(s) {
        let scale = Number(s);
        if (isNaN(scale) || scale <= 0) {
            scale = 1
        }
        this._offset_location.offset.s = scale
    }

    Tower.prototype.setRotation = function(r) {
        let rotation = Number(r);
        if (isNaN(rotation)) {
            rotation = 0;
        }
        // 规范到-180~180
        rotation = ((rotation + 180) % 360 + 360) % 360 - 180;
        this._offset_location.offset.r = rotation;
    }

    Tower.prototype._execute_ui_command = function (command) {
        if (command.id == "remove-from-group") {
            var container = this.container;
            var owner = this.owner;
            owner.remove(this);
            container.addChild(this);
        }
    };

    Tower.prototype.__save__ = function (json) {
        json = pwg.PointGraphics.prototype.__save__.call(this, json);
        return json;
    };

    Tower.prototype.__load__ = function (json, context) {
        pwg.PointGraphics.prototype.__load__.call(this, json, context);
    };
    pwg.registerClass(Tower);
    pwg.Tower = Tower;
    ////////////////////////////////////////////////////////////////
    function TowerXBuild(type, name, options) {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._type = type;
        this._options = options;
        this._creating = null;
        var that = this;
        pwg.json.registerCreator("tower:" + type, function (container, id, json) {
            return that.createJSON(container, id, json);
        });

    }
    pwg.inherits(TowerXBuild, pwg.BaseBuild);
    TowerXBuild.prototype.getLocationMode = function () {
        return this._options.locationMode;
    };

    TowerXBuild.prototype.addFromData = function (e) {
        let creating = this.create(this._context.container, e)
        this._context.container.addChild(creating);
        creating.setScale(e.scale)
        creating.setRotation(e.rotation)
    }

    TowerXBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(Tower.classid, this._options);
                this._creating.__json_creator__ = "tower:" + this._type;
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
    TowerXBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating = null;
        }
    };

    TowerXBuild.prototype.create = function (container, e) {
        var creating = container.createGraphics(Tower.classid, this._options);
        creating.__json_creator__ = "tower:" + this._type;
        creating.setLocation(e);
        return creating;
    };
    TowerXBuild.prototype.createJSON = function (container, id, json) {
        var creating = new Tower(container, id, this._options);
        creating.__json_creator__ = "tower:" + this._type;
        return creating;
    };

    TowerXBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "entity"); //TODO:for other render 
        }
    };

    function registerTowerXBuild(type, name, options) {
        var icon = options.icon;
        var bounds = options.bounds;
        var uri = "tower:" + icon;
        var xdata = options.xdata || {};
        xdata.CN = xdata.CN || name;
        xdata.type = "tower:" + type;
        pwg.drawing.define(uri, icon);
        var xoptions =
        {
            icon: uri,
            bounds: bounds,
            xdata: xdata
        };
        var build = new TowerXBuild(type, name, xoptions);
        pwg.graphics.registerBuild(name, build);
    }
    ///////////////////////////////////////////////////////
    function TowerAlineGroup(container, id) {
        pwg.super(this, pwg.Group, container, id);
        this._towers = [];
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
    pwg.inherits(TowerAlineGroup, pwg.Group);
    pwg.defineClassId(TowerAlineGroup, "pwg.TowerAlineGroup");
    TowerAlineGroup.prototype.add = function (tower, iloc) {
        if (!tower.owner /*TODO*/) {
            var b = this.addChild(tower);
            if (b)
                if (pwg.defined(iloc)) {
                    if (iloc == -1) {
                        this._towers.unshift(tower);
                    } else
                        this._towers.splice(iloc, 0, tower);
                }
                else {
                    this._towers.push(tower);
                }
            return b;
        }
        return false;
    };

    TowerAlineGroup.prototype.removeChild = function (o) {

        var b = pwg.Group.prototype.removeChild.call(this, o);
        var ix;
        if ((ix = this._towers.indexOf(o)) != -1) {
            this._towers.splice(ix, 1);
        }
        return b;
    };

    TowerAlineGroup.prototype.makeInlineRoute = function (nloc, routeType) {
        var towers = this._towers;
        //var route =  this.container.createGraphics(pwg.Route.classid);
        var route = pwg.graphics.getBuild(routeType).create(this.container, []);
        for (var i = 0, l = towers.length; i < l; i++) {
            var tower = towers[i];
            route.add(tower.getLocation(nloc));
        }
        this.addChild(route);
    };

    //////////////////////////////////////////////////////////
    var bounds = new pwg.rectangle(-16, -16, 32, 32);
    registerTowerXBuild("简单点要素", "简单点要素", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/钢管杆(耐张).svg", bounds: bounds });

    Tower.defaultBuild = pwg.graphics.getBuild("钢管杆(耐张)");
};