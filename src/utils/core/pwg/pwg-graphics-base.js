if (typeof pwg == 'undefined')
    pwg = {};
if (!pwg.graphics)
    pwg.graphics = {};
pwg.graphics.base = function () {
    var that = pwg.graphics;
    ////////////////////////////////////////////////////////////// 
    //Graphics:元素,场景的基本单元                              //
    ////////////////////////////////////////////////////////////// 
    function Graphics(container, id, owner) {
        pwg.super(this, pwg.Object);
        this.container = container;
        this.owner = owner;
        this.id = id;
        this._handles = null;
        this.layer = 'default';
    }
    pwg.inherits(Graphics, pwg.Object);
    pwg.defineClassId(Graphics, 'pwg.graphics');
    Graphics.prototype.update = function () {};
    /*pass=entity|selection|label|ui*/
    Graphics.prototype.render = function (pass) {};
    Graphics.prototype.getContainerContext = function () {
        return this.container.getContext();
    };
    Graphics.prototype.hitTest = function (e, filter, deep) {
        return null;
    };
    Graphics.prototype.collide = function (context) {
        return false;
    };
    Graphics.prototype.tryGetUiCommand = function (e, handle) {
        return null;
    };
    Graphics.prototype.executeCommand = function (op, argv) {
        return null;
    };
    Graphics.prototype.hasCommand = function (op) {
        return false;
    };

    Graphics.prototype.tryGetBoundingBox=function()
    {
        return null;
    };

    //option={name:""|type="joint|break"}
    Graphics.prototype.tryGetLocation = function (e, type) {
        return null;
    };
    Graphics.prototype._do_ui_handle_update = function () {
        return 'none';
    };
    Graphics.prototype._execute_ui_command = function () {
        return 'none';
    };
    Graphics.prototype._get_children = function () {
        return null;
    };
    Graphics.prototype.addChild = function (ch) {
        return false;
    };
    Graphics.prototype.removeChild = function (ch) {
        return -1;
    };
    Graphics.prototype.hasChild = function (ch) {
        return false;
    };

    Graphics.prototype.addTo = function (owner) {
        if (owner.children == null || this.getContainerContext() != owner.getContainerContext())
            return false;
        return owner.addChild(this);
    };
    Graphics.prototype.remove = function () {
        if (this.owner) {
            return this.owner.removeChild(this);
        } else {
            return false;
        }
    };

    Graphics.prototype.depth = function () {
        if (this.depth_runtime)
            return this.depth_runtime;
        else
            return 0;
    };

    Graphics.prototype.visitChildren = function (v) {
        var children = this.children;
        if (children) {
            for (var i = 0, l = children.length; i < l; i++) {
                var ch = children[i];
                v.on(ch);
                ch.visitChildren(v);
            }
        }
    };

    Graphics.prototype.removeDep = function (object) {
        return false;
    };

    Graphics.prototype.findDep = function (o, deps) {
        if (this.isDep(o)) {
            deps.push(this);
        }
        return deps;
    };

    Graphics.prototype.isDep = function (o) {
        return false;
    };

    Graphics.prototype.getLocation = function (id) {
        return null;
    };

    pwg.defineClassProperties(Graphics, {
        children: {
            get: function () {
                return this._children ? this._children : this._get_children();
            }
        },
        handles: {
            get: function () {
                return (this._get_handles ? this._get_handles() : this._handles);
            }
        },
        scene: {
            get: function () {
                return this.container.scene;
            }
        },
        text: {
            get: function () {
                if (this.name)
                    return this.name;
                if (this.xdata)
                    return this.xdata.CN;
                else
                    return this.id;
            }
        }
    });
    pwg.Graphics = Graphics;
    Graphics.prototype.__save__ = function (json) {
        if (!json)
            json = {};
        json.classid = this.classid;
        json.id = this.id;
        json.container = this.container.id;
        if (this.owner)
            json.owner = this.owner.id;
        json.layer = this.layer;
        if (this.__json_creator__)
            json.__json_creator__ = this.__json_creator__;
        if (this.xdata)
            json.xdata = this.xdata;
        return json;
    };
    Graphics.prototype.__load__ = function (json, context) {
        this.layer = json.layer;
        this.id = json.id;
        if (json.owner) {
            var owner = context.getObjectById(json.owner);
            if (owner)
                owner.addChild(this);
        }
        if (json.__json_creator__)
            this.__json_creator__ = json.__json_creator__;
        if (json.xdata)
            this.xdata = json.xdata;
    };
    Graphics.prototype.dispose = function () {};
    /////////////////////////////////////////////////////////////////
    //UiHandle:拥有界面交互的控制点                                   //
    /////////////////////////////////////////////////////////////////
    //mode=simple|continuous
    function UiHandle(owner, type, id, mode, location) {
        pwg.super(this, pwg.Object);
        this.mode = mode ? mode : 'simple';
        this.owner = owner;
        this.type = type;
        this.id = id;
        this.location = location ? location : new pwg.AbsoluteLocation(owner, id, "pixel");
        this.tooltip = null;
    }
    pwg.inherits(UiHandle, pwg.Object);
    UiHandle.prototype.begin = function () {
        if (this.owner._do_ui_handle_begin)
            this.owner._do_ui_handle_begin(this);
    };
    //action=down|move|up|post|delete
    UiHandle.prototype.update = function (e, action) {
        console.log('update', this, e, action)
        return this.owner._do_ui_handle_update(this, e, pwg.defaultValue(action, 'move'));
    };
    UiHandle.prototype.commit = function () {
        if (this.owner._do_ui_handle_commit)
            this.owner._do_ui_handle_commit(this);
    };
    UiHandle.prototype.cancel = function () {
        if (this.owner._do_ui_handle_cancel)
            this.owner._do_ui_handle_cancel(this);
    };
    UiHandle.prototype.isLocationTarget = function (object) {
        if (this.owner._is_ui_handle_location_target) {
            return this.owner._is_ui_handle_location_target(this, object);
        }
        return true;
    }
    pwg.UiHandle = UiHandle;
    /////////////////////////////////////////////////////////////////
    //UiCommand:提供运行时右键菜单的命令,有UiHandle关联             //
    /////////////////////////////////////////////////////////////////
    function UiCommand(owner, id, handle, title, mode) {
        pwg.super(this, pwg.Object);
        this.owner = owner;
        this.id = id;
        this.mode = mode;
        this.handle = handle;
        this.title = title;
        this.acckey = null;
        this.icon = null;
        this.tooltip = null;
        this.type = "execute";
        this.children = [];
        /*
            其它数据由这里添加
        */
    }
    pwg.inherits(UiCommand, pwg.Object);
    UiCommand.prototype.execute = function (argv) {
        return this.owner._execute_ui_command(this, argv);
    };
    pwg.UiCommand = UiCommand;
    /*
        Build
    */
    ///////////////////////////////////////////////////////////
    function BaseBuild(mode) {
        pwg.super(this, pwg.Object);
        this.mode = mode; //|simple|continuous
        this._creating = null;
    }
    pwg.inherits(BaseBuild, pwg.Object);
    BaseBuild.prototype.setContext = function (context) {
        this._context = context;
    };
    BaseBuild.prototype.update = function (e, action) {};
    BaseBuild.prototype.getLocationMode = function () {
        return null;
    };
    BaseBuild.prototype.render = function (drawing) {};
    BaseBuild.prototype.cancel = function () {};
    BaseBuild.prototype.post = function () {};
    pwg.graphics.BaseBuild = BaseBuild;
    pwg.BaseBuild = BaseBuild;

    ///////////////////////////////////////////////////////////    
    that._graphics_build_cache_map = {};
    that.builds = [];

    function register_graphics_build(name, build) {
        build.title = name; //confirm the name
        that.builds.push(build);
        that._graphics_build_cache_map[name] = build;
    }
    that.registerBuild = register_graphics_build;
    that.getBuild = function (n) {
        return that._graphics_build_cache_map[n]; //TODO:
    };

    ///////////////////////////////////////////////////////////
    //最基础的分组对象                                          //
    ///////////////////////////////////////////////////////////
    function Group(container, id) {
        pwg.super(this, pwg.Graphics, container, id);
        this._children = [];
    }
    pwg.inherits(Group, pwg.Graphics);
    pwg.defineClassId(Group, "pwg.Group");
    Group.prototype.nodes = function () {
        return null;
    };
    Group.prototype._get_children = function () {
        return this._children;
    };
    Group.prototype.addChild = function (ch) {
        var children = this._children;
        if (ch.owner == null /*&& (ch.container == this.container)*/ ) { //TODO:check the container same
            children.push(ch);
            ch.owner = this;
            this.raiseEvent("child-added", {
                parent: this,
                child: ch
            });
            return true;
        } else {
            return false;
        }
    };
    Group.prototype.removeChild = function (ch) {
        if (ch.owner == this) {
            ch.owner = null;
            var children = this._children;
            var ix = children.indexOf(ch);
            children.splice(ix, 1);
            this.raiseEvent("child-removed", {
                parent: this,
                child: ch
            });
            return true;
        } else {
            return false;
        }
    };
    Group.prototype.hasChild = function (ch) {
        return this._children.indexOf(ch) > -1;
    };
    Group.prototype.render = function (drawing, pass) {
        var children = this._children;
        for (var i = 0, l = children.length; i < l; i++) {
            var ch = children[i];
            ch.render(drawing, pass);
        }
    };
    Group.prototype.raiseEvent = function (name, e) {
        
        if (this.owner) {
            this.owner.raiseEvent(name, e);
        }
    };

    Group.prototype.findDep = function (o, result) {
        var children = this._children;
        for (var i = 0, l = children.length; i < l; i++) {
            var ch = children[i];
            ch.findDep(o, result);
        }
        return result;
    };

    Group.prototype.hitTest = function (e, option) {
        var D = 1e10;
        var hitted = null;
        var children = this.children;
        var filter = option ? option.filter : null;
        var ignores = option ? option.ignores : null;
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[l - i - 1];
            if ((!filter || filter(child)) && (!ignores || (ignores.indexOf(child) == -1))) {
                var hit = child.hitTest(e, option);
                if (hit && hit.succeed && hit.distance < D) {
                    D = hit.distance;
                    hitted = hit.object;
                }
            }
        }
        return hitted ? {
            succeed: true,
            object: hitted,
            distance: D
        } : null;
    };

    Group.prototype.visit = function (callback) {
        var children = this._children;
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            callback(child);
            if (child.visit) {
                child.visit(callback);
            }
        }
    };

    Group.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        return json;
    };

    Group.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
    };
    pwg.Group = Group;
    pwg.registerClass(pwg.Group);
    ///////////////////////////////////////////////////////////
    //容器对象,支持                                            //
    ///////////////////////////////////////////////////////////
    function GraphicsContainer(scene, id) {
        pwg.super(this, Group, scene, id);
        this._context = null;
    }
    pwg.inherits(GraphicsContainer, Group);
    GraphicsContainer.prototype.getContext = function () {
        return this._context;
    };
    GraphicsContainer.prototype.createGraphics = function (type, ...argv) {
        return this.scene._create_graphics(type, this, ...argv);
    };
    pwg.GraphicsContainer = GraphicsContainer;

    /////////////////////////////////////////////////////////////////
    //为所有的点图形,提供一个共同的基类                                 //
    /////////////////////////////////////////////////////////////////
    /*  point pivot layout
        +   T   +
        L   O   R  ->SA
        +   B   +
            R0     \ SB 
        {
            name:  a
            point:p,
            rotate0:v,
            sizeA:v,
            sizeB:v
        }
    */
    //
    //pwg point model
    //pixel: inline->[inline matrix]->base->[offset matrix]->frame->[frame matrix]->pixel
    //       frameToPixel pixelToFrame
    //       frameToBase  baseToFrame
    //       baseToPixel  pixelToBase
    //
    function PointGraphics(container, id, bounds, pivots, offmode) {
        pwg.super(this, pwg.Graphics, container, id);
        this._location = new pwg.OptionalLocation(this, "default", "local");
        this._offset_location = new pwg.OffsetLocation(this, "offset", this._location, offmode ? offmode : "pixel");

        this._frameTRS = new pwg.TRS();
        this._offsetTRS = new pwg.TRS();
        this._TRS = new pwg.TRS();

        this._handle_rotate = new pwg.UiHandle(this, "handle.rotate", "rotate");
        this._handle_scaleA = new pwg.UiHandle(this, "handle.scale", "scale.A");
        this._handle_scaleB = new pwg.UiHandle(this, "handle.scale", "scale.B");
        this._bounds = bounds;
        var _handles = [this._handle_rotate, this._handle_scaleA, this._handle_scaleB];
        this._pivots = pivots;
        var mvhandles = [];
        for (var i = 0, l = pivots.length; i < l; i++) {
            var pivot = pivots[i];
            var handle = new pwg.UiHandle(this, "handle.move", "move" + pivot.name);
            handle.pivot = pivot;
            handle.locationMode = pivot.location;
            mvhandles.push(handle);
        }
        this._handles = mvhandles.concat(_handles);
        this._change_pivot_to_(pivots[0]);

        this._annotation = new pwg.InlineOffsetAnnotation(container, this);
        this._annotation.location = this._offset_location;
        this._annotation.autoAdjustRatio = true;
        //this._handles.push(this._annotation._handles[1]);
    }
    pwg.inherits(PointGraphics, pwg.Graphics);
    PointGraphics.prototype.frameToPixel = function (point) {
        return this._frameTRS.M.transform(point);
    };
    PointGraphics.prototype.pixelToFrame = function (point) {
        return this._frameTRS.I.transform(point);
    };
    PointGraphics.prototype.baseToFrame = function (point) {
        return this._offsetTRS.M.transform(point);
    };
    PointGraphics.prototype.frameToBase = function (point) {
        return this._offsetTRS.I.transform(point);
    };
    PointGraphics.prototype.baseToPixel = function (point) {
        return this._TRS.M.transform(point);
    };
    PointGraphics.prototype.pixelToBase = function (point) {
        return this._TRS.I.transform(point);
    };
    PointGraphics.prototype._raise_location_changed_event = function () {
        this.scene.raiseEvent("location-mode-changed", this);
    };
    PointGraphics.prototype._change_pivot_to_handle = function (handle) {
        this._change_pivot_to_(handle.pivot);
    };
    PointGraphics.prototype._change_pivot_to_name = function (name) {
        var pivots = this._pivots;
        for (var i = 0, l = pivots.length; i < l; i++) {
            var pivot = pivots[i];
            if (pivot.name == name) {
                this._change_pivot_to_(pivot);
                break;
            }
        }
    };
    PointGraphics.prototype._change_pivot_to_ = function (pivot) {
        if (this.pivot != pivot) {
            if (this.pivot)
                this.pivot.style = "";
            pivot.style = "active";
            this.pivot = pivot;
            this._handle_rotate.roate0 = pivot.rotate0;
            this._handle_scaleA.size = pivot.sizeA;
            this._handle_scaleB.size = pivot.sizeB;
        }
    };

    PointGraphics.prototype._updateMatrix = function () {
        this._location.update();
        var frameloc = this._location;

        this._frameTRS.make(frameloc.pixel, frameloc.angle, 1);
        var context = this.getContainerContext();
        var offsetloc = this._offset_location;
        offsetloc.update();
        offset = offsetloc.offset;
        this._offsetTRS.make(offset.t, offset.r, offset.s * context.pointAdjustRatio, this.pivot.point);

        // function printMatrix(label, m) {
        //     // 假设 m 有 a, b, c, d, tx, ty 属性
        //     console.log(`${label}:`);
        //     console.log(
        //         `[ ${m.a}, ${m.c}, ${m.tx} ]\n` +
        //         `[ ${m.b}, ${m.d}, ${m.ty} ]\n` +
        //         `[ 0, 0, 1 ]`
        //     );
        // }
        
        // // 在 _updateMatrix 方法中调用
        // printMatrix('_frameTRS.M', this._frameTRS.M);
        // printMatrix('_offsetTRS.M', this._offsetTRS.M);
        
        this._TRS.M = this._frameTRS.M.appended(this._offsetTRS.M);
        this._TRS.I = this._TRS.M.inverted();
    };

    PointGraphics.prototype.depth = function () {
        return this._location.depth();
    };

    PointGraphics.prototype.setLocation = function (e) {
        this._location.set(e);
    };

    PointGraphics.prototype.tryGetBoundingBox=function()
    {
        return this._location.lonlat;
    };

    PointGraphics.prototype.isDep = function (o) {
        return this._location.isDep(o);
    };

    PointGraphics.prototype.removeDep = function (o) {
        return this._location.removeDep(o);
    };

    pwg.defineClassProperties(
        PointGraphics, {
            "location": {
                get: function () {
                    return this._location;
                }
            },
            "offset": {
                get: function () {
                    return this._offset_location;
                }
            },
            "locationTRS": {
                get: function () {
                    return this._frameTRS;
                }
            },
            "offsetTRS": {
                get: function () {
                    return this._offsetTRS;
                }
            },
            "TRS": {
                get: function () {
                    return this._TRS;
                }
            },
            "annotation": {
                get: function () {
                    return this._annotation;
                }
            }
        }
    );

    PointGraphics.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        json.location = this._location.__save__();
        json.offset = this._offset_location.__save__();
        json.bounds = pwg.json.formats[pwg.rectangle].save(this._bounds);
        json.pivot = this.pivot.name;
        json.annotation = this._annotation.__save__();
        return json;
    };

    PointGraphics.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
        this._location.__load__(json.location, context);
        this._offset_location.__load__(json.offset, context);
        this._bounds = pwg.json.formats[pwg.rectangle].load(json.bounds);
        this._change_pivot_to_name(json.pivot);
        this._annotation.__load__(json.annotation, context);
    };

    pwg.PointGraphics = PointGraphics;
    /////////////////////////////////////////////////////////////////////////
    function _do_point_graphics_handle_move_update_e(owner, handle, e) {
        if (handle.pivot != owner.pivot) {
            owner._change_pivot_to_(handle.pivot);
        }
        var location = e.location;
        if (handle.pivot.location == "absolute" ||(e.location && e.location.owner.isDep(owner)))
            e.location = "absolute";

        owner._location.set(e);
        e.location = location;
        return true;
    }
    pwg.utils._do_point_graphics_handle_move_update_e = _do_point_graphics_handle_move_update_e;

    function _do_point_graphics_handle_move_update(owner, handle) {
        var bpoint = handle.pivot.point;
        handle.location.point = owner.baseToPixel(bpoint);
        handle.location.update();
    }
    pwg.utils._do_point_graphics_handle_move_update = _do_point_graphics_handle_move_update;
    /////////////////////////////////////////////////////////
    function _do_point_graphics_handle_rotate_update_e(owner, handle, e) {
        var pivot = owner.pivot;
        var p0 = pivot.point;
        var v1 = pivot.rotate0.subtract(p0);
        var v2 = owner.pixelToFrame(e.pixel);
        var dangle = v2.getDirectedAngle(v1);
        owner._offset_location.offset.r = -dangle;
    }
    pwg.utils._do_point_graphics_handle_rotate_update_e = _do_point_graphics_handle_rotate_update_e;

    function _do_point_graphics_handle_rotate_update(owner, handle) {
        var pivot = owner.pivot;
        var point = pivot.rotate0;
        handle.location.point = owner.baseToPixel(point);
        handle.location.update();
    }
    pwg.utils._do_point_graphics_handle_rotate_update = _do_point_graphics_handle_rotate_update;
    //////////////////////////////////////////////////////////
    function _do_point_graphics_handle_scale_update_e(owner, handle, e) {
        var pivot = owner.pivot;
        var p0 = pivot.piont;
        var size1 = handle.size.subtract(p0);
        var sizeP = owner.pixelToBase(e.pixel);
        var nsize1 = size1.clone().normalize();
        var size = nsize1.dot(sizeP);
        var offset = owner._offset_location.offset;
        offset.s = Math.max(0.25, offset.s * size / size1.length);
    }
    pwg.utils._do_point_graphics_handle_scale_update_e = _do_point_graphics_handle_scale_update_e;

    function _do_point_graphics_handle_scale_update(owner, handle) {
        var pivot = owner.pivot;
        var point = pivot.point.add(handle.size);
        handle.location.point = owner.baseToPixel(handle.size);
        handle.location.update();
    }
    pwg.utils._do_point_graphics_handle_scale_update = _do_point_graphics_handle_scale_update;

    PointGraphics.prototype._do_ui_handle_begin = function (handle) {
        PointGraphics.TRS0 = {};
        PointGraphics.TRS0.M = this._TRS.M.clone();
        PointGraphics.TRS0.I = this._TRS.I.clone();
        return true;
    };

    PointGraphics.prototype._do_ui_handle_update = function (handle, e) {
        if (handle.type == "handle.move") {
            _do_point_graphics_handle_move_update_e(this, handle, e);
        } else if (handle.type == "handle.rotate") {
            _do_point_graphics_handle_rotate_update_e(this, handle, e);
        } else if (handle.type == "handle.scale") {
            _do_point_graphics_handle_scale_update_e(this, handle, e);
        }
        return true;
    };

    PointGraphics.prototype.updateOnlyLocation = function ()
    {
        this._updateMatrix();
    };
    PointGraphics.prototype.update = function (all) {
        this._updateMatrix();
        var context = this.getContainerContext();
        this._visibility = context.viewport.contains(this._location.pixel);
        
        if (this._visibility  ) {
            if(all)
            {
                var handles = this._handles;
                for (var i = 0, l = handles.length; i < l; i++) {
                    var h = handles[i];
                    if (h.type == "handle.move") {
                        _do_point_graphics_handle_move_update(this, h);
                    } else if (h.type == "handle.scale") {
                        _do_point_graphics_handle_scale_update(this, h);
                    } else if (h.type == "handle.rotate") {
                        _do_point_graphics_handle_rotate_update(this, h);
                    }
                }                
            }
            this._annotation.update();
        }
    };
    PointGraphics.prototype.dispose = function () {
        this._location.removeDep();
    };
};