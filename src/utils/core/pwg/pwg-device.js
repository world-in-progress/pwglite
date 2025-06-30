/*
    pwg-device-common.js
*/
if (typeof pwg == 'undefined')
    pwg = {};
pwg.device = function () {
    function CircleLocation(center, r, e, n) {
        this._center = center;
        this._r = r;
        this._e = e;
        this._a = 360 / n;
        this.length = n;
        this._id = "";
    }
    CircleLocation.prototype.constructor = CircleLocation;
    CircleLocation.prototype.tryGetLocation = function (p) {
        if (this._center.getDistance(p) - this._r < this._e) {
            var v = p.subtract(this.center);
            var k = Math.round(v.angle / this._a);
            var angle = this._a * k;
            p = new pwg.point(this._r, 0).rotate(angle);
            p = p.add(this._center);
            p.xangle = angle;
            p.id = this._id + `[${k}]`;
            return p;
        }
        return null;
    };

    CircleLocation.prototype.getLocation = function (id) {
        if (typeof id == "string") {
            var regex = /([+-]??\d+)/g;
            var m = id.match(regex);
            var k = parseInt(m[0]);
            var angle = k * this._a;
            p = new pwg.point(this._r, 0).rotate(angle);
            p = p.add(this._center);
            p.xangle = angle;
            p.id = id;
            return p;
        }
        else {
            var angle = id * this._a;
            p = new pwg.point(this._r, 0).rotate(angle);
            p = p.add(this._center);
            p.xangle = angle;
            p.id = this._id + `[${id}]`;
            return p;
        }

    };

    CircleLocation.prototype.__save__ = function () {
        var json = {};
        json.center = pwg.json.formats[pwg.point].save(this._center);
        json.r = this._r;
        json.e = this._e;
        json.a = this._a;
    };

    CircleLocation.prototype.__load__ = function (json) {
        this._center = pwg.json.formats[pwg.point].load(json.center);
        this._r = json.r;
        this._e = json.e;
        this._a = json.a;
    };

    /////////////////////////////////////////////////////////
    function BoxLocation(minp, maxp, n, e) {
        this._minp = pwg.point.min(minp, maxp);
        this._maxp = pwg.point.max(minp, maxp);
        this._center = this._minp.add(this._maxp).multiply(0.5);
        this._a = this._minp;
        this._b = new pwg.point(maxp.x, minp.y);
        this._c = this._maxp;
        this._d = new pwg.point(minp.x, maxp.y);
        this._e = e;
        this._n = n;
        this.length = n * 4;
        this._id = "";
    }
    BoxLocation.prototype.constructor = BoxLocation;
    BoxLocation.prototype.tryGetLocation = function (p) {
        var points = [this._a, this._b, this._c, this._d, this._a];
        for (var i = 0; i < 4; i++) {
            var d = pwg.math.getLineNearestPoint(p,points[i + 1],points[i]);
            if (d.distance < this._e && d.t >= 0 && d.t <= 1.0) {
                var v = points[i + 1].subtract(points[i]).multiply(1 / this._n);
                var n = Math.round(d.t * this._n);
                p = points[i].add(v.multiply(n));
                p.xangle = (i - 1) * 90;
                p.id = this._id + `(${i},${n})`;
                return p;
            }
        }
        return null;
    };
    BoxLocation.prototype.getLocation = function (id) {
        var points = [this._a, this._b, this._c, this._d, this._a];
        if (typeof id == "string") {
            var regex = /(\d+),(\d+)/;
            var m = id.match(regex);
            var i = parseInt(m[1]), n = parseInt(m[2]);
            var v = points[i + 1].subtract(points[i]).multiply(1 / this._n);
            var p = points[i].add(v.multiply(n));
            p.id = id;
            p.xangle = (i - 1) * 90;
            return p;
        }
        else {
            var i = Math.floor(id / this._n);
            var n = id % this._n;
            var v = points[i + 1].subtract(points[i]).multiply(1 / this._n);
            var p = points[i].add(v.multiply(n));
            p.id = this._id + `(${i},${n})`;
            p.xangle = (i - 1) * 90;
            return p;
        }
    };

    BoxLocation.prototype.__save__ = function () {
        var json = {};
        json.minp = pwg.json.formats[pwg.point].save(this._minp);
        json.maxp = pwg.json.formats[pwg.point].save(this._maxp);
        json.n = this._n;
        json.e = this._e;
    };

    BoxLocation.prototype.__load__ = function (json) {
        var minp = pwg.json.formats[pwg.point].load(json.minp);
        var maxp = pwg.json.formats[pwg.point].load(json.maxp);
        BoxLocation.call(this, minp, maxp, json.n, json.e);
    };

    ///////////////////////////////////////////////////////////
    //功能设备
    function Device(container, id, options) {
        var icon = options.icon;
        icon = typeof icon == "string" ? pwg.drawing.using(this, id, icon) : icon;
        this._icon = icon;
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
        this._inlineMatrix = inlineMatrix;
        pwg.super(this, pwg.PointGraphics, container, id, bounds, options.pivots);
        this.xdata = options.xdata;
        this._options = options;
        this._joints = [];
        var kjoints = options.joints;
        for (var i = 0, l = kjoints.length; i < l; i++) {
            var k = kjoints[i];
            var joint = new pwg.AbsoluteLocation(this, k.id, "pixel");
            joint.kpoint = k;
            joint.joint = new pwg.Joint('point');
            this._joints.push(joint);
        }
        if (options.jointx) {
            this._jointx = options.jointx;
            this._jointx_cache = {};
        }
    }
    pwg.inherits(Device, pwg.PointGraphics);
    pwg.defineClassId(Device, "pwg.Device");
    Device.prototype.update = function (all) {
        pwg.PointGraphics.prototype.update.call(this,all);
        var joints = this._joints;
        for (var i = 0, l = joints.length; i < l; i++) {
            var joint = joints[i];
            var point = this.baseToPixel(joint.kpoint);
            joint.point.xy = point;
            joint.angle = this.offset.angle + joint.kpoint.xangle;
            joint.update(all);
        }
        if (this._jointx_cache) {
            var cache = this._jointx_cache;
            for (var k in cache) {
                var joint = cache[k];
                var point = this.baseToPixel(joint.kpoint);
                joint.point.xy = point;
                joint.angle = this.offset.angle + joint.kpoint.xangle;
                joint.update(all);
            }
        }
    };
    Device.prototype.hitTest = function (e, option) {
        var hit = this._icon.hitTest(e.pixel, pwg.drawing.default_paper_param);
        if (hit) {
            return {
                succeed: true,
                distance: pwg.UI_HITTEST_TOLERENCE*0.8,
                object: this
            };
        }
        else {
            return null;
        }
    };
    Device.prototype.render = function (drawing, pass) {
        this._annotation.render(drawing,pass);
        if (pass == "entity") {
            drawing.begin();
            var param = drawing.default_paper_param;
            this._icon.matrix = this._TRS.M;
            this._icon.draw(drawing.ctx, param);
            drawing.end();
        }
        else if (pass == "hot"||pass == "ui"||pass=="debug") {
            drawing.begin();
            drawing.resetTransform();
            var joints = this._joints;
            for (var i = 0, l = joints.length; i < l; i++) {
                var p = joints[i].pixel;
                drawing.draw_ui_handle_circle(p, 4, 0xFF00FF00, 0xFF00FFFF);
            }
            if (this._jointx_cache) {
                var cache = this._jointx_cache;
                for (var k in cache) {
                    var p = cache[k].pixel;
                    drawing.draw_ui_handle_circle(p, 4, 0xFF00FF00, 0xFF00FFFF);
                }
            }
            drawing.end();
        }
        if (pass == "hot") {
            if (this._jointx_cache) {
                drawing.begin();
                drawing.resetTransform();
                var jointx = this._jointx;
                for (var i = 0; i < jointx.length; i++) {
                    var p = jointx.getLocation(i);
                    var pp = this.baseToPixel(p);
                    drawing.draw_ui_handle_circle(pp, 4, 0xFF0000FF, 0xFF0000FF);
                }
                drawing.end();
            }
        }
    };
    Device.prototype.tryGetLocation = function (e, mode) {
        var p = e.pixel;
        var location = null;
        var D = pwg.UI_HITTEST_TOLERENCE * 2;
        var joints = this._joints;
        for (var i = 0, l = joints.length; i < l; i++) {
            var joint = joints[i];
            var d = p.getDistance(joint.pixel);
            if (d < D) {
                D = d;
                location = joint;
            }
        }
        if (location)
            return location;
        if (this._jointx_cache) {
            var cache = this._jointx_cache;
            for (var k in cache) {
                var joint = cache[k];
                var d = p.getDistance(joint.pixel);
                if (d < D) {
                    D = d;
                    location = joint;
                }
            }
        }
        if (location)
            return location;
        if (this._jointx_cache) {
            var jointx = this._jointx;
            var pp = this.pixelToBase(e.pixel);
            var lp = jointx.tryGetLocation(pp);
            if (lp) {
                location = new pwg.AbsoluteLocationEx(this, lp.id, "pixel");
                location.kpoint = lp;
                location.point.xy = this.baseToPixel(lp);
                location.angle = this.offset.angle + lp.xangle;
                location.update();
            }
        }
        return location;
    };
    Device.prototype.getLocation = function (id) {
        if (id.indexOf("jointx@") != -1) {
            id = id.substring(7);
            var cache = this._jointx_cache;
            if (cache[id]) {
                return cache[id];
            }
            else {
                var lp = this._jointx.getLocation(id);
                var location = new pwg.AbsoluteLocationEx(this, lp.id, "pixel");
                location.kpoint = lp;
                return location;
            }
        }
        else {
            var joints = this._joints;
            for (var i = 0, l = joints.length; i < l; i++) {
                var joint = joints[i];
                if (joint.id == id) {
                    return joint;
                }
            }
        }
        return null;
    };
    Device.prototype._get_handles = function () {
        return [this._annotation._handles[1]].concat(this._handles);
    };
    Device.prototype._use_location = function (loc) {
        if (loc.classid == pwg.AbsoluteLocationEx.classid) {
            if (!this._jointx_cache[loc.id]) {
                this._jointx_cache[loc.id] = loc;
            }
        }
    };

    Device.prototype._release_location = function (loc) {
        if (loc.classid == pwg.AbsoluteLocationEx.classid) {
            if (loc._use_counter == 0) {
                delete this._jointx_cache[loc.id];
            }
        }
    };

    Device.prototype.__save__=function(json)
    {
        json = pwg.PointGraphics.prototype.__save__.call(this,json);
        var cache = this._jointx_cache;
        if(cache)//just to record
        {
            json.jointx=[];
            for(var k in cache)
            {
                var joint =cache[k];
                var usid =joint.__using_id__();
                json.jointx.push(usid);
            }
        }
        return json;
    };

    Device.prototype.__load__=function(json,context)
    {
        pwg.PointGraphics.prototype.__load__.call(this,json,context);
    };
    pwg.registerClass(Device);
    ////////////////////////////////////////////////////////////////////
    function DeviceXBuild(type, options) {
        this._options = options;
        this._type = type;
        pwg.super(this, pwg.BaseBuild,"simple");
        var that = this;
        //dynamic create a json creator
        pwg.json.registerCreator("device:"+type, function (container, id, json) {
            return that.createJSON(container, id, json);
        });
    }
    pwg.inherits(DeviceXBuild, pwg.BaseBuild);
    DeviceXBuild.prototype.getLocationMode = function () {
        return this._locationMode;
    };
    DeviceXBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(Device.classid, this._options);
                this._creating.__json_creator__ = "device:"+this._type;
                this._creating.setLocation(e);
            }
        } else
            if (action == "move") {
                if (this._creating) {
                    this._creating.setLocation(e);
                }
            } else
                if (action == "up" || action == "post") {
                    if (this._creating) {
                        this._creating.setLocation(e);
                        this._context.container.addChild(this._creating);
                        this._creating = null;
                    }
                }
    };
    DeviceXBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating = null;
        }
    };
    DeviceXBuild.prototype.create = function (container, e) {
        var creating = container.createGraphics(Device.classid, this._options);
        creating.__json_creator__ = "device:"+this._type;
        creating.setLocation(e);
        return creating;
    };
    DeviceXBuild.prototype.createJSON = function (container, id, json) {
        var creating = new Device(container,id,this._options);
        creating.__json_creator__ ="device:"+this._type;
        return creating;
    };
    DeviceXBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "entity"); //TODO:for other render 
        }
    };
    function register_io_device_class(type, name, options) {
        var cn = options.CN?options.CN:name;
        var icon = options.icon;
        var bounds = options.bounds;
        /*
            i
           [c]   
            o
        */
        var center = bounds.center;
        var joints = [];
        joints.push(new pwg.point(center.x, bounds.top));
        joints[0].xangle = 0;
        joints[0].id = "input";

        joints.push(new pwg.point(center.x, bounds.bottom));
        joints[1].xangle = 0;
        joints[1].id = "output";

        var pivots = [];
        pivots.push(
            {
                name: "center",
                point: center,
                rotate0: new pwg.point(0, bounds.bottom + 10),
                sizeA: new pwg.point(bounds.right, bounds.bottom),
                sizeB: new pwg.point(bounds.right, center.y),
                location: "absolute"
            });

        pivots.push(
            {
                name: "top-center",
                point: new pwg.point(center.x, bounds.top),
                rotate0: new pwg.point(0, bounds.bottom + 10),
                sizeA: new pwg.point(bounds.right, bounds.bottom),
                sizeB: new pwg.point(bounds.right, center.y),
                location: "joint"
            });

        pivots.push(
            {
                name: "bottom-center",
                point: new pwg.point(center.x, bounds.bottom),
                rotate0: new pwg.point(center.x, bounds.top - 10),
                sizeA: new pwg.point(bounds.right, bounds.top),
                sizeB: new pwg.point(bounds.right, center.y),
                location: "joint"
            });

        var uri = "device:" + icon;
        pwg.drawing.define(uri, icon);
        var xdata = options.xdata||{};
        xdata.CN=xdata.CN||name;
        xdata.type=xdata.type||"device:"+type;
        var xoptions =
        {
            icon: uri,
            bounds: bounds,
            pivots: pivots,
            joints: joints,
            xdata: xdata
        };
        var build = new DeviceXBuild(type, xoptions);
        pwg.graphics.registerBuild(name, build);
    }
    register_io_device_class("pwg.device.test", "外来测试", { CN: "测试", icon: pwg.ROOT_PATH+"/pwg/svg/测试.svg", bounds: new pwg.rectangle(-11, -25, 22, 50) });
    register_io_device_class("pwg.device.zyb", "专用变", { CN: "专用变", icon: pwg.ROOT_PATH+"/pwg/svg/标准/专用变.svg", bounds: new pwg.rectangle(-12, -25, 24, 50)});
    ///////////////////////////////////////////////////////////////////////////////////
    function register_hub_device(type, name, options) {
        var icon = options.icon;
        var bounds = options.bounds;
        var jointx = null;
        var center = bounds.center;
        if (options.jointx == "circle") {
            jointx = new CircleLocation(center, bounds.width / 2, 2, 12);
        }
        else if (options.jointx == "box") {
            jointx = new BoxLocation(bounds.topLeft, bounds.bottomRight, 4, 2);
        }

        var joints = [];
        joints.push(new pwg.point(center));
        joints[0].xangle = 0;
        joints[0].id = "center";

        var pivots = [];
        pivots.push({
            name: "center",
            point: center,
            rotate0: new pwg.point(center.x, bounds.bottom),
            sizeA: new pwg.point(bounds.right, center.y),
            sizeB: new pwg.point(bounds.right, bounds.bottom),
            location: "joint"
        });

        pivots.push({
            name: "top",
            point: new pwg.point(center.x, bounds.top),
            rotate0: new pwg.point(center.x, bounds.bottom),
            sizeA: new pwg.point(bounds.right, center.y),
            sizeB: new pwg.point(bounds.right, bounds.bottom),
            location: "joint"
        });

        var uri = "device:" + icon;
        pwg.drawing.define(uri, icon);
        var xdata = options.xdata||{};
        xdata.CN=xdata.CN||name;
        xdata.type=xdata.type||"device:"+type;
        var xoptions =
        {
            icon: uri,
            bounds: bounds,
            pivots: pivots,
            joints: joints,
            jointx: jointx,
            xdata:xdata
        };
        var build = new DeviceXBuild(type, xoptions);
        pwg.graphics.registerBuild(name, build);
    }
    var bounds =  new pwg.rectangle(-32, -32, 64, 64);

    register_hub_device("pwg.device.bdz110(66)", "变电站110(66)kv", {
        CN: "变电站110(66)kv",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/变电站110(66)kv.svg",
        bounds: bounds,
        jointx: "circle"
    });
    register_hub_device("pwg.device.bdz220(330)", "变电站220(330)kv", {
        CN: "变电站220(330)kv",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/变电站220(330)kv.svg",
        bounds: bounds,
        jointx: "circle"
    });

    register_hub_device("pwg.device.dlfxx", "电缆分支箱", {
        CN: "电缆分支箱",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/电缆分支箱.svg",
        bounds: bounds,
        jointx: "box"
    });
    register_hub_device("pwg.device.hwg", "环网柜HW", {
        CN: "环网柜HW",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/环网柜HW.svg",
        bounds: bounds,
        jointx: "box"
    });
    register_hub_device("pwg.device.pds", "配电室", {
        CN: "配电室",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/配电室.svg",
        bounds: bounds,
        jointx: "box"
    });
    register_hub_device("pwg.device.xb", "箱变", {
        CN: "箱变",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/箱变.svg",
        bounds: bounds,
        jointx: "box"
    });
};
