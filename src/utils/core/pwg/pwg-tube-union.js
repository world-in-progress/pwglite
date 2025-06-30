//import { Bezier } from "bezier-js/dist/bezier.js"
if (typeof pwg == 'undefined')
    pwg = {};
pwg.tube = function () {
    ////////////////////////////////////////////////////
    //tube math util                                  //
    ////////////////////////////////////////////////////
    function calc_tube_fork_size(center, offset, e) {
        var d = pwg.math.getLineNearestPoint(e, center, center.add(offset));
        return d.distance;
    }

    function calc_tube_fork_qoffset(center, offset, e) {
        var d = pwg.math.getLineNearestPoint(e, center, center.add(offset.multiply(-100)));
        var p = new pwg.point(d.x, d.y);
        return center.getDistance(p);
    }

    function cal_tube_fork_corners(center, offset, d, qoffset) {
        var p = center.add(offset);
        var u = offset.normalize();
        var v = u.rotate(90);
        var q = center.add(u.multiply(-qoffset));
        var lp = v.multiply(d).add(p);
        var rp = v.multiply(-d).add(p);
        var clp = v.multiply(d).add(q);
        var crp = v.multiply(-d).add(q);
        return {
            p,
            lp,
            rp,
            clp,
            crp,
            q,
            u,
            v
        };
    }

    function call_tube_intersection(t1, t2, ctl) {
        if (!ctl || ctl == "rl")
            return pwg.math.getIntersectionWithLine(t1.rp.local, t1.crp, t2.lp.local, t2.clp);
        else
            if (ctl == 'rr')
                return pwg.math.getIntersectionWithLine(t1.rp.local, t1.crp, t2.rp.local, t2.crp);
            else
                if (ctl == 'lr')
                    return pwg.math.getIntersectionWithLine(t1.lp.local, t1.clp, t2.rp.local, t2.crp);
                else
                    if (ctl == 'll')
                        return pwg.math.getIntersectionWithLine(t1.lp.local, t1.clp, t2.lp.local, t2.clp);

        return pwg.math.getIntersectionWithLine(t1.rp.local, t1.crp, t2.lp.local, t2.clp);
    }
    ////////////////////////////////////////////////////
    function TubeFork(owner, name, offset, d, qoffset) {
        this.offset = new pwg.point(offset); //t,d;
        this.d = d;
        this.qoffset = qoffset ? qoffset : 0;
        this.p = new pwg.AbsoluteLocation(owner, name, "local");
        this.lp = new pwg.AbsoluteLocation(owner, name, "local");
        this.clp = new pwg.point();
        this.rp = new pwg.AbsoluteLocation(owner, name, "local");
        this.crp = new pwg.point();
        this.handleP = new pwg.UiHandle(owner, "handle.offset", name + "-offset", "simple", this.p);
        this.handleP.fork = this;
        this.handleL = new pwg.UiHandle(owner, "handle.size", name + "-sizeL", "simple", this.lp);
        this.handleL.fork = this;
        this.handleR = new pwg.UiHandle(owner, "handle.size", name + "-sizeR", "simple", this.rp);
        this.handleR.fork = this;
        this.q = new pwg.AbsoluteLocation(owner, name, "local");
        this.handleQ = new pwg.UiHandle(owner, "handle.scale", name + "-offsetQ", "simple", this.q);
        this.handleQ.fork = this;
    }
    TubeFork.prototype.constructor = TubeFork;
    TubeFork.prototype.scale=function(scale)
    {
        this.offset = this.offset.multiply(scale);
        this.d*=scale;
        this.qoffset*=scale;
    };
    TubeFork.prototype.set = function (fk) {
        this.offset = fk.offset;
        this.qoffset = fk.q ? fk.q : 0;
        this.d = fk.d;
    };
    TubeFork.prototype.update = function (owner, all) {
        if (all) {
            var o = owner._O;
            var corners = cal_tube_fork_corners(o.local, this.offset, this.d, this.qoffset);
            this.p.set(corners.p);
            this.lp.set(corners.lp);
            this.clp = corners.clp;
            this.rp.set(corners.rp);
            this.crp = corners.crp;
            this.q.set(corners.q);
            this.u = corners.u;
            this.v = corners.v;
        }
        this.rp.update();
        this.lp.update();
        this.p.update();
        this.q.update();
    };
    TubeFork.prototype.__save__ = function () {
        var json = {
            offset: pwg.json.formats[pwg.point].save(this.offset),
            q: this.qoffset,
            d: this.d
        };
        return json;
    };
    TubeFork.prototype.__load__ = function (json, context) {
        json.offset = pwg.json.formats[pwg.point].load(json.offset);
        this.set(json);
    };
    /////////////////////////////////////////////////////
    pwg.tube.__default_outline_style = pwg.styles.get("tube.default-outline");
    pwg.tube.__default_frame_style =   pwg.styles.get("tube.default-frame");
    //////////////////////////////////////////////////////
    function TubeUnion(container, id, isframe) {
        pwg.super(this, pwg.Graphics, container, id);
        this._isframe = isframe ? true : false;
    }
    pwg.inherits(TubeUnion, pwg.Graphics);
    TubeUnion.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        json.isframe = this._isframe;
        return json;
    };
    TubeUnion.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
        this._isframe = json.isframe;
    };

    TubeUnion.prototype.tryGetLocation = function (e, mode) {
        if (!this._joints)
            return null;
        var loc = null;
        if (mode == "joint" || !pwg.defined(mode)) {
            var joints = this._joints;
            var D = pwg.UI_HITTEST_TOLERENCE * 2;
            for (var i = 0, l = joints.length; i < l; i++) {
                var p = joints[i].pixel;
                var d = p.getDistance(e.pixel);
                if (d < D) {
                    loc = joints[i];
                    D = d;
                }
            }
        }
        return loc;
    };
    TubeUnion.prototype.getLocation = function (n) {
        if (!this._joints)
            return null;
        var joints = this._joints; 
        for (var i = 0, l = joints.length; i < l; i++) {
            if(joints[i].name == n)
                return joints;
        }
        return null;
    };

    function _draw_joints_(joints,drawing)
    {
        var size = pwg.UI_HITTEST_TOLERENCE;
        var colors = pwg.drawing.ARGB;
        drawing.begin();
        drawing.resetTransform();
        for (var i = 0, l = joints.length; i < l; i++) {
            var p = joints[i].pixel;
            drawing.draw_ui_handle_diamond(p, size, colors.RED, colors.YELLOW);
        }
        drawing.end();
    }

    //////////////////////////////////////////////////////
    /*
        TubeUnionX
                    D
                    +
                    |
            Al   +G | H+
            A+------ +  -------+C
            Ar   +E | F+
                    |
                    +
                    B
    
    */
    function TubeUnionX(container, id, isframe) {
        pwg.super(this, TubeUnion, container, id, isframe);
        this._O = new pwg.OptionalLocation(this, "O", "local");
        this._handleO = new pwg.UiHandle(this, "handle.move", "handle.location", "simple", this._O);
        this._forkA = new TubeFork(this, "A", {
            x: -1,
            y: 0
        }, 0.1);
        this._forkB = new TubeFork(this, "B", {
            x: 0,
            y: 1
        }, 0.1);
        this._forkC = new TubeFork(this, "C", {
            x: 1,
            y: 0
        }, 0.1);
        this._forkD = new TubeFork(this, "D", {
            x: 0,
            y: -1
        }, 0.1);
        this._E = new pwg.AbsoluteLocation(this, "E", "local");
        this._F = new pwg.AbsoluteLocation(this, "F", "local");
        this._G = new pwg.AbsoluteLocation(this, "G", "local");
        this._H = new pwg.AbsoluteLocation(this, "H", "local");
        this._joints =
            [
                this._forkA.lp,
                this._forkA.rp,
                this._forkB.lp,
                this._forkB.rp,
                this._forkC.lp,
                this._forkC.rp,
                this._forkD.lp,
                this._forkD.rp,
                this._E, this._F, this._G, this.H
            ];
        this._style_outline = pwg.tube.__default_outline_style.clone();
        this._dirty = true;
    }
    pwg.inherits(TubeUnionX, TubeUnion);
    pwg.defineClassId(TubeUnionX, "pwg.TubeUnionX");
    TubeUnionX.prototype.initialize = function (e, forks) {
        this._O.set(e);
        if (forks) {
            this._forkA.set(forks[0]);
            this._forkB.set(forks[1]);
            this._forkC.set(forks[2]);
            this._forkD.set(forks[3]);
            this._dirty = true;
        }
    };

    TubeUnionX.prototype._get_handles = function () {
        var handles = [
            this._forkA.handleP, this._forkA.handleL, this._forkA.handleR,
            this._forkB.handleP, this._forkB.handleL, this._forkB.handleR,
            this._forkC.handleP, this._forkC.handleL, this._forkC.handleR,
            this._forkD.handleP, this._forkD.handleL, this._forkD.handleR,
        ];
        if (!this._isframe) {
            handles.push(this._handleO);
        }
        return handles;
    };
    TubeUnionX.prototype._do_ui_handle_update = function (handle, e, action) {
        this._dirty = true;
        var context = this.getContainerContext();
        if (handle.type == "handle.move") {
            this._O.set(e);
        } else if (handle.type == "handle.offset") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.offset = local.subtract(this._O.local);
        } else if (handle.type == "handle.size") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.d = calc_tube_fork_size(this._O.local, fork.offset, local);
        }
        return true;
    };
    TubeUnionX.prototype.scale=function(scale)
    {
        this._forkA.scale(scale);
        this._forkB.scale(scale);
        this._forkC.scale(scale);
        this._forkD.scale(scale);
    };
    TubeUnionX.prototype.update = function () {
        var context = this.getContainerContext();
        var all = this._dirty;
        this._O.update();
        this._forkA.update(this, all);
        this._forkB.update(this, all);
        this._forkC.update(this, all);
        this._forkD.update(this, all);
        if (all) {
            this._E.set(call_tube_intersection(this._forkA, this._forkB));
            this._F.set(call_tube_intersection(this._forkB, this._forkC));
            this._G.set(call_tube_intersection(this._forkC, this._forkD));
            this._H.set(call_tube_intersection(this._forkD, this._forkA));
        }
        this._E.update(context);
        this._F.update(context);
        this._G.update(context);
        this._H.update(context);
        if (all) {
            var center = this._O.local;
            var dE = this._E.local.getDistance(center) * 0.618;
            var dF = this._F.local.getDistance(center) * 0.618;
            var dG = this._G.local.getDistance(center) * 0.618;
            var dH = this._H.local.getDistance(center) * 0.618;

            var outline = [this._forkA.lp.local, this._forkA.rp.local, this._E.local.add(this._forkA.u.multiply(dE)), this._E.local, this._E.local.add(this._forkB.u.multiply(dE)),
            this._forkB.lp.local, this._forkB.rp.local, this._F.local.add(this._forkB.u.multiply(dF)), this._F.local, this._F.local.add(this._forkC.u.multiply(dF)),
            this._forkC.lp.local, this._forkC.rp.local, this._G.local.add(this._forkC.u.multiply(dG)), this._G.local, this._G.local.add(this._forkD.u.multiply(dG)),
            this._forkD.lp.local, this._forkD.rp.local, this._H.local.add(this._forkD.u.multiply(dH)), this._H.local, this._H.local.add(this._forkA.u.multiply(dH))
            ];
            this._outline_local = outline;
        }
        this._dirty = false;
        this._outline = this._outline_local.map(p => context.localToPixel(p));
        this._outline[2].c = "b3";
        this._outline[7].c = "b3";
        this._outline[12].c = "b3";
        this._outline[17].c = "b3";
        this._outline.closed = true;
    };
    TubeUnionX.prototype.hitTest = function (e, option) {
        var outline = this._outline;
        var b = pwg.math.isPointInPolygon(outline, e.pixel);
        if (b) {
            return {
                succeed: true,
                object: this,
                distance: pwg.UI_HITTEST_TOLERENCE * 5
            };
        } else
            return null;
    };
    TubeUnionX.prototype.render = function (drawing, pass) {
        drawing.begin();
        drawing.resetTransform();
        if (pass == "entity") {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
            _draw_joints_(this._joints,drawing);

        } else if (pass == "ui"||pass=='hot') {
            var fstyle = pwg.tube.__default_frame_style;
            drawing.drawLineEx([this._O.pixel, this._forkA.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkB.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkC.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkD.p.pixel], fstyle);
        }
        else if(pass=="mini")
        {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
        }
        drawing.end();
    };

    TubeUnionX.prototype.depth=function()
    {
        return this._O.depth()+1;
    };

    TubeUnionX.prototype.isDep=function(o)
    {
        return this._O.isDep(o);
    };
    TubeUnionX.prototype.dispose=function()
    {
        return this._O.removeDep();
    };
    TubeUnionX.prototype.removeDep=function(o)
    {
        return this._O.removeDep(o);
    };
    pwg.defineClassProperties(TubeUnionX, {
        "O": {
            get: function () {
                return this._O;
            }
        },
        "A": {
            get: function () {
                return this._forkA;
            }
        },
        "B": {
            get: function () {
                return this._forkB;
            }
        },
        "C": {
            get: function () {
                return this._forkC;
            }
        },
        "D": {
            get: function () {
                return this._forkD;
            }
        },
        "E": {
            get: function () {
                return this._E;
            }
        },
        "F": {
            get: function () {
                return this._F;
            }
        },
        "G": {
            get: function () {
                return this._G;
            }
        },
        "H": {
            get: function () {
                return this._H;
            }
        }
    });

    TubeUnionX.prototype.__save__ = function (json) {
        json = TubeUnion.prototype.__save__.call(this, json);
        json.forkA = this._forkA.__save__();
        json.forkB = this._forkB.__save__();
        json.forkC = this._forkC.__save__();
        json.forkD = this._forkD.__save__();
        json.O = this._O.__save__();
        return json;
    };

    TubeUnionX.prototype.__load__ = function (json, context) {
        TubeUnion.prototype.__load__.call(this, json, context);
        this._O.__load__(json.O, context);
        this._forkA.__load__(json.forkA);
        this._forkB.__load__(json.forkB);
        this._forkC.__load__(json.forkC);
        this._forkD.__load__(json.forkD);
        this._dirty = true;
    };


    pwg.registerClass(TubeUnionX);
    ///////////////////////////////////////////////////////////////////////
    function TubeUnionXBulid(isframe) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._points = [];
        this._isframe = isframe;
    }

    pwg.inherits(TubeUnionXBulid, pwg.BaseBuild);

    function create_TubeUnionX_p2(points) {
        var A = points[0];
        var C = points[1];
        var d = A.getDistance(C) / 2.0;
        if (d < 1e-10)
            return null;
        var center = points[0].add(points[1]).multiply(0.5);
        var n = C.subtract(A).normalize();
        n = n.rotate(90);
        var B = center.add(n.multiply(d));
        var D = center.subtract(n.multiply(d));
        d *= 0.2;
        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d
            },
            {
                offset: B.subtract(center),
                d: d
            },
            {
                offset: C.subtract(center),
                d: d
            },
            {
                offset: D.subtract(center),
                d: d
            }
            ]
        };
    }

    function create_TubeUnionX_p3(points) {
        var center = points[0].add(points[1]).multiply(0.5);
        var A = points[0];
        var C = points[1];
        var d1 = A.getDistance(C) / 2.0;
        d1 *= 0.2;
        var B = points[2];
        var n = B.subtract(center);
        var D = center.subtract(n);
        var d2 = n.length;
        if (d2 < 1e-10)
            return create_TubeUnionX_p2(points);
        d2 *= 0.2;
        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d1
            },
            {
                offset: B.subtract(center),
                d: d2
            },
            {
                offset: C.subtract(center),
                d: d1
            },
            {
                offset: D.subtract(center),
                d: d2
            }
            ]
        };
    }

    function create_TubeUnionX_p4(points) {
        var center = points[0].add(points[1]).multiply(0.5);
        var A = points[0];
        var C = points[1];
        var d1 = A.getDistance(C) / 2.0;
        d1 *= 0.1;
        var B = points[2];
        var n = B.subtract(center);
        var d2 = n.length;
        if (d2 < 1e-10)
            return create_TubeUnionX_p2(points);
        d2 *= 0.2;

        var D = points[3];
        n = B.subtract(center);
        var d3 = n.length;
        if (d3 < 1e-10)
            return create_TubeUnionX_p3(points);
        d3 *= 0.2;

        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d1
            },
            {
                offset: B.subtract(center),
                d: d1
            },
            {
                offset: C.subtract(center),
                d: d2
            },
            {
                offset: D.subtract(center),
                d: d3
            }
            ]
        };
    }

    function create_TubeUnionX(points) {
        if (points.length < 2)
            return null;

        if (points.length == 2)
            return create_TubeUnionX_p2(points);
        if (points.length == 3)
            return create_TubeUnionX_p3(points);
        if (points.length > 3)
            return create_TubeUnionX_p4(points);
        return null;
    }
    TubeUnionXBulid.prototype.update = function (e, action) {
        if (action == "down") {
            return true;
        } else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                this._points[this._points.length - 1] = e.pixel;
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                var param = create_TubeUnionX(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                return true;
            }
        } else if (action == "up") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(TubeUnionX.classid);
                this._points = [e.pixel, e.pixel];
            } else {
                var creating = this._creating;
                this._points.push(e.pixel);
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                points.pop();
                var param = create_TubeUnionX(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                if (points.length >= 3) {
                    this.post();
                }
            }
        }
    };
    TubeUnionXBulid.prototype.post = function () {
        if (this._creating) {
            if (this._points.length > 1) {
                if (!this._isframe)
                    this._context.container.addChild(this._creating);
                else {
                    var graphics0 = this._creating;
                    graphics0._isframe = true;
                    var location = graphics0.O.local.clone();
                    var frame = this._context.scene.createGraphics(pwg.FrameContainer.classid, "local", graphics0);
                    frame.location.set(location);
                    graphics0.O.set({
                        x: 0,
                        y: 0
                    });
                    var ccontext =  this._context.scene.getContainerContext();
                    graphics0.scale(1/ccontext.miniAdjustRatio);
                    this._context.scene.addChild(frame);
                    frame.__json_creator__ = "pwg.FrameContainer.creator";
                }
            }
        }
        this._creating = null;
        this._points = [];
    };
    TubeUnionXBulid.prototype.cancel = function () {
        this._creating = null;
        this._points = [];
    };
    TubeUnionXBulid.prototype.getLocationMode = function () {
        return "joint";
    };
    TubeUnionXBulid.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating && this._points.length > 1) {
            this._creating.update();
            this._creating.render(drawing, "entity");
            this._creating.render(drawing, "ui");
        }
    };
    pwg.graphics.registerBuild("管廊四通", new TubeUnionXBulid());
    pwg.graphics.registerBuild("管廊四通(容器)", new TubeUnionXBulid(true));
    ///////////////////////////////////////////////////////////////////////////////////
    /*
        TubeUnionT
            Al   
            A+------ +  -------+A'
            Ar    +E | F+
                    |
                    +
                    B
    
    */
    function TubeUnionT(container, id, isframe) {
        pwg.super(this, TubeUnion, container, id, isframe);
        this._O = new pwg.OptionalLocation(this, "O", "local")
        this._handleO = new pwg.UiHandle(this, "handle.move", "handle.move", "simple", this._O);
        this._forkA = new TubeFork(this, "A", {
            x: -1,
            y: 0
        }, 0.1, -1);
        this._forkB = new TubeFork(this, "B", {
            x: 0,
            y: 1
        }, 0.1);
        this._X1 = new pwg.AbsoluteLocation(this, "X1", "local");
        this._X2 = new pwg.AbsoluteLocation(this, "X2", "local")
        this._X3 = new pwg.AbsoluteLocation(this, "X3", "local")
        this._E = new pwg.AbsoluteLocation(this, "E", "local");
        this._F = new pwg.AbsoluteLocation(this, "F", "local");

        this._joints =
            [
                this._forkA.lp,
                this._forkA.rp,
                this._forkB.lp,
                this._forkB.rp,
                this._X1,
                this._X2,
                this._X3,
                this._E, this._F
            ];

        this._style_outline = pwg.tube.__default_outline_style.clone();
        this._dirty = true;
    }
    pwg.inherits(TubeUnionT, TubeUnion);
    pwg.defineClassId(TubeUnionT, "pwg.TubeUnionT");
    TubeUnionT.prototype.initialize = function (e, forks) {
        this._O.set(e);
        if (forks) {
            this._forkA.set(forks[0]);
            this._forkB.set(forks[1]);
        }
        this._dirty = true;
    };
    TubeUnionT.prototype.update = function () {
        var context = this.getContainerContext();
        var all = this._dirty;
        this._O.update();
        this._forkA.update(this, all);
        this._forkB.update(this, all);
        if (all) {
            this._E.set(call_tube_intersection(this._forkA, this._forkB, "rl"));
            this._F.set(call_tube_intersection(this._forkA, this._forkB, "rr"));
          
        }
        this._E.update();
        this._F.update(); 
        
        var clp = this._forkA.clp, crp = this._forkA.crp;
        this._X1.set(clp);
        this._X2.set(crp);
        this._X3.set(clp.add(this._forkA.lp.local).multiply(0.5));
        this._X1.update();
        this._X2.update();
        this._X3.update();
        
        if (all) {
            var center = this._O.local;
            var dE = this._E.local.getDistance(center) * 0.99;
            var outline = [
                this._forkA.lp.local, this._forkA.rp.local, this._E.local.add(this._forkA.u.multiply(dE)), this._E.local, this._E.local.add(this._forkB.u.multiply(dE)),
                this._forkB.lp.local, this._forkB.rp.local, this._F.local.add(this._forkB.u.multiply(dE)), this._F.local, this._F.local.add(this._forkA.u.multiply(-dE)),
                this._forkA.crp, this._forkA.clp
            ];
            this._outline_local = outline;
        }
        this.dirty = false;
        this._outline = this._outline_local.map(p => context.localToPixel(p));
        this._outline[2].c = "b3";
        this._outline[7].c = "b3";
        this._outline.closed = true;
    };

    TubeUnionT.prototype.scale=function(scale)
    {
        this._forkA.scale(scale);
        this._forkB.scale(scale);
    };

    TubeUnionT.prototype.render = function (drawing, pass) {
        drawing.begin();
        drawing.resetTransform();
        if (pass == "entity") {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
            _draw_joints_(this._joints,drawing);
        } else if (pass == "ui") {
            var fstyle = pwg.tube.__default_frame_style;
            drawing.drawLineEx([this._O.pixel, this._forkA.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkB.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkA.q.pixel], fstyle);
        }
        else if(pass=="mini")
        {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
        }
        drawing.end();
    };
    TubeUnionT.prototype._get_handles = function () {
        var handles = [
            this._forkA.handleP,
            this._forkA.handleQ,
            this._forkA.handleL,
            this._forkA.handleR,
            this._forkB.handleP,
            this._forkB.handleL,
            this._forkB.handleR
        ];

        if (!this._isframe) {
            handles.push(this._handleO);
        }
        return handles;
    };
    TubeUnionT.prototype._do_ui_handle_update = function (handle, e, action) {
        this._dirty = true;
        var context = this.getContainerContext();
        if (handle.type == "handle.move") {
            this._O.set(e);
        } else if (handle.type == "handle.offset") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.offset = local.subtract(this._O.local);
        } else if (handle.type == "handle.size") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.d = calc_tube_fork_size(this._O.local, fork.offset, local);
        } else if (handle.type == "handle.scale") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.qoffset = calc_tube_fork_qoffset(this._O.local, fork.offset, local);
        }
        return true;
    };

    TubeUnionT.prototype.hitTest = function (e, option) {
        var outline = this._outline;
        var b = pwg.math.isPointInPolygon(outline, e.pixel);
        if (b) {
            return {
                succeed: true,
                object: this,
                distance: pwg.UI_HITTEST_TOLERENCE*2
            };
        } else
            return null;
    };

    TubeUnionT.prototype.depth=function()
    {
        return this._O.depth()+1;
    };

    TubeUnionT.prototype.isDep=function(o)
    {
        return this._O.isDep(o);
    };
    TubeUnionT.prototype.dispose=function()
    {
        return this._O.removeDep();
    };
    TubeUnionT.prototype.removeDep=function(o)
    {
        return this._O.removeDep(o);
    };

    pwg.defineClassProperties(TubeUnionT, {
        "O": {
            get: function () {
                return this._O;
            }
        },
        "A": {
            get: function () {
                return this._forkA;
            }
        },
        "B": {
            get: function () {
                return this._forkB;
            }
        },
        "E": {
            get: function () {
                return this._E;
            }
        },
        "F": {
            get: function () {
                return this._F;
            }
        },
    });

    TubeUnionT.prototype.__save__ = function (json) {
        json = TubeUnion.prototype.__save__.call(this, json);
        json.forkA = this._forkA.__save__();
        json.forkB = this._forkB.__save__();
        json.O = this._O.__save__();
        return json;
    };

    TubeUnionT.prototype.__load__ = function (json, context) {
        TubeUnion.prototype.__load__.call(this, json, context);
        this._O.__load__(json.O, context);
        this._forkA.__load__(json.forkA);
        this._forkB.__load__(json.forkB);
        this._dirty = true;
    };

    pwg.registerClass(TubeUnionT);
    ///////////////////////////////////////////////////////////////////////
    function TubeUnionTBulid(isframe) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._points = [];
        this._isframe = isframe;
    }
    pwg.inherits(TubeUnionTBulid, pwg.BaseBuild);
    pwg.defineClassId(TubeUnionTBulid, "pwg.TubeUnionTBulid");

    function create_TubeUnionT_p2(points) {
        var A = points[0];
        var C = points[1];
        var d = A.getDistance(C) / 2.0;
        if (d < 1e-10)
            return null;
        var center = points[0].add(points[1]).multiply(0.5);
        var n = C.subtract(A).normalize();
        n = n.rotate(90);
        var B = center.add(n.multiply(d));
        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d * 0.2,
                q: d
            },
            {
                offset: B.subtract(center),
                d: d * 0.2
            },
            ]
        };
    }

    function create_TubeUnionT_p3(points) {
        var center = points[0].add(points[1]).multiply(0.5);
        var A = points[0];
        var C = points[1];
        var d1 = A.getDistance(C) / 2.0;
        var B = points[2];
        var n = B.subtract(center);
        var d2 = n.length;
        if (d2 < d1 / 10)
            return create_TubeUnionT_p2(points);

        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d1 * 0.2,
                q: d1
            },
            {
                offset: B.subtract(center),
                d: d2 * 0.2,
                q: d2
            }
            ]
        };
    }

    function create_TubeUnionT(points) {
        if (points.length < 2)
            return null;

        if (points.length == 2)
            return create_TubeUnionT_p2(points);
        if (points.length >= 3)
            return create_TubeUnionT_p3(points);
        return null;
    }
    TubeUnionTBulid.prototype.update = function (e, action) {
        if (action == "down") {
            return true;
        } else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                this._points[this._points.length - 1] = e.pixel;
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                var param = create_TubeUnionT(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                return true;
            }
        } else if (action == "up") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(TubeUnionT.classid);
                this._points = [e.pixel, e.pixel];
            } else {
                var creating = this._creating;
                this._points.push(e.pixel);
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                points.pop();
                var param = create_TubeUnionT(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                if (points.length >= 3) {
                    this.post();
                }
            }
        }
    };
    TubeUnionTBulid.prototype.post = function () {
        if (this._creating) {
            if (this._points.length > 1) {
                if (!this._isframe)
                    this._context.container.addChild(this._creating);
                else {
                    var graphics0 = this._creating;
                    graphics0._isframe = true;
                    var location = graphics0.O.local.clone();
                    var frame = this._context.scene.createGraphics(pwg.FrameContainer.classid, "local", graphics0);
                    frame.location.set(location);
                    graphics0.O.set({
                        x: 0,
                        y: 0
                    });

                    var ccontext =  this._context.scene.getContainerContext();
                    graphics0.scale(1/ccontext.miniAdjustRatio);

                    this._context.scene.addChild(frame);
                    frame.__json_creator__ = "pwg.FrameContainer.creator";
                }
            }
            this._creating = null;
            this._points = [];
        }
    };
    TubeUnionTBulid.prototype.cancel = function () {
        this._creating = null;
        this._points = [];
    };
    TubeUnionTBulid.prototype.getLocationMode = function () {
        return "joint";
    };
    TubeUnionTBulid.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating && this._points.length > 1) {
            this._creating.update();
            this._creating.render(drawing, "entity");
            this._creating.render(drawing, "ui");
        }
    };
    pwg.graphics.registerBuild("管廊T通", new TubeUnionTBulid());
    pwg.graphics.registerBuild("管廊T通(容器)", new TubeUnionTBulid(true));
    ///////////////////////////////////////////////////////////////////////////////////
    /*
               A        C
                \      /
                 \    /
                  \  /
                   +(O)
                    |
                    |
                    |
                    B
    */
    function TubeUnionY(container, id, isframe) {
        pwg.super(this, TubeUnion, container, id, isframe);
        this._O = new pwg.OptionalLocation(this, "O", "local")
        this._handleO = new pwg.UiHandle(this, "handle.move", "handle.move", "simple", this._O);
        this._forkA = new TubeFork(this, "A", {
            x: -1,
            y: -1
        }, 0.1, -1);
        this._forkB = new TubeFork(this, "B", {
            x: 0,
            y: 1
        }, 0.1);
        this._forkC = new TubeFork(this, "C", {
            x: 1,
            y: -1
        }, 0.1);
        this._E = new pwg.AbsoluteLocation(this, "E", "local");
        this._F = new pwg.AbsoluteLocation(this, "F", "local");
        this._G = new pwg.AbsoluteLocation(this, "G", "local");
        this._joints=[
            this._forkA.lp,
            this._forkA.rp,
            this._forkB.lp,
            this._forkB.rp,
            this._forkC.lp,
            this._forkC.rp,
            this._E,this._F,this._G
        ];
        this._style_outline = pwg.tube.__default_outline_style.clone();
        this._dirty = true;
    };
    pwg.inherits(TubeUnionY, TubeUnion);
    pwg.defineClassId(TubeUnionY, "pwg.TubeUnionY");
    TubeUnionY.prototype.initialize = function (e, forks) {
        this._O.set(e);
        if (forks) {
            this._forkA.set(forks[0]);
            this._forkB.set(forks[1]);
            this._forkC.set(forks[2]);
        }
        this._dirty = true;
    };
    TubeUnionY.prototype.update = function () {
        var context = this.getContainerContext();
        var all = this._dirty;
        this._O.update();
        this._forkA.update(this, all);
        this._forkB.update(this, all);
        this._forkC.update(this, all);
        if (all) {
            this._E.set(call_tube_intersection(this._forkA, this._forkB));
            this._F.set(call_tube_intersection(this._forkB, this._forkC));
            this._G.set(call_tube_intersection(this._forkC, this._forkA));
        }
        this._E.update();
        this._F.update();
        this._G.update();
        if (all) {
            var center = this._O.local;
            var dE = this._E.local.getDistance(center) * 0.99;
            var dF = this._F.local.getDistance(center) * 0.99;
            var dG = this._G.local.getDistance(center) * 0.99;
            var outline = [
                this._forkA.lp.local, this._forkA.rp.local, this._E.local.add(this._forkA.u.multiply(dE)), this._E.local, this._E.local.add(this._forkB.u.multiply(dE)),
                this._forkB.lp.local, this._forkB.rp.local, this._F.local.add(this._forkB.u.multiply(dF)), this._F.local, this._F.local.add(this._forkC.u.multiply(dF)),
                this._forkC.lp.local, this._forkC.rp.local, this._G.local.add(this._forkC.u.multiply(dG)), this._G.local, this._G.local.add(this._forkA.u.multiply(dG)),
            ];
            this._outline_local = outline;
        }
        this.dirty = false;
        this._outline = this._outline_local.map(p => context.localToPixel(p));
        this._outline[2].c = "b3";
        this._outline[7].c = "b3";
        this._outline[12].c = "b3";
        this._outline.closed = true;
    };
    
    TubeUnionY.prototype.scale=function(scale)
    {
        this._forkA.scale(scale);
        this._forkB.scale(scale);
        this._forkC.scale(scale);
    };

    TubeUnionY.prototype.render = function (drawing, pass) {
        drawing.begin();
        drawing.resetTransform();
        if (pass == "entity") {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
            _draw_joints_(this._joints,drawing);
        } else if (pass == "ui") {
            var fstyle = pwg.tube.__default_frame_style;
            drawing.drawLineEx([this._O.pixel, this._forkA.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkB.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkC.p.pixel], fstyle);
        }
        else if(pass=="mini")
        {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
        }
        drawing.end();
    };
    TubeUnionY.prototype._get_handles = function () {
        var handles = [
            this._forkA.handleP,
            this._forkA.handleL,
            this._forkA.handleR,
            this._forkB.handleP,
            this._forkB.handleL,
            this._forkB.handleR,
            this._forkC.handleP,
            this._forkC.handleL,
            this._forkC.handleR
        ];
        if (!this._isframe) {
            handles.push(this._handleO);
        }
        return handles;
    };
    TubeUnionY.prototype._do_ui_handle_update = function (handle, e, action) {
        this._dirty = true;
        var context = this.getContainerContext();
        if (handle.type == "handle.move") {
            this._O.set(e);
        } else if (handle.type == "handle.offset") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.offset = local.subtract(this._O.local);
        } else if (handle.type == "handle.size") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.d = calc_tube_fork_size(this._O.local, fork.offset, local);
        }
        return true;
    };

    TubeUnionY.prototype.hitTest = function (e, option) {
        var outline = this._outline;
        var b = pwg.math.isPointInPolygon(outline, e.pixel);
        if (b) {
            return {
                succeed: true,
                object: this,
                distance: pwg.UI_HITTEST_TOLERENCE*2
            };
        } else
            return null;
    };
    TubeUnionY.prototype.depth=function()
    {
        return this._O.depth()+1;
    };

    TubeUnionY.prototype.isDep=function(o)
    {
        return this._O.isDep(o);
    };
    TubeUnionY.prototype.dispose=function()
    {
        return this._O.removeDep();
    };
    TubeUnionY.prototype.removeDep=function(o)
    {
        return this._O.removeDep(o);
    };

    pwg.defineClassProperties(TubeUnionY, {
        "O": {
            get: function () {
                return this._O;
            }
        },
        "A": {
            get: function () {
                return this._forkA;
            }
        },
        "B": {
            get: function () {
                return this._forkB;
            }
        },
        "C": {
            get: function () {
                return this._forkC;
            }
        },
        "E": {
            get: function () {
                return this._E;
            }
        },
        "F": {
            get: function () {
                return this._F;
            }
        },
        "G": {
            get: function () {
                return this._G;
            }
        },
    });

    TubeUnionY.prototype.__save__ = function (json) {
        json = TubeUnion.prototype.__save__.call(this, json);
        json.forkA = this._forkA.__save__();
        json.forkB = this._forkB.__save__();
        json.forkC = this._forkC.__save__();
        json.O = this._O.__save__();
        return json;
    };

    TubeUnionY.prototype.__load__ = function (json, context) {
        TubeUnion.prototype.__load__.call(this, json, context);
        this._O.__load__(json.O, context);
        this._forkA.__load__(json.forkA);
        this._forkB.__load__(json.forkB);
        this._forkC.__load__(json.forkC);
        this._dirty = true;
    };
    pwg.registerClass(TubeUnionY);
    ///////////////////////////////////////////////////////////////////////
    function TubeUnionYBulid(isframe) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._points = [];
        this._isframe = isframe;
    }
    pwg.inherits(TubeUnionYBulid, pwg.BaseBuild);
    pwg.defineClassId(TubeUnionYBulid, "pwg.TubeUnionYBulid");

    function create_TubeUnionY_p2(points) {
        var A = points[0];
        var C = points[1];
        var d = A.getDistance(C) / 2.0;
        if (d < 1e-10)
            return null;
        var n = C.subtract(A).normalize();
        n = n.rotate(90);
        var center = C.add(A).multiply(0.5);
        center = center.add(n.multiply(d * 0.5773))
        var B = center.add(n.multiply(d * 1.1155));
        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d * 0.2
            },
            {
                offset: B.subtract(center),
                d: d * 0.2
            },
            {
                offset: C.subtract(center),
                d: d * 0.2
            }
            ]
        };
    }

    function create_TubeUnionY_p3(points) {
        var center = points[0].add(points[1]).add(points[2]).multiply(1 / 3.0);
        var A = points[0];
        var C = points[1];
        var B = points[2];
        var d1 = A.getDistance(center);
        var d2 = B.getDistance(center);
        var d3 = C.getDistance(center);

        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d1 * 0.2
            },
            {
                offset: B.subtract(center),
                d: d2 * 0.2
            },
            {
                offset: C.subtract(center),
                d: d3 * 0.2
            }
            ]
        };
    }

    function create_TubeUnionY(points) {
        if (points.length < 2)
            return null;
        if (points.length == 2)
            return create_TubeUnionY_p2(points);
        if (points.length >= 3)
            return create_TubeUnionY_p3(points);
        return null;
    }
    TubeUnionYBulid.prototype.update = function (e, action) {
        if (action == "down") {
            return true;
        } else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                this._points[this._points.length - 1] = e.pixel;
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                var param = create_TubeUnionY(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                return true;
            }
        } else if (action == "up") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(TubeUnionY.classid);
                this._points = [e.pixel, e.pixel];
            } else {
                var creating = this._creating;
                this._points.push(e.pixel);
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                points.pop();
                var param = create_TubeUnionY(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                if (points.length >= 3) {
                    this.post();
                }
            }
        }
    };
    TubeUnionYBulid.prototype.post = function () {
        if (this._creating) {
            if (this._points.length > 1) {
                if (!this._isframe)
                    this._context.container.addChild(this._creating);
                else {
                    var graphics0 = this._creating;
                    graphics0._isframe = true;
                    var location = graphics0.O.local.clone();
                    var frame = this._context.scene.createGraphics(pwg.FrameContainer.classid, "local", graphics0);
                    frame.location.set(location);
                    graphics0.O.set({
                        x: 0,
                        y: 0
                    });

                    var ccontext =  this._context.scene.getContainerContext();
                    graphics0.scale(1/ccontext.miniAdjustRatio);

                    this._context.scene.addChild(frame);
                    frame.__json_creator__ = "pwg.FrameContainer.creator";
                }
            }
        }
        this._creating = null;
        this._points = [];
    };

    TubeUnionYBulid.prototype.cancel = function () {
        this._creating = null;
        this._points = [];
    };
    TubeUnionYBulid.prototype.getLocationMode = function () {
        return "joint";
    };
    TubeUnionYBulid.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating && this._points.length > 1) {
            this._creating.update();
            this._creating.render(drawing, "entity");
            this._creating.render(drawing, "ui");
        }
    };
    pwg.graphics.registerBuild("管廊Y通", new TubeUnionYBulid());
    pwg.graphics.registerBuild("管廊Y通(容器)", new TubeUnionYBulid(true));
    ///////////////////////////////////////////////////////////////////////////////////
    /*
        TubeUnionL
            Al    +H
            A+------ + 
            Ar    +E | F+
                    |
                    +
                    B
    
    */
    function TubeUnionL(container, id, isframe) {
        pwg.super(this, TubeUnion, container, id, isframe);
        this._O = new pwg.OptionalLocation(this, "O", "local");
        this._handleO = new pwg.UiHandle(this, "handle.move", "handle.move", "simple", this._O);
        this._forkA = new TubeFork(this, "A", {
            x: -1,
            y: 0
        }, 0.1);
        this._forkB = new TubeFork(this, "B", {
            x: 0,
            y: 1
        }, 0.1);
        this._E = new pwg.AbsoluteLocation(this, "E", "local");
        this._H = new pwg.AbsoluteLocation(this, "H", "local");
        this._joints=[
            this._forkA.lp,
            this._forkA.rp,
            this._forkB.lp,
            this._forkB.rp,
            this._E,this._H
        ]
        this._style_outline = pwg.tube.__default_outline_style.clone();
        this._dirty = true;
    };
    pwg.inherits(TubeUnionL, TubeUnion);
    pwg.defineClassId(TubeUnionL, "pwg.TubeUnionL");
    TubeUnionL.prototype.initialize = function (e, forks) {
        this._O.set(e);
        if (forks) {
            this._forkA.set(forks[0]);
            this._forkB.set(forks[1]);
        }
        this._dirty = true;
    };
    TubeUnionL.prototype.update = function () {
        var context = this.getContainerContext();
        var all = this._dirty;
        this._O.update();
        this._forkA.update(this, all);
        this._forkB.update(this, all);
        if (all) {
            this._E.set(call_tube_intersection(this._forkA, this._forkB, "rl"));
            this._H.set(call_tube_intersection(this._forkA, this._forkB, "lr"));
        }
        this._E.update();
        this._H.update();
        if (all) {
            var center = this._O.local;
            var dE = this._E.local.getDistance(center) * 0.99;
            var dH = this._H.local.getDistance(center) * 0.99;
            var outline = [
                this._forkA.lp.local, this._forkA.rp.local, this._E.local.add(this._forkA.u.multiply(dE)), this._E.local, this._E.local.add(this._forkB.u.multiply(dE)),
                this._forkB.lp.local, this._forkB.rp.local, this._H.local.add(this._forkB.u.multiply(dH)), this._H.local, this._H.local.add(this._forkA.u.multiply(dH)),
            ]
            this._outline_local = outline;
        }
        this.dirty = false;
        this._outline = this._outline_local.map(p => context.localToPixel(p));
        this._outline[2].c = "b3";
        this._outline[7].c = "b3";
        this._outline.closed = true;
    };
    TubeUnionL.prototype.render = function (drawing, pass) {
        drawing.begin();
        drawing.resetTransform();
        if (pass == "entity") {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
            _draw_joints_(this._joints,drawing);
        } else if (pass == "ui") {
            var fstyle = pwg.tube.__default_frame_style;
            drawing.drawLineEx([this._O.pixel, this._forkA.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkB.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkA.q.pixel], fstyle);
        }
        else if(pass=="mini")
        {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
        }
        drawing.end();
    };
    TubeUnionL.prototype._get_handles = function () {
        var handles = [
            this._forkA.handleP,
            this._forkA.handleL,
            this._forkA.handleR,
            this._forkB.handleP,
            this._forkB.handleL,
            this._forkB.handleR
        ];
        if (!this._isframe)
            handles.push(this._handleO);
        return handles;
    };
    TubeUnionL.prototype._do_ui_handle_update = function (handle, e, action) {
        this._dirty = true;
        var context = this.getContainerContext();
        if (handle.type == "handle.move") {
            this._O.set(e);
        } else if (handle.type == "handle.offset") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.offset = local.subtract(this._O.local);
        } else if (handle.type == "handle.size") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            var d = calc_tube_fork_size(this._O.local, fork.offset, local);
            this._forkA.d = d;
            this._forkB.d = d;
        }
        return true;
    };

    TubeUnionL.prototype.scale=function(scale)
    {
        this._forkA.scale(scale);
        this._forkB.scale(scale);
    };

    TubeUnionL.prototype.hitTest = function (e, option) {
        var outline = this._outline;
        var b = pwg.math.isPointInPolygon(outline, e.pixel);
        if (b) {
            return {
                succeed: true,
                object: this,
                distance: pwg.UI_HITTEST_TOLERENCE*2
            };
        } else
            return null;
    };

    TubeUnionL.prototype.depth=function()
    {
        return this._O.depth()+1;
    };
    TubeUnionL.prototype.isDep=function(o)
    {
        return this._O.isDep(o);
    };
    TubeUnionL.prototype.dispose=function()
    {
        return this._O.removeDep();
    };
    TubeUnionL.prototype.removeDep=function(o)
    {
        return this._O.removeDep(o);
    };

    pwg.defineClassProperties(TubeUnionL, {
        "O": {
            get: function () {
                return this._O;
            }
        },
        "A": {
            get: function () {
                return this._forkA;
            }
        },
        "B": {
            get: function () {
                return this._forkB;
            }
        },
        "E": {
            get: function () {
                return this._E;
            }
        },
        "F": {
            get: function () {
                return this._F;
            }
        }
    });

    TubeUnionL.prototype.__save__ = function (json) {
        json = TubeUnion.prototype.__save__.call(this, json);
        json.forkA = this._forkA.__save__();
        json.forkB = this._forkB.__save__();
        json.O = this._O.__save__();
        return json;
    };

    TubeUnionL.prototype.__load__ = function (json, context) {
        TubeUnion.prototype.__load__.call(this, json, context);
        this._O.__load__(json.O, context);
        this._forkA.__load__(json.forkA);
        this._forkB.__load__(json.forkB);
        this._dirty = true;
    };

    pwg.registerClass(TubeUnionL);
    ///////////////////////////////////////////////////////////////////////
    function TubeUnionLBulid(isframe) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._points = [];
        this._isframe = isframe;
    }
    pwg.inherits(TubeUnionLBulid, pwg.BaseBuild);
    pwg.defineClassId(TubeUnionLBulid, "pwg.TubeUnionLBulid");

    function create_TubeUnionL_p2(points) {
        var A = points[0];
        var C = points[1];
        var d = A.getDistance(C);
        if (d < 1e-10)
            return null;
        var center = points[1];
        var n = C.subtract(A).normalize();
        n = n.rotate(90);
        var B = center.add(n.multiply(d));
        return {
            center: center,
            forks: [{
                offset: A.subtract(center),
                d: d * 0.1
            },
            {
                offset: B.subtract(center),
                d: d * 0.1
            },
            ]
        };
    }

    function create_TubeUnionL_p3(points) {
        var A = points[0];
        var O = points[1];
        var d1 = A.getDistance(O);
        var B = points[2];
        var d2 = B.getDistance(O);
        if (d2 < d1 / 10)
            return create_TubeUnionL_p2(points);

        return {
            center: points[1],
            forks: [{
                offset: A.subtract(O),
                d: d1 * 0.1
            },
            {
                offset: B.subtract(O),
                d: d1 * 0.1
            }
            ]
        };
    }

    function create_TubeUnionL(points) {
        if (points.length < 2)
            return null;

        if (points.length == 2)
            return create_TubeUnionL_p2(points);
        if (points.length >= 3)
            return create_TubeUnionL_p3(points);
        return null;
    }
    TubeUnionLBulid.prototype.update = function (e, action) {
        if (action == "down") {
            return true;
        } else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                this._points[this._points.length - 1] = e.pixel;
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                var param = create_TubeUnionL(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                return true;
            }
        } else if (action == "up") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(TubeUnionL.classid);
                this._points = [e.pixel, e.pixel];
            } else {
                var creating = this._creating;
                this._points.push(e.pixel);
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                points.pop();
                var param = create_TubeUnionL(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                if (points.length >= 3) {
                    this.post();
                }
            }
        }
    };
    TubeUnionLBulid.prototype.post = function () {
        if (this._creating) {
            if (this._points.length > 1) {
                if (!this._isframe)
                    this._context.container.addChild(this._creating);
                else {
                    var graphics0 = this._creating;
                    graphics0._isframe = true;
                    var location = graphics0.O.local.clone();
                    var frame = this._context.scene.createGraphics(pwg.FrameContainer.classid, "local", graphics0);
                    frame.location.set(location);
                    graphics0.O.set({
                        x: 0,
                        y: 0
                    });

                    var ccontext =  this._context.scene.getContainerContext();
                    graphics0.scale(1/ccontext.miniAdjustRatio);

                    this._context.scene.addChild(frame);
                    frame.__json_creator__ = "pwg.FrameContainer.creator";
                }
            }
        }
        this._creating = null;
        this._points = [];
    };
    TubeUnionLBulid.prototype.cancel = function () {
        this._creating = null;
        this._points = [];
    };
    TubeUnionLBulid.prototype.getLocationMode = function () {
        return "joint";
    };
    TubeUnionLBulid.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating && this._points.length > 1) {
            this._creating.update();
            this._creating.render(drawing, "entity");
            this._creating.render(drawing, "ui");
        }
    };
    pwg.graphics.registerBuild("管廊L通", new TubeUnionLBulid());
    pwg.graphics.registerBuild("管廊L通(容器)", new TubeUnionLBulid(true));

    /////////////////////////////////////////////////////////////////////////
    /*
        TubeUnionI
            Al                  CL
            A+------ +  -------+A'
                                CR    
    */
    function TubeUnionI(container, id, isframe) {
        pwg.super(this, TubeUnion, container, id, isframe);
        this._O = new pwg.OptionalLocation(this, "O", "local");
        this._handleO = new pwg.UiHandle(this, "handle.move", "handle.move", "simple", this._O);
        this._forkA = new TubeFork(this, "A", {
            x: -1,
            y: 0
        }, 0.1, -1);
        this._CL = new pwg.AbsoluteLocation(this, "E", "local");
        this._CR = new pwg.AbsoluteLocation(this, "F", "local");
        this._style_outline = pwg.tube.__default_outline_style.clone();
        this._joints=
        [
            this._forkA.lp,
            this._forkA.rp,
            this._CL,this._CR
        ]
        this._dirty = true;
    }
    pwg.inherits(TubeUnionI, TubeUnion);
    pwg.defineClassId(TubeUnionI, "pwg.TubeUnionI");
    TubeUnionI.prototype.initialize = function (e, fork0) {
        this._O.set(e);
        if (fork0) {
            this._forkA.set(fork0);
        }
        this._dirty = true;
    };
    TubeUnionI.prototype.update = function () {
        var context = this.getContainerContext();
        var all = this._dirty;
        this._O.update();
        this._forkA.update(this, all);
        if (all) {
            this._CL.set(this._forkA.clp);
            this._CR.set(this._forkA.crp);
        }
        this._CL.update();
        this._CR.update();
        if (all) {
            var center = this._O.local;
            var outline = [
                this._forkA.lp.local, this._forkA.rp.local,
                this._forkA.crp, this._forkA.clp
            ];
            this._outline_local = outline;
        }
        this.dirty = false;
        this._outline = this._outline_local.map(p => context.localToPixel(p));
        this._outline.closed = true;
    };

    TubeUnionI.prototype.scale=function(scale)
    {
        this._forkA.scale(scale);
    };

    TubeUnionI.prototype.render = function (drawing, pass) {
        drawing.begin();
        drawing.resetTransform();
        if (pass == "entity") {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
            _draw_joints_(this._joints,drawing);
        } else if (pass == "ui") {
            var fstyle = pwg.tube.__default_frame_style;
            drawing.drawLineEx([this._O.pixel, this._forkA.p.pixel], fstyle);
            drawing.drawLineEx([this._O.pixel, this._forkA.q.pixel], fstyle);
        }
        else if(pass=="mini")
        {
            var outline = this._outline;
            drawing.drawEx(outline, this._style_outline);
        }
        drawing.end();
    };
    TubeUnionI.prototype._get_handles = function () {
        var handles = [
            this._forkA.handleP,
            this._forkA.handleQ,
            this._forkA.handleL,
            this._forkA.handleR
        ];

        if (!this._isframe)
            handles.push(this._handleO);
        return handles;
    };
    TubeUnionI.prototype._do_ui_handle_update = function (handle, e, action) {
        this._dirty = true;
        var context = this.getContainerContext();
        if (handle.type == "handle.move") {
            this._O.set(e);
        } else if (handle.type == "handle.offset") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.offset = local.subtract(this._O.local);
            fork.qoffset = fork.offset.length;
        } else if (handle.type == "handle.size") {
            var fork = handle.fork;
            var local = context.globalToLocal(e.global);
            fork.d = calc_tube_fork_size(this._O.local, fork.offset, local);
        }
        return true;
    };

    TubeUnionI.prototype.hitTest = function (e, option) {
        var outline = this._outline;
        var b = pwg.math.isPointInPolygon(outline, e.pixel);
        if (b) {
            return {
                succeed: true,
                object: this,
                distance: pwg.UI_HITTEST_TOLERENCE*2
            };
        } else
            return null;
    };


    TubeUnionI.prototype.depth=function()
    {
        return this._O.depth()+1;
    };
    TubeUnionI.prototype.isDep=function(o)
    {
        return this._O.isDep(o);
    };
    TubeUnionI.prototype.dispose=function()
    {
        return this._O.removeDep();
    };
    TubeUnionI.prototype.removeDep=function(o)
    {
        return this._O.removeDep(o);
    };

    pwg.defineClassProperties(TubeUnionI, {
        "O": {
            get: function () {
                return this._O;
            }
        },
        "A": {
            get: function () {
                return this._forkA;
            }
        }
    });

    TubeUnionI.prototype.__save__ = function (json) {
        json = TubeUnion.prototype.__save__.call(this, json);
        json.forkA = this._forkA.__save__();
        json.O = this._O.__save__();
        return json;
    };

    TubeUnionI.prototype.__load__ = function (json, context) {
        TubeUnion.prototype.__load__.call(this, json, context);
        this._O.__load__(json.O, context);
        this._forkA.__load__(json.forkA);
        this._dirty = true;
    };
    pwg.registerClass(TubeUnionI);
    ///////////////////////////////////////////////////////////////////////
    function TubeUnionIBulid(isframe) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._points = [];
        this._isframe = isframe;
    }
    pwg.inherits(TubeUnionIBulid, pwg.BaseBuild);
    pwg.defineClassId(TubeUnionIBulid, "pwg.TubeUnionIBulid");

    function create_TubeUnionI(points) {
        var A = points[0];
        var C = points[1];
        var d = A.getDistance(C) / 2.0;
        if (d < 1e-10)
            return null;
        var center = points[0].add(points[1]).multiply(0.5);
        return {
            center: center,
            forks: {
                offset: A.subtract(center),
                d: d * 0.2,
                q: d
            }
        };
    }

    TubeUnionIBulid.prototype.update = function (e, action) {
        if (action == "down") {
            return true;
        } else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                this._points[this._points.length - 1] = e.pixel;
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                var param = create_TubeUnionI(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                return true;
            }
        } else if (action == "up") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(TubeUnionI.classid);
                this._points = [e.pixel, e.pixel];
            } else {
                var creating = this._creating;
                this._points.push(e.pixel);
                var context = creating.getContainerContext();
                var points = this._points.map(p => context.pixelToLocal(p));
                var param = create_TubeUnionI(points);
                if (param) {
                    creating.initialize(param.center, param.forks);
                }
                if (points.length >= 3) {
                    this.post();
                }
            }
        }
    };
    TubeUnionIBulid.prototype.post = function () {
        if (this._creating) {
            if (this._points.length > 1) {
                if (!this._isframe)
                    this._context.container.addChild(this._creating);
                else {
                    var graphics0 = this._creating;
                    graphics0._isframe = true;
                    var location = graphics0.O.local.clone();
                    var frame = this._context.scene.createGraphics(pwg.FrameContainer.classid, "local", graphics0);
                    frame.location.set(location);
                    graphics0.O.set({
                        x: 0,
                        y: 0
                    });

                    var ccontext =  this._context.scene.getContainerContext();
                    graphics0.scale(1/ccontext.miniAdjustRatio);

                    this._context.scene.addChild(frame);
                    frame.__json_creator__ = "pwg.FrameContainer.creator";
                }
            }
        }
        this._creating = null;
        this._points = [];
    };
    TubeUnionIBulid.prototype.cancel = function () {
        this._creating = null;
        this._points = [];
    };
    TubeUnionIBulid.prototype.getLocationMode = function () {
        return "joint";
    };
    TubeUnionIBulid.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating && this._points.length > 1) {
            this._creating.update();
            this._creating.render(drawing, "entity");
            this._creating.render(drawing, "ui");
        }
    };
    pwg.graphics.registerBuild("管廊I通", new TubeUnionIBulid());
    pwg.graphics.registerBuild("管廊I通(容器)", new TubeUnionIBulid(true));
};