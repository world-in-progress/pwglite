if (typeof pwg == "undefined")
    pwg = {};
pwg.location = function () {

    //pwg location model
    //map: lonlat->[projection]-->global
    //local/global: local->[local matrix]->global->[view matrix]->pixel
    //       localToGlobal globalToLocal
    //       globalToPixel pixelToGlobal
    //     * pixelToLocal  localToPixel
    //see also pwg point model
    ///////////////////////////////////////////
    //绝对位置                                //
    ///////////////////////////////////////////
    function AbsoluteLocation(owner, id, mode) {
        this.owner = owner;
        this.id = id;
        this._point = new pwg.point();
        this.mode = mode;
        this.angle = 0;
        this.scale = 1;
        this._pixel = new pwg.point();
        this._local = new pwg.point();
        this._global = new pwg.point();
        this._lonlat = new pwg.lonlat();
        this._use_counter = 0;
    }
    pwg.inherits(AbsoluteLocation, pwg.Object);
    pwg.defineClassId(AbsoluteLocation, "pwg.AbsoluteLocation");
    AbsoluteLocation.prototype.sync = function () {
        var point = this._point;
        var mode = this.mode;
        var context = this.context;
        if (!context.localToGlobal) //
            return false;
        var global, pixel, local, lonlat;
        if (mode == 'pixel') {
            pixel = point;
            global = context.pixelToGlobal(pixel);
            local = context.globalToLocal(global);
            lonlat = context.globalToLonlat(global);
        } else if (mode == 'lonlat') {
            lonlat = point;
            global = context.lonlatToGlobal(lonlat);
            local = context.globalToLocal(global);
            pixel = context.globalToPixel(global);
        } else if (mode == 'global') {
            global = point;
            local = context.globalToLocal(global);
            pixel = context.globalToPixel(global);
            lonlat = context.globalToLonlat(global);
        } else if (mode == 'local') {
            local = point;
            global = context.localToGlobal(local);
            pixel = context.globalToPixel(global);
            lonlat = context.globalToLonlat(global);
        }
        this._pixel = pixel;
        this._local = local;
        this._global = global;
        this._lonlat = lonlat;
    };

    AbsoluteLocation.prototype.set = function (e) {
        if (!e) {
            console.log(this.owner);
            console.log("null value e to set absolute location");
            return;
        }
        if (e.hasOwnProperty("x")) {
            this._point.xy = e;
        } else if (this.mode == "pixel") {
            this._point.xy = e.pixel;
        } else if (this.mode == "lonlat") {
            this._point.lonlat = e.lonlat;
        } else if (this.mode == "global") {
            this._point.xy = e.global;
        } else {
            this._point.xy = this.context.globalToLocal(e.global);
        }
    };
    AbsoluteLocation.prototype.setExternal = function (e, external) {
        return false;
    };
    AbsoluteLocation.prototype.update = function () {
        this.sync();
    };
    AbsoluteLocation.prototype.use = function () {
        this._use_counter ++;
    };
    AbsoluteLocation.prototype.release = function () {
        this._use_counter --;
    };
    AbsoluteLocation.prototype.isDep = function () {
        return false;
    };
    AbsoluteLocation.prototype.dispose = function () {
      
    };
    pwg.defineClassProperties(AbsoluteLocation, {
        point: {
            get: function () {
                return this._point;
            },
            set: function (p) {
                this._point.xy = p;
            }
        },
        pixel: {
            get: function () {
                return this._pixel;
            }
        },
        lonlat: {
            get: function () {
                return this._lonlat;
            }
        },
        global: {
            get: function () {
                return this._global;
            }
        },
        local: {
            get: function () {
                return this._local;
            }
        },
        context: {
            get: function () {
                return this.owner.getContainerContext ? this.owner.getContainerContext() : this.owner;
            }
        }
    });

    AbsoluteLocation.prototype.depth = function () {
        if (this.owner && this.owner.depth)
            return this.owner.depth();
        else
            return 0;
    };

    AbsoluteLocation.prototype.removeDep=function(o)
    {
    };

    AbsoluteLocation.prototype.__save__ = function () {
        var json = {};
        json.mode = this.mode;
        json.point = pwg.json.formats[pwg.point].save(this._point);
        return json;
    };
    AbsoluteLocation.prototype.__using_id__ = function () {
        return this.owner.id + ":" + this.id;
    };
    AbsoluteLocation.prototype.__load__ = function (json, context) {
        this.mode = json.mode;
        pwg.json.formats[pwg.point].load(json.point, this._point);
    };
    pwg.AbsoluteLocation = AbsoluteLocation;
    ///////////////////////////////////////////////////////////////
    //可选位置                                                    //
    ///////////////////////////////////////////////////////////////
    function OptionalLocation(owner, id, mode) {
        pwg.super(this, AbsoluteLocation, owner, id, mode);
        this._optional = null;
    }
    pwg.inherits(OptionalLocation, AbsoluteLocation);
    pwg.defineClassId(OptionalLocation, "pwg.OptionalLocation");
    OptionalLocation.prototype.set = function (e) {
        if (e.location == "absolute") {
            if (this._optional) {
                this._optional.release();
                this._optional = null;
                this._raise_location_changed_event();
            }
            AbsoluteLocation.prototype.set.call(this, e);
        } else
        if (this._optional) {
            if (e.location && e.location == this._optional)
                return;
            if (!this._optional.setExternal || !this._optional.setExternal(e, this.owner)) {
                this._optional.release();
                this._optional = null;
                this._raise_location_changed_event();
                this.set(e);
            }
        } else {
            if (e.location && (e.location.owner.container == this.owner.container || this.mode!='local')) {
                this._optional = e.location;
                this._optional.use();
                this._raise_location_changed_event();
            } else {
                AbsoluteLocation.prototype.set.call(this, e);
            }
        }
    };
    OptionalLocation.prototype._raise_location_changed_event = function () {
        if (this.owner && this.owner._raise_location_changed_event) {
            this.owner._raise_location_changed_event();
        }
    };

    OptionalLocation.prototype.update = function () {
        if (this._optional) {
            var using = this._optional;
            this._local.xy = using.local;
            this._pixel.xy = using.pixel;
            this._global.xy = using.global;
            this._lonlat.xy = using.lonlat;
            this.angle = using.angle;
            this.scale = using.scale;
        } else {
            AbsoluteLocation.prototype.update.call(this);
        }
    };

    OptionalLocation.prototype.depth = function () {
        return this._optional ? this._optional.depth() + 1 : 0;
    };

    OptionalLocation.prototype.isDep = function (o) {
        return this._optional ? this._optional.owner == o || this._optional.isDep(o) : false;
    };

    OptionalLocation.prototype.removeDep=function(o)
    {
        if(!o)
        {
            if(this._optional)
            {
                this._optional.release();
                this._optional=null;
            }
        }
        else if(this._optional && this._optional.owner == o )
        {
            this._optional.release();
            this._optional=null;
            this._raise_location_changed_event();
            return true;
        }
    };

    pwg.defineClassProperties(OptionalLocation, {
        using: {
            get: function () {
                return this._optional ? this._optional : this;
            }
        },
        optional: {
            get: function () {
                return this._optional;
            }
        }
    });

    OptionalLocation.prototype.__save__ = function () {
        var json = AbsoluteLocation.prototype.__save__.call(this);
        if (this._optional) {
            json.using = this._optional.__using_id__();
        }
        return json;
    };

    OptionalLocation.prototype.__load__ = function (json, context) {
        AbsoluteLocation.prototype.__load__.call(this, json, context);
        if (json.using) {
            var using = context.getUsingLocation(json.using);
            this._optional = using;
            using.use();
        }
    };
    pwg.OptionalLocation = OptionalLocation;
    /////////////////////////////////////////////////////////////////
    //Offset Location                                              //
    /////////////////////////////////////////////////////////////////
    function OffsetLocation(owner, id, base, mode) {
        pwg.super(this, AbsoluteLocation, owner, id);
        this.mode = mode ? mode : "pixel";
        this.base = base;
        this.offset = {
            t: new pwg.point(),
            r: 0,
            s: 1
        };
    }
    pwg.inherits(OffsetLocation, AbsoluteLocation);
    pwg.defineClassId(OffsetLocation, "pwg.OffsetLocation");
    OffsetLocation.prototype.update = function () {
        var mode = this.mode;
        var base = this.base;
        if (mode == 'pixel')
            this._point.xy = base.pixel.add(this.offset.t);
        else if (mode == 'local')
            this._point.xy = base.local.add(this.offset.t);
        else if (mode == "global")
            this._point.xy = base.globa.add(this.offset.t);
        else
            this._point.xy = base.local.add(this.offset.t);

        this.sync();
        this.angle = this.base.angle + this.offset.r;
        this.scale = this.base.scale * this.offset.s;
    };

    OffsetLocation.prototype.removeDep=function(o)
    {
    };
    
    pwg.defineClassProperties(OffsetLocation, {
        "t": {
            get: function () {
                return this.offset.t;
            },
            set: function (t) {
                this.offset.t = t
            }
        },
        "r": {
            get: function () {
                return this.offset.r;
            },
            set: function (t) {
                this.offset.r = t
            }
        },
        "s": {
            get: function () {
                return this.offset.s;
            },
            set: function (t) {
                this.offset.s = t;
            }
        }
    });

    OffsetLocation.prototype.isDep = function (o) {
        return this.base.isDep(o);
    };

    OffsetLocation.prototype.__save__ = function () {
        var json = AbsoluteLocation.prototype.__save__.call(this);
        json.T = pwg.json.formats[pwg.point].save(this.offset.t);
        json.R = this.offset.r;
        json.S = this.offset.s;
        return json;
    };

    OffsetLocation.prototype.__load__ = function (json, context) {
        AbsoluteLocation.prototype.__load__.call(this, json, context);
        this.offset.t.xy = json.T;
        this.offset.r = json.R;
        this.offset.s = json.S;
    };
    pwg.OffsetLocation = OffsetLocation;
    
    /////////////////////////////////////////////////////////
    function AbsoluteLocationEx(owner, id, mode) {
        pwg.super(this, pwg.AbsoluteLocation, owner, id, mode);
        this._use_counter = 0;
    }
    pwg.inherits(AbsoluteLocationEx, pwg.AbsoluteLocation);
    pwg.defineClassId(AbsoluteLocationEx, "pwg.AbsoluteLocationEx");
    AbsoluteLocationEx.prototype.use = function () {
        this.owner._use_location(this);
        this._use_counter++;
    };
    AbsoluteLocationEx.prototype.release = function () {
        this._use_counter--;
        this.owner._release_location(this);
    };
    AbsoluteLocationEx.prototype.__using_id__ = function () {
        return this.owner.id + ":jointx@" + this.id;
    };
    pwg.AbsoluteLocationEx = AbsoluteLocationEx;
};