/*
    pwg-xpath.js
*/
if (typeof pwg == 'undefined')
    pwg = {};
////////////////////////////////////////////////////////
pwg.xpath = function () {
    function Rectangle(container, id,mode) {
        pwg.super(this, pwg.Graphics, container, id);
        mode = mode?mode:"local";
        this._mode = mode;
        this._min_location = new pwg.AbsoluteLocation(this, "min-location", "local");
        this._size = new pwg.size();
        this._max_location = new pwg.AbsoluteLocation(this, "max-location", mode);

        this._minp_handle = new pwg.UiHandle(this, "handle.move", "min-location", "simple");
        this._minp_handle.location = this._min_location;
        this._maxp_handle = new pwg.UiHandle(this, "handle.move", "max-location", "simple");
        this._maxp_handle.location = this._max_location;

        this._handles = [this._minp_handle, this._maxp_handle];
        this._style = new paper.Style();
        this._style.strokeColor = 'red';
        this._style.strokeWidth = 1.0;
        this._style.fillColor = 'rgba(0,0,0,0.01)';

    }
    pwg.inherits(Rectangle, pwg.Graphics);
    pwg.defineClassId(Rectangle, "pwg.Rectangle");
    Rectangle.prototype.update = function () {
        this._min_location.update();
        if(this._mode=="local")
            this._max_location.point = this._min_location.local.add(this._size);
        else
            this._max_location.point = this._min_location.pixel.add(this._size);
        this._max_location.update();
    };

    Rectangle.prototype._do_ui_handle_update = function (handle, e) {
        if (handle == this._minp_handle) {
            this._min_location.set(e);
            return true;
        }
        else
            if (handle == this._maxp_handle) {
                if(this._mode=="local")
                {
                    var gcontext = this.container.getContext();
                    var lc = gcontext.pixelToLocal(e.pixel);
                    var sz = lc.subtract(this._min_location.local);
                    this._size = new pwg.size(sz);
                }
                else
                {
                    var sz = e.pixel.subtract(this._min_location.pixel);
                    this._size = new pwg.size(sz);
                }
                return true;
            }
            else
                return false;
    };

    Rectangle.prototype.hitTest = function (e, options) {
        var p = e.pixel;
        var minp = this._min_location.pixel;
        var maxp = this._max_location.pixel;
        if (p.x < minp.x || p.x > maxp.x || p.y < minp.y || p.y > maxp.y)
            return null;
        return {
            succeed: true,
            distance: 0,
            object: this
        };
    };
    Rectangle.prototype.render = function (drawing, pass) {
        if (pass == "entity" || pass == "mini") {   //TODO:prepare
            var minp = this._min_location.pixel;
            var maxp = this._max_location.pixel;

            drawing.begin();
            drawing.resetTransform();
            drawing.styleApply(this._style);
            drawing.beginPath();
            drawing.moveTo(minp.x, minp.y);
            drawing.lineTo(maxp.x, minp.y);
            drawing.lineTo(maxp.x, maxp.y);
            drawing.lineTo(minp.x, maxp.y);
            drawing.closePath();
            if (this._style.hasFill())
                drawing.ctx.fill();
            if (this._style.hasStroke())
                drawing.ctx.stroke();
            drawing.end();
        }
    };
    pwg.defineClassProperties(Rectangle, {
        "point": {
            get: function () {
                return this._min_location;
            }
        },
        "size": {
            get: function () {
                return this._size;
            },
            set:function(sz)
            {
                this._size =new pwg.size(sz);
            }

        },
        "min": {
            get: function () {
                return this._min_location;
            }
        },
        "max": {
            get: function () {
                return this._max_location;
            }
        },
        "mode": {
            get: function () {
                return this._mode;
            }
        }
    });

    Rectangle.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        json.location = this._min_location.__save__();
        json.size = pwg.json.formats[pwg.size].save(this._size);
        json.style = pwg.json.formats[pwg.style].save(this._style);
        json.__json_creator__ = "pwg.Rectangle.creator";
        return json;
    };

    Rectangle.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
        this._min_location.__load__(json.location, context);
        pwg.json.formats[pwg.size].load(json.size, this._size);
        pwg.json.formats[pwg.style].load(json.style, this._style);
    };

    pwg.json.registerCreator("pwg.Rectangle.creator", function (container, id, json) {
        return new Rectangle(container, id, json.lxmode, json.szmode);
    });

    pwg.registerClass(Rectangle);
    pwg.Rectangle = Rectangle;

    ///////////////////////////////////////////////////////////////
    function RectangleBuild(mode) {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._mode = mode;
    }
    pwg.inherits(RectangleBuild, pwg.BaseBuild);
    RectangleBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(Rectangle.classid, "local", this._mode);
                this._creating._min_location.set(e);
                this._creating._style.strokeColor = 'blue';
                this._creating._style.strokeWidth = 4;
                this._creating._size.dasharray = [10, 4, 10, 4];
            }
            return true;
        }
        else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                creating._do_ui_handle_update(creating._maxp_handle, e);
                return true;
            }
        }
        else if (action == "up" || action == "post") {
            this.post();
        }
    };
    RectangleBuild.prototype.post = function () {
        if (this._creating) {
            this._context.container.addChild(this._creating);
            this._creating = null;
        }
    };
    RectangleBuild.prototype.cancel = function () {
        this._creating = null;
    };
    RectangleBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    RectangleBuild.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating) {
            this._creating.update();
            this._creating.render(drawing, "entity");
        }
    };
    pwg.graphics.registerBuild("矩形框(像素)", new RectangleBuild("pixel"));
    pwg.graphics.registerBuild("矩形框(地理)", new RectangleBuild("local"));
};