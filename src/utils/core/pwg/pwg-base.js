/*
    pwg-base.js
*/
if (typeof pwg === 'undefined')
    pwg = {};
pwg.ROOT_PATH="";
pwg.base = function (paper) {
    //初始化
    __init__(this);
    /////////////////////////////////////////////////////////////////
    //       PWGObject                                              // 
    /////////////////////////////////////////////////////////////////
    function PWGObject() { }
    PWGObject.prototype.constructor = PWGObject;
    pwg.defineClassId(PWGObject, "pwg.object");
    pwg.Object = PWGObject;
    pwg.PWGObject = PWGObject;
    /////////////////////////////////////////////////////////////////
    //初始化库
    function __init__(that) {
        //!实现继承
        function __extends__(xclass, base) {
            var _proto_ = Object.create(base.prototype);
            xclass.prototype = _proto_;
            xclass.prototype.constructor = xclass;
        }
        that.__extends__ = __extends__;
        that.inherits = __extends__;
        //定义类属性
        function __define_class_property__(xclass, a, pd) {
            Object.defineProperty(xclass.prototype, a, pd);
        }
        that.defineClassProperty = __define_class_property__;
        //定义多个类属性
        function __define_class_properties__(xclass, pds) {
            Object.defineProperties(xclass.prototype, pds);
        }
        that.defineClassProperties = __define_class_properties__;
        //定义类id(classid)
        function __define_class_id(xclass, id) {
            __define_class_property__(xclass, 'classid', {
                value: id
            });
            xclass.classid = id;
        }
        that.defineClassId = __define_class_id;
        that.__classes__ = {};

        //注册类,以便通过类名创建
        function ___register_class(classid, xclass) {
            if (arguments.length > 1)
                that.__classes__[classid] = xclass;
            else {
                xclass = classid;
                classid = xclass.prototype.classid;
                that.__classes__[classid] = xclass;
            }
        }
        that.registerClass = ___register_class;
        //创建对象，通过名字
        function __create_object(classid, ...argv) {
            var xclass = that.__classes__[classid];
            var o = new xclass(...argv);
            return o;
        }
        that.createObject = __create_object;

        //调用超类构造函数
        function __super(that, base, ...argv) {
            base.call(that, ...argv);
        }
        that.super = __super;
        //判断变量是否为未定义
        function __defined(value) {
            return value !== undefined && value !== null && value !== "";
        }
        that.defined = __defined;
        //定义默认值
        function __default_value(a, b) {
            if (a !== undefined && a !== null) {
                return a;
            }
            return b;
        }
        that.defaultValue = __default_value;
        ////////////////////////////////////////////////////
        function _property_point_set(p) {
            if (p.hasOwnProperty('x')) {
                this.x = p.x;
                this.y = p.y;
            } else
                if (p.hasOwnProperty('lon')) {
                    this.x = p.lon;
                    this.y = p.lat;
                } else
                    if (p.hasOwnProperty('X')) {
                        this.x = p.X;
                        this.y = p.Y;
                    } else
                        if (Array.isArray(p)) {
                            this.lon = p[0];
                            this.lat = p[1];
                        }
        }
        pwg.defineClassProperties(paper.Point, {
            xy: {
                set: _property_point_set,
                get: function () {
                    return this;
                }
            },
            lonlat: {
                set: _property_point_set,
                get: function () {
                    return {
                        lon: this._x,
                        lat: this._y
                    };
                }
            },
            lon: {
                get: function () {
                    return this._x;
                },
                set: function (lon) {
                    this._x = lon;
                }
            },
            lat: {
                get: function () {
                    return this._y;
                },
                set: function (lat) {
                    this._y = lat;
                }
            }
        });

        pwg.point = paper.Point;   //alias paper.point
        pwg.pixel = paper.Point;   //alias paper.point
        pwg.lonlat = paper.Point;  //alias paper.point
        pwg.rect = paper.Rectangle;
        pwg.rectangle = paper.Rectangle;
        pwg.size = paper.Size;
        pwg.matrix = paper.Matrix; //alias paper.point
        pwg.vector2d = paper.Point; //alias paper.point
        pwg.style = paper.Style;
        pwg.line = paper.Line;
        pwg.clamp = paper.Numerical.clamp;

        function deepClone(obj){
            let clone;
            if(obj == null || typeof obj != 'object') return obj;
            clone = Object.assign({}, obj)
            Object.keys(clone).forEach(key => {
                clone[key] = typeof obj[key] === 'object'?deepClone(obj[key]):obj[key]
            })
            if(Array.isArray(obj)){
                clone.length = obj.length
                clone = Array.from(clone)
            }
            return clone
        }
        pwg.deepClone = deepClone;

        pwg.first = function (a) { return a[0]; };
        pwg.last = function (a) { return a[a.length - 1]; };
        pwg.has = function (container, k) {
            return container && (typeof container[k] == "undefined" || (Array.isArray(container) && container.indexOf(k) != -1));
        };
    }
    this.MOUSE_BUTTON_LEFT = 0;
    this.MOUSE_BUTTON_RIGHT = 2;
    this.MOUSE_BUTTON_MIDDLE = 1;
    this.MOUSE_BUTTON_NONE = 0xF;
    this.MOUSE_DOWN = 0;
    this.MOUSE_UP = 1;
    this.MOUSE_MOVE = 2;
    this.MOUSE_DOUBLE_CLICK = 3;
    ////////////////////////////////////////////////////////
};