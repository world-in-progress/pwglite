if (typeof pwg == "undefined")
    pwg = {}
pwg.styles = function () {
    var that = pwg.styles;
    that._style_map = {};
    that.all = [];
    function style_set_icon(url, width, height) {
        //this.icon = new Image();
        //this.icon.onload = function () { this.width = width; this.height = height; };
        //this.icon.src = url;
        this._icon = pwg.drawing.definex(url,url,new pwg.size(width,height));
        Object.defineProperty(this,"icon",{get:function()
            {
                return this._icon.image;
            }});
        return this;
    }
    that.register = function (id, style) {
        if (style instanceof pwg.style) {
            style.name = id;
            style.setIcon = style_set_icon;
            this._style_map[id] = style;
            this.all.push(style);
            return style;
        }
        else {
            var stylex = new pwg.style(style);
            return this.register(id, stylex);
        }
    };
    that.get = function (id) {
        return this._style_map[id];
    };

    function register(id, style) {
        return that.register(id, style);
    }

    //路径
    register("none", {
    });

    //路径
    register("route.default", {
        strokeColor: "#FF0000",
        strokeWidth: 2,
        pixelRatio: 2
    });
    register("route.pipe", {
        strokeColor: "#E0FFE0",
        strokeWidth: 8,
        pixelRatio: 2
    }).setIcon(pwg.ROOT_PATH+"/pwg/svg/线装饰/arrow-z.png", 16, 12);
    register("route.hot", {
        strokeColor: 'rgba(255,255,0,.5)',
        strokeWidth: 4
    });
    //线型符号的交互辅助
    register("linelike.ui", {
        strokeColor: "#333",
        strokeWidth: 1.0,
        dashArray: [10, 10]
    });
    //杆塔对齐组
    register("tower-aline-group.default", {
        strokeColor: 'rgba(255,255,0,.5)',
        strokeWidth: 10
    });
    register("tower-aline-group.hot",{
        strokeColor: 'rgba(255,0,0,.5)',
        strokeWidth: 12
    });
    //管廊
    register("tube.default-outline",{
        strokeColor: "black",
        dashArray: [10, 1],
        strokeWidth: 1,
        fillColor: "rgba(255,255,200,0.5)"
    });
    register("tube.default-frame",{
        strokeColor: "#8E8E8E",
        dashArray: [4, 10],
        strokeWidth: 1
    });

    register("label.text.default",{
        fontFamily:"SimHei",
        fontWeight:"normal",
        fontSize:"20",
        fillColor:'#333333',
        strokeColor: "#8E8E8E",
        strokeWidth: 2
    }).fontEnable=true;

    register("label.offsetline.default",{
        strokeColor: "#8E8E8E",
        strokeWidth: 1
    }).fontEnable=true;


    //路径
    register("label.line.default", {
        strokeColor: "#444",
        strokeWidth: 1
    });

    register("label.border.default",{
    });
};