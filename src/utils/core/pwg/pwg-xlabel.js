/*
    pwg-xlabel.js
*/
////////////////////////////////////////////////////////
pwg.xlabel = function () {
    var that = pwg.xlabel;
    function _update_text_metric(drawing, font, baseline, text) {
        if(!drawing.ctx)
            return new pwg.rectangle(0,0,64,16);
        drawing.begin();
        drawing.styleApply(font);
        drawing.ctx.textBaseline = baseline;
        var metric = drawing.measureText(text);
        var f = 0;
        var left = metric.actualBoundingBoxLeft - font.fontSize * f;
        var right = metric.actualBoundingBoxRight + font.fontSize * f;
        var top = -metric.actualBoundingBoxAscent - font.fontSize * f;
        var bottom = metric.actualBoundingBoxDescent + font.fontSize * f;
        var bbox = new pwg.rectangle(left, top, right - left, bottom - top);
        drawing.end();
        return bbox;
    }
    //==============================================================================================
    //add by laowine for labeling auto avoiding
    function AnnotationContext()
    {
        this._stack=[];
    }
    AnnotationContext.prototype.constructor = AnnotationContext;
    AnnotationContext.prototype.begin=function(viewport)
    {
        this._viewport = viewport;
        this._stack=[];
        this._cache=[];
    };
    
    AnnotationContext.prototype.tryItem=function(ibox)
    {
        var stack = this._stack;
        var length = stack.length;
        for(var i=0;i<length;i++)
        {
            var item = stack[i];
            if(item.boundx.intersects(ibox,2))
            {
                if(item.bounds)
                {
                    var bounds = item.bounds;
                    for(var k=0,nbounds=bounds.length;k<nbounds;k++)
                    {
                        if(bounds[k].intersects(ibox,2))
                            return false;
                    }
                }
                else
                {
                    return false;
                }
            }
        }
        return true;
    };

    AnnotationContext.prototype.push=function(item)
    {
        if(this._viewport.intersect(item.boundx)/* && this._cache.indexOf(item)==-1*/)
        {
            this._cache.push(item); 
        }  
        else
        {
            item.visible=false;
        }
    };

    AnnotationContext.prototype.end=function()
    {
        this._cache.sort(function(a,b){return a.priority-b.priority;});
        var items = this._cache;
        var stack = this._stack;
        for(var i=0,length=items.length;i<length;i++)
        {
            var item = items[i];
            var b = this.tryItem(item.boundx);
            if(!b && item.bounds)
            {
                var bounds = item.bounds;
                b=true;
                for(var k=0,nbounds=bounds.length;k<nbounds;k++)
                {
                    b =  this.tryItem(bounds[k]);
                    if(!b)
                        break;
                }
            }
            if(b)
            {
                stack.push(item);
            }
            else
            {
                item.visible=false;
            }
        }
    };
    that.AnnotationContext=AnnotationContext;
    function AnnotationContextItem()
    {
        this.visible=true;
        this.priority=0;
        this.boundx=null;
        this.bounds=null;
    }
    AnnotationContextItem.prototype.constructor=AnnotationContextItem;

    function _update_point_anno_context_item(owner,rc,item)
    {   
        item.visible=true;
        if(!item.boundx)
            item.boundx=new pwg.rectangle();
        var from = owner.baseToPixel(rc.topLeft);
        var to = owner.baseToPixel(rc.bottomRight);
        item.boundx.set(from,to);
    }

    function _update_aline_anno_context_item(owner,rc,ndiv,item)
    {
        if(ndiv==0)
        {
            item.visible=false;
            return;
        }
        item.visible=true;
        if(!item.boundx)
            item.boundx=new pwg.rectangle();
        if(!item.bounds || item.bounds.length!=ndiv)
        {
            item.bounds = [];
            for(var i=0;i<ndiv;i++)
            {
                item.bounds.push(new pwg.rectangle());
            }
        }
        var p1 = owner.baseToPixel(rc.topLeft);
        var p2 = owner.baseToPixel(rc.bottomRight);
        item.boundx.set(p1,p2);
        item.boundx.include(owner.baseToPixel(rc.topRight));
        item.boundx.include(owner.baseToPixel(rc.bottomLeft));

        var dx = rc.width/ndiv;
        var dy = rc.height;

        var p0 = owner.baseToPixel(new pwg.point(0,0));
        var size = owner.baseToPixel(new pwg.point(dx/2,dy/2));
        size=size.subtract(p0);

        for(var i=0;i<ndiv;i++)
        {
           var x=dx*(i+0.5)+rc.x;
           var y=dy*0.5+rc.y;
           var cp = owner.baseToPixel(new pwg.point(x,y));
           var p1=cp.subtract(size);
           var p2=cp.add(size); 
           item.bounds[i].set(p1,p2);
        }
    }

    //===============================================================================================
    function PointAnnotation(container, id) {
        pwg.super(this, pwg.Graphics, container, id);
        this._location = new pwg.OptionalLocation(this, "O", "local");
        this._location_handle = new pwg.UiHandle(this, "handle.move", "location", "simple", this._location);
        this._location_handle.locationMode = "joint";
        this._text = "$location.text";
        this.alignment = "left-bottom";
        this._boundingbox = null;
        this._font_style = pwg.styles.get("label.text.default");
        this._font_style.fontEnable = true;
        this._border_style = pwg.styles.get("label.border.default");
        this._TRS = new pwg.TRS();
        this._handles = [this._location_handle];
        this._context_stub_item = new AnnotationContextItem();
    }

    pwg.inherits(PointAnnotation, pwg.Graphics);
    pwg.defineClassId(PointAnnotation, "pwg.PointAnnotation");
    PointAnnotation.prototype._update_text_metric = _update_text_metric;
    PointAnnotation.prototype.update = function () {
        var context = this.getContainerContext();
        var drawing = context.drawing;
        this._boundingbox = this._update_text_metric(drawing, this._font_style, this._baseline, this._text);
        this._location.update();
        var loc = this._location;
        this._TRS.make(loc.pixel, 0, context.get_point_adjust_ratio());
        if(drawing.annotationContext)
        {
            _update_point_anno_context_item(this,this._boundingbox,this._context_stub_item);
            drawing.annotationContext.push(this._context_stub_item);
        }
    };

    //add by laowine for labeling auto avoiding
    PointAnnotation.prototype.baseToPixel = function (point) {
        return this._TRS.M.transform(point);
    };
    PointAnnotation.prototype.pixelToBase = function (point) {
        return this._TRS.I.transform(point);
    };

    PointAnnotation.prototype.render = function (drawing, pass) {
        if(!this._context_stub_item.visible)
            return;
        if (pass == "label") {
            drawing.begin();
            drawing.resetTransform();
            drawing.draw_ui_handle_diamond(this._location.pixel, 4, pwg.colors.RED, pwg.colors.YELLOW);
            drawing.setMatrix(this._TRS.M);
            var bstyle = this._border_style;
            var offset = 0;
            if (this._halignment == "center")
                offset = -this._boundingbox.width / 2;
            else if (this._halignment == "right")
                offset = -this._boundingbox.width;
            if (bstyle.hasFill() || bstyle.hasStroke()) {
                drawing.styleApply(bstyle);
                var bbox = this._boundingbox.clone();
                bbox.x += offset;
                drawing.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);
                drawing.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            }
            drawing.styleApply(this._font_style);
            drawing.fillText(this.text, offset, 0, this._baseline);
            drawing.end();
        } else if (pass == 'ui' || pass == 'hot' || pass == 'debug') {
            drawing.begin();
            drawing.resetTransform();
            drawing.draw_ui_handle_diamond(this._location.pixel, 4, pwg.colors.RED, pwg.colors.YELLOW);
            var hot = pwg.styles.get("linelike.ui");
            drawing.setMatrix(this._TRS.M);
            drawing.styleApply(hot);
            var bbox = this._boundingbox.clone();
            var offset = 0;
            if (this._halignment == "center")
                offset = -this._boundingbox.width / 2;
            else if (this._halignment == "right")
                offset = -this._boundingbox.width;
            bbox.x += offset;
            drawing.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            drawing.end();
        }
    };

    PointAnnotation.prototype.hitTest = function (e, options) {
        var pp = this._TRS.I.transform(e.pixel);
        if (this._boundingbox.contains(pp)) {
            return {
                succeed: true,
                object: this,
                distance: 0
            };
        }
        return null;
    };

    PointAnnotation.prototype.isDep=function(o)
    {
        return this._location.isDep(o);
    };

    PointAnnotation.prototype.removeDep=function(o)
    {
        return this._location.removeDep(o);
    };

    PointAnnotation.prototype.dispose=function()
    {
        return this._location.removeDep();
    };
    
    PointAnnotation.prototype.depth = function () {
        return this._location.depth() + 1;
    };

    PointAnnotation.prototype._do_ui_handle_update = function (handle, e, action) {
        if (handle == this._location_handle)
            this.location.set(e);
        return true;
    };

    PointAnnotation.prototype.tryGetUiCommand = function (e, handle) {
        //owner, id, handle, title, mode
        var command = new pwg.UiCommand(this, "center", handle, '居中');
        return [command];
    };


    PointAnnotation.prototype._execute_ui_command = function (command) {
        this.alignment = "center-" + this._baseline;
    };

    pwg.defineClassProperties(PointAnnotation, {
        "location": {
            get: function () {
                return this._location;
            }
        },
        "text": {
            get: function () {
                if(this._text=="$owner.text")
                    return this.owner.text;
                if(this._text=="$location.text")
                {
                    if(this._location.optional)
                        return this._location.optional.owner.text;
                    if(this._location.owner!=this)
                        return this._location.owner.text;
                }
                return this._text;
            },
            set: function (v) {
                this._text = v;
            }
        },
        "style": {
            get: function () {
                return {
                    font: this._font_style,
                    border: this._border_style
                };
            }
        },
        "alignment": {
            get: function () { return this._alignment; }, set: function (v) {
                var aa = v.split("-");
                this._baseline = aa[1];
                this._halignment = aa[0];
                this._alignment = v;
            }
        }
    });

    PointAnnotation.prototype.__save__=function(json)
    {
        json = pwg.Graphics.prototype.__save__.call(this,json);
        json.location = this._location.__save__();
        json.text = this._text;
        json.alignment = this._alignment;
        json.style = 
        {
            font:this._font_style.name,
            border:this._border_style.name
        };
        return json;
    };

    PointAnnotation.prototype.__load__=function(json,context)
    {
        pwg.Graphics.prototype.__load__.call(this,json,context);
        this._location.__load__(json.location,context);
        this._text = json.text;
        this.alignment = json.alignment;
        this._font_style = pwg.styles.get(json.style.font);
        this._border_style=pwg.styles.get(json.style.border);
    };

    pwg.registerClass(PointAnnotation);
    //////////////////////////////////////////////////////////////////////////////
    function PointAnnotationBuild() {
        pwg.super(this, pwg.BaseBuild);
    }
    pwg.inherits(PointAnnotationBuild, pwg.BaseBuild);
    PointAnnotationBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    PointAnnotationBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(PointAnnotation.classid);
                this._creating.location.set(e);
            }
        } else if (action == "up" || action == "post") {
            if (this._creating) {
                this._creating.location.set(e);
                this.post();
            }
        } else if (action == "move") {
            if (this._creating) {
                this._creating.location.set(e);
            }
        }
    };
    PointAnnotationBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "label");
            this._creating.render(context.drawing, "ui");
        }
    };
    PointAnnotationBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating.dispose();
            this._creating = NULL;
        }
    };
    PointAnnotationBuild.prototype.post = function () {
        if (this._creating) {
            this._context.container.addChild(this._creating);
        }
        this._creating = null;
    };
    pwg.graphics.registerBuild("点文本", new PointAnnotationBuild());
    ////////////////////////////////////////////////////////////////////
    //================================
    function OffsetAnnotation(container, id) {
        pwg.super(this, pwg.Graphics, container, id);
        this._text = "$location.text";
        this._font_style = pwg.styles.get("label.text.default");
        this._font_style.fontEnable = true;
        this._outline = null;
        this._boundingbox = null;
        this._text_metric = null;
        this._line_style = pwg.styles.get("label.offsetline.default");
        this._border_style = pwg.styles.get("label.border.default");
        this._location = new pwg.OptionalLocation(this, "location", "local");
        this._offset = new pwg.point();
        this._offset_location = new pwg.AbsoluteLocation(this, "offset", "pixel");
        this._handle_location = new pwg.UiHandle(this, "handle.move", "location", "simple", this._location);
        this._handle_location.locationMode = "joint";
        this._handle_offset = new pwg.UiHandle(this, "handle.move", "location", "simple", this._offset_location);
        this._handles = [this._handle_location, this._handle_offset];
        this._TRS = new pwg.TRS();
        this._baseline = "bottom";
        this._halignment = "left";
        this._context_stub_item=new AnnotationContextItem();
    }

    pwg.inherits(OffsetAnnotation, pwg.Graphics);
    pwg.defineClassId(OffsetAnnotation, "pwg.OffsetAnnotation");
    OffsetAnnotation.prototype._update_text_metric = _update_text_metric;
    OffsetAnnotation.prototype.update = function () {
        var context = this.getContainerContext();
        if (this._location.owner == this)
            this._location.update();
        var offset = this.offset;
        this._halignment = offset.x > 0 ? "left" : "right";
        this._baseline = offset.y < 0 ? "bottom" : "top";
        this._boundingbox = this._update_text_metric(context.drawing, this._font_style, this._baseline, this.text);
        var ratio = this.autoAdjustRatio ? context.pointAdjustRatio : 1;
        this._TRS.make(this._location.pixel, 0, ratio);
        this._offset_location.point = this.baseToPixel(offset);
        this._offset_location.update();

        var p0 = new pwg.point(0, 0);
        var p1 = this._offset;
        var p2 = p1.clone();
        if (this._halignment == "left")
            p2.x += this._boundingbox.width;
        else
            p2.x -= this._boundingbox.width;
        this._outline = [p0, p1, p2];

        if (this._halignment == "left")
            this._boundingbox.point = p1;
        else
            this._boundingbox.point = p2;
        if (this._baseline == "bottom") {
            this._boundingbox.y -= this._boundingbox.height;
        }

        var drawing = context.drawing;
        if(drawing.annotationContext)
        {
            _update_point_anno_context_item(this,this._boundingbox,this._context_stub_item);
            drawing.annotationContext.push(this._context_stub_item);
        }
    };

    OffsetAnnotation.prototype.render = function (drawing, pass) {
        if(!this._context_stub_item.visible)
            return;
        if (pass == "label") {
            drawing.begin();
            drawing.setMatrix(this._TRS.M);
            drawing.drawEx(this._outline, this._line_style);
            if (this._border_style.hasFill() || this._border_style.hasStroke()) {
                var bbox = this._boundingbox;
                drawing.styleApply(this._border_style);
                if (this._border_style.hasFill())
                    drawing.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);
                if (this._border_style.hassStroke())
                    drawing.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            }
            drawing.styleApply(this._font_style);
            if (this._halignment == "left") {
                var p1 = this._outline[1];
                drawing.fillText(this.text, p1.x, p1.y, this._baseline);
            } else {
                var p2 = this._outline[2];
                drawing.fillText(this.text, p2.x, p2.y, this._baseline);
            }
            drawing.end();
        } else if (pass == "ui" || pass == "hot" || pass == "debug") {
            drawing.begin();
            drawing.setMatrix(this._TRS.M);
            drawing.styleApply(pwg.styles.get("linelike.ui"));
            var bbox = this._boundingbox;
            drawing.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            drawing.end();
        }
    };

    OffsetAnnotation.prototype.baseToPixel = function (point) {
        return this._TRS.M.transform(point);
    };
    OffsetAnnotation.prototype.pixelToBase = function (point) {
        return this._TRS.I.transform(point);
    };

    OffsetAnnotation.prototype.hitTest = function (e, options) {
        var context = this.getContainerContext();
        var p = this._TRS.I.transform(e.pixel);
        if (this._boundingbox.contains(p))
            return {
                succeed: true,
                object: this,
                distance: 0
            }
        else {
            var d = pwg.utils.find_line_string_nearest_point(this._outline, p);
            if (d.distance < pwg.UI_HITTEST_TOLERENCE / context.pointAdjustRatio) {
                return {
                    succeed: true,
                    object: this,
                    distance: d.distance
                };
            }
        }
        return null;
    };

    OffsetAnnotation.prototype._do_ui_handle_update = function (handle, e) {
        if (handle == this._handle_location) {
            this._location.set(e);
        } else {
            this._offset = this.pixelToBase(e.pixel);
        }
    };

    OffsetAnnotation.prototype.get_text = function () {
        if (this._text == "$location.text") {
            if (this._location.optional)
                return this._location.optional.owner.text;
            if (this._location.owner != this)
                return this._location.owner.text;
        }
        if (this._text == "$owner.text")
            return this.owner.text;
        return this._text;
    };
    
    OffsetAnnotation.prototype.depth = function () {
        return this._location.depth() + 1; //TODO:check the depth update logic
    };

    OffsetAnnotation.prototype.isDep=function(o)
    {
        return this._location.isDep(o);
    };

    OffsetAnnotation.prototype.removeDep=function(o)
    {
        return this._location.removeDep(o);
    };

    OffsetAnnotation.prototype.dispose=function()
    {
        return this._location.removeDep();
    };
    

    pwg.defineClassProperties(OffsetAnnotation, {
        "location": {
            get: function () {
                return this._location;
            },
            set: function (v) {
                this._location = v;
            }
        },
        "offset": {
            get: function () {
                return this._offset;
            }
        },
        "text": {
            get: function () {
                return this.get_text();
            },
            set: function (v) {
                this._text = v;
            }
        },
        "style": {
            get: function () {
                return {
                    font: this._font_style,
                    border: this._border_style,
                    line: this._line_style
                };
            }
        }
    });

    OffsetAnnotation.prototype.__save__=function(json)
    {
        json = pwg.Graphics.prototype.__save__.call(this,json);
        if(this._location.owner==this)
            json.location = this._location.__save__();
        json.offset = pwg.json.formats[pwg.point].save(this._offset);
        json.text = this._text;
        json.autoAdjustRatio = this.autoAdjustRatio;
        json.style=
        {
            font:this._font_style.name,
            border:this._border_style.name,
            line:this._line_style.name
        };
        return json;
    };

    OffsetAnnotation.prototype.__load__=function(json,context)
    {
        pwg.Graphics.prototype.__load__.call(this,json,context);
        if(json.location)
            this._location.__load__(json.location,context);
        this._offset = pwg.json.formats[pwg.point].load(json.offset);
        this._text = json.text;
        this.autoAdjustRatio = json.autoAdjustRatio;
        this._font_style = pwg.styles.get(json.style.font); 
        this._border_style = pwg.styles.get(json.style.border);
        this._line_style = pwg.styles.get(json.style.line);
    };
    pwg.registerClass(OffsetAnnotation);
    pwg.OffsetAnnotation = OffsetAnnotation;
    //////////////////////////////////////////////////////////////////
    function OffsetAnnotationBuild() {
        pwg.super(this, pwg.BaseBuild, "continuous");
    }

    pwg.inherits(OffsetAnnotationBuild, pwg.BaseBuild);
    OffsetAnnotationBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    OffsetAnnotationBuild.prototype.update = function (e, action) {
        if (action == "up") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(OffsetAnnotation.classid);
                this._creating.location.set(e);
            } else {
                this._creating._handle_offset.update(e, action);
                this.post();
            }
        } else if (action == "move") {
            if (this._creating) {
                this._creating._handle_offset.update(e, action);
            }
        }
    };
    OffsetAnnotationBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "label");
            this._creating.render(context.drawing, "ui");
        }
    };
    OffsetAnnotationBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating.dispose();
            this._creating = NULL;
        }
    };
    OffsetAnnotationBuild.prototype.post = function () {
        if (this._creating) {
            this._context.container.addChild(this._creating);
        }
        this._creating = null;
    };
    pwg.graphics.registerBuild("引线标注", new OffsetAnnotationBuild());

    function InlineOffsetAnnotation(container, owner) {
        pwg.super(this, OffsetAnnotation, container, "__inline__");
        this.owner = owner;
        this._offset = new pwg.point(10, -10);
        this._text = "$owner.text";
    }
    pwg.inherits(InlineOffsetAnnotation, OffsetAnnotation);
    InlineOffsetAnnotation.prototype._get_handles = function () {
        return [this._handles[1]];
    };
    pwg.InlineOffsetAnnotation = InlineOffsetAnnotation;
    /////////////////////////////////////////////////////////////////////////////
    function AlineAnnotation(container, id) {
        pwg.super(this, pwg.Graphics, container, id)
        this._start = new pwg.OptionalLocation(this, "start", "local");
        this._end = new pwg.OptionalLocation(this, "end", "local");
        this._baseline = "middle";
        this._halignment = "center";
        this._text = "aline-text";
        this._font_style = pwg.styles.get("label.text.default");
        this._font_style.fontEnable = true;
        this._border_style = pwg.styles.get("label.border.default");
        this._line_style = pwg.styles.get("none");
        this._boundingbox = null;
        this._location = new pwg.AbsoluteLocation(this, "location0", 'pixel');
        this._center = new pwg.AbsoluteLocation(this, "location0", 'pixel');
        this._handle_start = new pwg.UiHandle(this, "handle.move", "start", "simple", this._start);
        this._handle_start.locationMode = 'joint';
        this._handle_end = new pwg.UiHandle(this, "handle.move", "end", "simple", this._end);
        this._handle_end.locationMode = 'joint';
        this._TRS = new pwg.TRS();
        this._offset_annotation = new InlineOffsetAnnotation(container, this);
        this._offset_annotation.location = this._center;
        this._offset_annotation.offset.xy = new pwg.point(10, -10);
        this._handles = [this._handle_start, this._handle_end, this._offset_annotation._handles[1]];
        this._context_stub_item=new AnnotationContextItem();
    }

    pwg.inherits(AlineAnnotation, pwg.Graphics);
    pwg.defineClassId(AlineAnnotation, "pwg.AlineAnnotation");
    AlineAnnotation.prototype.get_text = function () {
        if (this._text == "$owner.text") {
            return this.owner.text;
        } else {
            return pwg.defined(this._text) ? this._text : "...";
        }
    };
    
    AlineAnnotation.prototype._update_text_metric = _update_text_metric;

    //add by laowine for labeling auto avoiding
    AlineAnnotation.prototype.baseToPixel = function (point) {
        return this._TRS.M.transform(point);
    };
    AlineAnnotation.prototype.pixelToBase = function (point) {
        return this._TRS.I.transform(point);
    };

    AlineAnnotation.prototype.update = function () {
        var context = this.getContainerContext();
        var drawing = context.drawing;
        this._boundingbox = this._update_text_metric(drawing, this._font_style, this._baseline, this.text);
        if (this._start.owner == this)
            this._start.update();
        if (this._end.owner == this)
            this._end.update();
        var start = this._start.pixel;
        var end = this._end.pixel;
        this._visiblity = (start.getDistance(end) > this._boundingbox.width * 1.2);
        var angle = end.subtract(start).angle;
        var v = end.subtract(start);
        var l = v.length;
        v = v.normalize();
        var f = 0.025 * l;
        start = start.add(v.multiply(f));
        end = end.subtract(v.multiply(f));
        var center = start.add(end).multiply(0.5);
        this._center.set(center);
        this._center.update();
        if (v.x > 0) {
            this._location.angle = angle;
            if (this._halignment == "start") {
                this._location.set(start);
            } else if (this._halignment == "center") {
                var p = center.subtract(v.multiply(this._boundingbox.width * 0.5));
                this._location.set(p);
            } else {
                var p = end.subtract(v.multiply(this._boundingbox.width));
                this._location.set(p);
            }
            this._location.update();
            this._TRS.make(this._location.pixel, this._location.angle, 1);
        } else {
            this._location.angle = angle + 180;
            if (this._halignment == "start") {
                this._location.set(start.add(v.multiply(this._boundingbox.width)));
            } else if (this._halignment == "center") {
                var p = center.add(v.multiply(this._boundingbox.width * 0.5));
                this._location.set(p);
            } else {
                this._location.set(end);
            }
            this._location.update();
            this._TRS.make(this._location.pixel, this._location.angle, 1);
        }
        
        if(! this._visiblity)
            this._offset_annotation.update();

        if(drawing.annotationContext)
        {
            _update_aline_anno_context_item(this,this._boundingbox,this.text.length,this._context_stub_item);
            drawing.annotationContext.push(this._context_stub_item);
        }
    };

    AlineAnnotation.prototype.render = function (drawing, pass) {

        var start = this._start.pixel;
        var end = this._end.pixel;

        if (pass == "label") {
            if (!this._visiblity) {
                if(this._line_style.hasStroke())
                {
                    drawing.drawEx([start, end], this._line_style);
                }
                this._offset_annotation.render(drawing, pass);
            } else {
                if(!this._context_stub_item.visible)
                    return;
                drawing.begin();
                drawing.resetTransform();
                if(this._line_style.hasStroke())
                {
                    drawing.drawEx([start, end], this._line_style);
                }
                drawing.setMatrix(this._TRS.M);
                var offset = 0;
                drawing.styleApply(this._font_style);
                drawing.strokeText(this.text, offset, 0, this._baseline);
                drawing.fillText(this.text, offset, 0, this._baseline);
                drawing.end();
            }
        } else if (pass == "ui" || pass == 'hot' || pass == 'debug') {
            if(!this._context_stub_item.visible)
                return;
            drawing.begin();
            drawing.resetTransform();
            var style = this._line_style;
            var hot = pwg.styles.get("linelike.ui");
            if(!style.hasStroke())
            {
                drawing.drawEx([start, end], hot);
            }
            drawing.draw_ui_handle_diamond(start, 4, pwg.colors.RED, pwg.colors.YELLOW);
            drawing.draw_ui_handle_diamond(end, 4, pwg.colors.RED, pwg.colors.YELLOW);

            if (this._visiblity) {
                drawing.setMatrix(this._TRS.M);
                drawing.styleApply(hot);
                var bbox = this._boundingbox;
                drawing.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
                drawing.end();
            }
        }
    };

    AlineAnnotation.prototype.hitTest = function (e, options) {
        var pp = this._TRS.I.transform(e.pixel);
        if (this._boundingbox.contains(pp)) {
            return {
                succeed: true,
                object: this,
                distance: 0
            };
        }
        var start = this._start.pixel;
        var end = this._end.pixel;

        var d = pwg.math.getLineNearestPoint(e.pixel, start, end);
        if (d.distance < pwg.UI_HITTEST_TOLERENCE) {
            return {
                succeed: true,
                object: this,
                distance: d.distance
            };
        }
        return null;
    };

    AlineAnnotation.prototype._get_handles = function () {
        if (this._visiblity) {
            return this._handles.slice(0, 2);
        } else {
            return this._handles;
        }
    };

    AlineAnnotation.prototype._do_ui_handle_update = function (handle, e, action) {
        if (handle.owner == this)
            handle.location.set(e);
        return true;
    };

    AlineAnnotation.prototype.depth = function () {
        return Math.max(this._start.depth(), this._end.depth()) + 1;
    };
    AlineAnnotation.prototype.isDep=function(o)
    {
        return this._start.isDep(o)||this._end.isDep(o);
    };
    AlineAnnotation.prototype.removeDep=function(o)
    {
        var b = this._start.removeDep(o);
        b|=this._end.removeDep(o);
        return b;
    };

    AlineAnnotation.prototype.dispose=function()
    {
        this._start.removeDep();
        this._end.removeDep();
    };
    
    pwg.defineClassProperties(AlineAnnotation, {
        "start": {
            get: function () {
                return this._start;
            }
        },
        "end": {
            get: function () {
                return this._end;
            }
        },
        "text": {
            get: function () {
                return this.get_text();
            },
            set: function (v) {
                this._text = v;
            }
        },
        "style": {
            get: function () {
                return {
                    font: this._font_style,
                    border: this._border_style,
                    line:this._sty
                };
            }
        }
    });

    AlineAnnotation.prototype.__save__=function(json)
    {
        json = pwg.Graphics.prototype.__save__.call(this,json);
        if(this._start.owner==this)
            json.start = this._start.__save__();
        if(this._end.owner==this)
            json.end = this._end.__save__();
        
        json.text = this._text;
        json.baseline = this._baseline;
        json.style = {
            font :this._font_style.name,
            border:this._border_style.name,
            line:this._line_style.name
        };
        json.offsetAnnotation = this._offset_annotation.__save__();
        return json;
    };
    AlineAnnotation.prototype.__load__=function(json,context)
    {
        pwg.Graphics.prototype.__load__.call(this,json,context);
        if(this._start.owner ==this && json.start)
            this._start.__load__(json.start,context);
        if(this._end.owner==this && json.end)
            this._end.__load__(json.end,context);
        this._text = json.text;
        this._font_style = pwg.styles.get(json.style.font);
        this._border_style = pwg.styles.get(json.style.border);
        this._line_style = pwg.styles.get(json.style.line);
        this._offset_annotation.__load__(json.offsetAnnotation,context);
        this._baseline = json.baseline;
    };
    pwg.registerClass(AlineAnnotation);
    pwg.AlineAnnotation = AlineAnnotation;
    //////////////////////////////////////////////////////////////////////////////
    function AlineAnnotationBuild() {
        pwg.super(this, pwg.BaseBuild, 'continuous');
    }
    pwg.inherits(AlineAnnotationBuild, pwg.BaseBuild);
    AlineAnnotationBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    AlineAnnotationBuild.prototype.update = function (e, action) {
        if (action == "up") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(AlineAnnotation.classid);
                this._creating.start.set(e);
                this._creating.end.set(e);
            } else {
                this._creating.end.set(e);
                this.post();
            }
        } else if (action == "move") {
            if (this._creating) {
                this._creating.end.set(e);
            }
        }
    };
    AlineAnnotationBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "label");
            this._creating.render(context.drawing, "ui");
        }
    };
    AlineAnnotationBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating.dispose();
            this._creating = NULL;
        }
    };
    AlineAnnotationBuild.prototype.post = function () {
        if (this._creating) {
            this._context.container.addChild(this._creating);
        }
        this._creating = null;
    };
    pwg.graphics.registerBuild("线文本", new AlineAnnotationBuild());
};