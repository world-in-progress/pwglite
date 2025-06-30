```javascript
    class Location
    {
        mode=
        {

        }
        int   deep();
        map   {x,y};
        pixel {x,y};
    }
    class AbsoluteLocation;
    class NodeLocation;
    class Node2Location;{first,second}
    class DeviceOffsetLocation{lonlat;,map;,pixel;}
    class DeviceReleativeLocation;
    class RouteOffsetLocation;
    class Offset;
    class Angle;
    class Offset
    {   
        mode='';
        x,
        y,
    };
    class Angle
    {
        mode='absolute';
        //value;
    };
    location=AbsoluteLocation;
    offset;
    angle;
    runtimeLocation;

    class UiHandle
    {
        type,
        id,
        lonlat,
        map,
        pixel
        style;
        update();
    };
    class Location;
    class Device
    {
        type,
        id,
        bool contain();
    };
    class PWRoute
    {
    };
    class PWString
    {
    };
    class PWScene
    {
        deviceAll;
        routeAll;
    }
    class Base;
    class Location;
    class Location
    {
       lonlat;
       world;
       pixel;
       angle;
    };

    class AbsoluteLocation;
    class Node;
    class UIHandle;
    
    class UiHandle
    {
       '|continuous|move|'
        begin();
        update(e,location,'move|post|delete|');
        cancel();
        commit();
    };
    class UiCommand;

    class PWObject
    {
        scene;
        parent;
        handles();
        tryGetHandle('creating|route-breaking');
        joints;
        nodes;
        locations;
        getNode();
        getLocation();
        tryGetLocation();
        children();

        _loadJSON(json);
        _restoreGraph(json);
    };

    class PWDevice;     //简单的设备
    class PWContainer;  //容器
    class PWRoute;      //线路
    class PWTower;
    class PWTowerAline;
    class PWAnnotation;
    class PWPipeUnionO;
    class PWPipeUnionT;
    class PWPipeUnionY ;
    class PWPipeUnionX;
    class PWPipeUnionL;
    class PWPipeUnionI;
    class PWRenderable;

    class PWScene
    {
        object saveJSON();
        void loadJSON(json);

        children;
        add();
        remove();
        getObject();
        getLocation();
        getNode();
        filterObjects({classes,excluded|}|fn|,);
        hitTest(x,y,options{classes:[],excluded:[]});
    };
```

```javascript
     if(!this.paper && this.ppe)
        {
            this.paper=this.ppe;
            this.paper.install(window);
            this.paper.setup([20037508.3427892*2,20037508.3427892*2]);

            var to = new TObject();
            var xyz = to.xyz;
            console.log(xyz);
        }
        if(this.paper)
        {
            var rc = paper.Path.Rectangle(100,100,200,200);
            var curve  = new paper.Path([[100,100],[150,250],[300,300]]);
      
            var cpoints=rc.segments;

            for(var i=0,l=cpoints.length;i<l;i++)
            {
                var cp=cpoints[i];
                var p = cp.point;
                draw_ui_handle_diamond(this.drawing2d,p,10,0xFF00FF00,0xFFFF0000);  
            }
            
            rc.strokeColor = '#ff0000';
            rc.strokeWidth = 10;
            rc.fillColor='#00ff00';

            rc2=curve.clone();
            rc2.smooth({ type: 'continuous' });
            rc2.flatten();
            rc2.strokeColor = '#ff0000';
            rc2.strokeWidth = 1;
            //rc2.fillColor='#00ff00';

            var group = new paper.Group();
            group.addChild(rc); 
            
            .addChild(rc2);
            //group.reverseChildren();
            var ctx = context;
            ctx.save();
            var ht = group.hitTest(new Point(110,150),new Base({tolerence:1,'fill':true,'stroke':true}));
            //console.log(ht);
            var   param = new Base({
                    offset: new paper.Point(0, 0),
                    pixelRatio: 2,
                    viewMatrix:null,
                    matrices: [new  paper.Matrix()],
                    updateMatrix: true
                });
                group.draw(ctx, param);
            ctx.restore();
        };
        displayMode='auto'|'pixel'|'world'|
        sizeMode='world'|'pixel'|


    /*  point pivot layout
        +   T   +
        L   O   R  ->S0
        +   B   +
            R0     \ S1 
        {
            name:  a
            offset:p,
            rotate:v,
            scale0:v,
            scale1:v
        }
    */

    //map: lonlat-->[projection]-->global
    //local/global: local-->[local matrix]-->global->[view matrix]->pixel
    //       localToGlobal globalToLocal
    //       globalToPixel pixelToGlobal
    //     * pixelToLocal  localToPixel

    //pixel: o->[using matrix]-->frame-->[offset matrix]-->base-->[base matrix]-->pixel
    //       baseToPixel  pixelToBase
    //       frameToBase  baseToFrame
    //       frameToPixel pixelToFrame

    /*
    Route<---Joint
        joint->type:{point,points,cpoint,cpoints,break,};
        function Joint
        {
            owner;
            name;
            type:string;
            outline=[point||points];
        };
        Route=[joints];
        Route.addJoint(,auto);
        Route.insertJoint();
        Route.removeJoint();

        "route-child" |node|  //afterAdd;afterRemove;
    */


    CanvasOverLayer.prototype.render = function () {
        var context = this.context;
        context.update();
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.resetTransform();
        if (this.workerFrame) {
            var wkf = this.workerFrame;
            var bounds = wkf.bounds;
            var vp = wkf.viewport;
            var minp = context.globalToPixel(bounds.x, bounds.y);
            var maxp = context.globalToPixel(bounds.x + bounds.width, bounds.y + bounds.height);
            var w = maxp.x - minp.x;
            var h = maxp.y - minp.y;
            var ratio = pwg.DEVICE_PIXEL_RATIO;
            ctx.drawImage(wkf.image, minp.x * ratio, minp.y * ratio, w * ratio, h * ratio);
        }
        ctx.restore();
        ctx.save();
        context.drawing.setRenderContext2D(ctx);
        if (this.workspace) {
            this.workspace.renderEx(context.drawing);
        }
        ctx.restore();
        ///////////////////////////////////////////////////////////
        ctx.save();
        this.uicontext.render(this.context);
        ctx.restore();
        if (pwg.worker) {
            var viewport = context.viewport.clone();
            var minp = context.pixelToGlobal(0, 0);
            var maxp = context.pixelToGlobal(viewport.width, viewport.height);
            var bounds = new pwg.rectangle({ x: minp.x, y: minp.y, width: maxp.x - minp.x, height: maxp.y - minp.y });
            var ratio = pwg.DEVICE_PIXEL_RATIO;
            var message = { 
                            name: "update-map-frame",
                            pixelRatio:ratio,
                            pointMinAdjustRatio:pwg.pointMinAdjustRatio,
                            pointAdjustEnableLevel:pwg.pointAdjustEnableLevel,
                            miniEnableLevel:pwg.miniEnableLevel,
                            zoom: context.zoom, 
                            viewport: viewport, 
                            bounds: bounds
                         };
            this.last_post_message = message;
            var that = this;
            setTimeout(function () {
                var lm = that.last_post_message;
                if ((lm.zoom == message.zoom
                    && lm.viewport.equals(message.viewport)
                    && lm.bounds.equals(message.bounds)))//||Math.random()>0.9
                    {
                        message.time = Date.now();
                        pwg.worker.postMessage(message);
                    }
            }, 50);
        }
    };