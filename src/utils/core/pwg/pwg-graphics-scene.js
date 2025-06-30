/*
    pwg-scene.js
*/
if (typeof pwg === 'undefined')
    pwg = {};
if (typeof pwg.graphics == 'undefined')
    pwg.graphics = {};
pwg.graphics.scene = function () {
    /////////////////////////////////////////////////////////
    //场景对象                                              //
    /////////////////////////////////////////////////////////
    function Scene(workspace, context, id) {
        pwg.super(this, pwg.GraphicsContainer, null, id);
        this.workspace = workspace;
        this._context = context;
        this.id = id;
        this._object_counter = 0;
        this.workerEnable =false;
    }
    pwg.inherits(Scene, pwg.GraphicsContainer);
    pwg.defineClassId(Scene, "pwg.Scene");
    Scene.prototype.update = function (updateDep) {
        if(this.workerEnable)
            return;
        var cache = this._children_flatten_cache;
        function _on_visit_(o) {
            o.depth_runtime = o.depth();
            cache.push(o);
        }
        if (!cache || updateDep) {
            cache = [];
            this._children_flatten_cache = cache;
            this.visit(_on_visit_);
            cache.sort(function (a, b) {
                return a.depth_runtime - b.depth_runtime;
            });

        } else {
            cache = this._children_flatten_cache;
        }
        for (var i = 0, l = cache.length; i < l; i++) {
            var o = cache[i];
            o.update();
        }

        if(!pwg.defined(this.__runtime_bounding_box))
        {
            var sceneRC = null;
            for (var i = 0, l = cache.length; i < l; i++) {
                var o = cache[i];
                var objectRC = o.tryGetBoundingBox();
                if(objectRC)
                {
                    if(!sceneRC)
                    {
                        sceneRC=new pwg.rectangle(objectRC,new pwg.size(0,0));
                    }
                    else
                    {
                        sceneRC= sceneRC.include(objectRC);
                    }
                }
            }
            this.__runtime_bounding_box=sceneRC;
        }
    };

    Scene.prototype.getContainerContext = function () {
        return this._context;
    };

    Scene.prototype._create_graphics = function (type, container, ...argv) {
        var id = `${type}#${this._object_counter}`;
        var o = pwg.createObject(type, container ? container : this, id, ...argv);
        if (o) {
            this._object_counter++;
            return o;
        }
        return null;
    };

    Scene.prototype.raiseEvent = function (name, e) {
        if (name == 'child-added' || name == 'child-removed' || name == "location-mode-changed") {
            this._children_flatten_cache = null;
        }
        //console.log(name, e);
        if (this.workspace && this.workspace.on) {
            e.scene = this;
            this.workspace.on(name, e);
        }
        this.__runtime_bounding_box=null;
    };

    Scene.prototype.render = function (drawing, pass) {
        if(this.workerEnable)
            return;
        pwg.Group.prototype.render.call(this,drawing,pass);
    };
    pwg.defineClassProperties(Scene, {
        scene: {
            get: function () {
                return this;
            }
        }
    });

    Scene.prototype.__save__ = function (json) {
        if (!json)
            json = { objects: [] };
        var objects = [];
        this.visit(_ => objects.push(_));
        for (var i = 0, l = objects.length; i < l; i++) {
            var o = objects[i].__save__();
            json.objects.push(o);
        }
        json.object_counter = this._object_counter;
        json.id = this.id;
        json.classid = this.classid;
        return json;
    };

    Scene.prototype.__load__ = function (json) {
        this.id = json.id;
        this._object_counter = json.object_counter;
        var context = { objects: {} };
        context.getObjectById = function (id) {
            return this.objects[id];//!
        };
        context.registerObject = function (o) {
            this.objects[o.id] = o;
        };
        context.getUsingLocation = function (uid) {
            var pos = uid.indexOf(":");
            var oname = uid.substr(0, pos);
            var lname = uid.substr(pos + 1);
            var o = this.getObjectById(oname);
            return o.getLocation(lname);
        };
        context.registerObject(this);
        var jsobjects = json.objects;
        for (var i = 0, l = jsobjects.length; i < l; i++) {
            var jso = jsobjects[i];
            var classid = jso.classid;
            var container = context.getObjectById(jso.container);
            var id = jso.id;
            var o = pwg.json.create(container, id, jso);
            if (!o) {
                o = pwg.createObject(classid, container, id);
            }
            if (!o)
                console.log('creating fail:', jso);
            else
                context.registerObject(o);
            jso.object = o;
        }

        for (var i = 0, l = jsobjects.length; i < l; i++) {
            var jso = jsobjects[i];
            jso.object.__load__(jso, context);
        }
    };

    Scene.prototype.tryDeleteObject = function (o, force) {
        if (o.children && o.children.length > 0) {
            return {
                succeed: false,
                message: "COLLECTION_NO_EMPTY"
            };
        }
        var cache = this._children_flatten_cache;
        var deps = [];
        for (var i = 0, l = cache.length; i < l; i++) {
            var item = cache[i];
            if (item.isDep(o)) {
                deps.push(item);
            }
        }

        if(deps.length>0 && !force)
        {
            return {
                succeed: false,
                message: "DEPS_NO_EMPTY",
                deps:deps
            };
        }

        if(deps.length>0)
        {
            for(var i=0,l=deps.length;i<l;i++)
            {
                var dep = deps[i];
                dep.removeDep(o);
            }
        }
        var owner = o.owner;
        o.dispose();
        owner.removeChild(o);
        this.raiseEvent("object-deleted",{owner:owner,object:o});
        return {succeed:true};
    };

    Scene.prototype.save = function () {
        var json = this.__save__();
        json = JSON.stringify(json);
        return json;
    };

    Scene.prototype.load = function (json) {
        if (typeof json == "string")
            json = JSON.parse(json);
        this.__load__(json);
        //this.update(true);
    };

    Scene.prototype.enableWorker=function()
    {
        if(this.workerEnable)
            return;
        if(pwg.worker)
        {
            var json = this.save();
            var id = this.id;
            pwg.worker.postMessage({name:"load-scene",data:json,sceneid:id});
            this.workerEnable=true;
        }
    };

    Scene.prototype.disableWorker=function()
    {
        if(!this.workerEnable)
            return;
        if(pwg.worker)
        {
            var id = this.id;
            pwg.worker.postMessage({name:"unload-scene",sceneid:id});
            this.workerEnable=false;
        }
    };

    pwg.Scene = Scene;
    pwg.registerClass(pwg.Scene);
    ////////////////////////////////////////////////////////////
    function Workspace(context, name) {
        this.context = context;
        pwg.super(this, pwg.Object);
        this.scenes = [];
    }
    pwg.inherits(Workspace, pwg.Object);
    Workspace.prototype.renderEx = function (context) {
        var drawing = context.drawing;
        var scenes = this.scenes;
        var annoctx = drawing.annotationContext;
        var canvas=drawing.ctx.canvas;
        
        if(annoctx)
            annoctx.begin(new pwg.rectangle(0,0,canvas.width,canvas.height));
        
        for (var i = 0, l = scenes.length; i < l; i++) {
            var scene = scenes[i];
            var b = !pwg.defined(scene.__runtime_bounding_box)||
                    !pwg.defined(context.__runtime_lonlat_bounding_box)||
                    scene.__runtime_bounding_box.intersects(context.__runtime_lonlat_bounding_box);
            if(b)
                scene.update();
        }
        if(annoctx)
            annoctx.end();
        
        ['frame', 'route', 'entity', 'label', /*'ui', 'debug'*/].forEach(it => {
            for (var i = 0, l = scenes.length; i < l; i++) {
                var scene = scenes[i];

            var b = !pwg.defined(scene.__runtime_bounding_box) ||
                    !pwg.defined(context.__runtime_lonlat_bounding_box)||
                    scene.__runtime_bounding_box.intersects(context.__runtime_lonlat_bounding_box);
                if(b)
                    scene.render(drawing, it);
            }
        });
    };

    Workspace.prototype.remove=function(scn)
    {
        var ix = this.scenes.indexOf(scn);
        if(ix!=-1)
            this.scenes.splice(ix,1);
        return ix;
    };

    Workspace.prototype.add=function(scn)
    {
        this.scenes.push(scn);
    };

    Workspace.prototype.createScene = function (name, addWorkspace) {
        var scene = new pwg.Scene(this, this.context, name);
        if (addWorkspace) {
            this.scenes.push(scene);
        }
        return scene;
    };

    Workspace.prototype.getSceneById=function(name)
    {
        var scenes = this.scenes;
        for(var i=0,length = scenes.length;i<length;i++)
        {
            var scene = scenes[i];
            if(scene.id == name)
            {
                return scene;
            }
        }
        return null;
    };
    //////////////////////////////////////////////////////
    pwg.Workspace = Workspace;
};