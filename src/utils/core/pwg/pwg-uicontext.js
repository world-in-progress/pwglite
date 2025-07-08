/*
    pwg-canvas-render-engine.js
*/
if (typeof pwg == 'undefined')
    pwg = {};

var PWGObject = pwg.PWGObject;
pwg.uicontext = function () {
    pwg.UI_HITTEST_TOLERENCE = 4;

    function UiContext(layer) {
        this.layer = layer;
        this._activeTool = undefined;
        this._activeObject = null;
        this._creatingBuild = null;
        this._container = null;
        this.tools = {
            "creating": new pwg.DefaultCreatingTool(),
            "editing": new pwg.DefaultEditingTool(),
            "info": new pwg.DefaultInfoTool()
        };
        this.defaultTool = this.tools.editing;
    }
    pwg.inherits(UiContext, pwg.Object);
    pwg.defineClassProperty(UiContext, "uitool", {
        get: function () {
            return this._activeTool;
        },
        set: function (ut) {
            if (typeof ut == "string") {
                ut = this.tools[ut];
            }
            if (ut == this.uitool)
                return;
            if (ut != this._activeTool && this._activeTool) {
                this._activeTool.stop();
            }
            this._activeTool = ut;
            if (this._activeTool) {
                this._activeTool.start(this);
            } else {
                this.uitool = this.defaultTool;
                this.defaultTool.start(this);
            }
        }
    });
    pwg.defineClassProperty(UiContext, "scene", {
        get: function () {
            return this.layer.scene;
        }
    });

    pwg.defineClassProperty(UiContext, "container", {
        get: function () {
            return this._container ? this._container : this.layer.scene;
        },
        set: function (cc) {
            if (this._container != cc) {
                var last = this._container;
                this._container = cc;
                this.raiseEvent("containerChanged", { last: last, current: cc });
            }
        }
    });

    pwg.defineClassProperty(UiContext, "workspace", {
        get: function () {
            return this.layer.workspace;
        },
        set: function (c) {
            if (this._container == c)
                return;
            var last = this._container;
            this._container = c;
            if (this.on) {
                this.on("ui.ActiveContainerChanged", {
                    context: this,
                    last: last,
                    current: c
                });
            }
        }
    });

    pwg.defineClassProperty(UiContext, "activeObject", {
        get: function () {
            return this._activeObject;
        },
        set: function (o) {
            if (o == this._activeObject)
                return;
            var last = this._activeObject;
            this._activeObject = o;
            if (this.on) {
                this.on("ui.ActiveObjectChanged", {
                    context: this,
                    last: last,
                    current: o
                });
            }
            if (o) {
                if (o.getContext)
                    this.container = o;
                else
                    this.container = o.container;
            } else
                this.container = null;
        }
    });

    pwg.defineClassProperty(UiContext, "graphicsCtx", {
        get: function () {
            return this.layer.context;
        }
    });
    pwg.defineClassProperty(UiContext, "creatingBuild", {
        get: function () {
            return this._creatingBuild;
        },
        set: function (val) {
            this._creatingBuild = val;
            if (this._creatingBuild) {
                this._creatingBuild.setContext(this);
            }
        }
    });
    UiContext.prototype.onmousedown = function (e) {
        pwg.utils.ContextMenu.hide();
        if (this._activeTool)
            return this._activeTool.onmousedown(e);
        else
            return false;
    };
    UiContext.prototype.onmouseup = function (e) {
        if (this._activeTool) {
            var retval = this._activeTool.onmouseup(e);
            if (e.button == pwg.MOUSE_BUTTON_RIGHT && this._activeTool != this.defaultTool) {
                this.uitool = this.defaultTool;
            }
            return retval;
        } else
            return false;
    };

    UiContext.prototype.onmousemove = function (e) {
        if (this._activeTool)
            return this._activeTool.onmousemove(e);
        else
            return false;
    };

    UiContext.prototype.onmousewheel = function (e) {
        if (this._activeTool)
            return this._activeTool.onmousewheel(e);
        else
            return false;
    };

    UiContext.prototype.cancel = function (e) {
        if (this._activeTool)
            return this._activeTool.cancel();
        else
            return false;
    };

    UiContext.prototype.tryGetUiCommand = function (e) {
        if (this._activeTool)
            return this._activeTool.tryGetUiCommand(e);
        else
            return null;
    };
    UiContext.prototype.render = function (context) {
        if (this.activeObject) {
            this.activeObject.update(true);
            this.activeObject.render(context.drawing, 'ui');
        }
        if (this._activeTool) {
            this._activeTool.render(context);
        }
    };

    UiContext.prototype.raiseEvent = function (name, e) {
        if (this.on) {
            return this.on(name, e);
        }
    };
    pwg.UiContext = UiContext;
    /////////////////////////////////////////////////////////
    function UiTool(name) {
        pwg.super(this, pwg.Object);
        this.name = name;
        this.context = null;
    }
    pwg.inherits(UiTool, pwg.Object);
    UiTool.prototype.start = function (context) {
        this._context = context;
    };
    UiTool.prototype.stop = function (context) { };
    UiTool.prototype.onmouseup = function (e) {
        return false;
    };
    UiTool.prototype.onmousedown = function (e) {
        return false;
    };
    UiTool.prototype.onmousemove = function (e) {
        return false;
    };
    UiTool.prototype.onmousewheel = function (e) {
        return false;
    };
    UiTool.prototype.cancel = function (e) {
        return false;
    };
    UiTool.prototype.tryGetUiCommand = function (e) {
        return null;
    };
    UiTool.prototype.render = function (context) { };
    /////////////////////////////////////////////////////////////
    function tryGetLocation(scene, e, ignores, mode, filter, hitter) {
        if (hitter)
            hitter.hitted = null;
        var hitted = scene.hitTest(e, {
            ignores: ignores,
            filter: filter
        });
        if (hitted && hitted.succeed) {
            if (hitter)
                hitter.hitted = hitted.object;
            return hitted.object.tryGetLocation(e, mode);
        } else {
            return null;
        }
    }

    function get_location_mode(mode, e) {
        if (pwg.defined(mode))
            return mode;
        if (e.ctrl)
            return "joint";
        else
            return null;
    }
    /////////////////////////////////////////////////////////////
    function DefaultCreatingTool() {
        pwg.super(this, UiTool, 'uitool.creating');
    }
    pwg.inherits(DefaultCreatingTool, UiTool);
    pwg.defineClassId(DefaultCreatingTool, 'uitool.creating');
    DefaultCreatingTool.prototype.start = function (context) {
        this.context = context;
        this._last_e = null;
    };
    DefaultCreatingTool.prototype.stop = function (context) {
        if (this.context.creatingBuild) {
            this.context.creatingBuild.post();
        }
    };

    function make_handle_filter(build) {
        return function (o) {
            if (build.isLocationTarget) {
                return build.isLocationTarget(o);
            } else {
                return true;
            }
        }
    }

    // 在这里写上传事件
    DefaultCreatingTool.prototype.onLoadGeojson = function (geojson) {
        var build = this.context.creatingBuild; // 在build中撰写LoadGeojson方法
        if (build) {
            build.loadGeojson(geojson);
        }

    }

    DefaultCreatingTool.prototype.onmouseup = function (e) {
        if (this.context.creatingBuild) {
            var build = this.context.creatingBuild;
            var mode = build.getLocationMode();
            if (mode) {
                e.location = tryGetLocation(this.context.scene, e, null, mode, make_handle_filter(build), this);
            }
            if (e.button == pwg.MOUSE_BUTTON_LEFT) {
                var flag = build.update(e, "up");
                if (flag == "stop")
                    this.context.uitool = null;
            } else if (e.button == pwg.MOUSE_BUTTON_RIGHT) {
                var flag = build.post();
                if (flag == "stop")
                    this.context.uitool = null;
            }
        }
        this._last_e = null;
        return true;
    };
    DefaultCreatingTool.prototype.onmousedown = function (e) {
        var build = this.context.creatingBuild;
        if (build) {
            if (e.button == pwg.MOUSE_BUTTON_LEFT) {
                var mode = build.getLocationMode();
                if (pwg.defined(mode)) {
                    e.location = tryGetLocation(this.context.scene, e, null, mode, make_handle_filter(build), this);
                }
                build.update(e, "down");
            }
        }
        this._last_e = e;
        return true;
    };
    DefaultCreatingTool.prototype.onmousemove = function (e) {
        var build = this.context.creatingBuild;
        this.hitted = null;
        if (build) {
            if (e.button == pwg.MOUSE_BUTTON_LEFT || build.mode == "continuous") {
                e.location = "absolute";
                build.update(e, "move");
                var mode = build.getLocationMode();
                if (pwg.defined(mode)) {
                    e.location = tryGetLocation(this.context.scene, e, null, mode, make_handle_filter(build), this);
                }
            }
        }
        this._last_e = e;
        return true;
    };
    DefaultCreatingTool.prototype.cancel = function (e) {
        if (this.context.creatingBuild) {
            return this.context.creatingBuild.cancel();
        }
        return false;
    };
    DefaultCreatingTool.prototype.render = function (rc) {
        if (this.context.creatingBuild) {
            var drawing = rc.drawing;
            this.context.creatingBuild.render(rc);

            if (this._last_e && this._last_e.location && this._last_e.location.pixel) {
                var size = pwg.UI_HITTEST_TOLERENCE;
                drawing.begin();
                drawing.resetTransform();
                drawing.draw_ui_handle_circle(this._last_e.location.pixel, size * 4, 0xAAFF00FF, 0x0);
                drawing.end();
            }
            if (this.hitted) {
                this.hitted.update();
                this.hitted.render(drawing, "hot");
            }
        }
    };
    pwg.DefaultCreatingTool = DefaultCreatingTool;
    ////////////////////////////////////////////////////////////////
    //default editing tool                                        //
    ////////////////////////////////////////////////////////////////
    function DefaultEditingTool() {
        pwg.super(this, UiTool);
        this.activeHandle = null;
        this._last_e = null;
    }
    pwg.inherits(DefaultEditingTool, UiTool);

    DefaultEditingTool.prototype.start = function (context) {
        this.context = context;
    };
    DefaultEditingTool.prototype.stop = function (context) {

    };

    function get_nearset_ui_handle(o, p, tryGet) {
        if (!pwg.defined(o.handles))
            return null;
        var handles = o.handles;
        var D = pwg.UI_HITTEST_TOLERENCE;
        var handle = null;
        for (var i = 0, l = handles.length; i < l; i++) {
            var h = handles[i];
            var d = h.location.pixel.getDistance(p);
            if (d < D) {
                D = d;
                handle = h;
            }
        }
        if (!handle && o.tryGetUiHandle && tryGet) {
            handle = o.tryGetUiHandle({
                pixel: p
            });
        }
        return handle;
    }

    DefaultEditingTool.prototype.confirm_ui_handle = function (e) {
        if (!this.activeHandle) {
            var activeObject = this.context.activeObject;
            var activeHandle = null;
            if (activeObject) {
                activeHandle = get_nearset_ui_handle(activeObject, e.pixel, true);
                if (!activeHandle) {
                    var hit = activeObject.hitTest(e, pwg.drawing.default_paper_param);
                    if (!hit)
                        activeObject = null;
                    else {
                        activeObject = hit.object;
                    }
                }
            }
            if (!activeObject) {
                var option = {
                    tolerence: pwg.UI_HITTEST_TOLERENCE,
                };
                var hit = this.context.scene.hitTest(e, option);
                if (hit && hit.succeed) {
                    activeObject = hit.object;
                    activeHandle = get_nearset_ui_handle(activeObject, e.pixel);
                }
            }
            this.context.activeObject = activeObject;
            this.activeHandle = activeHandle;
        }
        return this.activeHandle != null;
    };

    DefaultEditingTool.prototype.onmousedown = function (e) {
        if (!this.context.container)
            return false;
        var last_active_object = this.context.activeObject;
        this.confirm_ui_handle(e);
        if (e.button != pwg.MOUSE_BUTTON_LEFT)
            return false;
        if (this.activeHandle) {
            {
                this.activeHandle.begin();
                this.activeHandle.update(e, 'update');
            }
        }
        return !!this.activeHandle || (last_active_object != this.context.activeObject && this.context.activeObject != null);
    };

    DefaultEditingTool.prototype.onmouseup = function (e) {
        var handle;

        function _filter_(o) {
            return handle.isLocationTarget(o);
        }
        if (this.activeHandle) {
            handle = this.activeHandle;
            var code = "";
            if (e.button == pwg.MOUSE_BUTTON_LEFT) {
                if (pwg.defined(handle.locationMode)) {

                    var location = tryGetLocation(this.context.container, e, [this.context.activeObject], handle.locationMode, _filter_, this);
                    if (!location && this.context.container != this.context.scene) {
                        location = tryGetLocation(this.context.scene, e, [this.context.activeObject], handle.locationMode, _filter_, this);
                    }
                    e.location = location;

                }
                code = this.activeHandle.update(e, 'post') || this.activeHandle.mode;
            }
            if (code != 'continuous' || e.button == pwg.MOUSE_BUTTON_RIGHT) {
                this.activeHandle.commit();
                this.activeHandle = null;
            }

            this.context.scene.__runtime_bounding_box = null;
            return true;
        } else
            return false;
    };

    DefaultEditingTool.prototype.onmousemove = function (e) {
        this._last_e = null;
        var handle = this.activeHandle;
        this.hitted = null;
        if (handle) {
            if (e.button == pwg.MOUSE_BUTTON_LEFT || handle.mode == "continuous") {
                var code = handle.update(e, 'update');
                var mode = get_location_mode(handle.locationMode, e);
                if (pwg.defined(mode)) {
                    e.location = tryGetLocation(this.context.scene, e, [this.context.activeObject], mode, make_handle_filter(handle), this);
                }
            }
            this.context.scene.__runtime_bounding_box = null;
            this._last_e = e;
            return true;
        } else
            return false;
    };
    DefaultEditingTool.prototype.onmousewheel = function (e) {

        return false;
    };
    DefaultEditingTool.prototype.cancel = function (e) {

        return false;
    };
    DefaultEditingTool.prototype.tryGetUiCommand = function (e) {
        var activeObject = this.context.activeObject;
        if (activeObject) {
            return activeObject.tryGetUiCommand(e, this.activeHandle);
        } else
            return null;
    };
    DefaultEditingTool.prototype.render = function (rc) {
        if (this.context.activeObject) {
            var drawing = rc.drawing;
            drawing.begin();
            drawing.resetTransform();
            var handles = this.context.activeObject.handles;
            if (handles) {
                var colors = pwg.drawing.ARGB;
                var size = pwg.UI_HITTEST_TOLERENCE * 2;
                for (var i = 0, l = handles.length; i < l; i++) {
                    var h = handles[i];
                    if (h.type == 'handle.move') {
                        if (h.pivot && h.pivot.style == "active")
                            drawing.draw_ui_handle_rect(h.location.pixel, size, colors.WHITE, colors.BLACK);
                        else
                            drawing.draw_ui_handle_rect(h.location.pixel, size, colors.YELLOW, colors.GREEN);
                    } else if (h.type == 'handle.rotate') {
                        drawing.draw_ui_handle_circle(h.location.pixel, size, colors.PINK, colors.BLACK);
                    } else if (h.type == 'handle.scale') {
                        drawing.draw_ui_handle_diamond(h.location.pixel, size, colors.GREEN, colors.BLACK);
                    } else if (h.type == 'handle.offset') {
                        drawing.draw_ui_handle_rect(h.location.pixel, size, colors.RED, colors.BLACK);
                    } else if (h.type == 'handle.size') {
                        drawing.draw_ui_handle_diamond(h.location.pixel, size, colors.GREEN, colors.BLACK);
                    } else if (h.type == 'handle.delete') {
                        drawing.draw_ui_handle_x(h.location.pixel, size, colors.RED, colors.BLACK);
                    } else if (h.type == 'handle.append') {
                        drawing.draw_ui_handle_plus(h.location.pixel, size, colors.RED, colors.BLACK);
                    } else {
                        drawing.draw_ui_handle_rect(h.location.pixel, size, colors.GREEN, colors.BLACK);
                    }
                }
                if (this.activeHandle) {
                    drawing.draw_ui_handle_circle(this.activeHandle.location.pixel, size / 2, colors.PINK, colors.GREEN);
                    if (this._last_e && this._last_e.location) {
                        drawing.draw_ui_handle_circle(this.activeHandle.location.pixel, size * 2, 0xAAFF00FF, 0x0);
                    }
                }
            }
            drawing.end();

            if (this.hitted) {
                this.hitted.render(drawing, "hot");
            }
        }

    };
    pwg.DefaultEditingTool = DefaultEditingTool;

    ////////////////////////////////////////////////////////////////
    //default information tool                                        //
    ////////////////////////////////////////////////////////////////
    function DefaultInfoTool() {
        pwg.super(this, UiTool);
        this._hottedObject = null;
        this._last_e = null;
    }
    pwg.inherits(DefaultInfoTool, UiTool);

    DefaultInfoTool.prototype.start = function (context) {
        this.context = context;
    };
    DefaultInfoTool.prototype.stop = function (context) {

    };

    DefaultInfoTool.prototype.onmousedown = function (e) {
        return false;
    };

    DefaultInfoTool.prototype.onmouseup = function (e) {
        var option = {
            tolerence: pwg.UI_HITTEST_TOLERENCE,
        };
        var hit = this.context.scene.hitTest(e, option);
        var activeObject = null;
        if (hit && hit.succeed) {
            activeObject = hit.object;
        }
        if (this.context.activeObject != activeObject) {
            this.context.activeObject = activeObject;
            return true;
        }
        return false;
    };

    DefaultInfoTool.prototype.onmousemove = function (e) {
        if (e.button != pwg.MOUSE_BUTTON_NONE) {
            return false;
        }
        var option = {
            tolerence: pwg.UI_HITTEST_TOLERENCE,
        };
        var hit = this.context.scene.hitTest(e, option);
        var activeObject = null;
        if (hit && hit.succeed) {
            activeObject = hit.object;
        }
        if (activeObject != this._hottedObject) {
            if (this._hottedObject) {
                this.context.raiseEvent("ui.mouseLeave", { e: e, object: this._hottedObject });
            }
            this._hottedObject = activeObject;
            if (activeObject) {
                this.context.raiseEvent("ui.mouseOver", { e: e, object: this._hottedObject });
            }
            return true;
        }
        return false;
    };
    DefaultInfoTool.prototype.onmousewheel = function (e) {

        return false;
    };
    DefaultInfoTool.prototype.cancel = function (e) {

        return false;
    };
    DefaultInfoTool.prototype.tryGetUiCommand = function (e) {
        return null;
    };
    DefaultInfoTool.prototype.render = function (rc) {
        if (this.context.activeObject) {
            this.context.activeObject.update(true);
            this.context.activeObject.render(rc.drawing, "ui");
        }
        if (this._hottedObject) {

            this._hottedObject.render(rc.drawing, "hot");
        }
    };
    pwg.DefaultInfoTool = DefaultInfoTool;
};