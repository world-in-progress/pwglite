/*
    pwg-route.js
*/
if (typeof pwg == "undefined")
    pwg = {};
if (typeof pwg.graphics == "undefined")
    pwg.graphics = {};
pwg.simpleLine = function () {
    /////////////////////////////////////////////////////////////////
    pwg.cpoint = paper.Segment;
    /////////////////////////////////////////////////////////////////
    // RouteJoint:提供线路的连接点(线),依附于设备存在                        //
    /////////////////////////////////////////////////////////////////
    //mode=point|point+|cpoint|cpoint+|break x代表可以连接多根线 ponitx cpointx
    function RouteJoint(mode) {
        this.mode = pwg.defaultValue(mode, "point");
        this.outline = null; //use RouteJoint
        this._route_ = this._is_x_mode() ? [] : null;
    }
    pwg.inherits(RouteJoint, pwg.Object);
    RouteJoint.prototype._is_x_mode = function () {
        var mode = this.mode;
        return (mode == "pointx" || mode == "cpointx");
    };
    RouteJoint.prototype._is_availabe = function () {
        return this._is_x_mode() || this._outline == null;
    };
    RouteJoint.prototype.tryDetachRoute = function (ru) {
        if (this._is_x_mode()) {
            var ip = 0;
            if ((ip = this._route_.indexOf(ru)) != -1) {
                delete this._route_[ip]; //!
                return true;
            } else {
                return false;
            }
        } else {
            if (this._route_ == ru) {
                this._route_ = null;
                return true;
            } else {
                return false;
            }
        }
    };
    RouteJoint.prototype.tryAttachRoute = function (ru) {
        if (!this._is_availabe())
            return false;
        if (this._is_x_mode()) {
            var i = this._route_.indexOf(undefined);
            if (i != -1) {
                this._route_[i] = ru;
            } else {
                this._route_.push(ru);
            }
        } else {
            this._route_ = ru;
        }
        return true;
    };
    RouteJoint.prototype.getDistance = function (p) {
        //TODO:处理其他的情况
        if (this.mode != "point")
            return 0;
        if (p.pxiel)
            p = pixel;
        return this._outline.getDistance(p);
    };
    pwg.RouteJoint = RouteJoint;
    pwg.graphics.RouteJoint = RouteJoint;
    pwg.Joint = RouteJoint;
    /////////////////////////////////////////////////
    function Route(container, id, options) {
        pwg.super(this, pwg.Group, container, id);
        this._locations = [];
        this._runtime_outline_ = null;
        this._first_line = null;
        this._last_line = null;
        this._add_head_handle = new pwg.UiHandle(this, "handle.add", "joint.add-head", "continuous");
        this._add_head_handle.locationMode = "joint";
        this._add_tail_handle = new pwg.UiHandle(this, "handle.add", "joint.add-tail", "continuous");
        this._add_tail_handle.locationMode = "joint";
        this._handle_move_insert = new pwg.UiHandle(this, "handle.move", "", "simple");
        this._handle_move_insert.locationMode = "joint";
        this._handles = [this._add_head_handle, this._add_tail_handle];
        this._route_locations = [];
        this._style = options.style ? pwg.styles.get(options.style) : pwg.styles.get("route.default");
        this.xdata = options.xdata;
        this._annotation = new pwg.AlineAnnotation(container, "__inline__");
        this._annotation.owner = this;
        this._annotation.text = "$owner.text";
    }
    pwg.inherits(Route, pwg.Group);
    pwg.defineClassId(Route, 'pwg.Route');
    pwg.defineClassProperty(Route, "locations", {
        get: function () {
            return this._locations;
        }
    });
    pwg.defineClassProperty(Route, "text", {
        get: function () {
            return this.id;
        }
    });

    function _make_locations_to_outline_(locations, context) { //TODO:优化以便更好的实现
        var outlines = [];
        var outline = [];
        for (var i = 0, l = locations.length; i < l; i++) {
            var loc = locations[i];
            var joint = loc.joint;
            if (!joint || !joint.outline) {
                outline.push(loc.pixel);
            } else {
                var jline = joint.outline;
                if (joint.mode == "point") {
                    outline.push(jline);
                } else
                if (joint.mode == "break") {
                    outline.push(jline[0]);
                    outlines.push(outline);
                    outline = [jline[1]];
                } else {
                    //TODO:
                }
            }
        }
        outlines.push(outline);
        return outlines;
    }

    function find_annotation_point(locations, vbbx) {
        var D = 0,
            I = -1;
        var C = 0,
            J = -1;
        var isRectCollided = pwg.math.isRectCollided;
        var vminp = pwg.point.min(vbbx.topLeft, vbbx.bottomRight);
        var vmaxp = pwg.point.max(vbbx.topLeft, vbbx.bottomRight);
        for (var i = 0, l = locations.length - 1; i < l; i++) {
            var head = locations[i];
            var tail = locations[i + 1];
            if (!head.joint || head.joint.mode == "point") //TODO:other joint type
            {
                var p1 = head.pixel;
                var p2 = tail.pixel;
                var minp = pwg.point.min(p1, p2);
                var maxp = pwg.point.max(p1, p2);

                var d = p1.getDistance(p2);
                if (d > D) {
                    D = d;
                    I = i;
                }
                if (isRectCollided(vminp, vmaxp, minp, maxp)) {
                    if (d > C) {
                        C = d;
                        J = i;
                    }
                }
            }
        }
        return J == -1 ? I : J;
    }

    Route.prototype.update = function () {
        this._runtime_outline_ = _make_locations_to_outline_(this._locations, this.getContainerContext());
        if (this._active_ui_handle != this._add_head_handle) {
            this._add_head_handle.location.point = pwg.last(this._locations).pixel;
            this._add_head_handle.location.update();
        }
        if (this._active_ui_handle != this._add_tail_handle) {
            this._add_tail_handle.location.point = pwg.first(this._locations).pixel;
            this._add_tail_handle.location.update();
        }
        this._route_locations.forEach(it => it.update());
        if (this._active_ui_handle)
            this._active_ui_handle.location.update();
        var vp = this.getContainerContext().viewport;
        var i = find_annotation_point(this._locations, vp);
        if (i == -1) {
            i = Math.floor(this._locations.length / 2);
        }
        if (i != -1 && this._locations.length>1) {
            var start = this._locations[i];
            var end = this._locations[i + 1];
            this._annotation._start = start;
            this._annotation._end = end;
            this._annotation.update();
        }
    };

    Route.prototype.add = function (location, iloc) {
        var locations = this._locations;
        if (!pwg.defined(iloc)) {
            locations.push(location);
        } else {
            if (iloc == -1) {
                locations.unshift(location);
            } else {
                locations.splice(iloc, 0, location);
            }
        }
        location.use();
        if (this.owner)
            this.owner.raiseEvent("location-mode-changed", {
                route: this,
                location: location
            });
    };

    Route.prototype.remove = function (iloc) {
        var locations = this._locations;
        var location = locations[iloc];
        locations.splice(iloc, 1);
        location.release();
        if (this.owner)
            this.owner.raiseEvent("location-mode-changed", {
                route: this,
                location: location
            });
    };

    Route.prototype._get_handles = function () {
        if (this._annotation._visibility) {
            return this._handles;
        } else {
            return this._handles.concat(this._annotation._handles[2]);
        }
    };

    Route.prototype.tryGetUiHandle = function (e) {
        var locations = this._locations;
        var I = find_route_break_point(this._locations, e.pixel);
        if (I) {
            var handle = this._handle_move_insert;
            if (I.t < 0.1) {
                handle.id = "joint.move";
                handle.iloc = I.i + 1;
            } else if (I.t > 0.9) {
                handle.id = "joint.move";
                handle.iloc = I.i;
            } else {
                handle.id = "joint.insert";
                handle.iloc = I.i;
            }
            return handle;
        } else {
            return null;
        }
    };
    Route.prototype._do_ui_handle_begin = function (handle) {
        this._active_ui_handle = handle;
    };
    Route.prototype._do_ui_handle_update = function (handle, e, action) {
        if (action == "update") {
            handle.location.set(e);
        } else if (action == "post") {
            if (!e.location) {
                if (handle.id == "joint.move")
                    this.remove(handle.iloc);
                return;
            }
            if (handle.id == "joint.add-tail") {
                this.add(e.location, -1);
            } else if (handle.id == "joint.add-head") {
                this.add(e.location);
            } else if (handle.id == "joint.insert") {
                this.add(e.location, handle.iloc + 1);
            } else if (handle.id == "joint.move") {
                if (this._locations[handle.iloc] != e.location) {
                    this.remove(handle.iloc);
                    this.add(e.location, handle.iloc);
                }
            }
        }
    };
    Route.prototype._do_ui_handle_cancel = function (handle, e, action) {};
    Route.prototype._do_ui_handle_commit = function (handle, e, action) {
        this._active_ui_handle = null;
    };

    function find_route_break_point(locations, px) {
        var I = -1;
        var D = 1e10;
        var t = 0;
        for (var i = 0, l = locations.length - 1; i < l; i++) {
            var head = locations[i];
            var tail = locations[i + 1];
            if (!head.joint || head.joint.mode == "point") //TODO:other joint type
            {
                var p1 = head.pixel;
                var p2 = tail.pixel;
                var d = pwg.math.getLineNearestPoint(px, p1, p2);
                if (d.distance < D) {
                    D = d.distance;
                    t = d.t;
                    I = i;
                }
            }
        }
        if (D < pwg.UI_HITTEST_TOLERENCE * 4 && I != -1) {
            return {
                i: I,
                t: t
            };
        } else
            return null;
    }


    Route.prototype.tryGetLocation = function (e, type) {
        if (type == "route") {
            var locations = this._locations;
            var I = find_route_break_point(this._locations, e.pixel);
            if (I) {
                var loc = new RouteLocation(this, locations[I.i], locations[I.i + 1], I.t);
                return loc;
            }
        }
        return null;
    };

    Route.prototype.getLocation = function (id) {
        var rls = this._route_locations;
        for (var i = 0, l = rls.length; i < l; i++) {
            var rl = rls[i];
            if (rl.id == id)
                return rl;
        }
        return null;
    };

    Route.prototype._use_location = function (loc) {
        this._route_locations.push(loc);
    };

    Route.prototype._release_location = function (loc) {
        var ix = this._route_locations.indexOf(loc);
        if (ix != -1) {
            this._route_locations = this._route_locations.splice(ix, 1);
        }
    };

    Route.prototype.depth = function () {
        var d = 0;
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            var loc = locations[i];
            if (loc && loc.joint == "break")
                continue;
            d = Math.max(d, loc.depth());
        }
        return d + 1;
    };

    Route.prototype.isDep=function(o)
    {
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            if(locations[i].owner==o)
                return true;
        }
        return false;
    };

    Route.prototype.findDep=function(o,result){
        if(this.isDep(o))
        {
            result.push(this);
        }
        pwg.Group.prototype.findDep.call(this,o,result);
        return result;
    };

    Route.prototype.removeDep = function (o) {
        var b = false;
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            if(locations[i].owner==o)
            {
                locations.splice(i,1);
                l--;
                i--;
            }
        }
        return b;
    };

    Route.prototype.dispose = function () {
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            locations[i].release();
        }
    };

    Route.prototype.hitTest = function (e, option) {
        var D = 1e10;
        var object = null;
        var outline_ = this._runtime_outline_;
        var hit0 = pwg.Group.prototype.hitTest.call(this, e, option);
        for (var i = 0, l = outline_.length; i < l; i++) {
            var ol = outline_[i];
            var fnd = pwg.utils.find_line_string_nearest_point(ol, e.pixel);
            if (fnd.distance < D) {
                D = fnd.distance;
            }
        }
        if (hit0 && hit0.distance < D) {
            return hit0;
        } else
        if (D < pwg.UI_HITTEST_TOLERENCE)
            return {
                succeed: true,
                object: this,
                distance: D
            };
        return null;
    };

    Route.prototype.render = function (drawing, pass) {
        if (pass == "route") {
            drawing.begin();
            drawing.resetTransform();
            var outline_ = this._runtime_outline_;
            for (var i = 0, l = outline_.length; i < l; i++) {
                var ol = outline_[i];
                drawing.drawLineEx(ol, this._style);
            }
            drawing.end();
        } else if (pass == 'ui' || pass == "hot" || pass == "debug") {
            drawing.begin();
            drawing.resetTransform();
            var outline_ = this._runtime_outline_;
            for (var i = 0, l = outline_.length; i < l; i++) {
                var ol = outline_[i];
                drawing.drawLineEx(ol, pwg.styles.get("route.hot"));
            }
            if (this._active_ui_handle) {
                var handle = this._active_ui_handle;
                var locations = this._locations;
                var hp = handle.location.pixel;
                var line;
                if (handle.id == "joint.add-tail") {
                    var p = pwg.first(locations).pixel;
                    line = [p, hp];
                } else
                if (handle.id == "joint.add-head") {
                    var p = pwg.last(locations).pixel;
                    line = [p, hp];
                } else
                if (handle.id == "joint.move") {
                    line = [];
                    if (handle.iloc > 0) {
                        var p = locations[handle.iloc - 1].pixel;
                        line.push(p);
                    }
                    line.push(hp);
                    if (handle.iloc < this._locations.length - 1) {
                        var p = locations[handle.iloc + 1].pixel;
                        line.push(p);
                    }
                } else
                if (handle.id == "joint.insert") {
                    var p0 = locations[handle.iloc].pixel;
                    var p1 = locations[handle.iloc + 1].pixel;
                    line = [p0, hp, p1];
                }
                drawing.drawEx(line, pwg.styles.get("linelike.ui"));
            }
            drawing.end();
        }
        this._annotation.render(drawing, pass);
        pwg.Group.prototype.render.call(this, drawing, pass);
    };



    Route.prototype.__save__ = function (json) {
        json = pwg.Group.prototype.__save__.call(this, json);
        var locations = this._locations;
        var jslocations = [];
        for (var i = 0, l = locations.length; i < l; i++) {
            var id = locations[i].__using_id__();
            jslocations.push(id);
        }
        json.locations = jslocations;

        var rls = this._route_locations;
        var jsnrls = [];
        for (var i = 0, l = rls.length; i < l; i++) {
            jsnrls.push(rls[i].__save__());
        }
        json.rlocations = jsnrls;
        json.style = this._style.name;
        json.annotation = this._annotation.__save__();
        return json;
    };

    Route.prototype.__load__ = function (json, context) {
        pwg.Group.prototype.__load__.call(this, json, context);
        var jslocations = json.locations;
        var locations = this._locations;
        for (var i = 0, l = jslocations.length; i < l; i++) {
            var id = jslocations[i];
            var location = context.getUsingLocation(id);
            locations.push(location);
            location.use();
        }

        var rls = this._route_locations;
        var jsnrls = json.rlocations;
        for (var i = 0, l = jsnrls.length; i < l; i++) {
            var jsnrl = jsnrls[i];
            var head = context.getUsingLocation(jsnrl.head);
            var tail = context.getUsingLocation(jsnrl.tail);
            var t = jsnrl.t;
            var rl = new RouteLocation(this, head, tail, t);
            rls.push(rl);
        }
        this._style = pwg.styles.get(json.style);
        this._annotation.__load__(json.annotation, context);
    };

    // pwg.json.registerCreator("pwg.Route.creator", function (container, id, json) {
    //     var style = pwg.styles.get(json.style);
    //     var route = new Route(container, id, style);
    //     return route;
    // });

    pwg.graphics.Route = Route;
    pwg.Route = Route;
    pwg.registerClass(Route);
    ///////////////////////////////////////////////////////////////////
    function RouteXBuild(type, name, options) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._last_add_e = null;
        this._last_e = null;
        this._type = type;
        this._name = name;
        this._location_counter = 0;
        var that = this;
        var xdata = options.xdata || {};
        xdata.type = "route:" + type;
        xdata.CN = name;
        options.xdata = xdata;
        this._options = options;
        pwg.json.registerCreator("route:" + type, function (container, id, json) {
            return that.createJSON(container, id, json);
        });
    }
    pwg.inherits(RouteXBuild, pwg.BaseBuild);
    RouteXBuild.prototype.setContext = function (context) {
        this._context = context;
    };
    RouteXBuild.prototype.update = function (e, action) {
        if (action == "up" && e.location) {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(Route.classid, this._options);
                this._creating.__json_creator__ = "route:" + this._type;
            }
            this._creating.add(e.location);
            this._last_add_e = e;
            this._location_counter++;
        } else if (action == "move") {
            this._last_e = e;
        } else if (action == "post") {
            this.post();
        }
    };
    RouteXBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    RouteXBuild.prototype.createJSON = function (container, id) {
        var route = new Route(container, id, this._options);
        route.__json_creator__ = "route:" + this._type;
        return route;
    };
    RouteXBuild.prototype.create = function (container, locations) {
        var route = container.createGraphics(Route.classid, this._options);
        route.__json_creator__ = "route:" + this._type;
        if (locations) {
            locations.forEach(it => {
                route.add(it);
            });
        }
        return route;
    };
    RouteXBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "route");
            var drawing = context.drawing;
            if (this._last_add_e && this._last_e) {
                drawing.begin();
                drawing.resetTransform();
                var ae = this._last_add_e;
                var p0 = ae.location ? ae.location.pixel : ae.pixel;
                var p1 = this._last_e.pixel;
                drawing.drawEx([p0, p1], pwg.styles.get('linelike.ui'));
                drawing.end();
            }
        }
    };
    RouteXBuild.prototype.cancel = function () {
        this._creating = null;
        this._location_counter = 0;
    };
    RouteXBuild.prototype.post = function () {
        if (this._location_counter > 1)
            this._context.container.addChild(this._creating);
        this._creating = null;
        this._location_counter = 0;
    };
    pwg.graphics.RouteXBuild = RouteXBuild;
    pwg.RouteXBuild = RouteXBuild;

    function registerRouteXBuild(type, name, options) {
        var build = new RouteXBuild(type, name, options);
        pwg.graphics.registerBuild(name, build);
    }
    registerRouteXBuild("route.ground", "线路(地上)", {
        style: 'route.default'
    });
    registerRouteXBuild("route.tube", "管廊", {
        style: 'route.pipe'
    });

    ////////////////////////////////////////////////////////////////////////////////////
    function RouteLocation(owner, head, tail, t) {
        pwg.super(this, pwg.AbsoluteLocation, owner, "", "pixel");
        this._head = head;
        this._tail = tail;
        this._t = pwg.defined(t) ? t : 0.5;
    }
    pwg.inherits(RouteLocation, pwg.AbsoluteLocation);
    pwg.defineClassId(RouteLocation, "pwg.RouteLocation");
    pwg.defineClassProperty(RouteLocation, "id", {
        get: function () {
            var _id = this._head.__using_id__() + "|" + this._t + "|" + this._tail.__using_id__();
            return _id;
        },
        set: function(val) { this._id = val; }
    });
    RouteLocation.prototype.setExternal = function (e, owner) {
        var b = this.set(e);
        if (!b) {
            //owner.tryDetachRoute();
        }
        return b;
    };
    RouteLocation.prototype.set = function (e) {
        var head = this._head;
        var tail = this._tail;
        var dp = pwg.math.getLineNearestPoint(e.pixel, head.pixel, tail.pixel);
        var t = dp.t;
        if (t < 0 || t > 1) {
            return false;
        } else {
            this._t = t;
            return dp.distance < pwg.UI_HITTEST_TOLERENCE * 120; //a way to escape from the line
        }
    };

    RouteLocation.prototype.update = function () {
        var head = this._head.pixel;
        var tail = this._tail.pixel;
        var px = tail.add(head.subtract(tail).multiply(this._t));

        var dirX = tail.subtract(head).normalize();
        this.angle = -dirX.getDirectedAngle({
            x: 1,
            y: 0
        });
        this.point = px;
        this.sync();
    };

    RouteLocation.prototype.depth = function () {
        return this.owner.depth() + 1;
    };
    RouteLocation.prototype.use = function () {
        this.owner._use_location(this);
    };
    RouteLocation.prototype.release = function () {
        this.owner._release_location(this);
    };
    RouteLocation.prototype.__save__ = function () {
        var json = pwg.AbsoluteLocation.prototype.__save__.call(this);
        json.head = this._head.__using_id__();
        json.tail = this._tail.__using_id__();
        json.t = this._t;
        return json;
    };
    RouteLocation.prototype.__using_id = function () {
        return this.owner.id + ":" + this.id;
    };
    RouteLocation.prototype.__load__ = function (json, context) {
        this._head = context.getUsingLocation(json.head);
        this._tail = context.getUsingLocation(json.tail);
        this._t = this._t;
    };
    pwg.RouteLocation = RouteLocation;
};