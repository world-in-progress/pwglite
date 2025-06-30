if(typeof pwg=="undefined")
pwg={};
pwg.json=function(){
    var that = pwg.json;
    that.__json_create_map__={};
    that.registerCreator=function(id,fn)
    {
        that.__json_create_map__[id]=fn;
    };

    that.create=function(container,id,json)
    {
        var c = json.__json_creator__;
        if(!c)
            return null;
        if(that.__json_create_map__[c])
        {
            return that.__json_create_map__[c](container,id,json);
        }
        else
        {
            return null;
        }
    };
    that.formats={};

    that.formats[pwg.point]=
    {
        save:function(o)
        {
            return {x:o.x,y:o.y};
        },
        load:function(jso,o)
        {
            if(!o)
                o=new pwg.point();
            o.xy = jso;
            return o;
        }
    };
    that.formats[pwg.size]=
    {
        save:function(o)
        {
            return {width:o.width,height:o.height};
        },
        load:function(jso,o)
        {
            if(!o)
                o = new pwg.size();
            o.width = jso.width;
            o.height = jso.height;
            return o;
        }
    };

    that.formats[pwg.rectangle]=
    {
        save:function(o)
        {
            return {x:o.x,y:o.y,width:o.width,height:o.height};
        },
        load:function(jso,o)
        {
            if(!o)
                o = new pwg.rectangle();
            o.set(jso);
            return o;
        }
    };
    paper.Style.inject(
        {
            _serialize: function(options, dictionary) {
                var that = this;
                var props={};
                function serialize(fields) {
                    for (var key in fields) {
                        var value = that[key];
                        if (!paper.Base.equals(value, key === 'leading'
                                ? fields.fontSize * 1.2 : fields[key])) {
                            props[key] = paper.Base.serialize(value, options,
                                    key !== 'data', dictionary);
                        }
                    }
                }
                serialize(this._defaults);
                return [ this._class, props ];
            }
        }
    );

    that.formats[pwg.style]=
    {
        save:function(o)
        {
            return paper.Base.serialize(o);
        },
        load:function(jso,o)
        {
            if(!o)
                o = new pwg.style();
            function _style_create(type,argv)
            {
                return argv[0];
            }
            var res = paper.Base.deserialize(jso,_style_create,null,false,true);
            o.set(res);
            return o;
        }
    };

};