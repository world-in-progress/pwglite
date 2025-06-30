if (typeof pwg == "undefined")
    pwg = {};
if (!pwg.framex)
    pwg.framex = {}

pwg.framex= function () {
    function FrameX(container, id, mode) {
        pwg.super(this, pwg.Graphics, container, id);
        this._offset_location = new pwg.AbsoluteLocation(this, "location.offset", "global");
        this._scale_top_location = new pwg.AbsoluteLocation(this, "location.scale-top", "global");
        this._scale_left_location = new pwg.AbsoluteLocation(this, "location.scale-left", "global");
        this._rotation_locaiton = new pwg.AbsoluteLocation(this, "location.rotation", "global");

        this._offset_handle = new pwg.UiHandle(this, "handle.move", "handle.offset", "simple");
        this._offset_handle.location = this._offset_location;
        this._scale_top_handle = new pwg.UiHandle(this, "handle.scale", "handle.scale-top", "simple");
        this._scale_top_handle.location = this._scale_top_location;
        this._scale_left_handle = new pwg.UiHandle(this, "handle.scale", "handle.scale-left", "simple");
        this._scale_left_handle.location = this._scale_left_location;
        this._rotation_handle = new pwg.UiHandle(this, "handle.rotation", "handle.rotation", "simple");
        this._rotation_handle.location = this._rotation_locaiton;

        this._offset = new pwg.point();
        this._scale = new pwg.point(1, 1);
        this._angle = 0;

        this._bounds = null;
        this.graphics = null;
        this._size0 = null;
        this._offset0 = null;

        this._frameTRS = new pwg.TRS();
        this._finalTRS = null;
        this._finalTRS_I = null;

        this._handles = [this._offset_handle, this._scale_top_handle, this._scale_left_handle, this._rotation_handle];
        this._style = new paper.Style();
        this._style.strokeColor = 'red';
        this._style.strokeWidth = 1.0;
        this._style.fillColor = 'rgba(0,0,0,.01)';

        // this._style = new paper.Style();
        // this._style.strokeColor = 'red';
        // this._style.strokeWidth = 1.0;
        // this._style.fillColor = 'rgba(0,0,0,0.01)';

    }
    pwg.inherits(FrameX, pwg.Graphics);
    pwg.defineClassId(FrameX, "pwg.FrameX");
    FrameX.prototype.update = function () {
        this._offset_location.update();
        this._bounds = this.graphics.bounds ? this.graphics.bounds : this.graphics;
        this._offset = this._offset_location.point;
        this._size0 = this._bounds.size;
        this._offset0 = this._bounds.point;
        this._frameTRS.make(this._offset, this._angle, this._scale);
        var context = this.container.getContext();
        var tempTRS = new pwg.TRS();
        tempTRS.make(new pwg.point(-this._offset0.x, -this._offset0.y), 0, 1);
        this._finalTRS = this._frameTRS.M.appended(tempTRS.M);
        this._finalTRS.I = this._finalTRS.inverted();

        var rb = this._frameTRS.M.transform(new pwg.point(this._size0.width, 0));
        var lt = this._frameTRS.M.transform(new pwg.point(0, this._size0.height));
        var rt = this._frameTRS.M.transform(new pwg.point(this._size0.width, this._size0.height));

        this._vs = [this._offset, rb, rt, lt];
        this._scale_left_location.point = rb.add(rt).divide(2);
        this._scale_left_location.update();
        this._scale_top_location.point = lt.add(rt).divide(2);
        this._scale_top_location.update();
        this._rotation_locaiton.point = rb;
        this._rotation_locaiton.update();
    };

    FrameX.prototype._do_ui_handle_update = function (handle, e) {
        if (handle == this._offset_handle) {
            this._offset_location.set(e);
            return true;
        }
        else if (handle == this._scale_left_handle) {
            var tempTRS = new pwg.TRS();
            tempTRS.make(this._offset, this._angle, 1);
            var p = tempTRS.I.transform(e.global);
            this._scale.x = p.x / this._size0.width;
            return true;
        }
        else if (handle == this._scale_top_handle) {
            var tempTRS = new pwg.TRS();
            tempTRS.make(this._offset, this._angle, 1);
            var p = tempTRS.I.transform(e.global);
            this._scale.y = p.y / this._size0.height;
            return true;
        }
        else if(handle == this._rotation_handle)
        {
            var pp = e.global.subtract(this._offset);
            this._angle = pp.getAngle();
            return true;
        }
        else
            return false;
    };

    FrameX.prototype.hitTest = function (e, options) {
        var p = e.global;
        p = this._frameTRS.I.transform(p);
        if (p.x>=0 && p.y>=0 && p.x < this._size0.width && p.y <this._size0.height)
        {
            return {
                succeed: true,
                distance: 0,
                object: this
            };
        }
        else
            return null;
    };
    FrameX.prototype.render = function (drawing, pass) {
        if (pass == "entity"|| pass == "mini") {   //TODO:prepare
            var vs = this._vs;
            var cc = this.getContainerContext();

            drawing.begin();
            drawing.resetTransform();
            drawing.styleApply(this._style);
            
            drawing.beginPath();
            var p0 = cc.globalToPixel(vs[0]);
            drawing.moveTo(p0.x,p0.y);
            var p1 = cc.globalToPixel(vs[1]);
            drawing.lineTo(p1.x,p1.y);
            var p2 = cc.globalToPixel(vs[2]);
            drawing.lineTo(p2.x,p2.y);
            var p3 = cc.globalToPixel(vs[3]);
            drawing.lineTo(p3.x,p3.y);
            //console.log([p0,p1,p2,p3]);
            drawing.closePath();

            if (this._style.hasFill())
                drawing.ctx.fill();
            if (this._style.hasStroke())
                drawing.ctx.stroke();
            drawing.end();

            if(this.graphics.render)
            {
                this.graphics.render(cc,this._finalTRS,drawing);
            }
        }
    };
    pwg.defineClassProperties(FrameX, {
        // "point": {
        //     get: function () {
        //         return this._min_location;
        //     }
        // },
        // "size": {
        //     get: function () {
        //         return this._size;
        //     },
        //     set: function (sz) {
        //         this._size = new pwg.size(sz);
        //     }

        // },
        // "min": {
        //     get: function () {
        //         return this._min_location;
        //     }
        // },
        // "max": {
        //     get: function () {
        //         return this._max_location;
        //     }
        // },
        "mode": {
            get: function () {
                return this._mode;
            }
         }
    });

    FrameX.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        //json.location = this._min_location.__save__();
        // json.size = pwg.json.formats[pwg.size].save(this._size);
        // json.style = pwg.json.formats[pwg.style].save(this._style);
        json.__json_creator__ = "pwg.FrameX.creator";
        return json;
    };

    FrameX.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
        // this._min_location.__load__(json.location, context);
        // pwg.json.formats[pwg.size].load(json.size, this._size);
        // pwg.json.formats[pwg.style].load(json.style, this._style);
    };

    FrameX.prototype.transformCoordinates=function(coordinates)
    {
        var cc = this.getContainerContext();
        var trs = this._finalTRS;
        for(var i=0;i<coordinates.length;i++)
        {
            var pp = coordinates[i];
            var p0 = trs.transform(pp);
            p0 = cc.globalToLonlat(p0);
            pp[0]=p0.x;
            pp[1]=p0.y;
        }
        return coordinates;
    }
    FrameX.prototype.transformData=function()
    {
        var trs=this._finalTRS;
        var p0 = this._offset0;
        var size0 = this._size0;
        var pp0 = trs.transform(p0);
        var p1 = p0.add(size0.width,0);
        var pp1 = trs.transform(p1);
        var p2 = p0.add(size0.width,size0.height);
        var pp2 = trs.transform(p2);
        var p3 = p0.add(0,size0.height);
        var pp3 = trs.transform(p3);
        
        return ([
        p0.x,p0.y,pp0.x,pp0.y,
        p1.x,p1.y,pp1.x,pp1.y,
        p2.x,p2.y,pp2.x,pp2.y,
        p3.x,p3.y,pp3.x,pp3.y]
        );
    }
    pwg.json.registerCreator("pwg.FrameX.creator", function (container, id, json) {
        return new FrameX(container, id, json.lxmode, json.szmode);
    });

    pwg.registerClass(FrameX);
    pwg.FrameX = FrameX;

    ///////////////////////////////////////////////////////////////
    function FrameXBuild(mode) {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._mode = mode;
    }
    pwg.inherits(FrameXBuild, pwg.BaseBuild);
    FrameXBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(FrameX.classid, "local", this._mode);
                this._creating._offset_location.set(e);
                this._creating._style.strokeColor = 'red';
                this._creating._style.strokeWidth = 2;
                this._creating._style.dasharray = [10, 4, 10, 4];
                this._creating.graphics = new pwg.rectangle(0,0,1,1);
                this._creating.update();
            }
            return true;
        }
        else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                var offset = this._creating._offset_location.point;
                var size = e.global.subtract(offset);
                creating.graphics = new pwg.rectangle(0,0,size.x,size.y);
                //creating._do_ui_handle_update(creating._maxp_handle, e);
                return true;
            }
        }
        else if (action == "up" || action == "post") {
            var creating = this._creating;
            if (creating) {
                creating._style.strokeColor = 'red';
                creating._style.strokeWidth = 2;
                creating._style.dasharray = [];
                var offset = new pwg.point(creating._offset);
                var size = new pwg.size(creating._size0);
                if(size.width<0)
                    offset.x+=size.width;
                if(size.height<0)
                    offset.y+=size.height;
                size.width = Math.abs(size.width);
                size.height = Math.abs(size.height);
                creating._offset = offset;
                creating._offset_location.point = offset;

                var geometry_1= {
                    type:"LINESTRING",
                    coordinates:[[1200,1200],[1800,1800]]
                }
                var wkt=new Wkt.Wkt();
                wkt.read("POLYGON((350 100,100 200,105 400,405 405,305 100),(200 300,350 305,300 200,200 300))");
                var geometry_2= wkt.toJson();

                var graphics = new SimpleGeometryRenderGroup();
                graphics.geomertries= window.TMPGEOM;
                graphics.bounds=graphics.geomertries.bounds;
                creating.graphics = graphics;
                this.post();
            }
        }
    };
    FrameXBuild.prototype.post = function () {
        if (this._creating) {
            this._context.container.addChild(this._creating);
            window.framex=this._creating;
            this._creating = null;
        }
    };
    FrameXBuild.prototype.cancel = function () {
        this._creating = null;
    };
    FrameXBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    FrameXBuild.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating) {
            this._creating.update();
            this._creating.render(drawing, "entity");
        }
    };
    pwg.graphics.registerBuild("FrameX", new FrameXBuild("global"));
    //pwg.graphics.registerBuild("矩形框(地理)", new FrameXBuild("local"));
    function SimpleGeometryRenderGroup()
    {
        this._style = new paper.Style();   
        this._style.strokeColor = 'blue';
        this._style.strokeWidth = 1.0;
        this._style.fillColor = 'rgba(0,0,0,.01)';
    }
    SimpleGeometryRenderGroup.prototype.constructor = SimpleGeometryRenderGroup;
    SimpleGeometryRenderGroup.prototype.render_line_string=function(vs,context,trs,drawing,style,closed)
    {
        var cc = context;

        drawing.begin();
        drawing.resetTransform();
        drawing.styleApply(style);
        
        drawing.beginPath();
        var p0 = trs.transform(vs[0]);
        var p0 = cc.globalToPixel(p0);
        drawing.moveTo(p0.x,p0.y);
        for(var i=1,length = vs.length;i<length;i++)
        {
            p0 = trs.transform(vs[i]);
            p0 = cc.globalToPixel(p0);
            drawing.lineTo(p0.x,p0.y);
        }
        if(closed)
            drawing.closePath();
        if (style.hasFill())
            drawing.ctx.fill();
        if (style.hasStroke())
            drawing.ctx.stroke();
        drawing.end();
    };

    SimpleGeometryRenderGroup.prototype.render_geometry=function(geometry,context,trs,drawing,style)
    {
        var style = geometry.style?geometry.style:this._style;
        if(geometry.type.toUpperCase()=="LINESTRING")
        {
            this.render_line_string(geometry.coordinates,context,trs,drawing,style);
        }
        else if(geometry.type.toUpperCase()=="POLYGON"||geometry.type.toUpperCase()=="MULTILINESTRING")
        {   
            var length = geometry.coordinates.length;
            for(var i=0;i<length;i++)
            {
                this.render_line_string(geometry.coordinates[i],context,trs,drawing,style,geometry.type=="POLYGON");
            }
        }
        else if(geometry.type.toUpperCase()=="MULTIPOLYGON")
        {   
            var length = geometry.coordinates.length;
            for(var i=0;i<length;i++)
            {
                var polygon = geometry.coordinates[i];
                for(var j=0;j<polygon.length;j++)
                    this.render_line_string(polygon[i],context,trs,drawing,style,true);
            }
        }
    };


    SimpleGeometryRenderGroup.prototype.render=function(context,trs,drawing)
    {
        var geomertries = this.geomertries;
        for(var i =0,length = geomertries.length;i<length;i++)
        {
            this.render_geometry(geomertries[i],context,trs,drawing);
        }
    }
}