if (typeof pwg == "undefined")
    pwg = {};
pwg.tower = function () {
    /*
 
    */
    function Tower(container, id, options) {
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
        this._jointA._counter=0;
        this._jointB = new pwg.AbsoluteLocation(this, "joint-B", "pixel");
        this._jointB.joint = new pwg.Joint("point");
        this._jointB._counter=0;
        this._jointC = new pwg.AbsoluteLocation(this, "joint-C", "pixel");
        this._jointC.joint = new pwg.Joint("point");
        this._jointC._counter=0;

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
        pwg.PointGraphics.prototype.update.call(this,all);
        var x = -interval;
        for (var i = 0; i < 3; i++) {
            var joint = this._joints[i];
            if(all||joint._use_counter>0)
            {
                joint.point = this.baseToPixel(new pwg.point(x, 0));
                joint.angle = this.offset.angle;
                joint.update();
            }
            x += interval;
        }
    };
    Tower.prototype.updateForceJoint=function()
    {
        this.update(true);
    };
    Tower.prototype._use_location=function(loc)
    {
        loc._counter++;
    };

    Tower.prototype._release_location=function(loc)
    {
        loc._counter--;
    };

    Tower.prototype.updateOnlyLocation = function () {
        pwg.PointGraphics.prototype.updateOnlyLocation.call(this);
    };

    Tower.prototype._get_handles = function () {
        var handles = this._handles;
        if (this.owner && this.owner.classid == TowerAlineGroup.classid) {
            return [handles[0],this._annotation._handles[1]];
        } else 
        {
            return [this._annotation._handles[1]].concat(handles);
        }
    };

    Tower.prototype.hitTest = function (e, option) {
        if(!this._visibility)
            return ;
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
        if(!this._visibility)
            return ;
        this._annotation.render(drawing,pass);
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
        this._hash_locations=new pwg.point();
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
        
        var b = pwg.Group.prototype.removeChild.call(this,o);
        var ix;
        if ((ix = this._towers.indexOf(o)) != -1) {
            this._towers.splice(ix, 1);
        }
        return b;
    };

    TowerAlineGroup.prototype.makeInlineRoute = function (nloc,routeType) {
        var towers = this._towers;
        //var route =  this.container.createGraphics(pwg.Route.classid);
        var route = pwg.graphics.getBuild(routeType).create(this.container,[]);
        for (var i = 0, l = towers.length; i < l; i++) {
            var tower = towers[i];
            route.add(tower.getLocation(nloc));
        }
        this.addChild(route);
    };

    function make_hash_locations(towers)
    {
        var loc = new pwg.point();
        if (towers.length < 2)
            return loc;

        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            var p = tw.location.lonlat;
            loc.x+=p.x;
            loc.y+=p.y;
        }
        return loc;
    }

    function calc_aline_direction_adjust_ratio(towers) {
        if (towers.length < 2)
            return [];
        var points = [];
        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            points.push(tw.location.pixel);
        }
        var fwdirs = [];
        var updirs = [];
        var ds = [];
        for (var i = 0, n = points.length - 1; i < n; i++) {
            var p0 = points[i];
            var p1 = points[i + 1];
            var dr = p1.subtract(p0);
            fwdirs.push(dr.normalize());
        }
        fwdirs.push(fwdirs[fwdirs.length - 1]);
        updirs.push(fwdirs[0]);
        ds.push(1);
        for (var i = 1, n = fwdirs.length; i < n; i++) {
            var v0 = fwdirs[i - 1].rotate(90);
            var v1 = fwdirs[i].rotate(90);
            v0 = v0.add(v1).normalize();
            var d = 1 / v0.dot(v1);
            ds.push(d);

            v0 = fwdirs[i - 1];
            v1 = fwdirs[i];
            var di = v0.add(v1);
            updirs.push(di);
        }
        var xx = new pwg.point(0, 1);
        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            tw.groupAdjustRatio = ds[i];
            var di = updirs[i];
            tw.groupAlineAngle = -di.getDirectedAngle(xx);
        }
        return points;
    }

    function make_towers_only_pline(towers) {
        if (towers.length < 2)
            return [];
        var points = [];
        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            points.push(tw.location.pixel);
        }
        return points;
    }

    TowerAlineGroup.prototype.update = function (all) {
        var towers = this._towers;
        //此处代码包含了避免重新计算角度的逻辑。
        var last_hash_location = make_hash_locations(towers);
        if(!this._hash_locations.equals(last_hash_location)||all)
        {
            for (var i = 0, l = towers.length; i < l; i++) {
                towers[i].updateOnlyLocation();
            }
            this._outline = calc_aline_direction_adjust_ratio(this._towers);

            this._hash_locations=last_hash_location;
        }
        else
        {
            this._outline = make_towers_only_pline(this._towers);
        }

        if (all) //或者其余部分将由每个tower的更新机制负责。
        {
            for (var i = 0, l = towers.length; i < l; i++) {
                towers[i].update();
            }
        }

        if (this._active_ui_handle != this._add_head_handle && this._outline.length > 2) {
            this._add_head_handle.location.point = pwg.last(this._outline);
            this._add_head_handle.location.update();
        }
        if (this._active_ui_handle != this._add_tail_handle && this._outline.length > 2) {
            this._add_tail_handle.location.point = pwg.first(this._outline);
            this._add_tail_handle.location.update();
        }
        if (this._active_ui_handle)
            this._active_ui_handle.location.update();
    };

    TowerAlineGroup.prototype._do_ui_handle_begin = function (handle) {
        this._active_ui_handle = handle;
    };

    TowerAlineGroup.prototype._is_acceptable_tower = function (tower) {
        return tower && tower.classid == Tower.classid && (!tower.owner || tower.owner.classid != TowerAlineGroup.classid);
    };

    TowerAlineGroup.prototype._do_ui_handle_update = function (handle, e, action) {
        if (action == "post") {
            var tower = null;
            if (e.location) {
                if (this._is_acceptable_tower(e.location.owner)) {
                    tower = e.location.owner;
                    tower.remove();
                }
            }
            if (tower) {
                if (handle.id == "joint.add-tail") {
                    this.add(tower, -1);
                } else if (handle.id == "joint.add-head") {
                    this.add(tower);
                } else if (handle.id == "joint.insert") {
                    this.add(tower, handle.iloc + 1);
                }
            }
            else {
                if (handle.id == "joint.insert") {
                    tower = Tower.defaultBuild.create(this.container, e);
                    this.add(tower, handle.iloc + 1);
                }
                else {
                    var outline = this._outline;
                    if (handle.id == "joint.add-tail") {
                        var first = pwg.first(outline);
                        if (first.getDistance(e.pixel) > pwg.UI_HITTEST_TOLERENCE * 5) {
                            tower = Tower.defaultBuild.create(this.container, e);
                            this.add(tower, -1);
                        }
                    }
                    else if (handle.id == "joint.add-head") {
                        var last = pwg.last(outline);
                        if (last.getDistance(e.pixel) > pwg.UI_HITTEST_TOLERENCE * 5) {
                            tower = Tower.defaultBuild.create(this.container, e);
                            this.add(tower);
                        }
                    }
                }
            }
        }
        else if (action == "update") {
            handle.location.set(e);
        }
    };

    TowerAlineGroup.prototype._do_ui_handle_cancel = function (handle, e, action) { };

    TowerAlineGroup.prototype._do_ui_handle_commit = function (handle, e, action) {
        this._active_ui_handle = null;
    };

    TowerAlineGroup.prototype.tryGetUiHandle = function (e) {
        var outline = this._outline;
        var d = pwg.utils.find_line_string_nearest_point(outline, e.pixel);
        if (d.distance < pwg.UI_HITTEST_TOLERENCE * 2) {
            if (d.t > 0.1 && d.t < 0.9) {
                var handle = this._handle_move_insert;
                handle.id = "joint.insert";
                handle.iloc = d.i;
                return handle;
            }
        } else {
            return null;
        }
    };

    TowerAlineGroup.prototype.depth=function()
    {
        var towers = this._towers;
        var d = 0;
        for(var i=0,l=towers.length;i<l;i++)
        {
            var t = towers[i];
            d=Math.max(t.depth(),d);
        }
        return d+1;
    };

    TowerAlineGroup.prototype.isDep=function(o)
    {
        var towers = this._towers;
        var d = 0;
        for(var i=0,l=towers.length;i<l;i++)
        {
            var t = towers[i];
            if(t==o||t.isDep(o))
            return true;
        }
        return false;
    };

    TowerAlineGroup.prototype.removeDep=function(o)
    {
        var towers = this._towers;
        var d = 0;
        for(var i=0,l=tower.length;i<l;i++)
        {
            var t = towers[i];
            if(t==o)
            {
                this.removeChild(o);
                return true;
            }
        }
        return false;
    };

    TowerAlineGroup.prototype.render = function (drawing, pass) {
        if (pass == "frame") {
            drawing.begin();
            drawing.resetTransform();
            drawing.drawEx(this._outline, pwg.styles.get("tower-aline-group.default"));
            drawing.end();
        } else if (pass == "ui"||pass=="hot"||pass=="debug") {
            drawing.begin();
            drawing.resetTransform();
            var outline = this._outline;
            drawing.drawEx(outline, pwg.styles.get("tower-aline-group.hot"));
            if (this._active_ui_handle) {
                var handle = this._active_ui_handle;
                var hp = handle.location.pixel;
                var line;
                if (handle.id == "joint.add-tail") {
                    var p = pwg.first(outline);
                    line = [p, hp];
                }
                else if (handle.id == "joint.add-head") {
                    var p = pwg.last(outline);
                    line = [p, hp];
                }
                else if (handle.id == "joint.insert") {
                    var p0 = outline[handle.iloc];
                    var p1 = outline[handle.iloc + 1];
                    line = [p0, hp, p1];
                }
                drawing.drawEx(line, pwg.styles.get("linelike.ui"));
            }
            drawing.end();
        }
        if( pass!="ui"&& pass!="hot")
        {
            pwg.Group.prototype.render.call(this, drawing, pass);
        }
    };

    TowerAlineGroup.prototype.hitTest = function (e, options) {
        var hit = pwg.Group.prototype.hitTest.call(this, e, options);
        if (hit)
            return hit;
        var d = pwg.utils.find_line_string_nearest_point(this._outline, e.pixel);
        if (d.distance < pwg.UI_HITTEST_TOLERENCE * 4) {
            return {
                succeed: true,
                object: this,
                distance: d.distance
            };
        }
        return null;
    };

    TowerAlineGroup.prototype.__save__ = function (json) {
        json = pwg.Group.prototype.__save__.call(this, json);
        var towers = this._towers;
        json.towers = [];
        for (var i = 0, l = towers.length; i < l; i++) {
            var id = towers[i].id;
            json.towers.push(id);
        }
        return json;
    };

    TowerAlineGroup.prototype.__load__ = function (json, context) {
        pwg.Group.prototype.__load__.call(this, json, context);
        var towers = json.towers;
        for (var i = 0, l = towers.length; i < l; i++) {
            var t = context.getObjectById(towers[i]);
            this._towers.push(t);
        }
    };

    pwg.registerClass(TowerAlineGroup);
    //////////////////////////////////////////////////////////
    function TowerAlineGroupBuild(routeType) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this.routeType = routeType;
    }
    pwg.inherits(TowerAlineGroupBuild, pwg.BaseBuild);
    pwg.defineClassId(TowerAlineGroupBuild, "pwg.TowerAlineGroupBuild");
    TowerAlineGroupBuild.prototype.getLocationMode = function () {
        return "joint";
    };

    TowerAlineGroupBuild.create = function (container, e) {
        var creating = this._context.container.createGraphics(TowerAlineGroup.classid);
        if (e.location) {
            var tower = e.location.owner;
            if (tower && tower.classid == Tower.classid) {
                if (tower.owner.classid != TowerAlineGroupBuild.classid) {
                    tower.remove();
                    creating.add(tower);
                }
            }
        } else {
            var tower = Tower.defaultBuild.create(this._creating.container, e);
            creating.add(tower);
        }
        return creating;
    };

    TowerAlineGroupBuild.prototype.update = function (e, action) {
        if (action == "up") {
            if (!this._creating)
                this._creating = this._context.container.createGraphics(TowerAlineGroup.classid);
            if (e.location) {
                var tower = e.location.owner;
                if (tower && tower.classid == Tower.classid) {
                    if (tower.owner.classid != TowerAlineGroupBuild.classid) {
                        tower.remove();
                        this._creating.add(tower);
                    }
                }
            } else {
                var tower = Tower.defaultBuild.create(this._creating.container, e);
                this._creating.add(tower);
            }
            this._last_up_e = e;
        } else if (action == "move") {
            this._last_e = e;
        } else if (action == "post") {
            this.post();
        }
        return "continous";
    };

    TowerAlineGroupBuild.prototype.post = function (e, action) {
        if (this._creating) {
            this._creating.makeInlineRoute("joint-A",this.routeType);
            this._creating.makeInlineRoute("joint-B",this.routeType);
            this._creating.makeInlineRoute("joint-C",this.routeType);
            this._context.container.addChild(this._creating);
        }
        this._creating = null;
        this._last_e = null;
        this._last_up_e = null;
    };
    TowerAlineGroupBuild.prototype.cancel = function () {
        this._creating = null;
        this._last_e = null;
        this._last_up_e = null;
    };

    TowerAlineGroupBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update(true);
            ['frame', 'route', 'entity', 'label'].forEach(it => {
                this._creating.render(context.drawing, it);
            });
            var drawing = context.drawing;
            drawing.begin();
            drawing.resetTransform();
            var style = pwg.styles.get("linelike.ui");
            drawing.drawEx([this._last_e.pixel, this._last_up_e.pixel], style);
            drawing.end();
        }
    };
    //////////////////////////////////////////////////////////
    var bounds = new pwg.rectangle(-16, -16, 32, 32);
    registerTowerXBuild("钢管杆(耐张)", "钢管杆(耐张)", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/钢管杆(耐张).svg", bounds: bounds });
    registerTowerXBuild("钢管杆(直线)", "钢管杆(直线)", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/钢管杆(直线).svg", bounds: bounds });
    registerTowerXBuild("钢管塔(耐张)", "钢管塔(耐张)", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/钢管塔(耐张).svg", bounds: bounds });
    registerTowerXBuild("钢管塔(直线)", "钢管塔(直线)", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/钢管塔(直线).svg", bounds: bounds });
    registerTowerXBuild("木塔", "木塔", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/木塔.svg", bounds: bounds });
    registerTowerXBuild("其他杆塔", "其他杆塔", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/其他杆塔.svg", bounds: bounds });
    registerTowerXBuild("水泥杆", "水泥杆", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/水泥杆.svg", bounds: bounds });
    registerTowerXBuild("铁杆(直线)", "铁杆(直线)", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/铁杆(直线).svg", bounds: new pwg.rectangle(-20, -16, 40, 32) });
    registerTowerXBuild("铁塔（同角钢塔，耐张）", "铁塔（同角钢塔，耐张）", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/铁塔（同角钢塔，耐张）.svg", bounds: bounds });
    registerTowerXBuild("铁塔（同角钢塔，直线）", "铁塔（同角钢塔，直线）", { icon: pwg.ROOT_PATH+"/pwg/svg/标准/铁塔（同角钢塔，直线）.svg", bounds: bounds });

    pwg.graphics.registerBuild("杆塔线路组", new TowerAlineGroupBuild("线路(地上)"));
    Tower.defaultBuild = pwg.graphics.getBuild("钢管杆(耐张)");
};