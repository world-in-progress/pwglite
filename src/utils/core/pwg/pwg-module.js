let pwg;let paper;
/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
/*
    pwg-math.js
*/
if (typeof pwg == 'undefined')
    pwg = {};
pwg.math = function () {
    var that = pwg.math;
    function getLineNearestPoint(pt, q, p) {
        var haz = (typeof pt.z !== 'undefined');
        var pqx = q.x - p.x;
        var pqy = q.y - p.y;
        var pqz = haz ? (q.z - p.z) : 0;
        var dx = pt.x - p.x;
        var dy = pt.y - p.y;
        var dz = haz ? (pt.z - p.z) : 0;
        var d = pqx * pqx + pqy * pqy + pqz * pqz; // qp线段长度的平方
        var t = pqx * dx + pqy * dy + pqz * dz; // p pt向量 点积 pq 向量（p相当于A点，q相当于B点，pt相当于P点）
        if (d > 0) // 除数不能为0; 如果为零 t应该也为零。下面计算结果仍然成立。
            t /= d; // 此时t 相当于 上述推导中的 r。
        if (t < 0)
            t = 0; // 当t（r）< 0时，最短距离即为 pt点 和 p点（A点和P点）之间的距离。
        else if (t > 1)
            t = 1; // 当t（r）> 1时，最短距离即为 pt点 和 q点（B点和P点）之间的距离。

        // t = 0，计算 pt点 和 p点的距离; t = 1, 计算 pt点 和 q点 的距离; 否则计算 pt点 和 投影点 的距离。
        var x = p.x + t * pqx,
            y = p.y + t * pqy,
            z = haz ? (p.z + t * pqz) : 0;
        dx = x - pt.x;
        dy = y - pt.y;
        dz = haz ? (z - pt.z) : 0;
        d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return {
            x: x,
            y: y,
            z: z,
            distance: d,
            t: t
        };
    }
    pwg.math.getLineNearestPoint = getLineNearestPoint;


    function PointInPoly(poly,pt) { 
        for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) 
            ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) 
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) 
            && (c = !c); 
        return c; 
    }
    pwg.math.isPointInPolygon = PointInPoly;

    function isRectCollided(amin, amax,bmin,bmax) {

        return (amin.x < bmax.x) &&
               (amin.y < bmax.y) &&
               (amax.x > bmin.x) &&
               (amax.y > bmin.y);
    }
    pwg.math.isRectCollided = isRectCollided;

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    function forEachPair(list, callback, that) {
        if (!list || list.length < 1) {
            return;
        }
        for (var i = 1, l = list.length; i < l; i++) {
            callback(list[i - 1], list[i], that);
        }
    }

    function lineEquation(pt1, pt2) {
        if (pt1.x === pt2.x) {
            return pt1.y === pt2.y ? null : {
                x: pt1.x
            };
        }

        var a = (pt2.y - pt1.y) / (pt2.x - pt1.x);
        return {
            a: a,
            b: pt1.y - a * pt1.x,
        };
    }

    function intersection(l1a, l1b, l2a, l2b) {
        var line1 = lineEquation(l1a, l1b);
        var line2 = lineEquation(l2a, l2b);

        if (line1 === null || line2 === null) {
            return null;
        }

        if (line1.hasOwnProperty('x')) {
            return line2.hasOwnProperty('x') ?
                null : {
                    x: line1.x,
                    y: line2.a * line1.x + line2.b,
                };
        }
        if (line2.hasOwnProperty('x')) {
            return {
                x: line2.x,
                y: line1.a * line2.x + line1.b,
            };
        }

        if (line1.a === line2.a) {
            return null;
        }

        var x = (line2.b - line1.b) / (line1.a - line2.a);
        return {
            x: x,
            y: line1.a * x + line1.b,
        };
    }
    pwg.math.getIntersectionWithLine=intersection;
    
    function translatePoint(pt, dist, heading) {
        return {
            x: pt.x + dist * Math.cos(heading),
            y: pt.y + dist * Math.sin(heading),
        };
    }

    var PolylineOffset = {
        offsetPointLine: function (points, distance) {
            var offsetSegments = [];

            forEachPair(points, (function (pa, pb, that) {
                var a = that.device.computeLonLatToView(pa[1], pa[2]);
                var b = that.device.computeLonLatToView(pb[1], pb[2]);
                if (a.x === b.x && a.y === b.y) {
                    return;
                }

                var segmentAngle = Math.atan2(a.y - b.y, a.x - b.x);
                var offsetAngle = segmentAngle - Math.PI / 2;

                offsetSegments.push({
                    offsetAngle: offsetAngle,
                    original: [a, b],
                    offset: [
                        translatePoint(a, distance, offsetAngle),
                        translatePoint(b, distance, offsetAngle)
                    ]
                });
            }), this);

            return offsetSegments;
        },

        offsetPoints: function (pts, offset, device) {
            this.device = device;
            var offsetSegments = this.offsetPointLine(pts, offset);
            return this.joinLineSegments(offsetSegments, offset);
        },

        joinSegments: function (s1, s2, offset) {
            // TODO: different join styles
            return this.circularArc(s1, s2, offset)
                .filter(function (x) {
                    return x;
                });
        },

        joinLineSegments: function (segments, offset) {
            var joinedPoints = [];
            var first = segments[0];
            var last = segments[segments.length - 1];

            if (first && last) {
                joinedPoints.push(first.offset[0]);
                forEachPair(segments, (function (s1, s2, that) {
                    joinedPoints = joinedPoints.concat(that.joinSegments(s1, s2, offset));
                }), this);
                joinedPoints.push(last.offset[1]);
            }

            return joinedPoints;
        },

        segmentAsVector: function (s) {
            return {
                x: s[1].x - s[0].x,
                y: s[1].y - s[0].y,
            };
        },

        getSignedAngle: function (s1, s2) {
            var a = this.segmentAsVector(s1);
            var b = this.segmentAsVector(s2);
            return Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
        },

        circularArc: function (s1, s2, distance) {
            if (s1.offsetAngle === s2.offsetAngle) {
                return [s1.offset[1]];
            }

            var signedAngle = this.getSignedAngle(s1.offset, s2.offset);
            if ((signedAngle * distance > 0) &&
                (signedAngle * this.getSignedAngle(s1.offset, [s1.offset[0], s2.offset[1]]) > 0)) {
                return [intersection(s1.offset[0], s1.offset[1], s2.offset[0], s2.offset[1])];
            }

            var points = [];
            var center = s1.original[1];
            // ensure angles go in the anti-clockwise direction
            var rightOffset = distance > 0;
            var startAngle = rightOffset ? s2.offsetAngle : s1.offsetAngle;
            var endAngle = rightOffset ? s1.offsetAngle : s2.offsetAngle;
            // and that the end angle is bigger than the start angle
            if (endAngle < startAngle) {
                endAngle += Math.PI * 2;
            }
            var step = Math.PI / 8;
            for (var alpha = startAngle; alpha < endAngle; alpha += step) {
                points.push(translatePoint(center, distance, alpha));
            }
            points.push(translatePoint(center, distance, endAngle));

            return rightOffset ? points.reverse() : points;
        }
    };
    this.PolylineOffset = PolylineOffset;

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    var degrees = 180 / Math.PI;

    that=pwg.math;
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    that.random = random;

    function radian2degrees(rad) {
        return rad * degrees;
    }
    that.radian2degrees = radian2degrees;
    that.R2D = radian2degrees;

    function degrees2radian(deg) {
        return deg / degrees;
    }
    that.degrees2radian = degrees2radian;
    that.D2R = degrees2radian;

    function Vector2x(x, y) {
        if (!(this instanceof Vector2x)) {
            return new Vector2x(x, y);
        }

        this.x = x || 0;
        this.y = y || 0;
    }

    Vector2x.fromArray = function (arr) {
        return new Vector2x(arr[0] || 0, arr[1] || 0);
    };

    Vector2x.fromObject = function (obj) {
        return new Vector2x(obj.x || 0, obj.y || 0);
    };

    Vector2x.prototype.addX = function (vec) {
        this.x += vec.x;
        return this;
    };

    Vector2x.prototype.addY = function (vec) {
        this.y += vec.y;
        return this;
    };

    Vector2x.prototype.add = function (vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    };

    Vector2x.prototype.add_New = function (vec) {
        return new Vector2x(this.x + vec.x, this.y + vec.y);
    };

    Vector2x.prototype.add_ = Vector2x.prototype.add_New;

    Vector2x.prototype.addScalar = function (scalar) {
        this.x += scalar;
        this.y += scalar;
        return this;
    };

    Vector2x.prototype.addScalarX = function (scalar) {
        this.x += scalar;
        return this;
    };

    Vector2x.prototype.addScalarY = function (scalar) {
        this.y += scalar;
        return this;
    };

    Vector2x.prototype.subtractX = function (vec) {
        this.x -= vec.x;
        return this;
    };

    Vector2x.prototype.subtractY = function (vec) {
        this.y -= vec.y;
        return this;
    };

    Vector2x.prototype.subtract = function (vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    };

    Vector2x.prototype.subtract_New = function (vec) {
        return new Vector2x(this.x - vec.x, this.y - vec.y);
    };

    Vector2x.prototype.subtract_ = Vector2x.prototype.subtract_New;

    Vector2x.prototype.subtractScalar = function (scalar) {
        this.x -= scalar;
        this.y -= scalar;
        return this;
    };

    Vector2x.prototype.subtractScalarX = function (scalar) {
        this.x -= scalar;
        return this;
    };

    Vector2x.prototype.subtractScalarY = function (scalar) {
        this.y -= scalar;
        return this;
    };

    Vector2x.prototype.divideX = function (vector) {
        this.x /= vector.x;
        return this;
    };

    Vector2x.prototype.divideY = function (vector) {
        this.y /= vector.y;
        return this;
    };

    Vector2x.prototype.divide = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    };

    Vector2x.prototype.divideScalar = function (scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        } else {
            this.x = 0;
            this.y = 0;
        }

        return this;
    };

    Vector2x.prototype.divideScalarX = function (scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
        } else {
            this.x = 0;
        }
        return this;
    };

    Vector2x.prototype.divideScalarY = function (scalar) {
        if (scalar !== 0) {
            this.y /= scalar;
        } else {
            this.y = 0;
        }
        return this;
    };

    Vector2x.prototype.invertX = function () {
        this.x *= -1;
        return this;
    };

    Vector2x.prototype.invertY = function () {
        this.y *= -1;
        return this;
    };

    Vector2x.prototype.invert = function () {
        this.invertX();
        this.invertY();
        return this;
    };

    Vector2x.prototype.invert_New = function () {
        return new Vector2x(this.x * (-1), this.y * (-1));
    };

    Vector2x.prototype.multiplyX = function (vector) {
        this.x *= vector.x;
        return this;
    };

    Vector2x.prototype.multiplyY = function (vector) {
        this.y *= vector.y;
        return this;
    };

    Vector2x.prototype.multiply = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    };

    Vector2x.prototype.multiply_New = function (vector) {
        return new Vector2x(this.x * vector.x, this.y * vector.y);
    };

    Vector2x.prototype.multiplyScalarX = function (scalar) {
        this.x *= scalar;
        return this;
    };

    Vector2x.prototype.multiplyScalarY = function (scalar) {
        this.y *= scalar;
        return this;
    };

    Vector2x.prototype.multiplyScalar = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    };

    Vector2x.prototype.multiplyScalar_New = function (scalar) {
        return new Vector2x(this.x * scalar, this.y * scalar);
    };

    Vector2x.prototype.normalize = function () {
        var length = this.length();

        if (length === 0) {
            this.x = 1;
            this.y = 0;
        } else {
            this.divide(Vector2x(length, length));
        }
        return this;
    };
    Vector2x.prototype.norm = Vector2x.prototype.normalize;

    Vector2x.prototype.limit = function (max, factor) {
        if (Math.abs(this.x) > max) {
            this.x *= factor;
        }
        if (Math.abs(this.y) > max) {
            this.y *= factor;
        }
        return this;
    };

    Vector2x.prototype.randomize = function (topLeft, bottomRight) {
        this.randomizeX(topLeft, bottomRight);
        this.randomizeY(topLeft, bottomRight);

        return this;
    };

    Vector2x.prototype.randomizeX = function (topLeft, bottomRight) {
        var min = Math.min(topLeft.x, bottomRight.x);
        var max = Math.max(topLeft.x, bottomRight.x);
        this.x = random(min, max);
        return this;
    };

    Vector2x.prototype.randomizeY = function (topLeft, bottomRight) {
        var min = Math.min(topLeft.y, bottomRight.y);
        var max = Math.max(topLeft.y, bottomRight.y);
        this.y = random(min, max);
        return this;
    };

    Vector2x.prototype.randomizeAny = function (topLeft, bottomRight) {
        if (!!Math.round(Math.random())) {
            this.randomizeX(topLeft, bottomRight);
        } else {
            this.randomizeY(topLeft, bottomRight);
        }
        return this;
    };

    Vector2x.prototype.unfloat = function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    };

    Vector2x.prototype.toFixed = function (precision) {
        if (typeof precision === 'undefined') {
            precision = 8;
        }
        this.x = this.x.toFixed(precision);
        this.y = this.y.toFixed(precision);
        return this;
    };

    Vector2x.prototype.mixX = function (vec, amount) {
        if (typeof amount === 'undefined') {
            amount = 0.5;
        }

        this.x = (1 - amount) * this.x + amount * vec.x;
        return this;
    };

    Vector2x.prototype.mixY = function (vec, amount) {
        if (typeof amount === 'undefined') {
            amount = 0.5;
        }

        this.y = (1 - amount) * this.y + amount * vec.y;
        return this;
    };

    Vector2x.prototype.mix = function (vec, amount) {
        this.mixX(vec, amount);
        this.mixY(vec, amount);
        return this;
    };

    Vector2x.prototype.clone = function () {
        return new Vector2x(this.x, this.y);
    };

    Vector2x.prototype.copyX = function (vec) {
        this.x = vec.x;
        return this;
    };

    Vector2x.prototype.copyY = function (vec) {
        this.y = vec.y;
        return this;
    };

    Vector2x.prototype.copy = function (vec) {
        this.copyX(vec);
        this.copyY(vec);
        return this;
    };

    Vector2x.prototype.zero = function () {
        this.x = this.y = 0;
        return this;
    };

    Vector2x.prototype.dot = function (vec2) {
        return this.x * vec2.x + this.y * vec2.y;
    };

    Vector2x.prototype.cross = function (vec2) {
        return (this.x * vec2.y) - (this.y * vec2.x);
    };

    Vector2x.prototype.projectOnto = function (vec2) {
        var coeff = ((this.x * vec2.x) + (this.y * vec2.y)) / ((vec2.x * vec2.x) + (vec2.y * vec2.y));
        this.x = coeff * vec2.x;
        this.y = coeff * vec2.y;
        return this;
    };


    Vector2x.prototype.horizontalAngle = function () {
        return Math.atan2(this.y, this.x);
    };

    Vector2x.prototype.horizontalAngleDeg = function () {
        return radian2degrees(this.horizontalAngle());
    };

    Vector2x.prototype.verticalAngle = function () {
        return Math.atan2(this.x, this.y);
    };

    Vector2x.prototype.verticalAngleDeg = function () {
        return radian2degrees(this.verticalAngle());
    };

    Vector2x.prototype.angle = Vector2x.prototype.horizontalAngle;
    Vector2x.prototype.angleDeg = Vector2x.prototype.horizontalAngleDeg;
    Vector2x.prototype.direction = Vector2x.prototype.horizontalAngle;

    Vector2x.prototype.rotate = function (angle) {
        var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
        var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

        this.x = nx;
        this.y = ny;

        return this;
    };

    Vector2x.prototype.rotateDeg = function (angle) {
        angle = degrees2radian(angle);
        return this.rotate(angle);
    };

    Vector2x.prototype.rotateTo = function (rotation) {
        return this.rotate(rotation - this.angle());
    };

    Vector2x.prototype.rotateToDeg = function (rotation) {
        rotation = degrees2radian(rotation);
        return this.rotateTo(rotation);
    };

    Vector2x.prototype.rotateBy = function (rotation) {
        var angle = this.angle() + rotation;

        return this.rotate(angle);
    };

    Vector2x.prototype.rotateByDeg = function (rotation) {
        rotation = degrees2radian(rotation);
        return this.rotateBy(rotation);
    };

    Vector2x.prototype.distanceX = function (vec) {
        return this.x - vec.x;
    };

    Vector2x.prototype.absDistanceX = function (vec) {
        return Math.abs(this.distanceX(vec));
    };

    Vector2x.prototype.distanceY = function (vec) {
        return this.y - vec.y;
    };

    Vector2x.prototype.absDistanceY = function (vec) {
        return Math.abs(this.distanceY(vec));
    };

    Vector2x.prototype.distance = function (vec) {
        return Math.sqrt(this.distanceSq(vec));
    };

    Vector2x.prototype.distanceSq = function (vec) {
        var dx = this.distanceX(vec),
            dy = this.distanceY(vec);

        return dx * dx + dy * dy;
    };

    Vector2x.prototype.length = function () {
        return Math.sqrt(this.lengthSq());
    };

    Vector2x.prototype.lengthSq = function () {
        return this.x * this.x + this.y * this.y;
    };

    Vector2x.prototype.magnitude = Vector2x.prototype.length;

    Vector2x.prototype.isZero = function () {
        return this.x === 0 && this.y === 0;
    };

    Vector2x.prototype.isEqualTo = function (vec2) {
        return this.x === vec2.x && this.y === vec2.y;
    };

    Vector2x.prototype.toString = function () {
        return 'x:' + this.x + ', y:' + this.y;
    };

    Vector2x.prototype.toArray = function () {
        return [this.x, this.y];
    };

    Vector2x.prototype.toObject = function () {
        return {
            x: this.x,
            y: this.y
        };
    };

    pwg.math.Vector2x = Vector2x;

    function Vector3x(x, y, z) {
        if (!(this instanceof Vector3x)) {
            return new Vector3x(x, y, z);
        }

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    };

    Vector3x.prototype.add = function (vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    };

    Vector3x.prototype.add_New = function (vec) {
        return new Vector3x(this.x + vec.x, this.y + vec.y, this.z + vec.z);
    };

    Vector3x.prototype.subtract = function (vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    };

    Vector3x.prototype.subtract_New = function (vec) {
        return new Vector3x(this.x - vec.x, this.y - vec.y, this.z - vec.z);
    };

    Vector3x.prototype.multiplyScalar = function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    };

    Vector3x.prototype.multiplyScalar_New = function (scalar) {
        return new Vector3x(this.x * scalar, this.y * scalar, this.z * scalar);
    };

    Vector3x.prototype.invertX = function () {
        this.x *= -1;
        return this;
    };

    Vector3x.prototype.invertY = function () {
        this.y *= -1;
        return this;
    };

    Vector3x.prototype.invertZ = function () {
        this.z *= -1;
        return this;
    };

    Vector3x.prototype.invert = function () {
        this.invertX();
        this.invertY();
        this.invertZ();
        return this;
    };

    Vector3x.prototype.invert_New = function () {
        return new Vector3x(this.x * (-1), this.y * (-1), this.z * (-1));
    };

    Vector3x.prototype.divide = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        return this;
    };

    Vector3x.prototype.length = function () {
        return Math.sqrt(this.lengthSq());
    };

    Vector3x.prototype.lengthSq = function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    };

    Vector3x.prototype.normalize = function () {
        var length = this.length();

        if (length === 0) {
            this.x = 1;
            this.y = 0;
            this.z = 0;
        } else {
            this.divide(Vector3x(length, length, length));
        }
        return this;
    };
    Vector3x.prototype.norm = Vector3x.prototype.normalize;
    pwg.math.Vector3x = Vector3x;
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
/*
    pwg-utils.js
*/
if (typeof pwg === 'undefined')
    pwg = {};
pwg.utils = function () {
    var that = pwg.utils;

    function find_line_string_nearest_point(lines, px) {
        var d = {
            distance: 1e10,
            i: -1
        };
        for (var i = 0, length = lines.length - 1; i < length; i++) {
            var p = lines[i];
            var q = lines[i + 1];
            p = pwg.math.getLineNearestPoint(px, p, q);
            if (p.distance < d.distance) {
                d = p;
                d.i = i;
            }
        }
        return d;
    }
    that.find_line_string_nearest_point = find_line_string_nearest_point;

    function unique_pred(list, compare) {
        var ptr = 1;
        var len = list.length;
        var a = list[0],
            b = list[0];
        for (var i = 1; i < len; ++i) {
            b = a;
            a = list[i];
            if (compare(a, b)) {
                if (i === ptr) {
                    ptr++;
                    continue;
                }
                list[ptr++] = a;
            }
        }
        list.length = ptr;
        return list;
    }

    function unique_eq(list) {
        var ptr = 1;
        var len = list.length;
        var a = list[0],
            b = list[0];
        for (var i = 1; i < len; ++i) {
            b = a;
            a = list[i];
            if (a !== b) {
                if (i === ptr) {
                    ptr++;
                    continue;
                }
                list[ptr++] = a;
            }
        }
        list.length = ptr;
        return list;
    }

    function unique(list, compare, sorted) {
        if (list.length === 0) {
            return list;
        }
        if (compare) {
            if (!sorted) {
                list.sort(compare);
            }
            return unique_pred(list, compare);
        }
        if (!sorted) {
            list.sort();
        }
        return unique_eq(list);
    }
    that.unique = unique;

    function createXmlDocument() {
        var doc = null;
        if (document.implementation && document.implementation.createDocument) {
            doc = document.implementation.createDocument('', '', null);
        } else if (window.ActiveXObject) {
            doc = new ActiveXObject('Microsoft.XMLDOM');
        }
        return doc;
    }
    that.createXmlDocument = createXmlDocument;

    function parseXml(xml_str) {
        if (window.DOMParser) {
            var parser = new DOMParser();
            return parser.parseFromString(xml_str, 'text/xml');
        } else // IE<=9
        {
            var result = this.createXmlDocument();
            result.async = false;
            // Workaround for parsing errors with SVG DTD
            result.validateOnParse = false;
            result.resolveExternals = false;
            result.loadXML(xml_str);
            return result;
        }
    }
    that.parseXml = parseXml;

    function getXml(xml_doc, linefeed) {
        var xml = '';
        if (window.XMLSerializer != null) {
            var xmlSerializer = new XMLSerializer();
            xml = xmlSerializer.serializeToString(xml_doc);
        } else if (xml_doc.xml != null) {
            xml = xml_doc.xml.replace(/\r\n\t[\t]*/g, '').
                replace(/>\r\n/g, '>').
                replace(/\r\n/g, '\n');
        }

        // Replaces linefeeds with HTML Entities.
        linefeed = linefeed || '&#xa;';
        xml = xml.replace(/\n/g, linefeed);

        // var xml_declaration = "<?xml version=\""+ xml_doc.xmlVersion +"\" encoding=\"gb2312\" ?>";
        // xml = xml_declaration + xml;
        return xml;
    }
    that.getXml = getXml;

    let XmlConstants = {
        NODETYPE_ELEMENT: 1,
        NODETYPE_ATTRIBUTE: 2,
        NODETYPE_TEXT: 3,
        NODETYPE_CDATA: 4,
        NODETYPE_ENTITY_REFERENCE: 5,
        NODETYPE_ENTITY: 6,
        NODETYPE_PROCESSING_INSTRUCTION: 7,
        NODETYPE_COMMENT: 8,
        NODETYPE_DOCUMENT: 9,
        NODETYPE_DOCUMENTTYPE: 10,
        NODETYPE_DOCUMENT_FRAGMENT: 11,
        NODETYPE_NOTATION: 12,
    };

    function getTextContent(node) {
        return (node != null) ? node[(node.textContent === undefined) ? 'text' : 'textContent'] : '';
    }

    function ltrim(str, chars) {
        chars = chars || "\\s";
        return (str != null) ? str.replace(new RegExp("^[" + chars + "]+", "g"), "") : null;
    }
    that.ltrim = ltrim;

    function rtrim(str, chars) {
        chars = chars || "\\s";
        return (str != null) ? str.replace(new RegExp("[" + chars + "]+$", "g"), "") : null;
    }
    that.rtrim = rtrim;

    function trim(str, chars) {
        return ltrim(rtrim(str, chars), chars);
    }
    that.trim = trim;

    function htmlEntities(s, newline) {
        s = String(s || '');
        s = s.replace(/&/g, '&amp;'); // 38 26
        s = s.replace(/"/g, '&quot;'); // 34 22
        s = s.replace(/\'/g, '&#39;'); // 39 27
        s = s.replace(/</g, '&lt;'); // 60 3C
        s = s.replace(/>/g, '&gt;'); // 62 3E
        if (newline == null || newline) {
            s = s.replace(/\n/g, '&#xa;');
        }
        return s;
    }

    function getPrettyXml(node, tab, indent, newline, ns) {
        var result = [];

        if (node != null) {
            tab = (tab != null) ? tab : '  ';
            indent = (indent != null) ? indent : '';
            newline = (newline != null) ? newline : '\n';

            if (node.namespaceURI != null && node.namespaceURI != ns) {
                ns = node.namespaceURI;
                if (node.getAttribute('xmlns') == null) {
                    node.setAttribute('xmlns', node.namespaceURI);
                }
            }

            if (node.nodeType == XmlConstants.NODETYPE_DOCUMENT) {
                result.push(getPrettyXml(node.documentElement, tab, indent, newline, ns));
            } else if (node.nodeType == XmlConstants.NODETYPE_DOCUMENT_FRAGMENT) {
                var tmp = node.firstChild;
                if (tmp != null) {
                    while (tmp != null) {
                        result.push(getPrettyXml(tmp, tab, indent, newline, ns));
                        tmp = tmp.nextSibling;
                    }
                }
            } else if (node.nodeType == XmlConstants.NODETYPE_COMMENT) {
                var value = getTextContent(node);
                if (value.length > 0) {
                    result.push(indent + '<!--' + value + '-->' + newline);
                }
            } else if (node.nodeType == XmlConstants.NODETYPE_TEXT) {
                var value = getTextContent(node);

                if (value.length > 0) {
                    result.push(indent + htmlEntities(trim(value), false) + newline);
                }
            } else if (node.nodeType == XmlConstants.NODETYPE_CDATA) {
                var value = getTextContent(node);
                if (value.length > 0) {
                    result.push(indent + '<![CDATA[' + value + ']]' + newline);
                }
            } else {
                result.push(indent + '<' + node.nodeName);
                var attrs = node.attributes;

                if (attrs != null) {
                    for (var i = 0; i < attrs.length; i++) {
                        var val = htmlEntities(attrs[i].value);
                        result.push(' ' + attrs[i].nodeName + '="' + val + '"');
                    }
                }
                var tmp = node.firstChild;
                if (tmp != null) {
                    result.push('>' + newline);
                    while (tmp != null) {
                        result.push(getPrettyXml(tmp, tab, indent + tab, newline, ns));
                        tmp = tmp.nextSibling;
                    }
                    result.push(indent + '</' + node.nodeName + '>' + newline);
                } else {
                    result.push(' />' + newline);
                }
            }
        }
        return result.join('');
    }
    that.getPrettyXml = getPrettyXml;

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    function rotate90(p1) {
        return new pwg.math.Vector2d(-p1.y, p1.x);
    }

    function strokeLineGPU(pPoints, nPoints, lineWidth, positionData, uvDirData, tagData, indexData) {
        if (nPoints < 2) return -1;
        var vR = 1.0;
        var vL = 0.0;

        var half_line_width = lineWidth / 2.;

        var a, b, c, aR, aL, bR, bL, cR, cL;
        var abP, abV, acP, acV, abcV;
        var abLength, acLength, uvLength = 0;

        var abLength2, acLength2;
        var cosa = 0;
        var cosa2 = 0;
        var abR, abL, acR, acL;
        // 用于标识是向左边添加点还是向右边添加点
        var aType = true;

        //////////////////////////////////////////////////////////////////////////
        var vAccIndex = positionData.length / 3;
        var vOffset = positionData.length / 3;

        if (nPoints == 2) {
            b = new pwg.math.Vector2x(pPoints[0][1], pPoints[0][2]);
            a = new pwg.math.Vector2x(pPoints[1][1], pPoints[1][2]);
            abP = a.subtract_New(b);
            abLength = abP.length();
            abP.normalize();
            abV = rotate90(abP);

            bR = b.add_New(abV.multiplyScalar_New(half_line_width));
            bL = b.subtract_New(abV.multiplyScalar_New(half_line_width));
            aR = a.add_New(abV.multiplyScalar_New(half_line_width));
            aL = a.subtract_New(abV.multiplyScalar_New(half_line_width));

            uvLength += abLength / lineWidth;

            //==============================================================
            var temp_pos = bR.subtract_New(abP.multiplyScalar_New(half_line_width));
            var temp_dir = abV.subtract_New(abP);
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(-0.5, vR, temp_dir.x, temp_dir.y);
            tagData.push(0, 0);

            temp_pos = bL.subtract_New(abP.multiplyScalar_New(half_line_width));
            temp_dir = abV.invert_New().subtract_New(abP);
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(-0.5, vL, temp_dir.x, temp_dir.y);
            tagData.push(0, 0);

            //==============================================================
            temp_pos = bR;
            temp_dir = abV;
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(0, vR, temp_dir.x, temp_dir.y);
            tagData.push(abLength / lineWidth, 0);

            temp_pos = bL;
            temp_dir = abV.invert_New();
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(0, vL, temp_dir.x, temp_dir.y);
            tagData.push(abLength / lineWidth, 0);

            temp_pos = aR;
            temp_dir = abV;
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
            tagData.push(0, abLength / lineWidth);

            temp_pos = aL;
            temp_dir = abV.invert_New();
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
            tagData.push(0, abLength / lineWidth);

            //==============================================================
            temp_pos = aR;
            temp_dir = abV;
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(0, vR, temp_dir.x, temp_dir.y);
            tagData.push(0, 0);

            temp_pos = aL;
            temp_dir = abV.invert_New();
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(0, vL, temp_dir.x, temp_dir.y);
            tagData.push(0, 0);

            temp_pos = aR.add_New(abP.multiplyScalar_New(half_line_width));
            temp_dir = abV.add_New(abP);
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(-0.5, vR, temp_dir.x, temp_dir.y);
            tagData.push(0, 0);

            temp_pos = aL.add_New(abP.multiplyScalar_New(half_line_width));
            temp_dir = abV.invert_New().add_New(abP);
            positionData.push(temp_pos.x, temp_pos.y, 0);
            uvDirData.push(-0.5, vL, temp_dir.x, temp_dir.y);
            tagData.push(0, 0);

            //==============================================================
            indexData.push(vOffset + 0);
            indexData.push(vOffset + 1);
            indexData.push(vOffset + 2);
            indexData.push(vOffset + 2);
            indexData.push(vOffset + 1);
            indexData.push(vOffset + 3);

            vOffset += 2;

            indexData.push(vOffset + 0);
            indexData.push(vOffset + 1);
            indexData.push(vOffset + 2);
            indexData.push(vOffset + 2);
            indexData.push(vOffset + 1);
            indexData.push(vOffset + 3);

            vOffset += 4;

            indexData.push(vOffset + 0);
            indexData.push(vOffset + 1);
            indexData.push(vOffset + 2);
            indexData.push(vOffset + 2);
            indexData.push(vOffset + 1);
            indexData.push(vOffset + 3);

            return uvLength;
        }
        for (var i = 1; i < nPoints; ++i) {
            if (i == 1) {
                b = new pwg.math.Vector2x(pPoints[i - 1][1], pPoints[i - 1][2]);
                a = new pwg.math.Vector2x(pPoints[i][1], pPoints[i][2]);

                abP = a.subtract_New(b);
                abLength = abP.length();
                abLength2 = abLength * abLength;
                abP.normalize();
                abV = rotate90(abP);

                bR = b.add_New(abV.multiplyScalar_New(half_line_width));
                bL = b.subtract_New(abV.multiplyScalar_New(half_line_width));
                abR = a.add_New(abV.multiplyScalar_New(half_line_width));
                abL = a.subtract_New(abV.multiplyScalar_New(half_line_width));
            } else {
                b = a;
                a = c;
                abP = acP.invert_New();
                abV = acV.invert_New();
                abLength = acLength;
                abLength2 = acLength2;

                bR = acR;
                bL = acL;
                abR = cR;
                abL = cL;
            }
            //////////////////////////////////////////////////////////////////////////
            //处理 c
            //////////////////////////////////////////////////////////////////////////
            if (i < nPoints - 1) {
                c = new pwg.math.Vector2x(pPoints[i + 1][1], pPoints[i + 1][2]);
                acP = a.subtract_New(c);
                acLength = acP.length();
                acLength2 = acLength * acLength;
                acP.normalize();
                acV = rotate90(acP);

                cR = c.subtract_New(acV.multiplyScalar_New(half_line_width));
                cL = c.add_New(acV.multiplyScalar_New(half_line_width));
                acR = a.subtract_New(acV.multiplyScalar_New(half_line_width));
                acL = a.add_New(acV.multiplyScalar_New(half_line_width));

                var bcLength2 = (c.subtract_New(b)).lengthSq();

                cosa = (abLength2 + acLength2 - bcLength2) / (2 * abLength * acLength);
                cosa2 = Math.sqrt((1 - cosa) / 2);
                /*if (cosa2 > 0.95)
                {
                    abcV = abV;
                }else if (cosa2 < 0.5)
                {
                    abcV = abV * 2;
                }else*/
                {
                    abcV = (abV.subtract_New(acV));
                    abcV.normalize();
                    abcV.divideScalar(cosa2);
                }

                aR = a.add_New(abcV.multiplyScalar_New(half_line_width));
                aL = a.subtract_New(abcV.multiplyScalar_New(half_line_width));

                var da = acP.dot(abV);
                if (da > 0) aType = true;
                if (da < 0) aType = false;
            } else {
                c = a;
                a = b;
                acV = abV.invert_New();
                abcV = abV;
                cR = aR;
                cL = aL;
                acLength = abLength;
                cR = c.subtract_New(acV.multiplyScalar_New(half_line_width));
                cL = c.add_New(acV.multiplyScalar_New(half_line_width));
            }

            //////////////////////////////////////////////////////////////////////////
            if (i == 1) {
                // 添加起点 cap
                var temp_pos = bR.subtract_New(abP.multiplyScalar_New(half_line_width));
                var temp_dir = abV.subtract_New(abP);
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(-0.5, vR, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                temp_pos = bL.subtract_New(abP.multiplyScalar_New(half_line_width));
                temp_dir = abV.invert_New().subtract_New(abP);
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(-0.5, vL, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                temp_pos = bR;
                temp_dir = abV;
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(0, vR, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                temp_pos = bL;
                temp_dir = abV.invert_New();
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(0, vL, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                //==============================================================
                indexData.push(vOffset + 0);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 3);

                vOffset = 4;

                // 添加第一个点
                temp_pos = bR;
                temp_dir = abV;
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                tagData.push(abLength / lineWidth, 0);
                vAccIndex++;

                temp_pos = bL;
                temp_dir = abV.invert_New();
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                tagData.push(abLength / lineWidth, 0);
                vAccIndex++;

                indexData.push(vOffset + 0);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 3);
            }

            if (i == nPoints - 1) {
                uvLength += acLength / lineWidth;

                // 添加最后一个点
                var temp_pos = cR;
                var temp_dir = acV.invert_New();
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                temp_pos = cL;
                temp_dir = acV;
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                vOffset = vAccIndex;

                //添加终点 cap
                temp_pos = cR;
                temp_dir = acV.invert_New();
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(0, vR, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                temp_pos = cL;
                temp_dir = acV;
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(0, vL, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                temp_pos = cR.subtract_New(acP.multiplyScalar_New(half_line_width));
                temp_dir = acV.invert_New().subtract_New(acP);
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(-0.5, vR, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                temp_pos = cL.subtract_New(acP.multiplyScalar_New(half_line_width));
                temp_dir = acV.subtract_New(acP);
                positionData.push(temp_pos.x, temp_pos.y, 0);
                uvDirData.push(-0.5, vL, temp_dir.x, temp_dir.y);
                tagData.push(0, 0);
                vAccIndex++;

                indexData.push(vOffset + 0);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 3);
            }

            //////////////////////////////////////////////////////////////////////////
            if (i < nPoints - 1) {
                uvLength += abLength / lineWidth;

                if (aType) {
                    var abR2 = abR.multiplyScalar_New(2).subtract_New(aR);
                    var join_len = (aR.subtract_New(abR2)).length() / 2.0 / lineWidth;

                    var temp_pos = abR;
                    var temp_dir = abV;
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                    tagData.push(0, abLength / lineWidth);
                    vAccIndex++;

                    temp_pos = abL;
                    temp_dir = abV.invert_New();
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                    tagData.push(0, abLength / lineWidth);
                    vAccIndex++;

                    //==============================================================
                    temp_pos = abR;
                    temp_dir = abV;
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0, -join_len / cosa2);
                    vAccIndex++;

                    temp_pos = a;
                    temp_dir = {
                        x: 0,
                        y: 0
                    };
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, 0.5, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0, -join_len / cosa2);
                    vAccIndex++;

                    temp_pos = aR;
                    temp_dir = abcV;
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0 - join_len, -join_len / cosa2);
                    vAccIndex++;

                    temp_pos = acR;
                    temp_dir = acV.invert_New();
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0, -join_len / cosa2);
                    vAccIndex++;

                    //==============================================================
                    temp_pos = acR;
                    temp_dir = acV.invert_New();
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                    tagData.push(acLength / lineWidth, 0);
                    vAccIndex++;

                    temp_pos = acL;
                    temp_dir = acV;
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                    tagData.push(acLength / lineWidth, 0);
                    vAccIndex++;

                    //////////////////////////////////////////////////////////////////////////
                    vOffset = vAccIndex - 8;

                    indexData.push(vOffset + 2);
                    indexData.push(vOffset + 3);
                    indexData.push(vOffset + 4);

                    indexData.push(vOffset + 3);
                    indexData.push(vOffset + 5);
                    indexData.push(vOffset + 4);
                } else {
                    var abL2 = abL.multiplyScalar_New(2).subtract_New(aL);
                    var join_len = (abL2.subtract_New(aL)).length() / 2.0 / lineWidth;

                    var temp_pos = abR;
                    var temp_dir = abV;
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                    tagData.push(0, abLength / lineWidth);
                    vAccIndex++;

                    temp_pos = abL;
                    temp_dir = abV.invert_New();
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                    tagData.push(0, abLength / lineWidth);
                    vAccIndex++;

                    //==============================================================
                    temp_pos = abL;
                    temp_dir = abV.invert_New();
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0, -join_len / cosa2);
                    vAccIndex++;

                    temp_pos = a;
                    temp_dir = {
                        x: 0,
                        y: 0
                    };
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, 0.5, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0, -join_len / cosa2);
                    vAccIndex++;

                    temp_pos = aL;
                    temp_dir = abcV.invert_New();
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0 - join_len, -join_len / cosa2);
                    vAccIndex++;

                    temp_pos = acL;
                    temp_dir = acV;
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                    tagData.push(-1.0, -join_len / cosa2);
                    vAccIndex++;

                    //==============================================================
                    temp_pos = acR;
                    temp_dir = acV.invert_New();
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vR, temp_dir.x, temp_dir.y);
                    tagData.push(acLength / lineWidth, 0);
                    vAccIndex++;

                    temp_pos = acL;
                    temp_dir = acV;
                    positionData.push(temp_pos.x, temp_pos.y, 0);
                    uvDirData.push(uvLength, vL, temp_dir.x, temp_dir.y);
                    tagData.push(acLength / lineWidth, 0);
                    vAccIndex++;

                    //////////////////////////////////////////////////////////////////////////
                    vOffset = vAccIndex - 8;

                    indexData.push(vOffset + 2);
                    indexData.push(vOffset + 4);
                    indexData.push(vOffset + 3);

                    indexData.push(vOffset + 3);
                    indexData.push(vOffset + 4);
                    indexData.push(vOffset + 5);
                }

                vOffset = vAccIndex - 2;

                indexData.push(vOffset + 0);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 2);
                indexData.push(vOffset + 1);
                indexData.push(vOffset + 3);
            }
        }
        return uvLength;
    }
    that.strokeLineGPU = strokeLineGPU;
    ///////////////////////////////////////////////////////////////////
    function ContextMenu() {

    }
    ContextMenu._container = null;
    ContextMenu._get_container = function () {
        if (ContextMenu._container == null) {
            var ul = document.createElement("ul");
            ul.classList.add("pwg-context-menu");
            ContextMenu._container = ul;
            var body = document.querySelector("body");
            body.appendChild(ul);
        }
        var container = ContextMenu._container;
        return container;
    };

    function _create_ui_command_execute(command) {
        return function () {
            ContextMenu.hide();
            command.execute();
        };
    }

    ContextMenu.prepare = function (commands) {

        var container = ContextMenu._get_container();
        while (container.childElementCount > 0) {
            container.removeChild(container.firstElementChild);
        }
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            var li = document.createElement("li");
            li.textContent = command.title;
            li.onclick = _create_ui_command_execute(command);
            container.appendChild(li);
        }
    };

    ContextMenu.show = function (x, y) {
        var container = ContextMenu._get_container();
        container.style.top = `${y}px`;
        container.style.left = `${x}px`;
        container.classList.remove("hidden");
    };

    ContextMenu.hide = function (x, y) {
        var container = ContextMenu._get_container();
        container.classList.add("hidden");
    };

    that.ContextMenu = ContextMenu;
    /////////////////////////////////////
    function injectTransformEx(context) {
        context.pixelToLocal = function (px, py) {
            if(!pwg.defined(py)){
                py=px.y;
                px=px.x;
            }
            var p = this.pixelToGlobal(px, py);
            return this.globalToLocal(p);
        };

        context.localToPixel = function (px, py) {
            if(!pwg.defined(py)){
                py=px.y;
                px=px.x;
            }
            var p = this.localToGlobal(px, py);
            return this.globalToPixel(p);
        };

        context.localToLonlat = function (px, py) {
            var p = this.localToGlobal(px, py);
            return this.globalToPixel(p);
        };
        
        function defined(value) {
            return value !== undefined && value !== null && value !== "";
        }
        context.lonlatToLocal = function (px, py) {
            if(!pwg.defined(py)){
                py=px.y;
                px=px.x;
            }
            var p = this.lonlatToGlobal(px, py);
            return this.globaltoLocal(p);
        };

        context.makeLocationFrom=function(point,type)
        {
            if(type=='pixel')
            {
                var location = new pwg.AbsoluteLocation(this,"just",'pixel');
                location.point.xy=point;
                location.update();
                return location;
            }   
            else 
            if(type=='lonlat')
            {
                var location = new pwg.AbsoluteLocation(this,"just",'lonlat');
                location.point.xy=point;
                location.update();
                return location;
            }
        };
        //just for make location 
        context.getContainerContext=function()
        {
            return this;
        };
    }
    that.injectTransformEx = injectTransformEx;
    ///////////////////////////////////////////////////////
    function build_icon_inline_matrix(outbox, inbox) {
        var TRS0 = new pwg.TRS();
        TRS0.make(inbox.center.multiply(-1), 0, 1, inbox.center);

        var TRS1 = new pwg.TRS();
        TRS1.make(outbox.center, 0, new pwg.point(outbox.width / inbox.width, outbox.height / inbox.height));
        return TRS1.M.append(TRS0.M);
    }
    that.build_icon_inline_matrix=build_icon_inline_matrix;
    ////////////////////////////////////////
    function point_readx(px, py) {
        if (!py)
            return px;
        else
            return new pwg.point(px, py);
    }
    pwg.point.readx = point_readx;
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
/*
    pwg-canvas-render-engine.js
*/
if (typeof pwg == 'undefined')
    pwg = {};
pwg.drawing = function (paper) {

    function WorkerImageProxy() {
        this._src = null;
        this.id = null;
        this._width = 0;
        this._height = 0;
        this.onload = null;
    }
    WorkerImageProxy.prototype.constructor = WorkerImageProxy;
    WorkerImageProxy.prototype.done = function (image) {
        if (this.onload) {
            this.onload(image);
        }
    };
    WorkerImageProxy.prototype.requeset = function () {
        self.postMessage({ name: "request-image", id: this.id?this.id:this.src, src: this._src });
    };

    pwg.defineClassProperties(WorkerImageProxy, {
        src:
        {
            get: function () { return this._src; },
            set: function (v) {
                this._src = v;
                this.requeset();
            }
        }
    });
    //Image = typeof window != 'undefined' ? window.Image : WorkerImageProxy;
    if(typeof Image === 'undefined')
    {
        self.Image=WorkerImageProxy;
    }

    var that = pwg.drawing;
    that.paper = paper;

    paper.setup([1024, 1024]);
    paper.project.view.autoUpdate = false;

    that.default_paper_param = new paper.Base({
        offset: new paper.Point(0, 0),
        pixelRatio: pwg.DEVICE_PIXEL_RATIO,
        viewMatrix: null,
        matrices: [new paper.Matrix()],
        updateMatrix: true
    });
    ////////////////////////////////////////////////////////////////
    //TRS rotate->scale->translate                                //
    ////////////////////////////////////////////////////////////////
    function TRS() {
        // this.T = new pwg.matrix();
        // this.R = new pwg.matrix();
        // this.S = new pwg.matrix();
        this.M = new pwg.matrix();
    }
    TRS._T = new pwg.matrix();
    TRS._R = new pwg.matrix();
    TRS._S = new pwg.matrix();
    TRS._O = new pwg.matrix();
    TRS.prototype.constructor = TRS;
    TRS.prototype.make = function (t, r, s, o) {
        TRS._T.reset();
        TRS._R.reset();
        TRS._S.reset();
        TRS._O.reset();
        if (o) {
            TRS._O.translate(o.multiply(-1));
        }
        TRS._T.translate(t.x, t.y);
        TRS._R.rotate(r);
        if (typeof s.x === 'undefined')
            TRS._S.scale(s, s);
        else
            TRS._S.scale(s.x, s.y);

        this.M.reset();
        if (!TRS._T.isIdentity())
            this.M.append(TRS._T);
        this.M.append(TRS._R);
        this.M.append(TRS._S);
        if (!TRS._O.isIdentity())
            this.M.append(TRS._O);
        this.I = this.M.inverted();
    };

    // TRS.prototype.make = function (t, r, s, o) {
    //     TRS._T.reset();
    //     TRS._R.reset();
    //     TRS._S.reset();
    //     if (o) {
    //         t = t.subtract(o);
    //     }
    //     TRS._T.translate(t.x, t.y);
    //     TRS._R.rotate(r, o);
    //     if (typeof s.x === 'undefined')
    //         TRS._S.scale(s, s, o);
    //     else
    //         TRS._S.scale(s.x, s.y, o);

    //         this.M.reset();
    //     this.M.append(TRS._T);
    //     this.M.append(TRS._R);
    //     this.M.append(TRS._S);
    //     this.I = this.M.inverted();
    // };

    TRS.prototype.transform = function (x, y) {
        return this.M.transform(x, y);
    };
    TRS.prototype.invert = function (x, y) {
        return this.I.transform(x, y);
    };
    that.TRS = TRS;
    pwg.TRS = TRS;

    function formatARGB(c) {
        if(typeof(c) === 'string' || c instanceof String)
            return c;
        c = c | 0;
        if (formatARGB._cache[c])
            return formatARGB._cache[c];
        var a = (c & 0xFF000000) >> 24;
        if (a < 0)
            a += 256;
        a /= 255.0;
        c = c & 0xFFFFFF;
        var r = (c >> 16),
            g = ((c & 0xFF00) >> 8),
            b = (c & 0xFF);
        var ret = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        formatARGB._cache[c] = ret;
        return ret;
    }
    formatARGB._cache = [];
    that.formatARGB = formatARGB;

    function setColorOpacity(color, opacity) {
        var r = ((color & 0xFFFFFF) >> 16),
            g = ((color & 0xFF00) >> 8),
            b = (color & 0xFF);
        var a = 255 * opacity / 100;
        return a << 24 | r << 16 | g << 8 | b;
    }
    that.setColorOpacity = setColorOpacity;

    function InterpolateColor(c1, c2, op1, op2, percent) {
        var r1 = ((c1 & 0xFFFFFF) >> 16),
            g1 = ((c1 & 0xFF00) >> 8),
            b1 = (c1 & 0xFF);
        var r2 = ((c2 & 0xFFFFFF) >> 16),
            g2 = ((c2 & 0xFF00) >> 8),
            b2 = (c2 & 0xFF);
        var a1 = 255 * op1 / 100;
        var a2 = 255 * op2 / 100;
        var r = (r2 - r1) * percent + r1;
        var g = (g2 - g1) * percent + g1;
        var b = (b2 - b1) * percent + b1;
        var a = (a2 - a1) * percent + a1;
        return a << 24 | r << 16 | g << 8 | b;
    }
    that.InterpolateColor = InterpolateColor;
    that.interpolateColor = InterpolateColor;

    var ARGB = {
        create: function (a, r, g, b) {
            if (a <= 2.0) {
                a *= 255;
                a |= 0;
                r *= 255;
                r |= 0;
                g *= 255;
                g |= 0;
                b *= 255;
                b |= 0;
            }
            return a << 24 | r << 16 | g << 8 | b;
        },
        formatARGB: formatARGB,
        RED: 0xFFFF0000,
        GREEN: 0xFF00FF00,
        BLUE: 0xFF0000FF,
        YELLOW: 0xFFFFFF00,
        BLACK: 0xFF000000,
        WHITE: 0xFFFFFFFF,
        PINK: 0XFFFF00FF
    };
    that.ARGB = ARGB;
    pwg.colors = ARGB;
    ////////////////////////////////////////////
    //set paper style to drawing context      //
    ////////////////////////////////////////////
    function apply_style_to_context(style, matrix, ctx, param, viewMatrix) {
        if (style.hasFill()) {
            ctx.fillStyle = style.getFillColor().toCanvasStyle(ctx, matrix);
        }
        if (style.hasStroke()) {
            ctx.strokeStyle = style.getStrokeColor().toCanvasStyle(ctx, matrix);
            ctx.lineWidth = style.getStrokeWidth();
            var strokeJoin = style.getStrokeJoin(),
                strokeCap = style.getStrokeCap(),
                miterLimit = style.getMiterLimit();
            if (strokeJoin)
                ctx.lineJoin = strokeJoin;
            if (strokeCap)
                ctx.lineCap = strokeCap;
            if (miterLimit)
                ctx.miterLimit = miterLimit;
            //if (paper.support.nativeDash)
            {
                var dashArray = style.getDashArray(),
                    dashOffset = style.getDashOffset();
                if (dashArray && dashArray.length) {
                    if ('setLineDash' in ctx) {
                        ctx.setLineDash(dashArray);
                        ctx.lineDashOffset = dashOffset;
                    } else {
                        ctx.mozDash = dashArray;
                        ctx.mozDashOffset = dashOffset;
                    }
                }
            }
        }
        if (style.hasShadow()) {
            var pixelRatio = param.pixelRatio || 1,
                mx = viewMatrix._shiftless().prepend(
                    new Matrix().scale(pixelRatio, pixelRatio)),
                blur = mx.transform(new Point(style.getShadowBlur(), 0)),
                offset = mx.transform(this.getShadowOffset());
            ctx.shadowColor = style.getShadowColor().toCanvasStyle(ctx);
            ctx.shadowBlur = blur.getLength();
            ctx.shadowOffsetX = offset.x;
            ctx.shadowOffsetY = offset.y;
        }
        if (style.fontEnable || (param && param.fontStyle)) {
            ctx.font = style.getFontStyle();
            ctx.textAlign = style.getJustification();
        }
    }
    that.apply_style_to_context = apply_style_to_context;

    //////////////////////////////////////////////////
    //create a help object to operate stroke        //
    //////////////////////////////////////////////////
    function create_stroke_op(drawing) {
        var strokeOp = {};
        strokeOp.drawing = drawing;
        strokeOp.setType = function (type, p) {
            if (type == 0) {
                this.drawing.ctx.setLineDash([]);
            } else if (type == 1) {
                this.drawing.ctx.setLineDash([this.drawing.ctx.lineWidth * 2, this.drawing.ctx.lineWidth]);
            } else {
                if (p == 1)
                    this.drawing.ctx.setLineDash([5, 15, 10]); //todo redefine the pattern style
                else if (p == 2)
                    this.drawing.ctx.setLineDash([5, 5, 0]);
                else if (p == 3)
                    this.drawing.ctx.setLineDash([15, 15, 10]);
                else if (p == 4)
                    this.drawing.ctx.setLineDash([5, 25, 10]);
                else
                    this.drawing.ctx.setLineDash([25, 15, 20]);
            }
        };

        strokeOp.setColor = function (color) {
            if (this.drawing.ctx)
                this.drawing.ctx.strokeStyle = pwg.drawing.formatARGB(color);
        };

        strokeOp.setWidth = function (width) {
            if (this.drawing.ctx)
                this.drawing.ctx.lineWidth = width;
        };
        strokeOp.setLineJoin = function (join) {

        };
        strokeOp.setInnerJoin = function (join) {

        };
        strokeOp.setMiterLimit = function (miterLimit) {

        };
        return strokeOp;
    }

    ////////////////////////////////////////////////////////////
    //create a help object to opereate context brush          //
    ////////////////////////////////////////////////////////////
    function create_brush_op(drawing) {
        var brushOp = {};
        brushOp.drawing = drawing;
        brushOp.brushType = 0;
        brushOp.color = 0xffffffff;
        brushOp.linearGradient = [];
        brushOp.hatchType = 0;
        brushOp.dirty = true;
        brushOp.setType = function (type, p) {
            this.brushType = type;
            this.dirty = true;
        };
        brushOp.setColor = function (c) {
            this.brushType = 0;
            var cc = formatARGB(c);
            this.color = cc;
            this.dirty = true;
        };
        brushOp.clearGradient = function () {
            while (this.linearGradient.length > 0)
                this.linearGradient.pop();
            this.dirty = true;
        };
        brushOp.addGradient = function (c1, x, y) {
            this.linearGradient.push([formatARGB(c1), x, y]);
            this.dirty = true;
        };
        brushOp.setHatchType = function (tex) {
            this.hatchType = tex;
            this.dirty = true;
        };
        return brushOp;
    }

    ///////////////////////////////////////////////////////////
    //help object to drawing anything in the pwg scene       //
    ///////////////////////////////////////////////////////////
    function ContextDrawing2D(context) {
        if (context)
            this.setContext(context);
        this.stroke = create_stroke_op(this);
        this.brush = create_brush_op(this);
        this._temp_matrix = new pwg.matrix();
        this._hatch_cache = {};
        var viewMatrix = null;
        this.default_paper_param = new paper.Base({
            offset: new paper.Point(0, 0),
            pixelRatio: 1, //pwg.DEVICE_PIXEL_RATIO,
            viewMatrix: viewMatrix,
            matrices: [new paper.Matrix()],
            updateMatrix: true
        });
        pwg.drawing.default_paper_param = this.default_paper_param;
    }

    ContextDrawing2D.prototype.constructor = ContextDrawing2D;

    ContextDrawing2D.prototype.setRenderContext2D = function (ctx) {
        var ratio = pwg.DEVICE_PIXEL_RATIO; //pwg.defaultValue(ctx.devicePixelRatio, pwg.DEVICE_PIXEL_RATIO ? pwg.DEVICE_PIXEL_RATIO : 1);
        this._base_xform = new pwg.matrix(ratio, 0, 0, ratio, 0, 0);
        this.ctx = ctx;
    };

    ContextDrawing2D.prototype.begin = function () {
        this.ctx.save();
    };

    ContextDrawing2D.prototype.end = function () {
        this.ctx.restore();
    };

    ContextDrawing2D.prototype.setTransform = function (a, b, c, d, e, f) {
        var m = this._temp_matrix;
        m.set(a, b, c, d, e, f);
        m.prepend(this._base_xform);
        this.ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    };

    ContextDrawing2D.prototype.setMatrix = function (m) {
        this.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    };

    ContextDrawing2D.prototype.resetTransform = function () {
        var m = this._temp_matrix;
        m.reset();
        m.prepend(this._base_xform);
        this.ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    };

    ContextDrawing2D.prototype.beginPath = function () {
        if (this.ctx)
            this.ctx.beginPath();
    };

    ContextDrawing2D.prototype.strokeRect = function (x0, y0, x1, y1) {
        if (this.ctx)
            this.ctx.strokeRect(x0, y0, x1, y1);
    };

    ContextDrawing2D.prototype.fillRect = function (x0, y0, x1, y1) {
        if (this.ctx)
            this.ctx.fillRect(x0, y0, x1, y1);
    };
    ContextDrawing2D.prototype.moveTo = function (x, y) {
        if (this.ctx)
            pwg.defined(y)?this.ctx.moveTo(x, y):this.ctx.moveTo(x.x,x.y);
    };
    ContextDrawing2D.prototype.lineTo = function (x, y) {
        if (this.ctx)
            pwg.defined(y)?this.ctx.lineTo(x, y):this.ctx.lineTo(x.x,x.y);
    };
    ContextDrawing2D.prototype.bezierCurveTo = function (fcp1x, cp1y, cp2x, cp2y, x, y) {
        if (this.ctx)
            this.ctx.bezierCurveTo(fcp1x, cp1y, cp2x, cp2y, x, y);
    };
    ContextDrawing2D.prototype.quadraticCurveTo = function (qcpx, qcpy, qx, qy) {
        if (this.ctx)
            this.ctx.quadraticCurveTo(qcpx, qcpy, qx, qy);
    };
    ContextDrawing2D.prototype.arc = function (x, y, r, sAngle, eAngle, radius, counterclockwise) {
        if (!radius) {
            sAngle *= (Math.PI / 180);
            eAngle *= (Math.PI / 180);
        }
        if (this.ctx)
            this.ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    };
    ContextDrawing2D.prototype.arcTo = function (x1, y1, x2, y2, r) {
        if (this.ctx)
            this.ctx.arcTo(x1, y1, x2, y2, r);
    };
    ContextDrawing2D.prototype.closePath = function () {
        if (this.ctx)
            this.ctx.closePath();
    };

    ContextDrawing2D.prototype.strokeExec = function () {
        if (this.ctx)
            this.ctx.stroke();
    };

    ContextDrawing2D.prototype._update_brush = function () {
        var brush = this.brush;
        if (brush.dirty) {
            if (brush.brushType == 0 || brush.brushType == 1) {
                this.ctx.fillStyle = brush.color;
            } else if (brush.brushType == 1) {
                this.ctx.fillStyle = brush.color;
            } else if (brush.brushType == 2) {
                //var src = "/resources/hatch_" + brush.hatchType + ".png";
                if (!this.hatchCache[brush.color]) {
                    var img = new Image();
                    img.src = nkJB.utils.ImageHelper.buildGridFillImage(brush.color);
                    this.hatchCache[brush.color] = this.ctx.createPattern(img, "repeat");
                }
                this.ctx.fillStyle = this.hatchCache[brush.color];
                return;
            } else if (brush.brushType == 3) {
                var x1 = brush.linearGradient[0][1];
                var y1 = brush.linearGradient[0][2];
                var x2 = brush.linearGradient[1][1];
                var y2 = brush.linearGradient[1][2];
                var grd = this.ctx.createLinearGradient(x1, y1, x2, y2);
                grd.addColorStop(0, brush.linearGradient[0][0]);
                grd.addColorStop(1, brush.linearGradient[1][0]);
                this.ctx.fillStyle = grd;
            } else if (brush.brushType == 4) {
                var x0 = brush.linearGradient[0][1],
                    y0 = brush.linearGradient[0][2];
                var r = brush.linearGradient[1][1] > brush.linearGradient[1][2] ? brush.linearGradient[1][1] : brush.linearGradient[1][2];
                var style = this.ctx.createRadialGradient(x0, y0, 0, x0, y0, r);
                style.addColorStop(0.0, brush.linearGradient[0][0]);
                style.addColorStop(1.0, brush.linearGradient[1][0]);
                this.ctx.fillStyle = style;
            }
            brush.dirty = false;
        }
    };

    ContextDrawing2D.prototype.fillExec = function () {
        if (this.ctx) {
            this._update_brush();
            this.ctx.fill();
        }
    };

    ContextDrawing2D.prototype.styleApply = function (style, matrix) {
        apply_style_to_context(style, matrix, this.ctx, this.default_paper_param, null);
    };

    ContextDrawing2D.prototype.setFont = function (fontName, size, bold, italic) {
        if (fontName == "") fontName = "sans-serif";
        var font = size + "px " + fontName;
        if (italic != undefined) {
            font = italic + " " + font;
        }
        if (bold != undefined) {
            font = bold + " " + font;
        }
        if (this.ctx) {
            this.ctx.font = font;
        }
    };

    ContextDrawing2D.prototype.measureText = function (text, pWidth, pHeight) {
        if (!this.ctx)
            return;
        var rc = this.ctx.measureText(text);
        return rc;
    };

    ContextDrawing2D.prototype.strokeText = function (text, x, y, v_align) {
        if (!this.ctx)
            return;

        var ob = this.ctx.textBaseline;
        if (v_align != undefined)
            this.ctx.textBaseline = v_align;
        else
            this.ctx.textBaseline = "middle";
        this.ctx.strokeText(text, x, y);
        this.ctx.textBaseline = ob;
    };

    ContextDrawing2D.prototype.fillText = function (text, x, y, v_align) {
        if (!this.ctx)
            return;

        this._update_brush();
        var ob = this.ctx.textBaseline;
        if (v_align != undefined)
            this.ctx.textBaseline = v_align;
        else
            this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, x, y);
        this.ctx.textBaseline = ob;
    };

    ContextDrawing2D.prototype.drawImage = function (image, x, y, w, h, updown) {
        this.ctx.drawImage(image, x, y, w, h);
    };
    //////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * drawIconLine in canvasOverlayer, can mutate input line data !
     * @param {*array typed line vertex.} line 
     * @param {*enable animation of draw arrow..} enableAni 
     */
    ContextDrawing2D.prototype.drawLineEx = function (line, style, icon) {
        if (!line || line.length < 2)
            return;
        var ctx = this.ctx;
        if (style)
            apply_style_to_context(style, null, ctx, null, null);
        else {
            style_ = {
                color: '#FDFDFD',
                lineDash: [],
                shadow: false,
                shadowBlur: 4,
                shadowColor: '#eee'
            };
            _icon_draw_set_line_style(ctx, style_);
        }
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        var i = 1;
        while (i < line.length) {
            var p = line[i];
            if (p.c && p.c == "b3") {
                var p1 = line[i];
                ctx.lineTo(line[i].x, line[i].y);
                var c = line[i + 1];
                var p2 = line[i + 2];
                ctx.bezierCurveTo(c.x, c.y, c.x, c.y, p2.x, p2.y);
                i += 3;
            } else {
                ctx.lineTo(line[i].x, line[i].y);
                i++;
            }
        }
        if (line.closed) {
            ctx.closePath();
        }
        ctx.stroke();

        if (style && style.hasFill()) {
            ctx.fill();
        }
        icon = icon ? icon : style.icon;
        if (icon)
            drawIcon4Line(ctx, line, icon);
    };

    ContextDrawing2D.prototype.drawEx = ContextDrawing2D.prototype.drawLineEx;

    function _icon_draw_set_line_style(ctx, style) {
        ctx.strokeStyle = style.color;
        ctx.setLineDash(style.lineDash);
        ctx.globalAlpha = 0.95;
        ctx.globalCompositeOperation = 'source-over';
        if (style.shadow === true) {
            ctx.shadowBlur = style.shadowBlur;
            ctx.shadowColor = style.shadowColor;
        } else {
            ctx.shadowBlur = 0;
        }
        // ctx.strokeStyle = 'green';
        ctx.lineCap = "round"; // square
        ctx.lineJoin = 'round'; // bevel
        ctx.lineWidth = 8;
    }

    /**
     * return function to be debounced.
     * @param fn {Function}
     * @param delay {Number}
     * @return {Function}
     */
    function debounce(fn, delay) {
        var timer;
        // timer is closure in memory.. returned function will be debounced..
        return function () {
            var context = this;
            var args = arguments;
            // clear the previous timer to prevent the function call.
            clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(context, args);
            }, delay);
        };
    }

    /**
     * draw Icons on segments (---) of one line.
     * @param {*} ctx 
     * @param {*} line 
     */
    function drawIcon4Line(ctx, line, icon) {
        if (line.length < 2)
            return;
        var aniOffset = 0.5;
        aniOffset = aniOffset < 1 ? aniOffset + 0.01 : 0.5;
        for (var i = 1, l = line.length; i < l; i++) {
            drawIcon4Segment(ctx, line[i - 1], line[i], aniOffset, icon);
        }
        if (line.closed) {
            drawIcon4Segment(ctx, line[line.length - 1], line[0], aniOffset, icon);
        }
    }

    // var debDrawIcon4Line = function () {};
    // if (util) {
    //     debDrawIcon4Line = util.debounce(drawIcon4Line, 100);
    // }

    /**
     * draw Icons on single segment (-) of line.
     * @param {*} ctx 
     * @param {*} startPoint 
     * @param {*} endPoint 
     * @param {*} aniOffset 
     */
    function drawIcon4Segment(ctx, startPoint, endPoint, aniOffset, iconImg) {
        generatePoints(startPoint, endPoint, 15, ctx, aniOffset, iconImg);
    }
    /**
     * Generate segment Icon points by given stepSize
     * @param {*} startP 
     * @param {*} endP 
     * @param {* stepSize of line Icon in screen pixel, default:30px } stepSize . 
     * @param {*} ctx 
     * @param {* icon offset on line, for eg: set 1 for offset by one stepSize. } aniOffset 
     * @param {* icon img to render alongsize line: Image } img 
     */
    function generatePoints(startP, endP, stepSize, ctx, aniOffset, iconImg) {
        // calc icon rotate by line segment direction.
        var fwd = endP.subtract(startP).normalize();
        var radA = fwd.angleInRadians;
        var dist = startP.getDistance(endP);
        var steps = dist / stepSize;

        var drawImg = (pX, pY) => {
            if (iconImg && ctx) {
                ctx.save();
                ctx.translate(pX, pY); // consider img position and imgWidth/Height.
                ctx.rotate(radA);
                ctx.drawImage(iconImg, -iconImg.width / 2, -iconImg.width / 2);
                ctx.restore();
            }
        };
        for (var s = aniOffset; s <= steps; s += 1) {
            var p = startP.add(fwd.multiply(stepSize * s));
            drawImg(p.x, p.y);
        }
    }

    function calcDist(startP, endP) {
        return Math.sqrt((endP[1] - startP[1]) ** 2 + (endP[0] - startP[0]) ** 2);
    }

    ////////////////////////////////////////////////////////////////////////////////
    function _draw_ui_handle_rect(drawing, p, size, ec, fc) {
        size = size / 2;
        var px = p.x,
            py = p.y;
        drawing.beginPath();
        drawing.moveTo(px - size, py - size);
        drawing.lineTo(px + size, py - size);
        drawing.lineTo(px + size, py + size);
        drawing.lineTo(px - size, py + size);
        drawing.closePath();
        drawing.brush.setColor(fc);
        drawing.brush.setType(1);
        drawing.fillExec();

        drawing.stroke.setType(1);
        drawing.stroke.setColor(ec);
        drawing.stroke.setWidth(1);
        drawing.strokeExec();
    }

    function _draw_ui_handle_diamond(drawing, p, size, ec, fc) {
        size = size / 2;
        var px = p.x,
            py = p.y;
        drawing.beginPath();
        drawing.moveTo(px - size, py);
        drawing.lineTo(px, py - size);
        drawing.lineTo(px + size, py);
        drawing.lineTo(px, py + size);
        drawing.closePath();
        drawing.brush.setColor(fc);
        drawing.brush.setType(1);
        drawing.fillExec();

        drawing.stroke.setType(1);
        drawing.stroke.setColor(ec);
        drawing.stroke.setWidth(1);
        drawing.strokeExec();
    }

    function _draw_ui_handle_circle(drawing, p, size, ec, fc) {
        size = size / 2;
        var px = p.x,
            py = p.y;
        drawing.beginPath();
        drawing.arc(px, py, size, 0, 360);
        drawing.closePath();
        drawing.brush.setColor(fc);
        drawing.brush.setType(1);
        drawing.fillExec();

        drawing.stroke.setType(1);
        drawing.stroke.setColor(ec);
        drawing.stroke.setWidth(1);
        drawing.strokeExec();
    }

    ContextDrawing2D.prototype.draw_ui_handle_rect = function (p, size, fc, ec) {
        _draw_ui_handle_rect(this, p, size, ec, fc);
    };

    ContextDrawing2D.prototype.draw_ui_handle_diamond = function (p, size, fc, ec) {
        _draw_ui_handle_diamond(this, p, size, ec, fc);
    };

    ContextDrawing2D.prototype.draw_ui_handle_circle = function (p, size, fc, ec) {
        _draw_ui_handle_circle(this, p, size, ec, fc);
    };

    function _execute_draw_local_ppe_action(drawing, action) {

    }

    function _execute_draw_global_ppe_action(drawing, action) {

    }

    ContextDrawing2D.prototype.execute = function (action) {
        switch (action.type) {
            case "ppe.local": {

            }
                break;
            case "ppe.action": {

            }
                break;
        }
    };
    pwg.ContextDrawing2D = ContextDrawing2D;
    that.ContextDrawing2D = ContextDrawing2D;
    ////////////////////////////////////////////////////////////////////////
    //import svg                                                          //
    ////////////////////////////////////////////////////////////////////////
    that.SVGCache = {};
    that.svg_hitbox_color = new paper.Color(0, 0, 0, 0.01);
    pwg.drawing.use_paper_svg_rastering = true;
    that.import_paper_svg_item = function (id, url, s, callback) {
        if (!id)
            id = url;

        function onload(loaded) {

            if (!pwg.drawing.use_paper_svg_rastering) {
                var bounds = loaded.bounds;
                bounds = bounds.scale(1.001);
                var hitbox = new paper.Shape.Rectangle(bounds);
                hitbox.fillColor = that.svg_hitbox_color;
                loaded.addChild(hitbox);
                var matrix = new pwg.matrix();
                matrix.scale(s, s);
                loaded.matrix = matrix;
            } else {
                var bounds = loaded.bounds;
                loaded = loaded.rasterize(600);
            }

            var cache = new paper.SymbolDefinition(loaded);
            that.SVGCache[id] = cache;
            that.SVGCache[url] = cache;
            if (callback) {
                callback(defn);
            }
        }
        if (!that.SVGCache[url]) {
            that.SVGCache[url] = "loading";
            paper.project.importSVG(url, onload);
            return "loading";
        } else {
            if (that.SVGCache[url] !== "loading") {
                if (callback)
                    callback(that.SVGCache[url]);
                return that.SVGCache[url];
            } else {
                return "loading";
            }
        }
    };

    ////////////////////////////////////////////////////////
    function using_paper_item(owner, id, inlineMatrix) {
        this.owner = owner;
        this.id = id;
        this._matrix = null;
        this.inlineMatrix = inlineMatrix;
        this._TRS = new pwg.matrix();
        this.url = null;
        this._svg = null;
    }
    using_paper_item._matrices = [new paper.Matrix()];
    using_paper_item.prototype.constructor = using_paper_item;
    pwg.defineClassProperty(using_paper_item, "matrix", {
        get: function () {
            return this._matrix;
        },
        set: function (m) {
            this._matrix = m;
            this.matrixDirty = true;
        }
    });
    pwg.defineClassProperty(using_paper_item, "bounds", {
        get: function () {
            this._confirm();
            return this._svg ? this._svg.bounds : "";
        }
    });
    using_paper_item.svg_view_matrix = new pwg.matrix().scale(2, 2);
    using_paper_item.prototype._update_matrix = function () {
        if (this.matrixDirty) {
            this._TRS.reset();
            if (this._matrix)
                this._TRS.set(this._matrix.values);
            if (this.inlineMatrix && !this.inlineMatrix.isIdentity())
                this._TRS = this._TRS.append(this.inlineMatrix);
            this._TRS.prepend(using_paper_item.svg_view_matrix);
            this.matrixDirty = false;
        }
    };
    using_paper_item.prototype.updateMatrixOnly = function (param) {
        this._confirm();
        if (!this._svg)
            return;
        this._update_matrix();
        this._svg.applyMatrix = false;
        this._svg.matrix = this._TRS;
        this._svg.updateMatrixOnly(param);
    };
    using_paper_item.prototype._confirm = function () {
        if (!this._svg) {
            var svg = that.SVGCache[this.url];
            if ((typeof (svg) != 'string'))
                this._svg = new paper.SymbolItem(svg);
        }
    };

    using_paper_item.prototype.draw = function (ctx, param) {
        this._confirm();
        if (!this._svg)
            return;
        this._update_matrix();
        this._svg.applyMatrix = false;
        this._svg.matrix = this._TRS;
        this._svg.draw(ctx, param);
    };

    using_paper_item.prototype.hitTest = function (px, param) {
        if (this._svg) {
            px = px.multiply(2);
            this._svg.applyMatrix = false;
            this._svg.matrix = this._TRS;
            this._svg.updateMatrixOnly(param);
            this.updateMatrixOnly(param);
            return this._svg.hitTest(px);
        } else {
            return null;
        }
    };

    that.using = function (owner, id, url) {
        var using = new using_paper_item(owner, id);
        url = url ? url : id;
        using.url = url;
        if (!that.SVGCache[url]) {
            that.import_paper_svg_item(url, null);
        }
        return using;
    };

    that.register_paper_svg = function (uri, svg) {
        that.SVGCache[uri] = new paper.SymbolDefinition(svg);
    };

    function create_paper_image_item(url) {
        var image = new Image();
        var _id = `pwg_svg_inline_image${create_paper_image_item.__image_id++}`;
        image.src = url;
        image.id = _id;
        var raster = new paper.Raster(image);
        //raster.image = image;
        return raster;
    }
    create_paper_image_item.__image_id = 0;
    that._register_paper_image_item = function (id, url) {
        var image = create_paper_image_item(url);
        that.register_paper_svg(id, image);
    };

    function __is_image_url__(d) {
        return (d.match(/\.(jpeg|jpg|gif|png)$/i) != null);
    }

    function __is_svg_url(d) {
        return (d.match(/\.svg$/i) != null);
    }

    function __is_svg_base64(d) {
        return d.indexof("data:image/svg+xml;base64") != -1;
    }

    function __is_image_base64(d) {
        return (d.match(/data:image\/(jpeg|jpg|gif|png)/) == 0);
    }

    function define(id, d, s) {
        if (typeof d == "string") {
            if (__is_image_url__(d) || __is_image_base64(d))
                pwg.drawing._register_paper_image_item(id, d);
            else if (__is_svg_url(d) || __is_svg_base64(d))
                pwg.drawing.import_paper_svg_item(id, d, s ? s : 1);
        } else if (d instanceof paper.Item) {
            pwg.drawing.register_paper_svg(id, d, s);
        }
    }
    that.define = define;

    that.__image_cache__ = {};
    function ImageDefine(id, src, size) {
        this.id = id;
        this.url = src;
        this._size = size;
        this._bounds = null;
        this._image = new Image();
        this._image.id = id;
        var that = this;
        this._image.onload = function (image) {
            if (typeof window!='undefined') {
                if (size) {
                    this.width =  size.width;
                    this.height = size.height;
                } else {
                    that._size = new pwg.size(this.width, this.height);
                }
            }
            else {
                that._image = image;
                that._size = new pwg.size(image.width, image.height);
            }
        };
        this._image.src = src;
    }
    ImageDefine.prototype.constructor = ImageDefine;
    ImageDefine.prototype.done = function (image) {
        this._image.done(image);
    };
    pwg.defineClassProperties(ImageDefine, {
        "image": {
            get: function () {
                return this._image;
            }
        },
        "size": {
            get: function () {
                return this._size;
            }
        },
        "bounds": {
            get: function () {
                if (this._bounds)
                    return this._bounds;
                var bx = new pwg.rectangle(-this._size.width / 2, -this._size.height / 2, this._size.width, this._size.height);
                this._bounds = bx;
                return bx;
            }
        }
    });

    function define_image(id, url, size) {
        if (!url)
            url = id;
        var image = new ImageDefine(id, url, size);
        that.__image_cache__[id] = image;
        if (url != id) {
            that.__image_cache__[id] = image;
        }
        return image;
    }
    function using_image_item(owner, id) {
        this.owner = owner;
        this.id = id;
        this._define = null;
        this.inlineMatrix = null;
        this._matrix = null;
        this._matrixDirty = true;
        this._M = new pwg.matrix();
        this._I = null;
    }
    using_image_item.prototype.constructor = using_image_item;
    using_image_item.prototype._confirm = function () {
        if (!this._define) {
            this._define = that.__image_cache__[this.url];
        }
    };
    using_image_item.prototype.updateMatrixOnly = function () {

        if (this._matrixDirty) {
            this._M.reset();
            this._M.scale(pwg.DEVICE_PIXEL_RATIO);
            if (this._matrix)
                this._M.append(this._matrix);
            if (this.inlineMatrix) {
                this._M = this._M.append(this.inlineMatrix);
            }
            this._I = this._M.inverted();
            this._matrixDirty = false;
        }
    };
    using_image_item.prototype.hitTest = function (px, param) {
        this.updateMatrixOnly();
        var pp = px.clone();
        pp.x *= pwg.DEVICE_PIXEL_RATIO; pp.y *= pwg.DEVICE_PIXEL_RATIO;
        pp = this._I.transform(pp);
        return this.bounds.contains(pp);
    };
    using_image_item.prototype.draw = function (ctx, param) {
        this._confirm();
        this.updateMatrixOnly();
        if (this._define) {
            ctx.save();
            var def = this._define;
            var size = def.size;
            var m = this._M;
            ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
            ctx.drawImage(def.image, -size.width / 2, -size.height / 2, size.width, size.height);
            ctx.restore();
        }
    };
    pwg.defineClassProperties(using_image_item, {
        "bounds": {
            get: function () {
                this._confirm();
                return this._define ? this._define.bounds : null;
            }
        },
        "matrix": {
            get: function () {
                return this._matrix;
            },
            set: function (m) {
                this._matrix = m;
                this._matrixDirty = true;
            }
        }
    });

    that.usingx = function (owner, id, url) {
        var using = new using_image_item(owner, id);
        url = url ? url : id;
        using.url = url;
        if (!that.__image_cache__[url]) {
            that.define(id, url);
        }
        return using;
    };
    that.requestx = function (id, src) {
        var imagex = that.__image_cache__[id];
        if (imagex) {
            console.log("imagex:",imagex.id,imagex.url);
            var im =imagex.image;
            createImageBitmap(im,0,0,im.width,im.height).then(image => {
                pwg.worker.postMessage({ name: "image-load", id: id, image: image }, [image]);
            });
        }
    };
    that.definex = define_image;
    that.define = that.definex;
    that.using = that.usingx;
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
if (typeof pwg == 'undefined')
    pwg = {};
if (!pwg.graphics)
    pwg.graphics = {};
pwg.graphics.base = function () {
    var that = pwg.graphics;
    ////////////////////////////////////////////////////////////// 
    //Graphics:元素,场景的基本单元                              //
    ////////////////////////////////////////////////////////////// 
    function Graphics(container, id, owner) {
        pwg.super(this, pwg.Object);
        this.container = container;
        this.owner = owner;
        this.id = id;
        this._handles = null;
        this.layer = 'default';
    }
    pwg.inherits(Graphics, pwg.Object);
    pwg.defineClassId(Graphics, 'pwg.graphics');
    Graphics.prototype.update = function () {};
    /*pass=entity|selection|label|ui*/
    Graphics.prototype.render = function (pass) {};
    Graphics.prototype.getContainerContext = function () {
        return this.container.getContext();
    };
    Graphics.prototype.hitTest = function (e, filter, deep) {
        return null;
    };
    Graphics.prototype.collide = function (context) {
        return false;
    };
    Graphics.prototype.tryGetUiCommand = function (e, handle) {
        return null;
    };
    Graphics.prototype.executeCommand = function (op, argv) {
        return null;
    };
    Graphics.prototype.hasCommand = function (op) {
        return false;
    };

    Graphics.prototype.tryGetBoundingBox=function()
    {
        return null;
    };

    //option={name:""|type="joint|break"}
    Graphics.prototype.tryGetLocation = function (e, type) {
        return null;
    };
    Graphics.prototype._do_ui_handle_update = function () {
        return 'none';
    };
    Graphics.prototype._execute_ui_command = function () {
        return 'none';
    };
    Graphics.prototype._get_children = function () {
        return null;
    };
    Graphics.prototype.addChild = function (ch) {
        return false;
    };
    Graphics.prototype.removeChild = function (ch) {
        return -1;
    };
    Graphics.prototype.hasChild = function (ch) {
        return false;
    };

    Graphics.prototype.addTo = function (owner) {
        if (owner.children == null || this.getContainerContext() != owner.getContainerContext())
            return false;
        return owner.addChild(this);
    };
    Graphics.prototype.remove = function () {
        if (this.owner) {
            return this.owner.removeChild(this);
        } else {
            return false;
        }
    };

    Graphics.prototype.depth = function () {
        if (this.depth_runtime)
            return this.depth_runtime;
        else
            return 0;
    };

    Graphics.prototype.visitChildren = function (v) {
        var children = this.children;
        if (children) {
            for (var i = 0, l = children.length; i < l; i++) {
                var ch = children[i];
                v.on(ch);
                ch.visitChildren(v);
            }
        }
    };

    Graphics.prototype.removeDep = function (object) {
        return false;
    };

    Graphics.prototype.findDep = function (o, deps) {
        if (this.isDep(o)) {
            deps.push(this);
        }
        return deps;
    };

    Graphics.prototype.isDep = function (o) {
        return false;
    };

    Graphics.prototype.getLocation = function (id) {
        return null;
    };

    pwg.defineClassProperties(Graphics, {
        children: {
            get: function () {
                return this._children ? this._children : this._get_children();
            }
        },
        handles: {
            get: function () {
                return (this._get_handles ? this._get_handles() : this._handles);
            }
        },
        scene: {
            get: function () {
                return this.container.scene;
            },
            set: function (val) {}
        },
        text: {
            get: function () {
                if (this.name)
                    return this.name;
                if (this.xdata)
                    return this.xdata.CN;
                else
                    return this.id;
            }
        }
    });
    pwg.Graphics = Graphics;
    Graphics.prototype.__save__ = function (json) {
        if (!json)
            json = {};
        json.classid = this.classid;
        json.id = this.id;
        json.container = this.container.id;
        if (this.owner)
            json.owner = this.owner.id;
        json.layer = this.layer;
        if (this.__json_creator__)
            json.__json_creator__ = this.__json_creator__;
        if (this.xdata)
            json.xdata = this.xdata;
        return json;
    };
    Graphics.prototype.__load__ = function (json, context) {
        this.layer = json.layer;
        this.id = json.id;
        if (json.owner) {
            var owner = context.getObjectById(json.owner);
            if (owner)
                owner.addChild(this);
        }
        if (json.__json_creator__)
            this.__json_creator__ = json.__json_creator__;
        if (json.xdata)
            this.xdata = json.xdata;
    };
    Graphics.prototype.dispose = function () {};
    /////////////////////////////////////////////////////////////////
    //UiHandle:拥有界面交互的控制点                                   //
    /////////////////////////////////////////////////////////////////
    //mode=simple|continuous
    function UiHandle(owner, type, id, mode, location) {
        pwg.super(this, pwg.Object);
        this.mode = mode ? mode : 'simple';
        this.owner = owner;
        this.type = type;
        this.id = id;
        this.location = location ? location : new pwg.AbsoluteLocation(owner, id, "pixel");
        this.tooltip = null;
    }
    pwg.inherits(UiHandle, pwg.Object);
    UiHandle.prototype.begin = function () {
        if (this.owner._do_ui_handle_begin)
            this.owner._do_ui_handle_begin(this);
    };
    //action=down|move|up|post|delete
    UiHandle.prototype.update = function (e, action) {
        console.log('update', this, e, action)
        return this.owner._do_ui_handle_update(this, e, pwg.defaultValue(action, 'move'));
    };
    UiHandle.prototype.commit = function () {
        if (this.owner._do_ui_handle_commit)
            this.owner._do_ui_handle_commit(this);
    };
    UiHandle.prototype.cancel = function () {
        if (this.owner._do_ui_handle_cancel)
            this.owner._do_ui_handle_cancel(this);
    };
    UiHandle.prototype.isLocationTarget = function (object) {
        if (this.owner._is_ui_handle_location_target) {
            return this.owner._is_ui_handle_location_target(this, object);
        }
        return true;
    }
    pwg.UiHandle = UiHandle;
    /////////////////////////////////////////////////////////////////
    //UiCommand:提供运行时右键菜单的命令,有UiHandle关联             //
    /////////////////////////////////////////////////////////////////
    function UiCommand(owner, id, handle, title, mode) {
        pwg.super(this, pwg.Object);
        this.owner = owner;
        this.id = id;
        this.mode = mode;
        this.handle = handle;
        this.title = title;
        this.acckey = null;
        this.icon = null;
        this.tooltip = null;
        this.type = "execute";
        this.children = [];
        /*
            其它数据由这里添加
        */
    }
    pwg.inherits(UiCommand, pwg.Object);
    UiCommand.prototype.execute = function (argv) {
        return this.owner._execute_ui_command(this, argv);
    };
    pwg.UiCommand = UiCommand;
    /*
        Build
    */
    ///////////////////////////////////////////////////////////
    function BaseBuild(mode) {
        pwg.super(this, pwg.Object);
        this.mode = mode; //|simple|continuous
        this._creating = null;
    }
    pwg.inherits(BaseBuild, pwg.Object);
    BaseBuild.prototype.setContext = function (context) {
        this._context = context;
    };
    BaseBuild.prototype.update = function (e, action) {};
    BaseBuild.prototype.getLocationMode = function () {
        return null;
    };
    BaseBuild.prototype.render = function (drawing) {};
    BaseBuild.prototype.cancel = function () {};
    BaseBuild.prototype.post = function () {};
    pwg.graphics.BaseBuild = BaseBuild;
    pwg.BaseBuild = BaseBuild;

    ///////////////////////////////////////////////////////////    
    that._graphics_build_cache_map = {};
    that.builds = [];

    function register_graphics_build(name, build) {
        build.title = name; //confirm the name
        that.builds.push(build);
        that._graphics_build_cache_map[name] = build;
    }
    that.registerBuild = register_graphics_build;
    that.getBuild = function (n) {
        return that._graphics_build_cache_map[n]; //TODO:
    };

    ///////////////////////////////////////////////////////////
    //最基础的分组对象                                          //
    ///////////////////////////////////////////////////////////
    function Group(container, id) {
        pwg.super(this, pwg.Graphics, container, id);
        this._children = [];
    }
    pwg.inherits(Group, pwg.Graphics);
    pwg.defineClassId(Group, "pwg.Group");
    Group.prototype.nodes = function () {
        return null;
    };
    Group.prototype._get_children = function () {
        return this._children;
    };
    Group.prototype.addChild = function (ch) {
        var children = this._children;
        if (ch.owner == null /*&& (ch.container == this.container)*/ ) { //TODO:check the container same
            children.push(ch);
            ch.owner = this;
            this.raiseEvent("child-added", {
                parent: this,
                child: ch
            });
            return true;
        } else {
            return false;
        }
    };
    Group.prototype.removeChild = function (ch) {
        if (ch.owner == this) {
            ch.owner = null;
            var children = this._children;
            var ix = children.indexOf(ch);
            children.splice(ix, 1);
            this.raiseEvent("child-removed", {
                parent: this,
                child: ch
            });
            return true;
        } else {
            return false;
        }
    };
    Group.prototype.hasChild = function (ch) {
        return this._children.indexOf(ch) > -1;
    };
    Group.prototype.render = function (drawing, pass) {
        var children = this._children;
        for (var i = 0, l = children.length; i < l; i++) {
            var ch = children[i];
            ch.render(drawing, pass);
        }
    };
    Group.prototype.raiseEvent = function (name, e) {
        
        if (this.owner) {
            this.owner.raiseEvent(name, e);
        }
    };

    Group.prototype.findDep = function (o, result) {
        var children = this._children;
        for (var i = 0, l = children.length; i < l; i++) {
            var ch = children[i];
            ch.findDep(o, result);
        }
        return result;
    };

    Group.prototype.hitTest = function (e, option) {
        var D = 1e10;
        var hitted = null;
        var children = this.children;
        var filter = option ? option.filter : null;
        var ignores = option ? option.ignores : null;
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[l - i - 1];
            if ((!filter || filter(child)) && (!ignores || (ignores.indexOf(child) == -1))) {
                var hit = child.hitTest(e, option);
                if (hit && hit.succeed && hit.distance < D) {
                    D = hit.distance;
                    hitted = hit.object;
                }
            }
        }
        return hitted ? {
            succeed: true,
            object: hitted,
            distance: D
        } : null;
    };

    Group.prototype.visit = function (callback) {
        var children = this._children;
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            callback(child);
            if (child.visit) {
                child.visit(callback);
            }
        }
    };

    Group.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        return json;
    };

    Group.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
    };
    pwg.Group = Group;
    pwg.registerClass(pwg.Group);
    ///////////////////////////////////////////////////////////
    //容器对象,支持                                            //
    ///////////////////////////////////////////////////////////
    function GraphicsContainer(scene, id) {
        pwg.super(this, Group, scene, id);
        this._context = null;
    }
    pwg.inherits(GraphicsContainer, Group);
    GraphicsContainer.prototype.getContext = function () {
        return this._context;
    };
    GraphicsContainer.prototype.createGraphics = function (type, ...argv) {
        return this.scene._create_graphics(type, this, ...argv);
    };
    pwg.GraphicsContainer = GraphicsContainer;

    /////////////////////////////////////////////////////////////////
    //为所有的点图形,提供一个共同的基类                                 //
    /////////////////////////////////////////////////////////////////
    /*  point pivot layout
        +   T   +
        L   O   R  ->SA
        +   B   +
            R0     \ SB 
        {
            name:  a
            point:p,
            rotate0:v,
            sizeA:v,
            sizeB:v
        }
    */
    //
    //pwg point model
    //pixel: inline->[inline matrix]->base->[offset matrix]->frame->[frame matrix]->pixel
    //       frameToPixel pixelToFrame
    //       frameToBase  baseToFrame
    //       baseToPixel  pixelToBase
    //
    function PointGraphics(container, id, bounds, pivots, offmode) {
        pwg.super(this, pwg.Graphics, container, id);
        this._location = new pwg.OptionalLocation(this, "default", "local");
        this._offset_location = new pwg.OffsetLocation(this, "offset", this._location, offmode ? offmode : "pixel");

        this._frameTRS = new pwg.TRS();
        this._offsetTRS = new pwg.TRS();
        this._TRS = new pwg.TRS();

        this._handle_rotate = new pwg.UiHandle(this, "handle.rotate", "rotate");
        this._handle_scaleA = new pwg.UiHandle(this, "handle.scale", "scale.A");
        this._handle_scaleB = new pwg.UiHandle(this, "handle.scale", "scale.B");
        this._bounds = bounds;
        var _handles = [this._handle_rotate, this._handle_scaleA, this._handle_scaleB];
        this._pivots = pivots;
        var mvhandles = [];
        for (var i = 0, l = pivots.length; i < l; i++) {
            var pivot = pivots[i];
            var handle = new pwg.UiHandle(this, "handle.move", "move" + pivot.name);
            handle.pivot = pivot;
            handle.locationMode = pivot.location;
            mvhandles.push(handle);
        }
        this._handles = mvhandles.concat(_handles);
        this._change_pivot_to_(pivots[0]);

        this._annotation = new pwg.InlineOffsetAnnotation(container, this);
        this._annotation.location = this._offset_location;
        this._annotation.autoAdjustRatio = true;
        //this._handles.push(this._annotation._handles[1]);
    }
    pwg.inherits(PointGraphics, pwg.Graphics);
    PointGraphics.prototype.frameToPixel = function (point) {
        return this._frameTRS.M.transform(point);
    };
    PointGraphics.prototype.pixelToFrame = function (point) {
        return this._frameTRS.I.transform(point);
    };
    PointGraphics.prototype.baseToFrame = function (point) {
        return this._offsetTRS.M.transform(point);
    };
    PointGraphics.prototype.frameToBase = function (point) {
        return this._offsetTRS.I.transform(point);
    };
    PointGraphics.prototype.baseToPixel = function (point) {
        return this._TRS.M.transform(point);
    };
    PointGraphics.prototype.pixelToBase = function (point) {
        return this._TRS.I.transform(point);
    };
    PointGraphics.prototype._raise_location_changed_event = function () {
        this.scene.raiseEvent("location-mode-changed", this);
    };
    PointGraphics.prototype._change_pivot_to_handle = function (handle) {
        this._change_pivot_to_(handle.pivot);
    };
    PointGraphics.prototype._change_pivot_to_name = function (name) {
        var pivots = this._pivots;
        for (var i = 0, l = pivots.length; i < l; i++) {
            var pivot = pivots[i];
            if (pivot.name == name) {
                this._change_pivot_to_(pivot);
                break;
            }
        }
    };
    PointGraphics.prototype._change_pivot_to_ = function (pivot) {
        if (this.pivot != pivot) {
            if (this.pivot)
                this.pivot.style = "";
            pivot.style = "active";
            this.pivot = pivot;
            this._handle_rotate.roate0 = pivot.rotate0;
            this._handle_scaleA.size = pivot.sizeA;
            this._handle_scaleB.size = pivot.sizeB;
        }
    };

    PointGraphics.prototype._updateMatrix = function () {
        this._location.update();
        var frameloc = this._location;

        this._frameTRS.make(frameloc.pixel, frameloc.angle, 1);
        var context = this.getContainerContext();
        var offsetloc = this._offset_location;
        offsetloc.update();
        let offset = offsetloc.offset;
        this._offsetTRS.make(offset.t, offset.r, offset.s * context.pointAdjustRatio, this.pivot.point);

        // function printMatrix(label, m) {
        //     // 假设 m 有 a, b, c, d, tx, ty 属性
        //     console.log(`${label}:`);
        //     console.log(
        //         `[ ${m.a}, ${m.c}, ${m.tx} ]\n` +
        //         `[ ${m.b}, ${m.d}, ${m.ty} ]\n` +
        //         `[ 0, 0, 1 ]`
        //     );
        // }
        
        // // 在 _updateMatrix 方法中调用
        // printMatrix('_frameTRS.M', this._frameTRS.M);
        // printMatrix('_offsetTRS.M', this._offsetTRS.M);
        
        this._TRS.M = this._frameTRS.M.appended(this._offsetTRS.M);
        this._TRS.I = this._TRS.M.inverted();
    };

    PointGraphics.prototype.depth = function () {
        return this._location.depth();
    };

    PointGraphics.prototype.setLocation = function (e) {
        this._location.set(e);
    };

    PointGraphics.prototype.tryGetBoundingBox=function()
    {
        return this._location.lonlat;
    };

    PointGraphics.prototype.isDep = function (o) {
        return this._location.isDep(o);
    };

    PointGraphics.prototype.removeDep = function (o) {
        return this._location.removeDep(o);
    };

    pwg.defineClassProperties(
        PointGraphics, {
            "location": {
                get: function () {
                    return this._location;
                }
            },
            "offset": {
                get: function () {
                    return this._offset_location;
                }
            },
            "locationTRS": {
                get: function () {
                    return this._frameTRS;
                }
            },
            "offsetTRS": {
                get: function () {
                    return this._offsetTRS;
                }
            },
            "TRS": {
                get: function () {
                    return this._TRS;
                }
            },
            "annotation": {
                get: function () {
                    return this._annotation;
                }
            }
        }
    );

    PointGraphics.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        json.location = this._location.__save__();
        json.offset = this._offset_location.__save__();
        json.bounds = pwg.json.formats[pwg.rectangle].save(this._bounds);
        json.pivot = this.pivot.name;
        json.annotation = this._annotation.__save__();
        return json;
    };

    PointGraphics.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
        this._location.__load__(json.location, context);
        this._offset_location.__load__(json.offset, context);
        this._bounds = pwg.json.formats[pwg.rectangle].load(json.bounds);
        this._change_pivot_to_name(json.pivot);
        this._annotation.__load__(json.annotation, context);
    };

    pwg.PointGraphics = PointGraphics;
    /////////////////////////////////////////////////////////////////////////
    function _do_point_graphics_handle_move_update_e(owner, handle, e) {
        if (handle.pivot != owner.pivot) {
            owner._change_pivot_to_(handle.pivot);
        }
        var location = e.location;
        if (handle.pivot.location == "absolute" ||(e.location && e.location.owner.isDep(owner)))
            e.location = "absolute";

        owner._location.set(e);
        e.location = location;
        return true;
    }
    pwg.utils._do_point_graphics_handle_move_update_e = _do_point_graphics_handle_move_update_e;

    function _do_point_graphics_handle_move_update(owner, handle) {
        var bpoint = handle.pivot.point;
        handle.location.point = owner.baseToPixel(bpoint);
        handle.location.update();
    }
    pwg.utils._do_point_graphics_handle_move_update = _do_point_graphics_handle_move_update;
    /////////////////////////////////////////////////////////
    function _do_point_graphics_handle_rotate_update_e(owner, handle, e) {
        var pivot = owner.pivot;
        var p0 = pivot.point;
        var v1 = pivot.rotate0.subtract(p0);
        var v2 = owner.pixelToFrame(e.pixel);
        var dangle = v2.getDirectedAngle(v1);
        owner._offset_location.offset.r = -dangle;
    }
    pwg.utils._do_point_graphics_handle_rotate_update_e = _do_point_graphics_handle_rotate_update_e;

    function _do_point_graphics_handle_rotate_update(owner, handle) {
        var pivot = owner.pivot;
        var point = pivot.rotate0;
        handle.location.point = owner.baseToPixel(point);
        handle.location.update();
    }
    pwg.utils._do_point_graphics_handle_rotate_update = _do_point_graphics_handle_rotate_update;
    //////////////////////////////////////////////////////////
    function _do_point_graphics_handle_scale_update_e(owner, handle, e) {
        var pivot = owner.pivot;
        var p0 = pivot.piont;
        var size1 = handle.size.subtract(p0);
        var sizeP = owner.pixelToBase(e.pixel);
        var nsize1 = size1.clone().normalize();
        var size = nsize1.dot(sizeP);
        var offset = owner._offset_location.offset;
        offset.s = Math.max(0.25, offset.s * size / size1.length);
    }
    pwg.utils._do_point_graphics_handle_scale_update_e = _do_point_graphics_handle_scale_update_e;

    function _do_point_graphics_handle_scale_update(owner, handle) {
        var pivot = owner.pivot;
        var point = pivot.point.add(handle.size);
        handle.location.point = owner.baseToPixel(handle.size);
        handle.location.update();
    }
    pwg.utils._do_point_graphics_handle_scale_update = _do_point_graphics_handle_scale_update;

    PointGraphics.prototype._do_ui_handle_begin = function (handle) {
        PointGraphics.TRS0 = {};
        PointGraphics.TRS0.M = this._TRS.M.clone();
        PointGraphics.TRS0.I = this._TRS.I.clone();
        return true;
    };

    PointGraphics.prototype._do_ui_handle_update = function (handle, e) {
        if (handle.type == "handle.move") {
            _do_point_graphics_handle_move_update_e(this, handle, e);
        } else if (handle.type == "handle.rotate") {
            _do_point_graphics_handle_rotate_update_e(this, handle, e);
        } else if (handle.type == "handle.scale") {
            _do_point_graphics_handle_scale_update_e(this, handle, e);
        }
        return true;
    };

    PointGraphics.prototype.updateOnlyLocation = function ()
    {
        this._updateMatrix();
    };
    PointGraphics.prototype.update = function (all) {
        this._updateMatrix();
        var context = this.getContainerContext();
        this._visibility = context.viewport.contains(this._location.pixel);
        
        if (this._visibility  ) {
            if(all)
            {
                var handles = this._handles;
                for (var i = 0, l = handles.length; i < l; i++) {
                    var h = handles[i];
                    if (h.type == "handle.move") {
                        _do_point_graphics_handle_move_update(this, h);
                    } else if (h.type == "handle.scale") {
                        _do_point_graphics_handle_scale_update(this, h);
                    } else if (h.type == "handle.rotate") {
                        _do_point_graphics_handle_rotate_update(this, h);
                    }
                }                
            }
            this._annotation.update();
        }
    };
    PointGraphics.prototype.dispose = function () {
        this._location.removeDep();
    };
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
if (typeof pwg == "undefined")
    pwg = {};
if (!pwg.graphics)
    pwg.graphics = {};
pwg.graphics.frame = function () {
    ////////////////////////////////////////////////////////
    //一个局部坐标系                                        //
    ////////////////////////////////////////////////////////
    function FrameContext(owner, location, mode) {
        this._owner = owner;
        this._location_point = location;
        this._frameTRS = new pwg.TRS();
        this._mode = mode;
    }
    FrameContext.prototype.constructor = FrameContext;
    function make_min_adjust_ratio(level,zoom)
    {
        if(zoom<level) 
           return Math.pow(2,level-zoom); 
        else 
           return 1; 
    }
    FrameContext.prototype.update = function () {
        var location = this._location_point;
        var ccontext = this._owner.getContainerContext();
        this.zoom = ccontext.zoom;
        var mode = this._mode;
        if (mode == "pixel") {
            this._frameTRS.make(location.pixel, location.angle, location.scale);
            this.pointAdjustRatio = location.scale;
        }
        else {
            this.miniAdjustRatio = ccontext.miniAdjustRatio ;//make_min_adjust_ratio(18,this.zoom);
            this._frameTRS.make(location.local, location.angle, location.scale*this.miniAdjustRatio);
            this.pointAdjustRatio = location.scale*ccontext.pointAdjustRatio;
        }
    };

    FrameContext.prototype.localToGlobal = function (px, py) {
        var p = pwg.point.readx(px, py);
        p = this._frameTRS.M.transform(p);
        var cc = this._owner.getContainerContext();
        return this._mode == "pixel" ? cc.pixelToGlobal(p) : p;
    };

    FrameContext.prototype.globalToLocal = function (px, py) {
        var p = pwg.point.readx(px, py);
        var cc = this._owner.getContainerContext();
        if (this._mode == "pixel")
            p = cc.globalToPixel(p);
        return this._frameTRS.I.transform(p);
    };

    FrameContext.prototype.pixelToGlobal = function (px, py) {
        var p = pwg.point.readx(px, py);
        var cc = this._owner.getContainerContext();
        return cc.pixelToGlobal(p);
    };

    FrameContext.prototype.globalToPixel = function (px, py) {
        var cc = this._owner.getContainerContext();
        return cc.globalToPixel(px, py);
    };

    FrameContext.prototype.lonlatToGlobal = function (lon, lat) {
        var cc = this._owner.getContainerContext();
        return cc.lonlatToGlobal(lon, lat);
    };

    FrameContext.prototype.globalToLonlat = function (px, py) {
        var cc = this._owner.getContainerContext();
        return cc.globalToLonlat(px, py);
    };
    pwg.defineClassProperty(FrameContext, "drawing", {
        get: function () {
            return this._owner.getContainerContext().drawing;
        }
    });
    pwg.defineClassProperty(FrameContext, "viewport", {
        get: function () {
            return this._owner.getContainerContext().viewport;
        }
    });
    pwg.utils.injectTransformEx(FrameContext.prototype);

    function __define_frame_inline_pivot_icon(size) {
        pwg.drawing.define("frame",'/pwg/svg/frame.svg',new pwg.size(64,64));
    }
    var _frame_size = 32;
    __define_frame_inline_pivot_icon(_frame_size);
    ///////////////////////////////////////////////////////////
    //框架图形,提供子图的基础支持
    ///////////////////////////////////////////////////////////
    function FrameContainer(container, id, mode, graphics0) {
        pwg.super(this, pwg.GraphicsContainer, container, id);
        var icon =  pwg.drawing.using(this, "frame");
        this._pivot_icon =icon;
        var rc = this._pivot_icon.bounds;
        this._location_point = new pwg.PointGraphics(container, "frame-location", rc,
            [{
                point: new pwg.point(0, 0),
                rotate0: new pwg.point(0, rc.bottom),
                sizeA: new pwg.point(rc.right, rc.bottom),
                sizeB: new pwg.point(rc.right, 0)
            }], "pixel");
        this._context = new FrameContext(this, this._location_point._offset_location, mode);
        this._graphics0 = graphics0;
        if (graphics0) {
            graphics0.container = this;
            graphics0.owner = this;
            graphics0.id = id;//
        }
    }
    pwg.inherits(FrameContainer, pwg.GraphicsContainer);
    pwg.defineClassId(FrameContainer, "pwg.FrameContainer");
    pwg.FrameContainer = FrameContainer;
    FrameContainer.prototype._get_handles = function () {
        var handles = [this._location_point.handles[0]];
        if (this._graphics0) {
            if (this._context._mode == "pixel") {
                handles = handles.concat([this._location_point.handles[2], this._graphics0.handles[1]]);
            } else {
                handles = handles.concat(this._location_point.handles[3], this._graphics0.handles);
            }
        }
        return handles;
    };

    FrameContainer.prototype.getContext = function () {
        return this._context;
    };

    FrameContainer.prototype.update = function (all) {
        this._location_point.update(all);
        this._context.update(all);
        if (this._graphics0)
            this._graphics0.update(true);
        pwg.GraphicsContainer.prototype.update.call(this,all);
    };

    FrameContainer.prototype.hitTest = function (e, options) {
        var hit = pwg.GraphicsContainer.prototype.hitTest.call(this, e, options);
        if (hit)
            return hit;
        if (this._graphics0)
            hit = this._graphics0.hitTest(e, options);
        if (hit) {
            hit.object = this;
            return hit;
        }
        this._pivot_icon.matrix = this._location_point._TRS.M;
        hit = this._pivot_icon.hitTest(e.pixel, pwg.drawing.default_paper_param);
        if (hit) {
            return {
                succeed: true,
                distance: 0,
                object: this
            };
        }
        return null;
    };

    FrameContainer.prototype.tryGetLocation = function (e, mode) {
        if (this._graphics0)
            return this._graphics0.tryGetLocation(e, mode);
    };
    FrameContainer.prototype.getLocation = function (n) {
        if (this._graphics0)
            return this._graphics0.getLocation(n);
    };

    FrameContainer.prototype.render = function (drawing, pass) {
        var context = this._context;
        if (context._mode == "local") {
            if (context.miniAdjustRatio == 1) {
                if (this._graphics0) {
                    if (pass == "frame")
                        this._graphics0.render(drawing, "entity");
                    if (pass == "ui" || pass == "hot" || pass == "debug")
                        this._graphics0.render(drawing, pass);
                }
                if (pass == "ui") {
                    drawing.begin();
                    this._pivot_icon.matrix = this._location_point._TRS.M;
                    this._pivot_icon.draw(drawing.ctx, drawing.default_paper_param);
                    drawing.end();
                }
            }
            else {
                if (pass == "frame")
                    this._graphics0.render(drawing, "mini");
                if (pass == "ui" || pass == "hot" || pass == "debug") {
                    if (this._graphics0)
                        this._graphics0.render(drawing, pass);
                }
            }
            if (pass != "ui" && pass != 'hot' && pass != 'debug')
                pwg.GraphicsContainer.prototype.render.call(this, drawing, pass);
        }
        else {
            if (this._graphics0) {
                if (pass == "frame")
                    this._graphics0.render(drawing, "entity");
                if (pass == "ui" || pass == "hot" || pass == "debug") {
                    this._graphics0.render(drawing, pass);
                }
            }
            if (pass == "ui") {
                drawing.begin();
                this._pivot_icon.matrix = this._location_point._TRS.M;
                this._pivot_icon.draw(drawing.ctx, drawing.default_paper_param);
                drawing.end();
            }
            if (pass != "ui" && pass != 'hot' && pass != 'debug')
                pwg.GraphicsContainer.prototype.render.call(this, drawing, pass);
        }
    };
    FrameContainer.prototype.__save__ = function (json) {
        json = pwg.GraphicsContainer.prototype.__save__.call(this, json);
        json.location = this._location_point.__save__();
        json.szmode = this._size_mode;
        if (this._graphics0) {
            this._graphics0.owner = null; //forbiden graphics be insert into chidren list
            json.graphics0 = this._graphics0.__save__();
            this._graphics0.owner = this;
        }
        return json;
    };
    FrameContainer.prototype.__load__ = function (json, context) {
        pwg.GraphicsContainer.prototype.__load__.call(this, json, context);
        this._location_point.__load__(json.location,context);
        this._size_mode=json.szmode;
        if (this._graphics0)
            this._graphics0.__load__(json.graphics0,context);
    };

    pwg.defineClassProperties(FrameContainer, {
        "location": { get: function () { return this._location_point.location; } }
    });

    pwg.json.registerCreator("pwg.FrameContainer.creator", function (container, id, json) {
        var graphics0;
        if (json.graphics0) {
            var jgraphics0 = json.graphics0;
            if (jgraphics0.__json_creator__)
                graphics0 = pwg.json.create(container, jgraphics0.id, jgraphics0);
            else {
                graphics0 = pwg.createObject(jgraphics0.classid, null, jgraphics0.id);
            }
        }
        var frame = new FrameContainer(container, id, json.szmode, graphics0);
        return frame;
    });


    pwg.registerClass(FrameContainer);
    ///////////////////////////////////////////////////////////////
    function RectangleFrameBuild(mode) {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._down_e = null;
        this._mode = mode;
    }
    pwg.inherits(RectangleFrameBuild, pwg.BaseBuild);
    RectangleFrameBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(pwg.Rectangle.classid, this._mode);
                this._creating.min.set(e);
            }
            this._down_e = e;
            return true;
        } else if (action == "move") {
            var creating = this._creating;
            if (creating) {
                creating._do_ui_handle_update(creating._maxp_handle, e);
                return true;
            }
        } else if (action == "up" || action == "post") {
            if (!this._down_e || this._down_e.pixel.equals(e.pixel)) {
                this.cancel();
            } else {
                return this.post();
            }
        }
    };
    RectangleFrameBuild.prototype.post = function () {
        if (this._creating) {
            var graphics0 = this._creating;
            graphics0.update();
            //the frame object always should be created in scene as a 2nd container object
            var frame = this._context.scene.createGraphics(FrameContainer.classid, this._mode, graphics0);
            graphics0._style.fillColor = "rgba(255,255,255,0.8)";
            if (this._mode == "pixel") {
                var e = {
                    global: graphics0.min.global
                };
                frame.location.set(e);
                graphics0.min.point = new pwg.point(0, 0);
                graphics0.max.mode = "local";
                graphics0._mode = 'local';
            } else {
                graphics0._min_location.point.xy = new pwg.point(graphics0._size).multiply(-0.5);
                var minp = graphics0._min_location.global;
                var maxp = graphics0._max_location.global;
                var p0 = minp.add(maxp).multiply(0.5);
                var e = {
                    global: p0
                };
                frame.location.set(e);
                minp = graphics0._min_location.pixel.clone();
                maxp = graphics0._max_location.pixel.clone();
                frame.update();
                minp = frame.getContext().pixelToLocal(minp);
                maxp = frame.getContext().pixelToLocal(maxp);
                graphics0.min.set(minp);
                graphics0.size.set(maxp.subtract(minp));
            }
            frame.__json_creator__ = "pwg.FrameContainer.creator";
            this._context.scene.addChild(frame);
            this._creating = null;
            return "stop";
        }
    };
    RectangleFrameBuild.prototype.cancel = function () {
        this._creating = null;
    };
    RectangleFrameBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    RectangleFrameBuild.prototype.render = function (context) {
        var drawing = context.drawing;
        if (this._creating) {
            this._creating.update();
            this._creating.render(drawing, "entity");
        }
    };
    pwg.graphics.registerBuild("局部坐标系(地理)", new RectangleFrameBuild('local'));
    pwg.graphics.registerBuild("局部坐标系(像素)", new RectangleFrameBuild('pixel'));
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
if (typeof pwg == "undefined")
    pwg = {};
if (!pwg.cad) {
    pwg.cad = function () {

        function render_line_string(vs, context, trs, drawing, style, closed) {
            var cc = context;

            drawing.begin();
            drawing.resetTransform();
            var width = style.strokeWidth;
            if (Array.isArray(trs)) {
                drawing.setTransform(trs[0], trs[1], trs[2], trs[3], trs[4], trs[5]);
                style.strokeWidth /= Math.max(Math.abs(trs[0]), Math.abs(trs[1]), Math.abs(trs[2]), Math.abs(trs[3]));
                trs = null;
            }
            drawing.styleApply(style);

            drawing.beginPath();
            if (trs) {
                var p0 = trs.transform(vs[0]);
                p0 = cc.globalToPixel(p0);
                drawing.moveTo(p0.x, p0.y);
                for (var i = 1, length = vs.length; i < length; i++) {
                    p0 = trs.transform(vs[i]);
                    p0 = cc.globalToPixel(p0);
                    drawing.lineTo(p0.x, p0.y);
                }
            } else {
                drawing.moveTo(vs[0][0], vs[0][1]);
                for (var i = 1, length = vs.length; i < length; i++) {
                    drawing.lineTo(vs[i][0], vs[i][1]);
                }
            }
            if (closed)
                drawing.closePath();
            if (style.hasFill())
                drawing.ctx.fill();
            if (style.hasStroke())
                drawing.ctx.stroke();

            style.strokeWidth = width;
            drawing.end();
        };

        function render_geometry(geometry, context, trs, drawing, style) {
            style = geometry.style || style;
            if (geometry.type.toUpperCase() == "LINESTRING") {
                render_line_string(geometry.coordinates, context, trs, drawing, style);
            } else if (geometry.type.toUpperCase() == "POLYGON" || geometry.type.toUpperCase() == "MULTILINESTRING") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    render_line_string(geometry.coordinates[i], context, trs, drawing, style, geometry.type == "POLYGON");
                }
            } else if (geometry.type.toUpperCase() == "MULTIPOLYGON") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    var polygon = geometry.coordinates[i];
                    for (var j = 0; j < polygon.length; j++)
                        render_line_string(polygon[i], context, trs, drawing, style, true);
                }
            }
        };


        function render_geometries(context, trs, drawing, geomertries, style) {
            for (var i = 0, length = geomertries.length; i < length; i++) {
                render_geometry(geomertries[i], context, trs, drawing, style);
            }
        }

        function AffineSolver(X, Y, XP, YP) {
            var AtoF = [];
            AtoF[0] = (XP[1] * Y[0] - XP[2] * Y[0] - XP[0] * Y[1] + XP[2] * Y[1] + XP[0] * Y[2] - XP[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);

            AtoF[1] = (XP[1] * X[0] - XP[2] * X[0] - XP[0] * X[1] + XP[2] * X[1] + XP[0] * X[2] - XP[1] * X[2]) /
                (-X[1] * Y[0] + X[2] * Y[0] + X[0] * Y[1] - X[2] * Y[1] - X[0] * Y[2] + X[1] * Y[2]);

            AtoF[2] = (YP[1] * Y[0] - YP[2] * Y[0] - YP[0] * Y[1] + YP[2] * Y[1] + YP[0] * Y[2] - YP[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);

            AtoF[3] = (YP[1] * X[0] - YP[2] * X[0] - YP[0] * X[1] + YP[2] * X[1] + YP[0] * X[2] - YP[1] * X[2]) /
                (-X[1] * Y[0] + X[2] * Y[0] + X[0] * Y[1] - X[2] * Y[1] - X[0] * Y[2] + X[1] * Y[2]);

            AtoF[4] = (XP[2] * X[1] * Y[0] - XP[1] * X[2] * Y[0] - XP[2] * X[0] * Y[1] + XP[0] * X[2] * Y[1] +
                    XP[1] * X[0] * Y[2] - XP[0] * X[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);

            AtoF[5] = (YP[2] * X[1] * Y[0] - YP[1] * X[2] * Y[0] - YP[2] * X[0] * Y[1] + YP[0] * X[2] * Y[1] + YP[1] * X[0] * Y[2] - YP[0] * X[1] * Y[2]) /
                (X[1] * Y[0] - X[2] * Y[0] - X[0] * Y[1] + X[2] * Y[1] + X[0] * Y[2] - X[1] * Y[2]);
            return AtoF;
        }

        function affineFrom3PS(p1, p2, p3, pp1, pp2, pp3) {
            var m = AffineSolver([p1.x, p2.x, p3.x], [p1.y, p2.y, p3.y], [pp1.x, pp2.x, pp3.x], [pp1.y, pp2.y, pp3.y])
            return [m[0], m[2], m[1], m[3], m[4], m[5]];
        }

        //////////////////////////////////////////////////////////////////

        function FrameCAD(container, id, mode) {
            pwg.super(this, pwg.Graphics, container, id);
            this.location_center = new pwg.AbsoluteLocation(this, "location.center", "global");
            this.location_top = new pwg.AbsoluteLocation(this, "location.top", "global");
            this.location_left = new pwg.AbsoluteLocation(this, "location.left", "global");
            this.location_bottom = new pwg.AbsoluteLocation(this, "location.bottom", "global");
            this.location_right = new pwg.AbsoluteLocation(this, "location.right", "global");
            this.locaiton_rotation = new pwg.AbsoluteLocation(this, "location.rotation", "global");

            this.location_lb = new pwg.AbsoluteLocation(this, "location.left-bottom", "global");
            this.location_rb = new pwg.AbsoluteLocation(this, "location.right-bottom", "global");
            this.location_rt = new pwg.AbsoluteLocation(this, "location.right-top", "global");
            this.location_lt = new pwg.AbsoluteLocation(this, "location.left-top", "global");


            this.handle_center = new pwg.UiHandle(this, "handle.move", "handle.center", "simple");
            this.handle_center.location = this.location_center;
            this.handle_top = new pwg.UiHandle(this, "handle.move", "handle.top", "simple");
            this.handle_top.location = this.location_top;
            this.handle_left = new pwg.UiHandle(this, "handle.move", "handle.left", "simple");
            this.handle_left.location = this.location_left;
            this.handle_bottom = new pwg.UiHandle(this, "handle.move", "handle.bottom", "simple");
            this.handle_bottom.location = this.location_bottom;
            this.handle_right = new pwg.UiHandle(this, "handle.move", "handle.right", "simple");
            this.handle_right.location = this.location_right;
            this.handle_rb = new pwg.UiHandle(this, "handle.move", "handle.rb", "simple");
            this.handle_rb.location = this.location_rb;
            this.handle_rotation = new pwg.UiHandle(this, "handle.rotation", "handle.rotation", "simple");
            this.handle_rotation.location = this.locaiton_rotation;

            this._frameTRS = new pwg.TRS();
            this._finalTRS = new pwg.TRS();;

            this.dataURL = "";
            this.graphics = null;
            this._offset0 = 0;
            this._size0 = 0;
            this._center = null;
            this._offset = new pwg.point(0, 0);
            this._size = new pwg.size(1, 1);
            this._scale = new pwg.point(1, 1);
            this._angle = 0;

            this._handles = [this.handle_center, this.handle_top, this.handle_left, this.handle_right, this.handle_bottom, this.handle_rb, this.handle_rotation];
            this._style = new paper.Style();
            this._style.strokeColor = 'red';
            this._style.strokeWidth = 1.0;
            this._style.fillColor = 'rgba(0,0,0,.01)';

            this._style_geometry_default = new paper.Style();
            this._style_geometry_default.strokeColor = 'yellow';
            this._style_geometry_default.strokeWidth = 1.0;
            this._style_geometry_default.fillColor = 'rgba(0,0,0,0.01)';
        }
        pwg.inherits(FrameCAD, pwg.Graphics);
        pwg.defineClassId(FrameCAD, "pwg.FrameCAD");

        FrameCAD.prototype.update = function () {
            this.location_center.update();
            this._center = this.location_center.global;
            var size = this._size;
            if (this.graphics)
                this._bounds = this.graphics.bounds ? this.graphics.bounds : this.graphics;
            else
                this._bounds = new pwg.rectangle(0, 0, size.width * 2, size.height * 2);
            this._offset0 = this._bounds.point;
            this._size0 = this._bounds.size;

            this._frameTRS.make(this._center, this._angle, 1);
            var trs = this._frameTRS;
            this.location_top.point = trs.transform(new pwg.point(0, size.height));
            this.location_top.update();
            this.location_left.point = trs.transform(new pwg.point(-size.width, 0));
            this.location_left.update();
            this.location_bottom.point = trs.transform(new pwg.point(0, -size.height));
            this.location_bottom.update();
            this.location_right.point = trs.transform(new pwg.point(size.width, 0));
            this.location_right.update();
            this.location_lb.point = trs.transform(new pwg.point(-size.width, -size.height));
            this.location_lb.update();
            this.location_rb.point = trs.transform(new pwg.point(size.width, -size.height));
            this.location_rb.update();
            this.location_rt.point = trs.transform(new pwg.point(size.width, size.height));
            this.location_rt.update();
            this.location_lt.point = trs.transform(new pwg.point(-size.width, size.height));
            this.location_lt.update();
            this.locaiton_rotation.point = trs.transform(new pwg.point(size.width * 1.05, 0));
            this.locaiton_rotation.update();

            this._scale = new pwg.point(size.width / this._size0.width * 2, size.height / this._size0.height * 2);
            this._finalTRS.make(this.location_lb.point, this._angle, this._scale, this._offset0);
            if (this.graphics && this.graphics.geomertries && !this.graphics.offset0) {
                this.graphics.offset0 = true;
            }
            this._vs = [this.location_lb.pixel, this.location_rb.pixel, this.location_rt.pixel, this.location_lt.pixel]
        }

        FrameCAD.prototype._do_ui_handle_update = function (handle, e) {
            if (handle == this.handle_center) {
                this.location_center.set(e);
                return true;
            } else if (handle == this.handle_left || handle == this.handle_right) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.width = Math.abs(p.x);
                return true;
            } else if (handle == this.handle_top || handle == this.handle_bottom) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.height = Math.abs(p.y);
                return true;
            } else if (handle == this.handle_rb) {
                var p = this._frameTRS.I.transform(e.global);
                var size = this._size;
                var sizeP = new pwg.point(size.width, size.height);
                sizeP = sizeP.normalize();
                sizeP = sizeP.multiply(p.length);
                this._size.width = sizeP.x;
                this._size.height = sizeP.y;
                return true;
            } else if (handle == this.handle_rotation) {
                var pp = e.global.subtract(this._center);
                this._angle = pp.getAngle();
                return true;
            } else
                return false;
        };

        FrameCAD.prototype.hitTest = function (e, options) {
            var p = e.global;
            p = this._frameTRS.I.transform(p);
            if (p.x >= -this._size.width && p.y >= -this._size.height && p.x < this._size.width && p.y < this._size.height) {
                pwg.cad.currentFrame = this;
                return {
                    succeed: true,
                    distance: 0,
                    object: this
                };
            } else
                return null;
        };


        FrameCAD.prototype.render = function (drawing, pass) {
            if (pass == "entity" || pass == "mini") { //TODO:prepare
                var vs = this._vs;
                var cc = this.getContainerContext();

                drawing.begin();
                drawing.resetTransform();
                drawing.styleApply(this._style);

                drawing.beginPath();
                drawing.moveTo(vs[0]);
                drawing.lineTo(vs[1]);
                drawing.lineTo(vs[2]);
                drawing.lineTo(vs[3]);
                drawing.closePath();

                if (this._style.hasFill())
                    drawing.ctx.fill();
                if (this._style.hasStroke())
                    drawing.ctx.stroke();
                drawing.end();

                if (this.graphics && this.graphics.geometries) {
                    var geometries = this.graphics.geometries;
                    if (!this.graphics.offset0) {
                        var offset0 = this._offset0;

                        function tx(coords) {
                            for (var i = 0, length = coords.length; i < length; i++) {
                                coords[i][0] -= offset0.x;
                                coords[i][1] -= offset0.y;
                            }
                        }
                        var transform = {
                            transformCoordinates: tx
                        };
                        for (var i = 0; i < geometries.length; i++) {
                            transformGeometry(geometries[i], transform);
                        }
                        this.graphics.offset0 = true;
                    }
                    var trs = new pwg.TRS();
                    trs.make(this._offset, this._angle, this._scale);
                    var p0 = new pwg.point(0, 0);
                    var pp0 = cc.globalToPixel(trs.transform(p0));
                    var p1 = p0.add(this._size0.width, 0);
                    var pp1 = cc.globalToPixel(trs.transform(p1));
                    var p2 = p0.add(this._size0.width / 2, this._size0.height);
                    var pp2 = cc.globalToPixel(trs.transform(p2));
                    trs = affineFrom3PS(p0, p1, p2, pp0, pp1, pp2);
                    render_geometries(cc, trs, drawing, geometries, this._style_geometry_default);
                }
            }
        };
        pwg.defineClassProperties(FrameCAD, {
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

        FrameCAD.prototype.__save__ = function (json) {
            json = pwg.Graphics.prototype.__save__.call(this, json);
            //json.location = this._min_location.__save__();
            // json.size = pwg.json.formats[pwg.size].save(this._size);
            // json.style = pwg.json.formats[pwg.style].save(this._style);
            json.__json_creator__ = "pwg.FrameCAD.creator";
            return json;
        };

        FrameCAD.prototype.__load__ = function (json, context) {
            pwg.Graphics.prototype.__load__.call(this, json, context);
            // this._min_location.__load__(json.location, context);
            // pwg.json.formats[pwg.size].load(json.size, this._size);
            // pwg.json.formats[pwg.style].load(json.style, this._style);
        };

        FrameCAD.prototype.transformCoordinates = function (coordinates) {
            var cc = this.getContainerContext();
            var trs = this._finalTRS;
            for (var i = 0; i < coordinates.length; i++) {
                var pp = coordinates[i];
                var p0 = trs.transform(pp);
                p0 = cc.globalToLonlat(p0);
                pp[0] = p0.x;
                pp[1] = p0.y;
            }
            return coordinates;
        }
        FrameCAD.prototype.transformData = function () {
            var trs = this._finalTRS;
            var p0 = this._offset0;
            var size0 = this._size0;
            var pp0 = trs.transform(p0);
            var p1 = p0.add(size0.width, 0);
            var pp1 = trs.transform(p1);
            var p2 = p0.add(size0.width, size0.height);
            var pp2 = trs.transform(p2);
            var p3 = p0.add(0, size0.height);
            var pp3 = trs.transform(p3);

            return ([
                p0.x, p0.y, pp0.x, pp0.y,
                p1.x, p1.y, pp1.x, pp1.y,
                p2.x, p2.y, pp2.x, pp2.y,
                p3.x, p3.y, pp3.x, pp3.y
            ]);
        }

        pwg.json.registerCreator("pwg.FrameCAD.creator", function (container, id, json) {
            return new FrameCAD(container, id, json.lxmode, json.szmode);
        });

        pwg.registerClass(FrameCAD);
        pwg.FrameCAD = FrameCAD;

        ///////////////////////////////////////////////////////////////
        function FrameCADBuild(mode) {
            pwg.super(this, pwg.BaseBuild, "simple");
            this._mode = mode;
        }
        pwg.inherits(FrameCADBuild, pwg.BaseBuild);
        FrameCADBuild.prototype.update = function (e, action) {
            if (action == "down") {
                if (this._creating == null) {
                    this._creating = this._context.container.createGraphics(FrameCAD.classid, "local", this._mode);
                    this.point0 = e.global;
                    this._creating.location_center.set(e);
                    this._creating._size = new pwg.size(0, 0);
                    this._creating._style.strokeColor = 'red';
                    this._creating._style.strokeWidth = 2;
                    this._creating._style.dasharray = [10, 4, 10, 4];
                    //this._creating.graphics = new pwg.rectangle(0, 0, 1, 1);
                    this._creating.update();
                }
                return true;
            } else if (action == "move") {
                var creating = this._creating;
                if (creating) {
                    var size = e.global.subtract(this.point0);
                    var center = this.point0.add(e.global).divide(2);
                    size = size.divide(2);
                    this._creating.location_center.point = center;
                    this._creating._size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    //this._creating.update();
                    return true;
                }
            } else if (action == "up" || action == "post") {
                var creating = this._creating;
                if (creating) {
                    creating._style.strokeColor = 'red';
                    creating._style.strokeWidth = 2;
                    creating._style.dasharray = [];

                    var size = e.global.subtract(this.point0);
                    var center = this.point0.add(e.global).divide(2);
                    size = size.divide(2);
                    this._creating.location_center.point = center;
                    this._creating._size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    //this._creating.update();
                    this.post();
                }
            }
        };
        FrameCADBuild.prototype.post = function () {
            if (this._creating) {
                pwg.cad.currentFrame = this._creating;
                this._creating.graphics = pwg.cad.currentGraphics;
                this._context.container.addChild(this._creating);
                this._creating = null;
            }
        };
        FrameCADBuild.prototype.cancel = function () {
            this._creating = null;
        };
        FrameCADBuild.prototype.getLocationMode = function () {
            return "joint";
        };
        FrameCADBuild.prototype.render = function (context) {
            var drawing = context.drawing;
            if (this._creating) {
                this._creating.update();
                this._creating.render(drawing, "entity");
            }
        };
        pwg.graphics.registerBuild("FrameCAD", new FrameCADBuild("global"));

        ///////////////////////////////////////////////////////////////////////////
        function FrameCADL(container, id, mode) {
            pwg.super(this, pwg.Graphics, container, id);
            this.location_offset = new pwg.AbsoluteLocation(this, "location.offset", "global");
            this.location_center = new pwg.AbsoluteLocation(this, "location.center", "global");
            this.location_top = new pwg.AbsoluteLocation(this, "location.top", "global");
            this.location_left = new pwg.AbsoluteLocation(this, "location.left", "global");
            this.location_bottom = new pwg.AbsoluteLocation(this, "location.bottom", "global");
            this.location_right = new pwg.AbsoluteLocation(this, "location.right", "global");
            this.locaiton_rotation = new pwg.AbsoluteLocation(this, "location.rotation", "global");
            this.locaiton_rotation2 = new pwg.AbsoluteLocation(this, "location.rotation2", "global");

            this.location_lb = new pwg.AbsoluteLocation(this, "location.left-bottom", "global");
            this.location_rb = new pwg.AbsoluteLocation(this, "location.right-bottom", "global");
            this.location_rt = new pwg.AbsoluteLocation(this, "location.right-top", "global");
            this.location_lt = new pwg.AbsoluteLocation(this, "location.left-top", "global");

            this.handle_offset = new pwg.UiHandle(this, "handle.move", "handle.offset", "simple");
            this.handle_offset.location = this.location_offset;

            this.handle_center = new pwg.UiHandle(this, "handle.move", "handle.center", "simple");
            this.handle_center.location = this.location_center;

            this.handle_top = new pwg.UiHandle(this, "handle.move", "handle.top", "simple");
            this.handle_top.location = this.location_top;
            this.handle_left = new pwg.UiHandle(this, "handle.move", "handle.left", "simple");
            this.handle_left.location = this.location_left;
            this.handle_bottom = new pwg.UiHandle(this, "handle.move", "handle.bottom", "simple");
            this.handle_bottom.location = this.location_bottom;
            this.handle_right = new pwg.UiHandle(this, "handle.move", "handle.right", "simple");
            this.handle_right.location = this.location_right;

            this.handle_rt = new pwg.UiHandle(this, "handle.move", "handle.rt", "simple");
            this.handle_rt.location = this.location_rt;
            this.handle_rb = new pwg.UiHandle(this, "handle.move", "handle.rb", "simple");
            this.handle_rb.location = this.location_rb;
            this.handle_lt = new pwg.UiHandle(this, "handle.move", "handle.lt", "simple");
            this.handle_lt.location = this.location_lt;

            this.handle_rotation = new pwg.UiHandle(this, "handle.rotation", "handle.rotation", "simple");
            this.handle_rotation.location = this.locaiton_rotation;
            this.handle_rotation2 = new pwg.UiHandle(this, "handle.rotation", "handle.rotation2", "simple");
            this.handle_rotation2.location = this.locaiton_rotation2;


            this._frameTRS = new pwg.TRS();
            this._finalTRS = new pwg.TRS();;

            this.dataURL = "";
            this.graphics = null;
            this._offset0 = 0;
            this._size0 = 0;
            this._offset = new pwg.point(0, 0);
            this._size = new pwg.size(1, 1);
            this._scale = new pwg.point(1, 1);
            this._angle = 0;

            this._handles = [this.handle_offset, this.handle_center, this.handle_top, this.handle_right, this.handle_left, this.handle_bottom, this.handle_rt, this.handle_rb, this.handle_lt, this.handle_rotation, this.handle_rotation2];
            this._style = new paper.Style();
            this._style.strokeColor = 'red';
            this._style.strokeWidth = 1.0;
            this._style.fillColor = 'rgba(0,0,0,.01)';

            this._style_geometry_default = new paper.Style();
            this._style_geometry_default.strokeColor = 'yellow';
            this._style_geometry_default.strokeWidth = 1.0;
            this._style_geometry_default.fillColor = 'rgba(0,0,0,0.01)';
        }
        pwg.inherits(FrameCADL, pwg.Graphics);
        pwg.defineClassId(FrameCADL, "pwg.FrameCADL");

        FrameCADL.prototype.update = function () {
            this.location_offset.update();
            this._offset = this.location_offset.global;
            var size = this._size;
            if (this.graphics)
                this._bounds = this.graphics.bounds ? this.graphics.bounds : this.graphics;
            else
                this._bounds = new pwg.rectangle(0, 0, size.width * 2, size.height * 2);
            this._offset0 = this._bounds.point;
            this._size0 = this._bounds.size;

            this._frameTRS.make(this._offset, this._angle, 1);
            var trs = this._frameTRS;
            this.location_top.point = trs.transform(new pwg.point(size.width / 2, size.height));
            this.location_top.update();
            this.location_left.point = trs.transform(new pwg.point(0, size.height / 2));
            this.location_left.update();
            this.location_bottom.point = trs.transform(new pwg.point(size.width / 2, 0));
            this.location_bottom.update();
            this.location_right.point = trs.transform(new pwg.point(size.width, size.height / 2));
            this.location_right.update();

            this.location_center.point = trs.transform(new pwg.point(size.width / 2, size.height / 2));
            this.location_center.update();

            this.location_lb = this.location_offset;

            this.location_rb.point = trs.transform(new pwg.point(size.width, 0));
            this.location_rb.update();
            this.location_rt.point = trs.transform(new pwg.point(size.width, size.height));
            this.location_rt.update();
            this.location_lt.point = trs.transform(new pwg.point(0, size.height));
            this.location_lt.update();

            this.locaiton_rotation.point = trs.transform(new pwg.point(size.width * 1.05, 0));
            this.locaiton_rotation.update();
            this.locaiton_rotation2.point = trs.transform(new pwg.point(size.width * 1.05, size.height / 2));
            this.locaiton_rotation2.update();

            this._scale = new pwg.point(size.width / this._size0.width, size.height / this._size0.height);
            this._finalTRS.make(this.location_lb.point, this._angle, this._scale, this._offset0);
            this._vs = [this.location_lb.pixel, this.location_rb.pixel, this.location_rt.pixel, this.location_lt.pixel]
        }
        const size_ratio_reserved = true;
        FrameCADL.prototype._do_ui_handle_update = function (handle, e) {
            if (handle == this.handle_offset) {
                // this.location_offset.set(e);
                // return true;
                if (size_ratio_reserved) {
                    var p0 = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeO = new pwg.point(size.width, size.height);
                    var p = sizeO.subtract(p0);
                    var sizeN = sizeO.normalize();
                    var sizeA = sizeN.multiply(p.length);
                    this._size = new pwg.size(sizeA.x, sizeA.y);
                    var sizeB = sizeN.multiply(sizeO.length - p.length);
                    var offset = this._frameTRS.M.transform(sizeB);
                    this.location_offset.point = offset;
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    //sizeP = sizeP.normalize();
                    //sizeP = sizeP.multiply(p.length);
                    this._size = size.subtract(p);
                    this.location_offset.set(e);
                }
                return true;
            } else if (handle == this.handle_center) {
                var pc = this._frameTRS.M.transform(new pwg.point(this._size.width / 2, this._size.height / 2));
                var po = this._frameTRS.M.transform(new pwg.point(0, 0));
                var dp = po.subtract(pc);
                var offset = e.global.add(dp);
                this.location_offset.point = offset;
                return true;
            } else if (handle == this.handle_right) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.width = Math.abs(p.x);
                return true;
            } else if (handle == this.handle_left) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.width -= p.x; //Math.abs(p.x);
                p = this._frameTRS.M.transform(new pwg.point(-p.x, 0));
                p = p.subtract(this._offset);
                p = this._offset.subtract(p);
                this.location_offset.point = p;
                return true;
            } else if (handle == this.handle_bottom) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.height -= p.y; //Math.abs(p.x);
                p = this._frameTRS.M.transform(new pwg.point(0, -p.y));
                p = p.subtract(this._offset);
                p = this._offset.subtract(p);
                this.location_offset.point = p;
                return true;
            } else if (handle == this.handle_top) {
                var p = this._frameTRS.I.transform(e.global);
                this._size.height = Math.abs(p.y);
                return true;
            } else if (handle == this.handle_rt) {
                if (size_ratio_reserved) {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeP = new pwg.point(size.width, size.height);
                    sizeP = sizeP.normalize();
                    sizeP = sizeP.multiply(p.length);
                    this._size.width = sizeP.x;
                    this._size.height = sizeP.y;
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    this._size.width = p.x;
                    this._size.height = p.y;
                }
                return true;
            } else if (handle == this.handle_rb) {
                if (size_ratio_reserved) {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var pp = new pwg.point(p.x, size.height - p.y);
                    var sizeO = new pwg.point(size.width, size.height);
                    var sizeA = sizeO.normalize().multiply(pp.length);
                    this._size = new pwg.size(sizeA.x, sizeA.y);
                    var offset = new pwg.point(0, size.height - sizeA.y);
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeP = new pwg.point(p.x, size.height - p.y);
                    var offset = new pwg.point(0, p.y);
                    //offset = this._frameTRS.M.transform(offset);
                    this._size.width = sizeP.x;
                    this._size.height = sizeP.y;
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                }
                return true;
            } else if (handle == this.handle_lt) {
                if (size_ratio_reserved) {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var pp = new pwg.point(size.width - p.x, p.y);
                    var sizeO = new pwg.point(size.width, size.height);
                    var sizeA = sizeO.normalize().multiply(pp.length);
                    this._size = new pwg.size(sizeA.x, sizeA.y);
                    var offset = new pwg.point(size.width - sizeA.x, 0);
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                } else {
                    var p = this._frameTRS.I.transform(e.global);
                    var size = this._size;
                    var sizeP = new pwg.point(size.width - p.x, p.y);
                    var offset = new pwg.point(p.x, 0);
                    this._size.width = sizeP.x;
                    this._size.height = sizeP.y;
                    this.location_offset.point = this._frameTRS.M.transform(offset);
                }
                return true;
            } else if (handle == this.handle_rotation) {
                var pp = e.global.subtract(this._offset);
                this._angle = pp.getAngle();
                return true;
            } else if (handle == this.handle_rotation2) {
                var pp = e.global.subtract(this.location_center.point);
                this._angle = pp.getAngle();
                var tmpTRS = new pwg.TRS();
                tmpTRS.make(this.location_center.point, this._angle, 1);
                var pp = tmpTRS.M.transform(new pwg.point(-this._size.width / 2, -this._size.height / 2));
                this.location_offset.point = pp;
                return true;
            } else
                return false;
        };

        FrameCADL.prototype.hitTest = function (e, options) {
            var p = e.global;
            p = this._frameTRS.I.transform(p);
            if (p.x >= 0 && p.y >= 0 && p.x < this._size.width && p.y < this._size.height) {
                pwg.cad.currentFrame = this;
                return {
                    succeed: true,
                    distance: 0,
                    object: this
                };
            } else
                return null;
        };
        pwg.cad.offset_auto_remove = true;
        pwg.cad.use_h5_transform = true;

        FrameCADL.prototype.render = function (drawing, pass) {
            if (pass == "entity" || pass == "mini") { //TODO:prepare
                var vs = this._vs;
                var cc = this.getContainerContext();

                drawing.begin();
                drawing.resetTransform();
                drawing.styleApply(this._style);

                drawing.beginPath();
                drawing.moveTo(vs[0]);
                drawing.lineTo(vs[1]);
                drawing.lineTo(vs[2]);
                drawing.lineTo(vs[3]);
                drawing.closePath();

                if (this._style.hasFill())
                    drawing.ctx.fill();
                if (this._style.hasStroke())
                    drawing.ctx.stroke();
                drawing.end();

                if (this.graphics && this.graphics.geometries) {
                    var geometries = this.graphics.geometries;
                    if (!this.graphics.offset0 && pwg.cad.offset_auto_remove) {
                        var offset0 = this._offset0;

                        function tx(coords) {
                            for (var i = 0, length = coords.length; i < length; i++) {
                                coords[i][0] -= offset0.x;
                                coords[i][1] -= offset0.y;
                            }
                        }
                        var transform = {
                            transformCoordinates: tx
                        };
                        for (var i = 0; i < geometries.length; i++) {
                            transformGeometry(geometries[i], transform);
                        }
                        this.graphics.offset0 = true;
                    }
                    var trs;
                    if (pwg.cad.offset_auto_remove) {
                        trs = new pwg.TRS();
                        trs.make(this._offset, this._angle, this._scale);
                    } else {
                        trs = this._finalTRS;
                    }
                    var p0 = new pwg.point(0, 0);
                    var pp0 = cc.globalToPixel(trs.transform(p0));
                    var p1 = p0.add(this._size0.width, 0);
                    var pp1 = cc.globalToPixel(trs.transform(p1));
                    var p2 = p0.add(this._size0.width / 2, this._size0.height);
                    var pp2 = cc.globalToPixel(trs.transform(p2));
                    if (pwg.cad.use_h5_transform)
                        trs = affineFrom3PS(p0, p1, p2, pp0, pp1, pp2);
                    render_geometries(cc, trs, drawing, geometries, this._style_geometry_default);
                }
            }
        };
        pwg.defineClassProperties(FrameCADL, {
            "offset": {
                get: function () {
                    return this.location_offset.point;
                },
                set: function (offset) {
                    this.location_offset.point = offset;
                }
            },
            "size": {
                get: function () {
                    return this._size;
                },
                set: function (sz) {
                    this._size = new pwg.size(sz);
                }
            },

            "angle": {
                get: function () {
                    return this._angle;
                },

                set: function (a) {
                    this._angle = a;
                },
            },
            "mode": {
                get: function () {
                    return this._mode;
                }
            }
        });

        FrameCADL.prototype.__save__ = function (json) {
            json = pwg.Graphics.prototype.__save__.call(this, json);
            //json.location = this._min_location.__save__();
            // json.size = pwg.json.formats[pwg.size].save(this._size);
            // json.style = pwg.json.formats[pwg.style].save(this._style);
            json.__json_creator__ = "pwg.FrameCADL.creator";
            return json;
        };

        FrameCADL.prototype.__load__ = function (json, context) {
            pwg.Graphics.prototype.__load__.call(this, json, context);
            // this._min_location.__load__(json.location, context);
            // pwg.json.formats[pwg.size].load(json.size, this._size);
            // pwg.json.formats[pwg.style].load(json.style, this._style);
        };

        FrameCADL.prototype.transformCoordinates = function (coordinates) {
            var cc = this.getContainerContext();
            var trs = this._finalTRS;
            for (var i = 0; i < coordinates.length; i++) {
                var pp = coordinates[i];
                var p0 = trs.transform(pp);
                p0 = cc.globalToLonlat(p0);
                pp[0] = p0.x;
                pp[1] = p0.y;
            }
            return coordinates;
        }
        FrameCADL.prototype.transformData = function () {
            var trs = this._finalTRS;
            var p0 = this._offset0;
            var size0 = this._size0;
            var pp0 = trs.transform(p0);
            var p1 = p0.add(size0.width, 0);
            var pp1 = trs.transform(p1);
            var p2 = p0.add(size0.width, size0.height);
            var pp2 = trs.transform(p2);
            var p3 = p0.add(0, size0.height);
            var pp3 = trs.transform(p3);

            return ([
                p0.x, p0.y, pp0.x, pp0.y,
                p1.x, p1.y, pp1.x, pp1.y,
                p2.x, p2.y, pp2.x, pp2.y,
                p3.x, p3.y, pp3.x, pp3.y
            ]);
        }

        pwg.json.registerCreator("pwg.FrameCADL.creator", function (container, id, json) {
            return new FrameCADL(container, id, json.lxmode, json.szmode);
        });

        pwg.registerClass(FrameCADL);
        pwg.FrameCADL = FrameCADL;

        ///////////////////////////////////////////////////////////////
        function FrameCADLBuild(mode) {
            pwg.super(this, pwg.BaseBuild, "simple");
            this._mode = mode;
        }
        pwg.inherits(FrameCADLBuild, pwg.BaseBuild);
        FrameCADLBuild.prototype.update = function (e, action) {
            if (action == "down") {
                if (this._creating == null) {
                    this._creating = this._context.container.createGraphics(FrameCADL.classid, "local", this._mode);
                    this.point0 = e.global;
                    this._creating.location_offset.set(e);
                    this._creating._size = new pwg.size(0, 0);
                    this._creating._style.strokeColor = 'red';
                    this._creating._style.strokeWidth = 2;
                    this._creating._style.dasharray = [10, 4, 10, 4];
                    //this._creating.graphics = new pwg.rectangle(0, 0, 1, 1);
                    this._creating.update();
                }
                return true;
            } else if (action == "move") {
                var creating = this._creating;
                if (creating) {
                    var nowp = e.global;
                    var size = nowp.subtract(this.point0);
                    size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    var offset = new pwg.point(Math.min(this.point0.x, nowp.x), Math.min(this.point0.y, nowp.y));
                    this._creating.location_offset.point = offset;
                    this._creating._size = size;
                    this._creating.update();
                    return true;
                }
            } else if (action == "up" || action == "post") {
                var creating = this._creating;
                if (creating) {
                    creating._style.strokeColor = 'red';
                    creating._style.strokeWidth = 2;
                    creating._style.dasharray = [];

                    var nowp = e.global;
                    var size = nowp.subtract(this.point0);
                    size = new pwg.size(Math.abs(size.x), Math.abs(size.y));
                    var offset = new pwg.point(Math.min(this.point0.x, nowp.x), Math.min(this.point0.y, nowp.y));
                    this._creating.location_offset.point = offset;
                    this._creating._size = size;
                    this.post();
                }
            }
        };
        FrameCADLBuild.prototype.post = function () {
            if (this._creating) {
                pwg.cad.currentFrame = this._creating;
                this._creating.graphics = pwg.cad.currentGraphics;
                this._context.container.addChild(this._creating);
                this._creating = null;
            }
        };
        FrameCADLBuild.prototype.cancel = function () {
            this._creating = null;
        };
        FrameCADLBuild.prototype.getLocationMode = function () {
            return "joint";
        };
        FrameCADLBuild.prototype.render = function (context) {
            var drawing = context.drawing;
            if (this._creating) {
                this._creating.update();
                this._creating.render(drawing, "entity");
            }
        };
        pwg.graphics.registerBuild("FrameCADL", new FrameCADLBuild("global"));

        function OutlinesFind() {
            this.outlines = [];
            this.insertLine = function (line) {
                var outlines = this.outlines;
                if (outlines.length < 4) {
                    outlines.push(line);
                } else {
                    for (var i = 0; i < 4; i++) {
                        if (line.length > outlines[i].length) {
                            line1 = outlines[i];
                            outlines[i] = line;
                            line = line1;
                        }
                    }
                }
            }
            this.insertGeometry = function (geometry) {
                var points = null;
                if (geometry.type == "LineString")
                    points = geometry.coordinates;
                if (geometry.type == "Polygon")
                    points = geometry.coordinates[0];
                if (points.length < 6) {
                    var p1 = points[0];
                    var p2 = points[1];
                    var E = 0.0001;
                    if (Math.abs(p1[0] - p2[0]) < E || Math.abs(p1[1] - p2[1]) < E) {
                        this.insertLine(new pwg.line(p1[0], p1[1], p2[0], p2[1]));
                    }

                    if (points.length > 2) {
                        p1 = points[1];
                        p2 = points[2];
                        if (Math.abs(p1[0] - p2[0]) < E || Math.abs(p1[1] - p2[1]) < E) {
                            this.insertLine(new pwg.line(p1[0], p1[1], p2[0], p2[1]));
                        }
                    }
                }
            }
            this.bounds = function () {
                var outlines = this.outlines;
                var l = outlines[0];
                var rc = new pwg.rectangle(l.point, new pwg.size(1, 1));
                rc = rc.include(l.point.add(l.vector));
                for (var i = 1; i < this.outlines.length; i++) {
                    var l = outlines[i];
                    rc = rc.include(l.point);
                    rc = rc.include(l.point.add(l.vector));
                }
                return rc;
            }
        }

        pwg.cad.OutlinesFind = OutlinesFind;

        function transformGeometry(geometry, transform) {
            if (geometry.type.toUpperCase() == "LINESTRING") {
                transform.transformCoordinates(geometry.coordinates);
            } else if (geometry.type.toUpperCase() == "POLYGON" || geometry.type.toUpperCase() == "MULTILINESTRING") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    transform.transformCoordinates(geometry.coordinates[i]);
                }
            } else if (geometry.type.toUpperCase() == "MULTIPOLYGON") {
                var length = geometry.coordinates.length;
                for (var i = 0; i < length; i++) {
                    var polygon = geometry.coordinates[i];
                    for (var j = 0; j < polygon.length; j++)
                        transform.transformCoordinates(polygon[j])
                }
            }
        }
        pwg.cad.transformGeometry = transformGeometry;
        pwg.cad.createFrameL=function(container,id,offset,angle,size,graphics)
        {
            var cad = new pwg.FrameCADL(container,id,"global");
            cad.offset =offset;
            cad.size = size;
            cad.angle = angle;
            cad.graphics = graphics;
            return cad;
        }
    }
}


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
/*
    pwg-route.js
*/
if (typeof pwg == "undefined")
    pwg = {};
if (typeof pwg.graphics == "undefined")
    pwg.graphics = {};
pwg.route = function () {
    /////////////////////////////////////////////////////////////////
    pwg.cpoint = paper.Segment;
    /////////////////////////////////////////////////////////////////
    // RouteJoint:提供线路的连接点(线),依附于设备存在                        //
    /////////////////////////////////////////////////////////////////
    //mode=point|point+|cpoint|cpoint+|break x代表可以连接多根线 ponitx cpointx
    function RouteJoint(mode) {
        this.mode = pwg.defaultValue(mode, "point");
        this.outline = null; //use RouteJoint
        this._route_ = this._is_x_mode() ? [] : null;
    }
    pwg.inherits(RouteJoint, pwg.Object);
    RouteJoint.prototype._is_x_mode = function () {
        var mode = this.mode;
        return (mode == "pointx" || mode == "cpointx");
    };
    RouteJoint.prototype._is_availabe = function () {
        return this._is_x_mode() || this._outline == null;
    };
    RouteJoint.prototype.tryDetachRoute = function (ru) {
        if (this._is_x_mode()) {
            var ip = 0;
            if ((ip = this._route_.indexOf(ru)) != -1) {
                delete this._route_[ip]; //!
                return true;
            } else {
                return false;
            }
        } else {
            if (this._route_ == ru) {
                this._route_ = null;
                return true;
            } else {
                return false;
            }
        }
    };
    RouteJoint.prototype.tryAttachRoute = function (ru) {
        if (!this._is_availabe())
            return false;
        if (this._is_x_mode()) {
            var i = this._route_.indexOf(undefined);
            if (i != -1) {
                this._route_[i] = ru;
            } else {
                this._route_.push(ru);
            }
        } else {
            this._route_ = ru;
        }
        return true;
    };
    RouteJoint.prototype.getDistance = function (p) {
        //TODO:处理其他的情况
        if (this.mode != "point")
            return 0;
        if (p.pxiel)
            p = pixel;
        return this._outline.getDistance(p);
    };
    pwg.RouteJoint = RouteJoint;
    pwg.graphics.RouteJoint = RouteJoint;
    pwg.Joint = RouteJoint;
    /////////////////////////////////////////////////
    function Route(container, id, options) {
        pwg.super(this, pwg.Group, container, id);
        this._locations = [];
        this._runtime_outline_ = null;
        this._first_line = null;
        this._last_line = null;
        this._add_head_handle = new pwg.UiHandle(this, "handle.add", "joint.add-head", "continuous");
        this._add_head_handle.locationMode = "joint";
        this._add_tail_handle = new pwg.UiHandle(this, "handle.add", "joint.add-tail", "continuous");
        this._add_tail_handle.locationMode = "joint";
        this._handle_move_insert = new pwg.UiHandle(this, "handle.move", "", "simple");
        this._handle_move_insert.locationMode = "joint";
        this._handles = [this._add_head_handle, this._add_tail_handle];
        this._route_locations = [];
        this._style = options.style ? pwg.styles.get(options.style) : pwg.styles.get("route.default");
        this.xdata = options.xdata;
        this._annotation = new pwg.AlineAnnotation(container, "__inline__");
        this._annotation.owner = this;
        this._annotation.text = "$owner.text";
    }
    pwg.inherits(Route, pwg.Group);
    pwg.defineClassId(Route, 'pwg.Route');
    pwg.defineClassProperty(Route, "locations", {
        get: function () {
            return this._locations;
        }
    });
    pwg.defineClassProperty(Route, "text", {
        get: function () {
            return this.id;
        }
    });

    function _make_locations_to_outline_(locations, context) { //TODO:优化以便更好的实现
        var outlines = [];
        var outline = [];
        for (var i = 0, l = locations.length; i < l; i++) {
            var loc = locations[i];
            var joint = loc.joint;
            if (!joint || !joint.outline) {
                outline.push(loc.pixel);
            } else {
                var jline = joint.outline;
                if (joint.mode == "point") {
                    outline.push(jline);
                } else
                if (joint.mode == "break") {
                    outline.push(jline[0]);
                    outlines.push(outline);
                    outline = [jline[1]];
                } else {
                    //TODO:
                }
            }
        }
        outlines.push(outline);
        return outlines;
    }

    function find_annotation_point(locations, vbbx) {
        var D = 0,
            I = -1;
        var C = 0,
            J = -1;
        var isRectCollided = pwg.math.isRectCollided;
        var vminp = pwg.point.min(vbbx.topLeft, vbbx.bottomRight);
        var vmaxp = pwg.point.max(vbbx.topLeft, vbbx.bottomRight);
        for (var i = 0, l = locations.length - 1; i < l; i++) {
            var head = locations[i];
            var tail = locations[i + 1];
            if (!head.joint || head.joint.mode == "point") //TODO:other joint type
            {
                var p1 = head.pixel;
                var p2 = tail.pixel;
                var minp = pwg.point.min(p1, p2);
                var maxp = pwg.point.max(p1, p2);

                var d = p1.getDistance(p2);
                if (d > D) {
                    D = d;
                    I = i;
                }
                if (isRectCollided(vminp, vmaxp, minp, maxp)) {
                    if (d > C) {
                        C = d;
                        J = i;
                    }
                }
            }
        }
        return J == -1 ? I : J;
    }

    Route.prototype.update = function () {
        this._runtime_outline_ = _make_locations_to_outline_(this._locations, this.getContainerContext());
        if (this._active_ui_handle != this._add_head_handle) {
            this._add_head_handle.location.point = pwg.last(this._locations).pixel;
            this._add_head_handle.location.update();
        }
        if (this._active_ui_handle != this._add_tail_handle) {
            this._add_tail_handle.location.point = pwg.first(this._locations).pixel;
            this._add_tail_handle.location.update();
        }
        this._route_locations.forEach(it => it.update());
        if (this._active_ui_handle)
            this._active_ui_handle.location.update();
        var vp = this.getContainerContext().viewport;
        var i = find_annotation_point(this._locations, vp);
        if (i == -1) {
            i = Math.floor(this._locations.length / 2);
        }
        if (i != -1 && this._locations.length>1) {
            var start = this._locations[i];
            var end = this._locations[i + 1];
            this._annotation._start = start;
            this._annotation._end = end;
            this._annotation.update();
        }
    };

    Route.prototype.add = function (location, iloc) {
        var locations = this._locations;
        if (!pwg.defined(iloc)) {
            locations.push(location);
        } else {
            if (iloc == -1) {
                locations.unshift(location);
            } else {
                locations.splice(iloc, 0, location);
            }
        }
        location.use();
        if (this.owner)
            this.owner.raiseEvent("location-mode-changed", {
                route: this,
                location: location
            });
    };

    Route.prototype.remove = function (iloc) {
        var locations = this._locations;
        var location = locations[iloc];
        locations.splice(iloc, 1);
        location.release();
        if (this.owner)
            this.owner.raiseEvent("location-mode-changed", {
                route: this,
                location: location
            });
    };

    Route.prototype._get_handles = function () {
        if (this._annotation._visibility) {
            return this._handles;
        } else {
            return this._handles.concat(this._annotation._handles[2]);
        }
    };

    Route.prototype.tryGetUiHandle = function (e) {
        var locations = this._locations;
        var I = find_route_break_point(this._locations, e.pixel);
        if (I) {
            var handle = this._handle_move_insert;
            if (I.t < 0.1) {
                handle.id = "joint.move";
                handle.iloc = I.i + 1;
            } else if (I.t > 0.9) {
                handle.id = "joint.move";
                handle.iloc = I.i;
            } else {
                handle.id = "joint.insert";
                handle.iloc = I.i;
            }
            return handle;
        } else {
            return null;
        }
    };
    Route.prototype._do_ui_handle_begin = function (handle) {
        this._active_ui_handle = handle;
    };
    Route.prototype._do_ui_handle_update = function (handle, e, action) {
        if (action == "update") {
            handle.location.set(e);
        } else if (action == "post") {
            if (!e.location) {
                if (handle.id == "joint.move")
                    this.remove(handle.iloc);
                return;
            }
            if (handle.id == "joint.add-tail") {
                this.add(e.location, -1);
            } else if (handle.id == "joint.add-head") {
                this.add(e.location);
            } else if (handle.id == "joint.insert") {
                this.add(e.location, handle.iloc + 1);
            } else if (handle.id == "joint.move") {
                if (this._locations[handle.iloc] != e.location) {
                    this.remove(handle.iloc);
                    this.add(e.location, handle.iloc);
                }
            }
        }
    };
    Route.prototype._do_ui_handle_cancel = function (handle, e, action) {};
    Route.prototype._do_ui_handle_commit = function (handle, e, action) {
        this._active_ui_handle = null;
    };

    function find_route_break_point(locations, px) {
        var I = -1;
        var D = 1e10;
        var t = 0;
        for (var i = 0, l = locations.length - 1; i < l; i++) {
            var head = locations[i];
            var tail = locations[i + 1];
            if (!head.joint || head.joint.mode == "point") //TODO:other joint type
            {
                var p1 = head.pixel;
                var p2 = tail.pixel;
                var d = pwg.math.getLineNearestPoint(px, p1, p2);
                if (d.distance < D) {
                    D = d.distance;
                    t = d.t;
                    I = i;
                }
            }
        }
        if (D < pwg.UI_HITTEST_TOLERENCE * 4 && I != -1) {
            return {
                i: I,
                t: t
            };
        } else
            return null;
    }


    Route.prototype.tryGetLocation = function (e, type) {
        if (type == "route") {
            var locations = this._locations;
            var I = find_route_break_point(this._locations, e.pixel);
            if (I) {
                var loc = new RouteLocation(this, locations[I.i], locations[I.i + 1], I.t);
                return loc;
            }
        }
        return null;
    };

    Route.prototype.getLocation = function (id) {
        var rls = this._route_locations;
        for (var i = 0, l = rls.length; i < l; i++) {
            var rl = rls[i];
            if (rl.id == id)
                return rl;
        }
        return null;
    };

    Route.prototype._use_location = function (loc) {
        this._route_locations.push(loc);
    };

    Route.prototype._release_location = function (loc) {
        var ix = this._route_locations.indexOf(loc);
        if (ix != -1) {
            this._route_locations = this._route_locations.splice(ix, 1);
        }
    };

    Route.prototype.depth = function () {
        var d = 0;
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            var loc = locations[i];
            if (loc && loc.joint == "break")
                continue;
            d = Math.max(d, loc.depth());
        }
        return d + 1;
    };

    Route.prototype.isDep=function(o)
    {
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            if(locations[i].owner==o)
                return true;
        }
        return false;
    };

    Route.prototype.findDep=function(o,result){
        if(this.isDep(o))
        {
            result.push(this);
        }
        pwg.Group.prototype.findDep.call(this,o,result);
        return result;
    };

    Route.prototype.removeDep = function (o) {
        var b = false;
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            if(locations[i].owner==o)
            {
                locations.splice(i,1);
                l--;
                i--;
            }
        }
        return b;
    };

    Route.prototype.dispose = function () {
        var locations = this._locations;
        for (var i = 0, l = locations.length; i < l; i++) {
            locations[i].release();
        }
    };

    Route.prototype.hitTest = function (e, option) {
        var D = 1e10;
        var object = null;
        var outline_ = this._runtime_outline_;
        var hit0 = pwg.Group.prototype.hitTest.call(this, e, option);
        for (var i = 0, l = outline_.length; i < l; i++) {
            var ol = outline_[i];
            var fnd = pwg.utils.find_line_string_nearest_point(ol, e.pixel);
            if (fnd.distance < D) {
                D = fnd.distance;
            }
        }
        if (hit0 && hit0.distance < D) {
            return hit0;
        } else
        if (D < pwg.UI_HITTEST_TOLERENCE)
            return {
                succeed: true,
                object: this,
                distance: D
            };
        return null;
    };

    Route.prototype.render = function (drawing, pass) {
        if (pass == "route") {
            drawing.begin();
            drawing.resetTransform();
            var outline_ = this._runtime_outline_;
            for (var i = 0, l = outline_.length; i < l; i++) {
                var ol = outline_[i];
                drawing.drawLineEx(ol, this._style);
            }
            drawing.end();
        } else if (pass == 'ui' || pass == "hot" || pass == "debug") {
            drawing.begin();
            drawing.resetTransform();
            var outline_ = this._runtime_outline_;
            for (var i = 0, l = outline_.length; i < l; i++) {
                var ol = outline_[i];
                drawing.drawLineEx(ol, pwg.styles.get("route.hot"));
            }
            if (this._active_ui_handle) {
                var handle = this._active_ui_handle;
                var locations = this._locations;
                var hp = handle.location.pixel;
                var line;
                if (handle.id == "joint.add-tail") {
                    var p = pwg.first(locations).pixel;
                    line = [p, hp];
                } else
                if (handle.id == "joint.add-head") {
                    var p = pwg.last(locations).pixel;
                    line = [p, hp];
                } else
                if (handle.id == "joint.move") {
                    line = [];
                    if (handle.iloc > 0) {
                        var p = locations[handle.iloc - 1].pixel;
                        line.push(p);
                    }
                    line.push(hp);
                    if (handle.iloc < this._locations.length - 1) {
                        var p = locations[handle.iloc + 1].pixel;
                        line.push(p);
                    }
                } else
                if (handle.id == "joint.insert") {
                    var p0 = locations[handle.iloc].pixel;
                    var p1 = locations[handle.iloc + 1].pixel;
                    line = [p0, hp, p1];
                }
                drawing.drawEx(line, pwg.styles.get("linelike.ui"));
            }
            drawing.end();
        }
        this._annotation.render(drawing, pass);
        pwg.Group.prototype.render.call(this, drawing, pass);
    };



    Route.prototype.__save__ = function (json) {
        json = pwg.Group.prototype.__save__.call(this, json);
        var locations = this._locations;
        var jslocations = [];
        for (var i = 0, l = locations.length; i < l; i++) {
            var id = locations[i].__using_id__();
            jslocations.push(id);
        }
        json.locations = jslocations;

        var rls = this._route_locations;
        var jsnrls = [];
        for (var i = 0, l = rls.length; i < l; i++) {
            jsnrls.push(rls[i].__save__());
        }
        json.rlocations = jsnrls;
        json.style = this._style.name;
        json.annotation = this._annotation.__save__();
        return json;
    };

    Route.prototype.__load__ = function (json, context) {
        pwg.Group.prototype.__load__.call(this, json, context);
        var jslocations = json.locations;
        var locations = this._locations;
        for (var i = 0, l = jslocations.length; i < l; i++) {
            var id = jslocations[i];
            var location = context.getUsingLocation(id);
            locations.push(location);
            location.use();
        }

        var rls = this._route_locations;
        var jsnrls = json.rlocations;
        for (var i = 0, l = jsnrls.length; i < l; i++) {
            var jsnrl = jsnrls[i];
            var head = context.getUsingLocation(jsnrl.head);
            var tail = context.getUsingLocation(jsnrl.tail);
            var t = jsnrl.t;
            var rl = new RouteLocation(this, head, tail, t);
            rls.push(rl);
        }
        this._style = pwg.styles.get(json.style);
        this._annotation.__load__(json.annotation, context);
    };

    // pwg.json.registerCreator("pwg.Route.creator", function (container, id, json) {
    //     var style = pwg.styles.get(json.style);
    //     var route = new Route(container, id, style);
    //     return route;
    // });

    pwg.graphics.Route = Route;
    pwg.Route = Route;
    pwg.registerClass(Route);
    ///////////////////////////////////////////////////////////////////
    function RouteXBuild(type, name, options) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._last_add_e = null;
        this._last_e = null;
        this._type = type;
        this._name = name;
        this._location_counter = 0;
        var that = this;
        var xdata = options.xdata || {};
        xdata.type = "route:" + type;
        xdata.CN = name;
        options.xdata = xdata;
        this._options = options;
        pwg.json.registerCreator("route:" + type, function (container, id, json) {
            return that.createJSON(container, id, json);
        });
    }
    pwg.inherits(RouteXBuild, pwg.BaseBuild);
    RouteXBuild.prototype.setContext = function (context) {
        this._context = context;
    };
    RouteXBuild.prototype.update = function (e, action) {
        if (action == "up" && e.location) {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(Route.classid, this._options);
                this._creating.__json_creator__ = "route:" + this._type;
            }
            this._creating.add(e.location);
            this._last_add_e = e;
            this._location_counter++;
        } else if (action == "move") {
            this._last_e = e;
        } else if (action == "post") {
            this.post();
        }
    };
    RouteXBuild.prototype.getLocationMode = function () {
        return "joint";
    };
    RouteXBuild.prototype.createJSON = function (container, id) {
        var route = new Route(container, id, this._options);
        route.__json_creator__ = "route:" + this._type;
        return route;
    };
    RouteXBuild.prototype.create = function (container, locations) {
        var route = container.createGraphics(Route.classid, this._options);
        route.__json_creator__ = "route:" + this._type;
        if (locations) {
            locations.forEach(it => {
                route.add(it);
            });
        }
        return route;
    };
    RouteXBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "route");
            var drawing = context.drawing;
            if (this._last_add_e && this._last_e) {
                drawing.begin();
                drawing.resetTransform();
                var ae = this._last_add_e;
                var p0 = ae.location ? ae.location.pixel : ae.pixel;
                var p1 = this._last_e.pixel;
                drawing.drawEx([p0, p1], pwg.styles.get('linelike.ui'));
                drawing.end();
            }
        }
    };
    RouteXBuild.prototype.cancel = function () {
        this._creating = null;
        this._location_counter = 0;
    };
    RouteXBuild.prototype.post = function () {
        if (this._location_counter > 1)
            this._context.container.addChild(this._creating);
        this._creating = null;
        this._location_counter = 0;
    };
    pwg.graphics.RouteXBuild = RouteXBuild;
    pwg.RouteXBuild = RouteXBuild;

    function registerRouteXBuild(type, name, options) {
        var build = new RouteXBuild(type, name, options);
        pwg.graphics.registerBuild(name, build);
    }
    registerRouteXBuild("route.ground", "线路(地上)", {
        style: 'route.default'
    });
    registerRouteXBuild("route.tube", "管廊", {
        style: 'route.pipe'
    });

    ////////////////////////////////////////////////////////////////////////////////////
    function RouteLocation(owner, head, tail, t) {
        pwg.super(this, pwg.AbsoluteLocation, owner, "", "pixel");
        this._head = head;
        this._tail = tail;
        this._t = pwg.defined(t) ? t : 0.5;
    }
    pwg.inherits(RouteLocation, pwg.AbsoluteLocation);
    pwg.defineClassId(RouteLocation, "pwg.RouteLocation");
    pwg.defineClassProperty(RouteLocation, "id", {
        get: function () {
            var _id = this._head.__using_id__() + "|" + this._t + "|" + this._tail.__using_id__();
            return _id;
        },
        set: function(val) { this._id = val; }
    });
    RouteLocation.prototype.setExternal = function (e, owner) {
        var b = this.set(e);
        if (!b) {
            //owner.tryDetachRoute();
        }
        return b;
    };
    RouteLocation.prototype.set = function (e) {
        var head = this._head;
        var tail = this._tail;
        var dp = pwg.math.getLineNearestPoint(e.pixel, head.pixel, tail.pixel);
        var t = dp.t;
        if (t < 0 || t > 1) {
            return false;
        } else {
            this._t = t;
            return dp.distance < pwg.UI_HITTEST_TOLERENCE * 120; //a way to escape from the line
        }
    };

    RouteLocation.prototype.update = function () {
        var head = this._head.pixel;
        var tail = this._tail.pixel;
        var px = tail.add(head.subtract(tail).multiply(this._t));

        var dirX = tail.subtract(head).normalize();
        this.angle = -dirX.getDirectedAngle({
            x: 1,
            y: 0
        });
        this.point = px;
        this.sync();
    };

    RouteLocation.prototype.depth = function () {
        return this.owner.depth() + 1;
    };
    RouteLocation.prototype.use = function () {
        this.owner._use_location(this);
    };
    RouteLocation.prototype.release = function () {
        this.owner._release_location(this);
    };
    RouteLocation.prototype.__save__ = function () {
        var json = pwg.AbsoluteLocation.prototype.__save__.call(this);
        json.head = this._head.__using_id__();
        json.tail = this._tail.__using_id__();
        json.t = this._t;
        return json;
    };
    RouteLocation.prototype.__using_id = function () {
        return this.owner.id + ":" + this.id;
    };
    RouteLocation.prototype.__load__ = function (json, context) {
        this._head = context.getUsingLocation(json.head);
        this._tail = context.getUsingLocation(json.tail);
        this._t = this._t;
    };
    pwg.RouteLocation = RouteLocation;
    /////////////////////////////////////////////////////////////////////////////////////
    function RouteBreak(container, id, rc, pivot, svg) {
        pwg.super(this, pwg.PointGraphics, container, id, rc, [pivot]);
        this._break = new pwg.AbsoluteLocation(this, "break", "pixel");
        var joint = new RouteJoint("break");
        joint.outline = [new pwg.point(0, 0), new pwg.point(0, 0)];
        this._break.joint = joint;
        this._joint0_location = new pwg.AbsoluteLocation(this, "joint-0", "pixel");
        this.svg = svg;
        this._handle_move = this._handles[0];
    }
    pwg.inherits(RouteBreak, pwg.PointGraphics);
    pwg.defineClassId(RouteBreak, "pwg.RouteBreak");
    RouteBreak.prototype.update = function (all) {
        pwg.PointGraphics.prototype.update.call(this,all);
        var rc = this._bounds;
        var left = rc.left,
            right = rc.right,
            hcenter = rc.center.y;
        var lp = this.baseToPixel({
            x: left,
            y: hcenter
        });
        var rp = this.baseToPixel({
            x: right,
            y: hcenter
        });
        var joint = this._break.joint;
        joint.outline[0].xy = lp;
        joint.outline[1].xy = rp;

        joint = this._joint0_location;
        var p = this.baseToPixel(new pwg.point(0, this._bounds.height / 2));
        joint.point = p;
        joint.angle = this._offset_location.angle;
        joint.update();
        this._handle_move.locationMode = this.location.optional ? null : "route";
    };

    RouteBreak.prototype._get_handles = function () {
        var handles = this._handles;
        return [this._annotation._handles[1]].concat(handles);
    };

    RouteBreak.prototype.hitTest = function (e) {
        var hit = this.svg.hitTest(e.pixel, pwg.drawing.default_paper_param);
        if (hit) {
            return {
                succeed: true,
                distance: 0,
                object: this
            };
        } else {
            return null;
        }
    };

    RouteBreak.prototype.tryGetLocation = function (e, type) {
        if (type == "joint" || pwg.has(type))
            if (e.pixel.getDistance(this._joint0_location.pixel) < 10) {
                return this._joint0_location;
            }
    };

    RouteBreak.prototype.getLocation = function (id) {
        if (id == "joint-0")
            return this._joint0_location;
        else
            return null;
    };

    RouteBreak.prototype.tryAddToRoute = function () {
        if (this.location.optional) {
            var using = this.location.optional;
            var route = using.owner;
            this.addTo(route);
            return true;
        } else {
            return false;
        }
    };

    // RouteBreak.prototype.removeDep=function(o)
    // {
    //     pwg.PointGraphics.prototype.removeDep.call(this,o);
    // };

    RouteBreak.prototype.render = function (drawing, pass) {
        if (pass == "entity") {
            drawing.begin();
            this.svg.matrix = this._TRS.M;
            this.svg.draw(drawing.ctx, drawing.default_paper_param);
            drawing.end();
            drawing.begin();
            drawing.resetTransform();
            var outline = this._break.joint.outline;
            drawing.draw_ui_handle_circle(outline[0], 4, 0xFF0000FF, 0xFF00FFFF);
            drawing.draw_ui_handle_circle(outline[1], 4, 0xFF00FF00, 0xFF00FFFF);
            drawing.end();
        } else if (pass == "label") {
            this._annotation.render(drawing, pass);
        }
    };

    RouteBreak.prototype.__save__ = function (json) {
        json = pwg.PointGraphics.prototype.__save__.call(this, json);
        json.svg = this.svg.url;
        return json;
    };

    RouteBreak.prototype.__load__ = function (json, context) {
        pwg.PointGraphics.prototype.__load__.call(this, json, context);
    };

    pwg.json.registerCreator("pwg.RouteBreak.creator",

        function (container, id, json) {
            var svg = pwg.drawing.using(null, json.svg);
            var rc = svg.bounds;
            var pivot = {
                name: "default",
                point: rc.center,
                sizeA: new pwg.point(rc.left, rc.center.y),
                sizeB: new pwg.point(rc.left, rc.center.y),
                rotate0: new pwg.point(rc.center.x, rc.bottom),
            };
            var o = new RouteBreak(container, id, rc, pivot, svg);
            svg.owner = o;
            return o;
        });

    pwg.registerClass(RouteBreak);
    /////////////////////////////////////////////////////////////////////////////////////
    function RouteBreakBuild() {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._has_route_location = false;
    }
    pwg.inherits(RouteBreakBuild, pwg.BaseBuild);
    RouteBreakBuild.prototype.getLocationMode = function () {
        return this._has_route_location ? "" : "route";
    };
    pwg.drawing.define("线上设备", pwg.ROOT_PATH+"/pwg/svg/线上设备x.svg");
    RouteBreakBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (!this._creating) {
                var svg = pwg.drawing.using(this, "线上设备");
                var rc = svg.bounds;
                var pivot = {
                    name: "default",
                    point: rc.center,
                    sizeA: new pwg.point(rc.left, rc.center.y),
                    sizeB: new pwg.point(rc.left, rc.center.y),
                    rotate0: new pwg.point(rc.center.x, rc.bottom),
                };
                this._creating = this._context.container.createGraphics(RouteBreak.classid, rc, pivot, svg);
                this._creating.__json_creator__ = "pwg.RouteBreak.creator";
            }
            this._creating.setLocation(e);
            this._has_route_location |= e.location;
            return true;
        }
        if (action == "up" || action == "post") {
            if (this._creating) {
                this._creating.setLocation(e);
                this._has_route_location |= e.location;
                this.post();
                return true;
            }
        } else if (action == "move") {
            if (this._creating) {
                this._creating.setLocation(e);
                this._has_route_location |= e.location;
                return true;
            }
        }
        return false;
    };
    RouteBreakBuild.prototype.post = function () {
        if (this._creating) {
            if (!this._creating.tryAddToRoute()) {
                this._creating.remove();
            }
        }
        this._creating = null;
        this._has_route_location = false;
    };

    RouteBreakBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "entity");
        }
    };

    RouteBreakBuild.prototype.cancel = function () {
        this._creating = null;
        this._has_route_location = false;
    };

    pwg.graphics.registerBuild("线上设备", new RouteBreakBuild());

    ////////////////////////////////////////////////////////////
    function JointsBeam(mode) {
        var self = this || globalThis;

        self.mode = mode ? mode : "local";
        self.O = null;
        self.interval = 1;
        self.direction = new pwg.point(1, 0);
        self.count = 1;
        self.locations = [];
    }
    JointsBeam.prototype.constructor = JointsBeam();
    JointsBeam._layouts = {
        1: {
            p: [0],
            n: ["C"]
        },
        2: {
            p: [-0.5, 0.5],
            n: ["A", "B"]
        },
        3: {
            p: [-1, 0, 1],
            n: ["A", "C", "B"]
        },
    };
    JointsBeam._layouts.get = function (n) {
        if (n <= 3)
            return JointsBeam._layouts[n];
        var d = -(n - 1) / 2.0;
        var ps = [],
            ns = [];
        for (var i = 0; i < n; i++) {
            ps.push(d);
            d++;
            ns.push(String.fromCharCode(('A'.charCodeAt(0) + i)));
        }
        return {
            p: ps,
            n: ns
        };
    };
    JointsBeam.prototype.reset = function (owner, count) {
        this.count = count;
        var layout = JointsBeam._layouts.get(this.count);
        var ns = layout.n;
        var mode = this.mode;
        for (var i = 0, l = this.count; i < l; i++) {
            var loc = this.locations[i];
            if (!loc) {
                loc = new pwg.AbsoluteLocation(owner, ns[i], mode);
                this.locations[i] = loc;
            }
            loc.name = ns[i];
        }
        this.layout = layout;
    };
    JointsBeam.prototype.update = function (all) {
        var mode = this.mode;
        if (all || mode == 'pixel') {
            var ps = this.layout.p;
            var o = this.O;
            o.update();
            var p0 = mode == "pixel" ? o.pixel : o.local;
            var interval = this.interval;
            var dn = this.direction;
            var angle = dn.angle;
            for (var i = 0, l = this.count; i < l; i++) {
                var loc = this.locations[i];
                var p = p0.add(dn.multiply(ps[i] * interval));
                loc.set(p);
                loc.angle = angle;
            }
        }
        for (var i = 0, l = this.count; i < l; i++) {
            var loc = this.locations[i];
            loc.update();
        }
    };
    JointsBeam.prototype.__save__ = function (json) {
        if (!json)
            json = {};
        json.count = this.count;
        json.mode = mode;
        return json;
    };
    JointsBeam.prototype.__load__ = function (json) {
        this.count = json.count;
        this.mode = json.mode;
    }
    pwg.JointsBeam = JointsBeam;
    /////////////////////////////////////////////////////
    function AlineJoints(container, id) {
        pwg.super(this, pwg.Graphics, container, id);
        this._locationA = new pwg.OptionalLocation(this, "start", "local");
        this._locationB = new pwg.OptionalLocation(this, "end", "local");
        this._beam = new JointsBeam();
        this._beam.O = new pwg.AbsoluteLocation(this, "O", 'local');
        this._dirty = true;
        this._handleA = new pwg.UiHandle(this, "handle.move", "move-a", "simple", this._locationA);
        this._handleA.locationMode = "joint";
        this._handleB = new pwg.UiHandle(this, "handle.move", "move-b", "simple", this._locationB);
        this._handleB.locationMode = "joint";
        this._handles = [this._handleA, this._handleB];
        this._style = new pwg.style({
            strokeColor: "black",
            strokeWidth: 1.0,
            dashArray: [10, 10],
            fillColor: "green"
        });
    }

    pwg.inherits(AlineJoints, pwg.Graphics);
    pwg.defineClassId(AlineJoints, "pwg.AlineJoints");
    AlineJoints.prototype.initialize = function (ea, eb, count, padding) {
        this._locationA.set(ea);        // 起点
        this._locationB.set(eb);        // 终点
        this._beam.reset(this, count);      // 重置接线柱分布
        this._padding = padding ? padding : 0;
        this._dirty = true;
    };
    
    AlineJoints.prototype.depth = function () {
        return Math.max(this._locationA.depth(), this._locationB.depth());
    }; 
    
    AlineJoints.prototype.isDep=function(o)
    {
        return this._locationA.isDep(o) || this._locationB.isDep(o);
    };

    AlineJoints.prototype.removeDep = function (o) {
        var b = this._locationA.removeDep(o);
        b|=this._locationB.removeDep(o);
        return b;
    };

    AlineJoints.prototype.dispose = function () {
        this._locationA.removeDep();
        this._locationB.removeDep();
    };

    AlineJoints.prototype.update = function () {
        this._locationA.update();
        this._locationB.update();
        //if (this._dirty) 
        {
            var pa = this._locationA.local,
                pb = this._locationB.local;
            var o = pa.add(pb).multiply(0.5);
            this._beam.O.set(o);
            var direction = pb.subtract(pa);
            this._beam.interval = direction.length / (this._beam.count);
            this._beam.direction = direction.normalize();
        }
        this._beam.update(true);
        this._dirty = false;
    };

    AlineJoints.prototype._do_ui_handle_update = function (handle, e) {
        handle.location.set(e);
        this._dirty = true;
        return true;
    };
    AlineJoints.prototype._raise_location_changed_event = function () {
        this.scene.raiseEvent("location-mode-changed", this);
    };
    AlineJoints.prototype.tryGetLocation = function (e, mode) {
        var locations = this._beam.locations;
        var D = pwg.UI_HITTEST_TOLERENCE * 2;
        var retloc;
        for (var i = 0, l = this._beam.count; i < l; i++) {
            var loc = locations[i];
            var d = loc.pixel.getDistance(e.pixel);
            if (d < D) {
                D = d;
                retloc = loc;
            }
        }
        return retloc;
    };
    AlineJoints.prototype.getLocation = function (n) {
        var locations = this._beam.locations;
        for (var i = 0, l = this._beam.count; i < l; i++) {
            if (locations[i].name == n)
                return locations[i];
        }
        return null;
    };
    AlineJoints.prototype.hitTest = function (e, options) {
        var d = pwg.math.getLineNearestPoint(e.pixel, this._locationA.pixel, this._locationB.pixel);
        if (d.distance < pwg.UI_HITTEST_TOLERENCE * 2)
            return {
                succeed: true,
                object: this,
                distance: d.distance
            };
        else
            return null;
    };
    AlineJoints.prototype.render = function (drawing, pass) {
        if (pass == "entity") {
            drawing.begin();
            drawing.resetTransform();
            var line = [this._locationA.pixel, this._locationB.pixel];
            drawing.drawEx(line, this._style);
            var locations = this._beam.locations;
            for (var i = 0, l = this._beam.count; i < l; i++) {
                var p = locations[i].pixel;
                drawing.beginPath();
                drawing.arc(p.x, p.y, pwg.UI_HITTEST_TOLERENCE / 2, 0, 360);
                drawing.closePath();
                drawing.fillExec();
                drawing.strokeExec();
            }
            drawing.end();
        }
    };

    AlineJoints.prototype._is_ui_handle_location_target = function (handle, o) {
        return (o.classid != AlineJoints.classid);
    };

    AlineJoints.prototype.__save__ = function (json) {
        json = pwg.Graphics.prototype.__save__.call(this, json);
        json.locationA = this._locationA.__save__();
        json.locationB = this._locationB.__save__();
        this._beam.__save__(json);
        return json;
    };

    AlineJoints.prototype.__load__ = function (json, context) {
        pwg.Graphics.prototype.__load__.call(this, json, context);
        this._locationA.__load__(json.locationA, context);
        this._locationB.__load__(json.locationB, context);
        this._dirty = true;
    };

    pwg.json.registerCreator("pwg.AlineJoints.creator", function (container, id, json) {
        var o = new AlineJoints(container, id);
        o._beam.reset(o, json.count);
        return o;
    });

    pwg.registerClass(AlineJoints);
    ////////////////////////////////////////////////////////
    function AlineJointsBuild(count) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this._count = count;
        this._start_e = null;
    }
    pwg.inherits(AlineJointsBuild, pwg.BaseBuild);
    pwg.defineClassId(AlineJointsBuild, "pwg.AlineJointsBuild");
    AlineJointsBuild.prototype.update = function (e, action) {
        if (action == "up") {
            if (this._creating == null) {
                this._creating = this._context.container.createGraphics(AlineJoints.classid);
                this._start_e = e;
                this._creating.initialize(e, e, this._count, 0);
                this._creating.__json_creator__ = "pwg.AlineJoints.creator";
            } else {
                this._creating.initialize(this._start_e, e, this._count, 0);
                this.post();
            }
        } else
        if (action == "move") {
            if (this._creating) {
                this._creating.initialize(this._start_e, e, this._count, 0);
            }
        }
    };

    AlineJointsBuild.prototype.getLocationMode = function () {
        return "joint";
    };

    AlineJointsBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "entity");
        }
    };

    AlineJointsBuild.prototype.post = function () {
        if (this._creating) {
            this._context.container.addChild(this._creating);
            console.log(this._context.container)
            this._creating = null;
        }
    };
    AlineJointsBuild.prototype.cancel = function () {
        this._creating = null;
    };

    AlineJointsBuild.prototype.isLocationTarget = function (o) {
        return o.classid != AlineJoints.classid;
    };
    pwg.graphics.registerBuild("管廊接线柱", new AlineJointsBuild(4));
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
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


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
if (typeof pwg == "undefined")
    pwg = {};
pwg.tower = function () {
    /*
 
    */
    function Tower(container, id, options) {
        var icon = options.icon;
        icon = typeof icon == "string" ? pwg.drawing.using(this, id, icon) : icon;

        var bounds, inlineMatrix;
        if (options.bounds) {
            bounds = options.bounds;
            inlineMatrix = pwg.utils.build_icon_inline_matrix(options.bounds, icon.bounds);
        }
        else {
            var inlineTRS = new pwg.TRS();
            bounds = icon.bounds;
            inlineTRS.make(bounds.center.multiply(-1), 0, 1, bounds.center);
            inlineMatrix = inlineTRS.M;
            bounds = new pwg.rectangle(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        }
        icon.inlineMatrix = inlineMatrix;
        this._icon = icon;
        this.xdata = options.xdata;
        bounds = new pwg.rect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        var pivot = {
            name: "default",
            point: new pwg.point(0, 0),
            rotate0: new pwg.point(0, bounds.height / 2),
            sizeA: new pwg.point(bounds.width / 2, bounds.height / 2),
            sizeB: new pwg.point(bounds.width / 2, 0),
            location: "joint"
        };
        pwg.super(this, pwg.PointGraphics, container, id, bounds, [pivot]);
        this._interval0 = bounds.width / 2.0;
        this._jointA = new pwg.AbsoluteLocation(this, "joint-A", "pixel");
        this._jointA.joint = new pwg.Joint("point");
        this._jointA._counter = 0;
        this._jointB = new pwg.AbsoluteLocation(this, "joint-B", "pixel");
        this._jointB.joint = new pwg.Joint("point");
        this._jointB._counter = 0;
        this._jointC = new pwg.AbsoluteLocation(this, "joint-C", "pixel");
        this._jointC.joint = new pwg.Joint("point");
        this._jointC._counter = 0;

        this._joints = [this._jointA, this._jointC, this._jointB];
        this.groupAdjustRatio = 1.0;
        this.groupAlineAngle = 0.0;
        this._handles[0].locationMode = "joint";
    };
    //////////////////////////////////////////////////////////////////////////////
    pwg.inherits(Tower, pwg.PointGraphics);
    pwg.defineClassId(Tower, "pwg.Tower");
    Tower.prototype.update = function (all) {
        var interval = this._interval0;
        if (this.owner && this.owner.classid == TowerAlineGroup.classid) {
            this.offset.r = this.groupAlineAngle;
            this.offset.s = 1.0;
            interval *= this.groupAdjustRatio;
        }
        pwg.PointGraphics.prototype.update.call(this, all);
        var x = -interval;
        for (var i = 0; i < 3; i++) {
            var joint = this._joints[i];
            if (all || joint._use_counter > 0) {
                joint.point = this.baseToPixel(new pwg.point(x, 0));
                joint.angle = this.offset.angle;
                joint.update();
            }
            x += interval;
        }
    };
    Tower.prototype.updateForceJoint = function () {
        this.update(true);
    };
    Tower.prototype._use_location = function (loc) {
        loc._counter++;
    };

    Tower.prototype._release_location = function (loc) {
        loc._counter--;
    };

    Tower.prototype.updateOnlyLocation = function () {
        pwg.PointGraphics.prototype.updateOnlyLocation.call(this);
    };

    Tower.prototype._get_handles = function () {
        var handles = this._handles;
        if (this.owner && this.owner.classid == TowerAlineGroup.classid) {
            return [handles[0], this._annotation._handles[1]];
        } else {
            return [this._annotation._handles[1]].concat(handles);
        }
    };

    Tower.prototype.hitTest = function (e, option) {
        if (!this._visibility)
            return;
        var hit = this._icon.hitTest(e.pixel, pwg.drawing.default_paper_param);
        if (hit) {
            return {
                succeed: true,
                distance: pwg.UI_HITTEST_TOLERENCE * 0.8,
                object: this
            };
        } else {
            return null;
        }
    };

    Tower.prototype.render = function (drawing, pass) {
        if (!this._visibility)
            return;
        this._annotation.render(drawing, pass);
        if (pass == "entity") {
            drawing.begin();
            var param = drawing.default_paper_param;
            this._icon.matrix = this._TRS.M;
            this._icon.draw(drawing.ctx, param);
            drawing.end();
        }
        else if (pass == "ui" || pass == "hot" || pass == "debug") {
            this.updateForceJoint();
            drawing.begin();
            drawing.resetTransform();
            var joints = this._joints;
            for (var i = 0; i < 3; i++) {
                var p = joints[i].pixel;
                drawing.draw_ui_handle_circle(p, 4, 0xFF00FF00, 0xFF00FFFF);
            }
            var p = this.location.pixel;
            drawing.draw_ui_handle_rect(p, 4, 0xFF00FFFF, 0xFF00FFFF);
            drawing.end();
        }
    };

    Tower.prototype.tryGetLocation = function (e, type) {
        this.updateForceJoint();
        if (type == "joint" || !pwg.defined(type)) {
            var D = pwg.UI_HITTEST_TOLERENCE * 2;
            var joint = null;
            var joints = this._joints;
            for (var i = 0; i < 3; i++) {
                var p = joints[i].pixel;
                var d = p.getDistance(e.pixel);
                if (d < D) {
                    D = d;
                    joint = joints[i];
                }
            }
            return joint;
        }
        return null;
    };

    Tower.prototype.getLocation = function (id) {
        if (this._jointA.id == id)
            return this._jointA;
        if (this._jointB.id == id)
            return this._jointB;
        if (this._jointC.id == id)
            return this._jointC;
        return null;
    };

    Tower.prototype.tryGetUiCommand = function (e, handle) {
        if (this.owner && this.owner.classid == TowerAlineGroup.classid) {
            return [new pwg.UiCommand(this, "remove-from-group", null, "从分组中移除", "simple")];
        }
        return null;
    };

    Tower.prototype._execute_ui_command = function (command) {
        if (command.id == "remove-from-group") {
            var container = this.container;
            var owner = this.owner;
            owner.remove(this);
            container.addChild(this);
        }
    };

    Tower.prototype.__save__ = function (json) {
        json = pwg.PointGraphics.prototype.__save__.call(this, json);
        return json;
    };

    Tower.prototype.__load__ = function (json, context) {
        pwg.PointGraphics.prototype.__load__.call(this, json, context);
    };
    pwg.registerClass(Tower);
    pwg.Tower = Tower;
    ////////////////////////////////////////////////////////////////
    function TowerXBuild(type, name, options) {
        pwg.super(this, pwg.BaseBuild, "simple");
        this._type = type;
        this._options = options;
        this._creating = null;
        var that = this;
        pwg.json.registerCreator("tower:" + type, function (container, id, json) {
            return that.createJSON(container, id, json);
        });

    }
    pwg.inherits(TowerXBuild, pwg.BaseBuild);
    TowerXBuild.prototype.getLocationMode = function () {
        return this._options.locationMode;
    };

    TowerXBuild.prototype.addFromData = function (e) {
        this._context.container.addChild(this.create(this._context.container, e));
    }

    TowerXBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(Tower.classid, this._options);
                this._creating.__json_creator__ = "tower:" + this._type;
                this._creating.setLocation(e);
            }
        } else if (action == "move") {
            if (this._creating) {
                this._creating.setLocation(e);
            }
        } else if (action == "up" || action == "post") {
            if (this._creating) {
                this._creating.setLocation(e);
                this._context.container.addChild(this._creating);
                this._creating = null;
            }
        }
    };
    TowerXBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating = null;
        }
    };

    TowerXBuild.prototype.create = function (container, e) {
        var creating = container.createGraphics(Tower.classid, this._options);
        creating.__json_creator__ = "tower:" + this._type;
        creating.setLocation(e);
        return creating;
    };
    TowerXBuild.prototype.createJSON = function (container, id, json) {
        var creating = new Tower(container, id, this._options);
        creating.__json_creator__ = "tower:" + this._type;
        return creating;
    };

    TowerXBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "entity"); //TODO:for other render 
        }
    };

    function registerTowerXBuild(type, name, options) {
        var icon = options.icon;
        var bounds = options.bounds;
        var uri = "tower:" + icon;
        var xdata = options.xdata || {};
        xdata.CN = xdata.CN || name;
        xdata.type = "tower:" + type;
        pwg.drawing.define(uri, icon);
        var xoptions =
        {
            icon: uri,
            bounds: bounds,
            xdata: xdata
        };
        var build = new TowerXBuild(type, name, xoptions);
        pwg.graphics.registerBuild(name, build);
    }
    ///////////////////////////////////////////////////////
    function TowerAlineGroup(container, id) {
        pwg.super(this, pwg.Group, container, id);
        this._towers = [];
        this._outline = [];

        this._add_head_handle = new pwg.UiHandle(this, "handle.add", "joint.add-head", "continuous");
        this._add_head_handle.locationMode = "joint";
        this._add_tail_handle = new pwg.UiHandle(this, "handle.add", "joint.add-tail", "continuous");
        this._add_tail_handle.locationMode = "joint";
        this._handle_move_insert = new pwg.UiHandle(this, "handle.move", "", "simple");
        this._handle_move_insert.locationMode = "joint";
        this._handles = [this._add_head_handle, this._add_tail_handle];
        this._hash_locations = new pwg.point();
    }
    pwg.inherits(TowerAlineGroup, pwg.Group);
    pwg.defineClassId(TowerAlineGroup, "pwg.TowerAlineGroup");
    TowerAlineGroup.prototype.add = function (tower, iloc) {
        if (!tower.owner /*TODO*/) {
            var b = this.addChild(tower);
            if (b)
                if (pwg.defined(iloc)) {
                    if (iloc == -1) {
                        this._towers.unshift(tower);
                    } else
                        this._towers.splice(iloc, 0, tower);
                }
                else {
                    this._towers.push(tower);
                }
            return b;
        }
        return false;
    };

    TowerAlineGroup.prototype.removeChild = function (o) {

        var b = pwg.Group.prototype.removeChild.call(this, o);
        var ix;
        if ((ix = this._towers.indexOf(o)) != -1) {
            this._towers.splice(ix, 1);
        }
        return b;
    };

    TowerAlineGroup.prototype.makeInlineRoute = function (nloc, routeType) {
        var towers = this._towers;
        //var route =  this.container.createGraphics(pwg.Route.classid);
        var route = pwg.graphics.getBuild(routeType).create(this.container, []);
        for (var i = 0, l = towers.length; i < l; i++) {
            var tower = towers[i];
            route.add(tower.getLocation(nloc));
        }
        this.addChild(route);
    };

    function make_hash_locations(towers) {
        var loc = new pwg.point();
        if (towers.length < 2)
            return loc;

        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            var p = tw.location.lonlat;
            loc.x += p.x;
            loc.y += p.y;
        }
        return loc;
    }

    function calc_aline_direction_adjust_ratio(towers) {
        if (towers.length < 2)
            return [];
        var points = [];
        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            points.push(tw.location.pixel);
        }
        var fwdirs = [];
        var updirs = [];
        var ds = [];
        for (var i = 0, n = points.length - 1; i < n; i++) {
            var p0 = points[i];
            var p1 = points[i + 1];
            var dr = p1.subtract(p0);
            fwdirs.push(dr.normalize());
        }
        fwdirs.push(fwdirs[fwdirs.length - 1]);
        updirs.push(fwdirs[0]);
        ds.push(1);
        for (var i = 1, n = fwdirs.length; i < n; i++) {
            var v0 = fwdirs[i - 1].rotate(90);
            var v1 = fwdirs[i].rotate(90);
            v0 = v0.add(v1).normalize();
            var d = 1 / v0.dot(v1);
            ds.push(d);

            v0 = fwdirs[i - 1];
            v1 = fwdirs[i];
            var di = v0.add(v1);
            updirs.push(di);
        }
        var xx = new pwg.point(0, 1);
        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            tw.groupAdjustRatio = ds[i];
            var di = updirs[i];
            tw.groupAlineAngle = -di.getDirectedAngle(xx);
        }
        return points;
    }

    function make_towers_only_pline(towers) {
        if (towers.length < 2)
            return [];
        var points = [];
        for (var i = 0, n = towers.length; i < n; i++) {
            var tw = towers[i];
            points.push(tw.location.pixel);
        }
        return points;
    }

    TowerAlineGroup.prototype.update = function (all) {
        var towers = this._towers;
        //此处代码包含了避免重新计算角度的逻辑。
        var last_hash_location = make_hash_locations(towers);
        if (!this._hash_locations.equals(last_hash_location) || all) {
            for (var i = 0, l = towers.length; i < l; i++) {
                towers[i].updateOnlyLocation();
            }
            this._outline = calc_aline_direction_adjust_ratio(this._towers);

            this._hash_locations = last_hash_location;
        }
        else {
            this._outline = make_towers_only_pline(this._towers);
        }

        if (all) //或者其余部分将由每个tower的更新机制负责。
        {
            for (var i = 0, l = towers.length; i < l; i++) {
                towers[i].update();
            }
        }

        if (this._active_ui_handle != this._add_head_handle && this._outline.length > 2) {
            this._add_head_handle.location.point = pwg.last(this._outline);
            this._add_head_handle.location.update();
        }
        if (this._active_ui_handle != this._add_tail_handle && this._outline.length > 2) {
            this._add_tail_handle.location.point = pwg.first(this._outline);
            this._add_tail_handle.location.update();
        }
        if (this._active_ui_handle)
            this._active_ui_handle.location.update();
    };

    TowerAlineGroup.prototype._do_ui_handle_begin = function (handle) {
        this._active_ui_handle = handle;
    };

    TowerAlineGroup.prototype._is_acceptable_tower = function (tower) {
        return tower && tower.classid == Tower.classid && (!tower.owner || tower.owner.classid != TowerAlineGroup.classid);
    };

    TowerAlineGroup.prototype._do_ui_handle_update = function (handle, e, action) {
        if (action == "post") {
            var tower = null;
            if (e.location) {
                if (this._is_acceptable_tower(e.location.owner)) {
                    tower = e.location.owner;
                    tower.remove();
                }
            }
            if (tower) {
                if (handle.id == "joint.add-tail") {
                    this.add(tower, -1);
                } else if (handle.id == "joint.add-head") {
                    this.add(tower);
                } else if (handle.id == "joint.insert") {
                    this.add(tower, handle.iloc + 1);
                }
            }
            else {
                if (handle.id == "joint.insert") {
                    tower = Tower.defaultBuild.create(this.container, e);
                    this.add(tower, handle.iloc + 1);
                }
                else {
                    var outline = this._outline;
                    if (handle.id == "joint.add-tail") {
                        var first = pwg.first(outline);
                        if (first.getDistance(e.pixel) > pwg.UI_HITTEST_TOLERENCE * 5) {
                            tower = Tower.defaultBuild.create(this.container, e);
                            this.add(tower, -1);
                        }
                    }
                    else if (handle.id == "joint.add-head") {
                        var last = pwg.last(outline);
                        if (last.getDistance(e.pixel) > pwg.UI_HITTEST_TOLERENCE * 5) {
                            tower = Tower.defaultBuild.create(this.container, e);
                            this.add(tower);
                        }
                    }
                }
            }
        }
        else if (action == "update") {
            handle.location.set(e);
        }
    };

    TowerAlineGroup.prototype._do_ui_handle_cancel = function (handle, e, action) { };

    TowerAlineGroup.prototype._do_ui_handle_commit = function (handle, e, action) {
        this._active_ui_handle = null;
    };

    TowerAlineGroup.prototype.tryGetUiHandle = function (e) {
        var outline = this._outline;
        var d = pwg.utils.find_line_string_nearest_point(outline, e.pixel);
        if (d.distance < pwg.UI_HITTEST_TOLERENCE * 2) {
            if (d.t > 0.1 && d.t < 0.9) {
                var handle = this._handle_move_insert;
                handle.id = "joint.insert";
                handle.iloc = d.i;
                return handle;
            }
        } else {
            return null;
        }
    };

    TowerAlineGroup.prototype.depth = function () {
        var towers = this._towers;
        var d = 0;
        for (var i = 0, l = towers.length; i < l; i++) {
            var t = towers[i];
            d = Math.max(t.depth(), d);
        }
        return d + 1;
    };

    TowerAlineGroup.prototype.isDep = function (o) {
        var towers = this._towers;
        var d = 0;
        for (var i = 0, l = towers.length; i < l; i++) {
            var t = towers[i];
            if (t == o || t.isDep(o))
                return true;
        }
        return false;
    };

    TowerAlineGroup.prototype.removeDep = function (o) {
        var towers = this._towers;
        var d = 0;
        for (var i = 0, l = tower.length; i < l; i++) {
            var t = towers[i];
            if (t == o) {
                this.removeChild(o);
                return true;
            }
        }
        return false;
    };

    TowerAlineGroup.prototype.render = function (drawing, pass) {
        if (pass == "frame") {
            drawing.begin();
            drawing.resetTransform();
            drawing.drawEx(this._outline, pwg.styles.get("tower-aline-group.default"));
            drawing.end();
        } else if (pass == "ui" || pass == "hot" || pass == "debug") {
            drawing.begin();
            drawing.resetTransform();
            var outline = this._outline;
            drawing.drawEx(outline, pwg.styles.get("tower-aline-group.hot"));
            if (this._active_ui_handle) {
                var handle = this._active_ui_handle;
                var hp = handle.location.pixel;
                var line;
                if (handle.id == "joint.add-tail") {
                    var p = pwg.first(outline);
                    line = [p, hp];
                }
                else if (handle.id == "joint.add-head") {
                    var p = pwg.last(outline);
                    line = [p, hp];
                }
                else if (handle.id == "joint.insert") {
                    var p0 = outline[handle.iloc];
                    var p1 = outline[handle.iloc + 1];
                    line = [p0, hp, p1];
                }
                drawing.drawEx(line, pwg.styles.get("linelike.ui"));
            }
            drawing.end();
        }
        if (pass != "ui" && pass != "hot") {
            pwg.Group.prototype.render.call(this, drawing, pass);
        }
    };

    TowerAlineGroup.prototype.hitTest = function (e, options) {
        var hit = pwg.Group.prototype.hitTest.call(this, e, options);
        if (hit)
            return hit;
        var d = pwg.utils.find_line_string_nearest_point(this._outline, e.pixel);
        if (d.distance < pwg.UI_HITTEST_TOLERENCE * 4) {
            return {
                succeed: true,
                object: this,
                distance: d.distance
            };
        }
        return null;
    };

    TowerAlineGroup.prototype.__save__ = function (json) {
        json = pwg.Group.prototype.__save__.call(this, json);
        var towers = this._towers;
        json.towers = [];
        for (var i = 0, l = towers.length; i < l; i++) {
            var id = towers[i].id;
            json.towers.push(id);
        }
        return json;
    };

    TowerAlineGroup.prototype.__load__ = function (json, context) {
        pwg.Group.prototype.__load__.call(this, json, context);
        var towers = json.towers;
        for (var i = 0, l = towers.length; i < l; i++) {
            var t = context.getObjectById(towers[i]);
            this._towers.push(t);
        }
    };

    pwg.registerClass(TowerAlineGroup);
    //////////////////////////////////////////////////////////
    function TowerAlineGroupBuild(routeType) {
        pwg.super(this, pwg.BaseBuild, "continuous");
        this.routeType = routeType;
    }
    pwg.inherits(TowerAlineGroupBuild, pwg.BaseBuild);
    pwg.defineClassId(TowerAlineGroupBuild, "pwg.TowerAlineGroupBuild");
    TowerAlineGroupBuild.prototype.getLocationMode = function () {
        return "joint";
    };

    TowerAlineGroupBuild.create = function (container, e) {
        var creating = this._context.container.createGraphics(TowerAlineGroup.classid);
        if (e.location) {
            var tower = e.location.owner;
            if (tower && tower.classid == Tower.classid) {
                if (tower.owner.classid != TowerAlineGroupBuild.classid) {
                    tower.remove();
                    creating.add(tower);
                }
            }
        } else {
            var tower = Tower.defaultBuild.create(this._creating.container, e);
            creating.add(tower);
        }
        return creating;
    };

    TowerAlineGroupBuild.prototype.update = function (e, action) {
        if (action == "up") {
            if (!this._creating)
                this._creating = this._context.container.createGraphics(TowerAlineGroup.classid);
            if (e.location) {
                var tower = e.location.owner;
                if (tower && tower.classid == Tower.classid) {
                    if (tower.owner.classid != TowerAlineGroupBuild.classid) {
                        tower.remove();
                        this._creating.add(tower);
                    }
                }
            } else {
                var tower = Tower.defaultBuild.create(this._creating.container, e);
                this._creating.add(tower);
            }
            this._last_up_e = e;
        } else if (action == "move") {
            this._last_e = e;
        } else if (action == "post") {
            this.post();
        }
        return "continous";
    };

    TowerAlineGroupBuild.prototype.post = function (e, action) {
        if (this._creating) {
            this._creating.makeInlineRoute("joint-A", this.routeType);
            this._creating.makeInlineRoute("joint-B", this.routeType);
            this._creating.makeInlineRoute("joint-C", this.routeType);
            this._context.container.addChild(this._creating);
        }
        this._creating = null;
        this._last_e = null;
        this._last_up_e = null;
    };
    TowerAlineGroupBuild.prototype.cancel = function () {
        this._creating = null;
        this._last_e = null;
        this._last_up_e = null;
    };

    TowerAlineGroupBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update(true);
            ['frame', 'route', 'entity', 'label'].forEach(it => {
                this._creating.render(context.drawing, it);
            });
            var drawing = context.drawing;
            drawing.begin();
            drawing.resetTransform();
            var style = pwg.styles.get("linelike.ui");
            drawing.drawEx([this._last_e.pixel, this._last_up_e.pixel], style);
            drawing.end();
        }
    };
    //////////////////////////////////////////////////////////
    var bounds = new pwg.rectangle(-16, -16, 32, 32);
    registerTowerXBuild("钢管杆(耐张)", "钢管杆(耐张)", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/钢管杆(耐张).svg", bounds: bounds });
    registerTowerXBuild("钢管杆(直线)", "钢管杆(直线)", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/钢管杆(直线).svg", bounds: bounds });
    registerTowerXBuild("钢管塔(耐张)", "钢管塔(耐张)", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/钢管塔(耐张).svg", bounds: bounds });
    registerTowerXBuild("钢管塔(直线)", "钢管塔(直线)", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/钢管塔(直线).svg", bounds: bounds });
    registerTowerXBuild("木塔", "木塔", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/木塔.svg", bounds: bounds });
    registerTowerXBuild("其他杆塔", "其他杆塔", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/其他杆塔.svg", bounds: bounds });
    registerTowerXBuild("水泥杆", "水泥杆", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/水泥杆.svg", bounds: bounds });
    registerTowerXBuild("铁杆(直线)", "铁杆(直线)", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/铁杆(直线).svg", bounds: new pwg.rectangle(-20, -16, 40, 32) });
    registerTowerXBuild("铁塔（同角钢塔，耐张）", "铁塔（同角钢塔，耐张）", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/铁塔（同角钢塔，耐张）.svg", bounds: bounds });
    registerTowerXBuild("铁塔（同角钢塔，直线）", "铁塔（同角钢塔，直线）", { icon: pwg.ROOT_PATH + "/pwg/svg/标准/铁塔（同角钢塔，直线）.svg", bounds: bounds });

    pwg.graphics.registerBuild("杆塔线路组", new TowerAlineGroupBuild("线路(地上)"));
    Tower.defaultBuild = pwg.graphics.getBuild("钢管杆(耐张)");
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
/*
    pwg-device-common.js
*/
if (typeof pwg == 'undefined')
    pwg = {};
pwg.device = function () {
    function CircleLocation(center, r, e, n) {
        this._center = center;
        this._r = r;
        this._e = e;
        this._a = 360 / n;
        this.length = n;
        this._id = "";
    }
    CircleLocation.prototype.constructor = CircleLocation;
    CircleLocation.prototype.tryGetLocation = function (p) {
        if (this._center.getDistance(p) - this._r < this._e) {
            var v = p.subtract(this.center);
            var k = Math.round(v.angle / this._a);
            var angle = this._a * k;
            p = new pwg.point(this._r, 0).rotate(angle);
            p = p.add(this._center);
            p.xangle = angle;
            p.id = this._id + `[${k}]`;
            return p;
        }
        return null;
    };

    CircleLocation.prototype.getLocation = function (id) {
        if (typeof id == "string") {
            var regex = /([+-]??\d+)/g;
            var m = id.match(regex);
            var k = parseInt(m[0]);
            var angle = k * this._a;
            p = new pwg.point(this._r, 0).rotate(angle);
            p = p.add(this._center);
            p.xangle = angle;
            p.id = id;
            return p;
        }
        else {
            var angle = id * this._a;
            p = new pwg.point(this._r, 0).rotate(angle);
            p = p.add(this._center);
            p.xangle = angle;
            p.id = this._id + `[${id}]`;
            return p;
        }

    };

    CircleLocation.prototype.__save__ = function () {
        var json = {};
        json.center = pwg.json.formats[pwg.point].save(this._center);
        json.r = this._r;
        json.e = this._e;
        json.a = this._a;
    };

    CircleLocation.prototype.__load__ = function (json) {
        this._center = pwg.json.formats[pwg.point].load(json.center);
        this._r = json.r;
        this._e = json.e;
        this._a = json.a;
    };

    /////////////////////////////////////////////////////////
    function BoxLocation(minp, maxp, n, e) {
        this._minp = pwg.point.min(minp, maxp);
        this._maxp = pwg.point.max(minp, maxp);
        this._center = this._minp.add(this._maxp).multiply(0.5);
        this._a = this._minp;
        this._b = new pwg.point(maxp.x, minp.y);
        this._c = this._maxp;
        this._d = new pwg.point(minp.x, maxp.y);
        this._e = e;
        this._n = n;
        this.length = n * 4;
        this._id = "";
    }
    BoxLocation.prototype.constructor = BoxLocation;
    BoxLocation.prototype.tryGetLocation = function (p) {
        var points = [this._a, this._b, this._c, this._d, this._a];
        for (var i = 0; i < 4; i++) {
            var d = pwg.math.getLineNearestPoint(p,points[i + 1],points[i]);
            if (d.distance < this._e && d.t >= 0 && d.t <= 1.0) {
                var v = points[i + 1].subtract(points[i]).multiply(1 / this._n);
                var n = Math.round(d.t * this._n);
                p = points[i].add(v.multiply(n));
                p.xangle = (i - 1) * 90;
                p.id = this._id + `(${i},${n})`;
                return p;
            }
        }
        return null;
    };
    BoxLocation.prototype.getLocation = function (id) {
        var points = [this._a, this._b, this._c, this._d, this._a];
        if (typeof id == "string") {
            var regex = /(\d+),(\d+)/;
            var m = id.match(regex);
            var i = parseInt(m[1]), n = parseInt(m[2]);
            var v = points[i + 1].subtract(points[i]).multiply(1 / this._n);
            var p = points[i].add(v.multiply(n));
            p.id = id;
            p.xangle = (i - 1) * 90;
            return p;
        }
        else {
            var i = Math.floor(id / this._n);
            var n = id % this._n;
            var v = points[i + 1].subtract(points[i]).multiply(1 / this._n);
            var p = points[i].add(v.multiply(n));
            p.id = this._id + `(${i},${n})`;
            p.xangle = (i - 1) * 90;
            return p;
        }
    };

    BoxLocation.prototype.__save__ = function () {
        var json = {};
        json.minp = pwg.json.formats[pwg.point].save(this._minp);
        json.maxp = pwg.json.formats[pwg.point].save(this._maxp);
        json.n = this._n;
        json.e = this._e;
    };

    BoxLocation.prototype.__load__ = function (json) {
        var minp = pwg.json.formats[pwg.point].load(json.minp);
        var maxp = pwg.json.formats[pwg.point].load(json.maxp);
        BoxLocation.call(this, minp, maxp, json.n, json.e);
    };

    ///////////////////////////////////////////////////////////
    //功能设备
    function Device(container, id, options) {
        var icon = options.icon;
        icon = typeof icon == "string" ? pwg.drawing.using(this, id, icon) : icon;
        this._icon = icon;
        var bounds, inlineMatrix;
        if (options.bounds) {
            bounds = options.bounds;
            inlineMatrix = pwg.utils.build_icon_inline_matrix(options.bounds, icon.bounds);
        }
        else {
            var inlineTRS = new pwg.TRS();
            bounds = icon.bounds;
            inlineTRS.make(bounds.center.multiply(-1), 0, 1, bounds.center);
            inlineMatrix = inlineTRS.M;
            bounds = new pwg.rectangle(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
        }
        icon.inlineMatrix = inlineMatrix;
        this._inlineMatrix = inlineMatrix;
        pwg.super(this, pwg.PointGraphics, container, id, bounds, options.pivots);
        this.xdata = options.xdata;
        this._options = options;
        this._joints = [];
        var kjoints = options.joints;
        for (var i = 0, l = kjoints.length; i < l; i++) {
            var k = kjoints[i];
            var joint = new pwg.AbsoluteLocation(this, k.id, "pixel");
            joint.kpoint = k;
            joint.joint = new pwg.Joint('point');
            this._joints.push(joint);
        }
        if (options.jointx) {
            this._jointx = options.jointx;
            this._jointx_cache = {};
        }
    }
    pwg.inherits(Device, pwg.PointGraphics);
    pwg.defineClassId(Device, "pwg.Device");
    Device.prototype.update = function (all) {
        pwg.PointGraphics.prototype.update.call(this,all);
        var joints = this._joints;
        for (var i = 0, l = joints.length; i < l; i++) {
            var joint = joints[i];
            var point = this.baseToPixel(joint.kpoint);
            joint.point.xy = point;
            joint.angle = this.offset.angle + joint.kpoint.xangle;
            joint.update(all);
        }
        if (this._jointx_cache) {
            var cache = this._jointx_cache;
            for (var k in cache) {
                var joint = cache[k];
                var point = this.baseToPixel(joint.kpoint);
                joint.point.xy = point;
                joint.angle = this.offset.angle + joint.kpoint.xangle;
                joint.update(all);
            }
        }
    };
    Device.prototype.hitTest = function (e, option) {
        var hit = this._icon.hitTest(e.pixel, pwg.drawing.default_paper_param);
        if (hit) {
            return {
                succeed: true,
                distance: pwg.UI_HITTEST_TOLERENCE*0.8,
                object: this
            };
        }
        else {
            return null;
        }
    };
    Device.prototype.render = function (drawing, pass) {
        this._annotation.render(drawing,pass);
        if (pass == "entity") {
            drawing.begin();
            var param = drawing.default_paper_param;
            this._icon.matrix = this._TRS.M;
            this._icon.draw(drawing.ctx, param);
            drawing.end();
        }
        else if (pass == "hot"||pass == "ui"||pass=="debug") {
            drawing.begin();
            drawing.resetTransform();
            var joints = this._joints;
            for (var i = 0, l = joints.length; i < l; i++) {
                var p = joints[i].pixel;
                drawing.draw_ui_handle_circle(p, 4, 0xFF00FF00, 0xFF00FFFF);
            }
            if (this._jointx_cache) {
                var cache = this._jointx_cache;
                for (var k in cache) {
                    var p = cache[k].pixel;
                    drawing.draw_ui_handle_circle(p, 4, 0xFF00FF00, 0xFF00FFFF);
                }
            }
            drawing.end();
        }
        if (pass == "hot") {
            if (this._jointx_cache) {
                drawing.begin();
                drawing.resetTransform();
                var jointx = this._jointx;
                for (var i = 0; i < jointx.length; i++) {
                    var p = jointx.getLocation(i);
                    var pp = this.baseToPixel(p);
                    drawing.draw_ui_handle_circle(pp, 4, 0xFF0000FF, 0xFF0000FF);
                }
                drawing.end();
            }
        }
    };
    Device.prototype.tryGetLocation = function (e, mode) {
        var p = e.pixel;
        var location = null;
        var D = pwg.UI_HITTEST_TOLERENCE * 2;
        var joints = this._joints;
        for (var i = 0, l = joints.length; i < l; i++) {
            var joint = joints[i];
            var d = p.getDistance(joint.pixel);
            if (d < D) {
                D = d;
                location = joint;
            }
        }
        if (location)
            return location;
        if (this._jointx_cache) {
            var cache = this._jointx_cache;
            for (var k in cache) {
                var joint = cache[k];
                var d = p.getDistance(joint.pixel);
                if (d < D) {
                    D = d;
                    location = joint;
                }
            }
        }
        if (location)
            return location;
        if (this._jointx_cache) {
            var jointx = this._jointx;
            var pp = this.pixelToBase(e.pixel);
            var lp = jointx.tryGetLocation(pp);
            if (lp) {
                location = new pwg.AbsoluteLocationEx(this, lp.id, "pixel");
                location.kpoint = lp;
                location.point.xy = this.baseToPixel(lp);
                location.angle = this.offset.angle + lp.xangle;
                location.update();
            }
        }
        return location;
    };
    Device.prototype.getLocation = function (id) {
        if (id.indexOf("jointx@") != -1) {
            id = id.substring(7);
            var cache = this._jointx_cache;
            if (cache[id]) {
                return cache[id];
            }
            else {
                var lp = this._jointx.getLocation(id);
                var location = new pwg.AbsoluteLocationEx(this, lp.id, "pixel");
                location.kpoint = lp;
                return location;
            }
        }
        else {
            var joints = this._joints;
            for (var i = 0, l = joints.length; i < l; i++) {
                var joint = joints[i];
                if (joint.id == id) {
                    return joint;
                }
            }
        }
        return null;
    };
    Device.prototype._get_handles = function () {
        return [this._annotation._handles[1]].concat(this._handles);
    };
    Device.prototype._use_location = function (loc) {
        if (loc.classid == pwg.AbsoluteLocationEx.classid) {
            if (!this._jointx_cache[loc.id]) {
                this._jointx_cache[loc.id] = loc;
            }
        }
    };

    Device.prototype._release_location = function (loc) {
        if (loc.classid == pwg.AbsoluteLocationEx.classid) {
            if (loc._use_counter == 0) {
                delete this._jointx_cache[loc.id];
            }
        }
    };

    Device.prototype.__save__=function(json)
    {
        json = pwg.PointGraphics.prototype.__save__.call(this,json);
        var cache = this._jointx_cache;
        if(cache)//just to record
        {
            json.jointx=[];
            for(var k in cache)
            {
                var joint =cache[k];
                var usid =joint.__using_id__();
                json.jointx.push(usid);
            }
        }
        return json;
    };

    Device.prototype.__load__=function(json,context)
    {
        pwg.PointGraphics.prototype.__load__.call(this,json,context);
    };
    pwg.registerClass(Device);
    ////////////////////////////////////////////////////////////////////
    function DeviceXBuild(type, options) {
        this._options = options;
        this._type = type;
        pwg.super(this, pwg.BaseBuild,"simple");
        var that = this;
        //dynamic create a json creator
        pwg.json.registerCreator("device:"+type, function (container, id, json) {
            return that.createJSON(container, id, json);
        });
    }
    pwg.inherits(DeviceXBuild, pwg.BaseBuild);
    DeviceXBuild.prototype.getLocationMode = function () {
        return this._locationMode;
    };
    DeviceXBuild.prototype.update = function (e, action) {
        if (action == "down") {
            if (!this._creating) {
                this._creating = this._context.container.createGraphics(Device.classid, this._options);
                this._creating.__json_creator__ = "device:"+this._type;
                this._creating.setLocation(e);
            }
        } else
            if (action == "move") {
                if (this._creating) {
                    this._creating.setLocation(e);
                }
            } else
                if (action == "up" || action == "post") {
                    if (this._creating) {
                        this._creating.setLocation(e);
                        this._context.container.addChild(this._creating);
                        this._creating = null;
                    }
                }
    };
    DeviceXBuild.prototype.cancel = function () {
        if (this._creating) {
            this._creating = null;
        }
    };
    DeviceXBuild.prototype.create = function (container, e) {
        var creating = container.createGraphics(Device.classid, this._options);
        creating.__json_creator__ = "device:"+this._type;
        creating.setLocation(e);
        return creating;
    };
    DeviceXBuild.prototype.createJSON = function (container, id, json) {
        var creating = new Device(container,id,this._options);
        creating.__json_creator__ ="device:"+this._type;
        return creating;
    };
    DeviceXBuild.prototype.render = function (context) {
        if (this._creating) {
            this._creating.update();
            this._creating.render(context.drawing, "entity"); //TODO:for other render 
        }
    };
    function register_io_device_class(type, name, options) {
        var cn = options.CN?options.CN:name;
        var icon = options.icon;
        var bounds = options.bounds;
        /*
            i
           [c]   
            o
        */
        var center = bounds.center;
        var joints = [];
        joints.push(new pwg.point(center.x, bounds.top));
        joints[0].xangle = 0;
        joints[0].id = "input";

        joints.push(new pwg.point(center.x, bounds.bottom));
        joints[1].xangle = 0;
        joints[1].id = "output";

        var pivots = [];
        pivots.push(
            {
                name: "center",
                point: center,
                rotate0: new pwg.point(0, bounds.bottom + 10),
                sizeA: new pwg.point(bounds.right, bounds.bottom),
                sizeB: new pwg.point(bounds.right, center.y),
                location: "absolute"
            });

        pivots.push(
            {
                name: "top-center",
                point: new pwg.point(center.x, bounds.top),
                rotate0: new pwg.point(0, bounds.bottom + 10),
                sizeA: new pwg.point(bounds.right, bounds.bottom),
                sizeB: new pwg.point(bounds.right, center.y),
                location: "joint"
            });

        pivots.push(
            {
                name: "bottom-center",
                point: new pwg.point(center.x, bounds.bottom),
                rotate0: new pwg.point(center.x, bounds.top - 10),
                sizeA: new pwg.point(bounds.right, bounds.top),
                sizeB: new pwg.point(bounds.right, center.y),
                location: "joint"
            });

        var uri = "device:" + icon;
        pwg.drawing.define(uri, icon);
        var xdata = options.xdata||{};
        xdata.CN=xdata.CN||name;
        xdata.type=xdata.type||"device:"+type;
        var xoptions =
        {
            icon: uri,
            bounds: bounds,
            pivots: pivots,
            joints: joints,
            xdata: xdata
        };
        var build = new DeviceXBuild(type, xoptions);
        pwg.graphics.registerBuild(name, build);
    }
    register_io_device_class("pwg.device.test", "外来测试", { CN: "测试", icon: pwg.ROOT_PATH+"/pwg/svg/测试.svg", bounds: new pwg.rectangle(-11, -25, 22, 50) });
    register_io_device_class("pwg.device.zyb", "专用变", { CN: "专用变", icon: pwg.ROOT_PATH+"/pwg/svg/标准/专用变.svg", bounds: new pwg.rectangle(-12, -25, 24, 50)});
    ///////////////////////////////////////////////////////////////////////////////////
    function register_hub_device(type, name, options) {
        var icon = options.icon;
        var bounds = options.bounds;
        var jointx = null;
        var center = bounds.center;
        if (options.jointx == "circle") {
            jointx = new CircleLocation(center, bounds.width / 2, 2, 12);
        }
        else if (options.jointx == "box") {
            jointx = new BoxLocation(bounds.topLeft, bounds.bottomRight, 4, 2);
        }

        var joints = [];
        joints.push(new pwg.point(center));
        joints[0].xangle = 0;
        joints[0].id = "center";

        var pivots = [];
        pivots.push({
            name: "center",
            point: center,
            rotate0: new pwg.point(center.x, bounds.bottom),
            sizeA: new pwg.point(bounds.right, center.y),
            sizeB: new pwg.point(bounds.right, bounds.bottom),
            location: "joint"
        });

        pivots.push({
            name: "top",
            point: new pwg.point(center.x, bounds.top),
            rotate0: new pwg.point(center.x, bounds.bottom),
            sizeA: new pwg.point(bounds.right, center.y),
            sizeB: new pwg.point(bounds.right, bounds.bottom),
            location: "joint"
        });

        var uri = "device:" + icon;
        pwg.drawing.define(uri, icon);
        var xdata = options.xdata||{};
        xdata.CN=xdata.CN||name;
        xdata.type=xdata.type||"device:"+type;
        var xoptions =
        {
            icon: uri,
            bounds: bounds,
            pivots: pivots,
            joints: joints,
            jointx: jointx,
            xdata:xdata
        };
        var build = new DeviceXBuild(type, xoptions);
        pwg.graphics.registerBuild(name, build);
    }
    var bounds =  new pwg.rectangle(-32, -32, 64, 64);

    register_hub_device("pwg.device.bdz110(66)", "变电站110(66)kv", {
        CN: "变电站110(66)kv",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/变电站110(66)kv.svg",
        bounds: bounds,
        jointx: "circle"
    });
    register_hub_device("pwg.device.bdz220(330)", "变电站220(330)kv", {
        CN: "变电站220(330)kv",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/变电站220(330)kv.svg",
        bounds: bounds,
        jointx: "circle"
    });

    register_hub_device("pwg.device.dlfxx", "电缆分支箱", {
        CN: "电缆分支箱",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/电缆分支箱.svg",
        bounds: bounds,
        jointx: "box"
    });
    register_hub_device("pwg.device.hwg", "环网柜HW", {
        CN: "环网柜HW",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/环网柜HW.svg",
        bounds: bounds,
        jointx: "box"
    });
    register_hub_device("pwg.device.pds", "配电室", {
        CN: "配电室",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/配电室.svg",
        bounds: bounds,
        jointx: "box"
    });
    register_hub_device("pwg.device.xb", "箱变", {
        CN: "箱变",
        icon: pwg.ROOT_PATH+"/pwg/svg/标准/箱变.svg",
        bounds: bounds,
        jointx: "box"
    });
};



/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
/*
    pwg-canvas-render-engine.js
*/
if (typeof pwg == 'undefined')
    pwg = {};

var PWGObject = pwg.PWGObject;
pwg.uicontext = function () {
    pwg.UI_HITTEST_TOLERENCE = 4;

    function UiContext(layer) {
        this.layer = layer;
        this._activeTool = undefined;
        this._activeObject = null;
        this._creatingBuild = null;
        this._container = null;
        this.tools = {
            "creating": new pwg.DefaultCreatingTool(),
            "editing": new pwg.DefaultEditingTool(),
            "info": new pwg.DefaultInfoTool()
        };
        this.defaultTool = this.tools.editing;
    }
    pwg.inherits(UiContext, pwg.Object);
    pwg.defineClassProperty(UiContext, "uitool", {
        get: function () {
            return this._activeTool;
        },
        set: function (ut) {
            if (typeof ut == "string") {
                ut = this.tools[ut];
            }
            if (ut == this.uitool)
                return;
            if (ut != this._activeTool && this._activeTool) {
                this._activeTool.stop();
            }
            this._activeTool = ut;
            if (this._activeTool) {
                this._activeTool.start(this);
            } else {
                this.uitool = this.defaultTool;
                this.defaultTool.start(this);
            }
        }
    });
    pwg.defineClassProperty(UiContext, "scene", {
        get: function () {
            return this.layer.scene;
        }
    });

    pwg.defineClassProperty(UiContext, "container", {
        get: function () {
            return this._container ? this._container : this.layer.scene;
        },
        set: function (cc) {
            if (this._container != cc) {
                var last = this._container;
                this._container = cc;
                this.raiseEvent("containerChanged", { last: last, current: cc });
            }
        }
    });

    pwg.defineClassProperty(UiContext, "workspace", {
        get: function () {
            return this.layer.workspace;
        },
        set: function (c) {
            if (this._container == c)
                return;
            var last = this._container;
            this._container = c;
            if (this.on) {
                this.on("ui.ActiveContainerChanged", {
                    context: this,
                    last: last,
                    current: c
                });
            }
        }
    });

    pwg.defineClassProperty(UiContext, "activeObject", {
        get: function () {
            return this._activeObject;
        },
        set: function (o) {
            if (o == this._activeObject)
                return;
            var last = this._activeObject;
            this._activeObject = o;
            if (this.on) {
                this.on("ui.ActiveObjectChanged", {
                    context: this,
                    last: last,
                    current: o
                });
            }
            if (o) {
                if (o.getContext)
                    this.container = o;
                else
                    this.container = o.container;
            } else
                this.container = null;
        }
    });

    pwg.defineClassProperty(UiContext, "graphicsCtx", {
        get: function () {
            return this.layer.context;
        }
    });
    pwg.defineClassProperty(UiContext, "creatingBuild", {
        get: function () {
            return this._creatingBuild;
        },
        set: function (val) {
            this._creatingBuild = val;
            if (this._creatingBuild) {
                this._creatingBuild.setContext(this);
            }
        }
    });
    UiContext.prototype.onmousedown = function (e) {
        pwg.utils.ContextMenu.hide();
        if (this._activeTool)
            return this._activeTool.onmousedown(e);
        else
            return false;
    };
    UiContext.prototype.onmouseup = function (e) {
        if (this._activeTool) {
            var retval = this._activeTool.onmouseup(e);
            if (e.button == pwg.MOUSE_BUTTON_RIGHT && this._activeTool != this.defaultTool) {
                this.uitool = this.defaultTool;
            }
            return retval;
        } else
            return false;
    };

    UiContext.prototype.onmousemove = function (e) {
        if (this._activeTool)
            return this._activeTool.onmousemove(e);
        else
            return false;
    };

    UiContext.prototype.onmousewheel = function (e) {
        if (this._activeTool)
            return this._activeTool.onmousewheel(e);
        else
            return false;
    };

    UiContext.prototype.cancel = function (e) {
        if (this._activeTool)
            return this._activeTool.cancel();
        else
            return false;
    };

    UiContext.prototype.tryGetUiCommand = function (e) {
        if (this._activeTool)
            return this._activeTool.tryGetUiCommand(e);
        else
            return null;
    };
    UiContext.prototype.render = function (context) {
        if (this.activeObject) {
            this.activeObject.update(true);
            this.activeObject.render(context.drawing, 'ui');
        }
        if (this._activeTool) {
            this._activeTool.render(context);
        }
    };

    UiContext.prototype.raiseEvent = function (name, e) {
        if (this.on) {
            return this.on(name, e);
        }
    };
    pwg.UiContext = UiContext;
    /////////////////////////////////////////////////////////
    function UiTool(name) {
        pwg.super(this, pwg.Object);
        this.name = name;
        this.context = null;
    }
    pwg.inherits(UiTool, pwg.Object);
    UiTool.prototype.start = function (context) {
        this._context = context;
    };
    UiTool.prototype.stop = function (context) { };
    UiTool.prototype.onmouseup = function (e) {
        return false;
    };
    UiTool.prototype.onmousedown = function (e) {
        return false;
    };
    UiTool.prototype.onmousemove = function (e) {
        return false;
    };
    UiTool.prototype.onmousewheel = function (e) {
        return false;
    };
    UiTool.prototype.cancel = function (e) {
        return false;
    };
    UiTool.prototype.tryGetUiCommand = function (e) {
        return null;
    };
    UiTool.prototype.render = function (context) { };
    /////////////////////////////////////////////////////////////
    function tryGetLocation(scene, e, ignores, mode, filter, hitter) {
        if (hitter)
            hitter.hitted = null;
        var hitted = scene.hitTest(e, {
            ignores: ignores,
            filter: filter
        });
        if (hitted && hitted.succeed) {
            if (hitter)
                hitter.hitted = hitted.object;
            return hitted.object.tryGetLocation(e, mode);
        } else {
            return null;
        }
    }

    function get_location_mode(mode, e) {
        if (pwg.defined(mode))
            return mode;
        if (e.ctrl)
            return "joint";
        else
            return null;
    }
    /////////////////////////////////////////////////////////////
    function DefaultCreatingTool() {
        pwg.super(this, UiTool, 'uitool.creating');
    }
    pwg.inherits(DefaultCreatingTool, UiTool);
    pwg.defineClassId(DefaultCreatingTool, 'uitool.creating');
    DefaultCreatingTool.prototype.start = function (context) {
        this.context = context;
        this._last_e = null;
    };
    DefaultCreatingTool.prototype.stop = function (context) {
        if (this.context.creatingBuild) {
            this.context.creatingBuild.post();
        }
    };

    function make_handle_filter(build) {
        return function (o) {
            if (build.isLocationTarget) {
                return build.isLocationTarget(o);
            } else {
                return true;
            }
        }
    }

    // 在这里写上传事件
    DefaultCreatingTool.prototype.onLoadGeojson = function (geojson) {
        var build = this.context.creatingBuild; // 在build中撰写LoadGeojson方法
        if (build) {
            build.loadGeojson(geojson);
        }

    }

    DefaultCreatingTool.prototype.onmouseup = function (e) {
        if (this.context.creatingBuild) {
            var build = this.context.creatingBuild;
            var mode = build.getLocationMode();
            if (mode) {
                e.location = tryGetLocation(this.context.scene, e, null, mode, make_handle_filter(build), this);
            }
            if (e.button == pwg.MOUSE_BUTTON_LEFT) {
                var flag = build.update(e, "up");
                if (flag == "stop")
                    this.context.uitool = null;
            } else if (e.button == pwg.MOUSE_BUTTON_RIGHT) {
                var flag = build.post();
                if (flag == "stop")
                    this.context.uitool = null;
            }
        }
        this._last_e = null;
        return true;
    };
    DefaultCreatingTool.prototype.onmousedown = function (e) {
        var build = this.context.creatingBuild;
        if (build) {
            if (e.button == pwg.MOUSE_BUTTON_LEFT) {
                var mode = build.getLocationMode();
                if (pwg.defined(mode)) {
                    e.location = tryGetLocation(this.context.scene, e, null, mode, make_handle_filter(build), this);
                }
                build.update(e, "down");
            }
        }
        this._last_e = e;
        return true;
    };
    DefaultCreatingTool.prototype.onmousemove = function (e) {
        var build = this.context.creatingBuild;
        this.hitted = null;
        if (build) {
            if (e.button == pwg.MOUSE_BUTTON_LEFT || build.mode == "continuous") {
                e.location = "absolute";
                build.update(e, "move");
                var mode = build.getLocationMode();
                if (pwg.defined(mode)) {
                    e.location = tryGetLocation(this.context.scene, e, null, mode, make_handle_filter(build), this);
                }
            }
        }
        this._last_e = e;
        return true;
    };
    DefaultCreatingTool.prototype.cancel = function (e) {
        if (this.context.creatingBuild) {
            return this.context.creatingBuild.cancel();
        }
        return false;
    };
    DefaultCreatingTool.prototype.render = function (rc) {
        if (this.context.creatingBuild) {
            var drawing = rc.drawing;
            this.context.creatingBuild.render(rc);

            if (this._last_e && this._last_e.location && this._last_e.location.pixel) {
                var size = pwg.UI_HITTEST_TOLERENCE;
                drawing.begin();
                drawing.resetTransform();
                drawing.draw_ui_handle_circle(this._last_e.location.pixel, size * 4, 0xAAFF00FF, 0x0);
                drawing.end();
            }
            if (this.hitted) {
                this.hitted.update();
                this.hitted.render(drawing, "hot");
            }
        }
    };
    pwg.DefaultCreatingTool = DefaultCreatingTool;
    ////////////////////////////////////////////////////////////////
    //default editing tool                                        //
    ////////////////////////////////////////////////////////////////
    function DefaultEditingTool() {
        pwg.super(this, UiTool);
        this.activeHandle = null;
        this._last_e = null;
    }
    pwg.inherits(DefaultEditingTool, UiTool);

    DefaultEditingTool.prototype.start = function (context) {
        this.context = context;
    };
    DefaultEditingTool.prototype.stop = function (context) {

    };

    function get_nearset_ui_handle(o, p, tryGet) {
        if (!pwg.defined(o.handles))
            return null;
        var handles = o.handles;
        var D = pwg.UI_HITTEST_TOLERENCE;
        var handle = null;
        for (var i = 0, l = handles.length; i < l; i++) {
            var h = handles[i];
            var d = h.location.pixel.getDistance(p);
            if (d < D) {
                D = d;
                handle = h;
            }
        }
        if (!handle && o.tryGetUiHandle && tryGet) {
            handle = o.tryGetUiHandle({
                pixel: p
            });
        }
        return handle;
    }

    DefaultEditingTool.prototype.confirm_ui_handle = function (e) {
        if (!this.activeHandle) {
            var activeObject = this.context.activeObject;
            var activeHandle = null;
            if (activeObject) {
                activeHandle = get_nearset_ui_handle(activeObject, e.pixel, true);
                if (!activeHandle) {
                    var hit = activeObject.hitTest(e, pwg.drawing.default_paper_param);
                    if (!hit)
                        activeObject = null;
                    else {
                        activeObject = hit.object;
                    }
                }
            }
            if (!activeObject) {
                var option = {
                    tolerence: pwg.UI_HITTEST_TOLERENCE,
                };
                var hit = this.context.scene.hitTest(e, option);
                if (hit && hit.succeed) {
                    activeObject = hit.object;
                    activeHandle = get_nearset_ui_handle(activeObject, e.pixel);
                }
            }
            this.context.activeObject = activeObject;
            this.activeHandle = activeHandle;
        }
        return this.activeHandle != null;
    };

    DefaultEditingTool.prototype.onmousedown = function (e) {
        if (!this.context.container)
            return false;
        var last_active_object = this.context.activeObject;
        this.confirm_ui_handle(e);
        if (e.button != pwg.MOUSE_BUTTON_LEFT)
            return false;
        if (this.activeHandle) {
            {
                this.activeHandle.begin();
                this.activeHandle.update(e, 'update');
            }
        }
        return !!this.activeHandle || (last_active_object != this.context.activeObject && this.context.activeObject != null);
    };

    DefaultEditingTool.prototype.onmouseup = function (e) {
        var handle;

        function _filter_(o) {
            return handle.isLocationTarget(o);
        }
        if (this.activeHandle) {
            handle = this.activeHandle;
            var code = "";
            if (e.button == pwg.MOUSE_BUTTON_LEFT) {
                if (pwg.defined(handle.locationMode)) {

                    var location = tryGetLocation(this.context.container, e, [this.context.activeObject], handle.locationMode, _filter_, this);
                    if (!location && this.context.container != this.context.scene) {
                        location = tryGetLocation(this.context.scene, e, [this.context.activeObject], handle.locationMode, _filter_, this);
                    }
                    e.location = location;

                }
                code = this.activeHandle.update(e, 'post') || this.activeHandle.mode;
            }
            if (code != 'continuous' || e.button == pwg.MOUSE_BUTTON_RIGHT) {
                this.activeHandle.commit();
                this.activeHandle = null;
            }

            this.context.scene.__runtime_bounding_box = null;
            return true;
        } else
            return false;
    };

    DefaultEditingTool.prototype.onmousemove = function (e) {
        this._last_e = null;
        var handle = this.activeHandle;
        this.hitted = null;
        if (handle) {
            if (e.button == pwg.MOUSE_BUTTON_LEFT || handle.mode == "continuous") {
                var code = handle.update(e, 'update');
                var mode = get_location_mode(handle.locationMode, e);
                if (pwg.defined(mode)) {
                    e.location = tryGetLocation(this.context.scene, e, [this.context.activeObject], mode, make_handle_filter(handle), this);
                }
            }
            this.context.scene.__runtime_bounding_box = null;
            this._last_e = e;
            return true;
        } else
            return false;
    };
    DefaultEditingTool.prototype.onmousewheel = function (e) {

        return false;
    };
    DefaultEditingTool.prototype.cancel = function (e) {

        return false;
    };
    DefaultEditingTool.prototype.tryGetUiCommand = function (e) {
        var activeObject = this.context.activeObject;
        if (activeObject) {
            return activeObject.tryGetUiCommand(e, this.activeHandle);
        } else
            return null;
    };
    DefaultEditingTool.prototype.render = function (rc) {
        if (this.context.activeObject) {
            var drawing = rc.drawing;
            drawing.begin();
            drawing.resetTransform();
            var handles = this.context.activeObject.handles;
            if (handles) {
                var colors = pwg.drawing.ARGB;
                var size = pwg.UI_HITTEST_TOLERENCE * 2;
                for (var i = 0, l = handles.length; i < l; i++) {
                    var h = handles[i];
                    if (h.type == 'handle.move') {
                        if (h.pivot && h.pivot.style == "active")
                            drawing.draw_ui_handle_rect(h.location.pixel, size, colors.WHITE, colors.BLACK);
                        else
                            drawing.draw_ui_handle_rect(h.location.pixel, size, colors.YELLOW, colors.GREEN);
                    } else if (h.type == 'handle.rotate') {
                        drawing.draw_ui_handle_circle(h.location.pixel, size, colors.PINK, colors.BLACK);
                    } else if (h.type == 'handle.scale') {
                        drawing.draw_ui_handle_diamond(h.location.pixel, size, colors.GREEN, colors.BLACK);
                    } else if (h.type == 'handle.offset') {
                        drawing.draw_ui_handle_rect(h.location.pixel, size, colors.RED, colors.BLACK);
                    } else if (h.type == 'handle.size') {
                        drawing.draw_ui_handle_diamond(h.location.pixel, size, colors.GREEN, colors.BLACK);
                    } else if (h.type == 'handle.delete') {
                        drawing.draw_ui_handle_x(h.location.pixel, size, colors.RED, colors.BLACK);
                    } else if (h.type == 'handle.append') {
                        drawing.draw_ui_handle_plus(h.location.pixel, size, colors.RED, colors.BLACK);
                    } else {
                        drawing.draw_ui_handle_rect(h.location.pixel, size, colors.GREEN, colors.BLACK);
                    }
                }
                if (this.activeHandle) {
                    drawing.draw_ui_handle_circle(this.activeHandle.location.pixel, size / 2, colors.PINK, colors.GREEN);
                    if (this._last_e && this._last_e.location) {
                        drawing.draw_ui_handle_circle(this.activeHandle.location.pixel, size * 2, 0xAAFF00FF, 0x0);
                    }
                }
            }
            drawing.end();

            if (this.hitted) {
                this.hitted.render(drawing, "hot");
            }
        }

    };
    pwg.DefaultEditingTool = DefaultEditingTool;

    ////////////////////////////////////////////////////////////////
    //default information tool                                        //
    ////////////////////////////////////////////////////////////////
    function DefaultInfoTool() {
        pwg.super(this, UiTool);
        this._hottedObject = null;
        this._last_e = null;
    }
    pwg.inherits(DefaultInfoTool, UiTool);

    DefaultInfoTool.prototype.start = function (context) {
        this.context = context;
    };
    DefaultInfoTool.prototype.stop = function (context) {

    };

    DefaultInfoTool.prototype.onmousedown = function (e) {
        return false;
    };

    DefaultInfoTool.prototype.onmouseup = function (e) {
        var option = {
            tolerence: pwg.UI_HITTEST_TOLERENCE,
        };
        var hit = this.context.scene.hitTest(e, option);
        var activeObject = null;
        if (hit && hit.succeed) {
            activeObject = hit.object;
        }
        if (this.context.activeObject != activeObject) {
            this.context.activeObject = activeObject;
            return true;
        }
        return false;
    };

    DefaultInfoTool.prototype.onmousemove = function (e) {
        if (e.button != pwg.MOUSE_BUTTON_NONE) {
            return false;
        }
        var option = {
            tolerence: pwg.UI_HITTEST_TOLERENCE,
        };
        var hit = this.context.scene.hitTest(e, option);
        var activeObject = null;
        if (hit && hit.succeed) {
            activeObject = hit.object;
        }
        if (activeObject != this._hottedObject) {
            if (this._hottedObject) {
                this.context.raiseEvent("ui.mouseLeave", { e: e, object: this._hottedObject });
            }
            this._hottedObject = activeObject;
            if (activeObject) {
                this.context.raiseEvent("ui.mouseOver", { e: e, object: this._hottedObject });
            }
            return true;
        }
        return false;
    };
    DefaultInfoTool.prototype.onmousewheel = function (e) {

        return false;
    };
    DefaultInfoTool.prototype.cancel = function (e) {

        return false;
    };
    DefaultInfoTool.prototype.tryGetUiCommand = function (e) {
        return null;
    };
    DefaultInfoTool.prototype.render = function (rc) {
        if (this.context.activeObject) {
            this.context.activeObject.update(true);
            this.context.activeObject.render(rc.drawing, "ui");
        }
        if (this._hottedObject) {

            this._hottedObject.render(rc.drawing, "hot");
        }
    };
    pwg.DefaultInfoTool = DefaultInfoTool;
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
/*
    pwg-module-inline.js
*/
if(typeof pwg =='undefined')
    pwg={};
pwg.initialize=function(_paper)
{
    paper = _paper;
    pwg.base(_paper);
    pwg.drawing(_paper);
    pwg.math();
    pwg.utils();
    pwg.json();
    pwg.location();
    pwg.styles();
    pwg.graphics.base();
    pwg.graphics.frame();
    pwg.graphics.scene();
    pwg.cad();
    pwg.route();
    pwg.tower();
    pwg.device();
    pwg.tube();
    pwg.xpath();
    pwg.xlabel();
    pwg.uicontext();
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
if (typeof pwg === 'undefined')
    pwg = {};
//pwg.ol ={};
pwg.ol = function (ol) {
    that = pwg.ol;
    ///////////////////////////////////////////////////////////////////////
    //openlayers pwg map layer render,just as a proxy to layer   render  //
    ///////////////////////////////////////////////////////////////////////
    function PWGLayerRenderer(mapRender, layer) {
        ol.renderer.canvas.Layer.call(this, mapRender, layer);
        this.layer = layer;
    }
    ol.inherits(PWGLayerRenderer, ol.renderer.canvas.Layer);
    PWGLayerRenderer.prototype.composeFrame = function (frameState, layerState, context) {
        this.layer.render(context);
    };
    PWGLayerRenderer.prototype.prepareFrame = function (frameState, layerState, context) {
        return true;
    };
    PWGLayerRenderer.handles = function (type, layer) {
        return type === ol.renderer.Type.CANVAS && layer.getType() === PWGLayer.TYPE;
    };
    PWGLayerRenderer.create = function (mapRenderer, layer) {
        return new PWGLayerRenderer(mapRenderer, layer);
    };
    ol.plugins.registerMultiple(ol.PluginType.LAYER_RENDERER, [PWGLayerRenderer]);

    /////////////////////////////////////////////////////////////////////////////////
    function OpenLayerGraphicsContext() {}
    OpenLayerGraphicsContext.prototype.constuctor = OpenLayerGraphicsContext;
    OpenLayerGraphicsContext.prototype.pixelToGlobal = function (px, py) {
        var transform = this.map_.pixelToCoordinateTransform_;
        var p = py ? [px, py] : [px.x, px.y];
        ol.transform.apply(transform, p);
        return new pwg.point({
            x: p[0],
            y: p[1]
        });
    };
    OpenLayerGraphicsContext.prototype.globalToPixel = function (px, py) {
        var transform = this.map_.coordinateToPixelTransform_;
        var p = py ? [px, py] : [px.x, px.y];
        ol.transform.apply(transform, p);
        return new pwg.point({
            x: p[0],
            y: p[1]
        });
    };

    //!globe transform interface
    OpenLayerGraphicsContext.prototype.lonlatToGlobal = function (lon, lat) {
        var projection = this.map_.frameState_.viewState.projection;
        var lonlat = lat ? [lon, lat] : [lon.lon, lon.lat];
        var p = ol.proj.fromLonLat(lonlat, projection);
        return new pwg.point({
            x: p[0],
            y: p[1]
        });
    };

    OpenLayerGraphicsContext.prototype.globalToLonlat = function (px, py) {
        var projection = this.map_.frameState_.viewState.projection;
        var p = py ? [px, py] : [px.x, px.y];
        ll = ol.proj.toLonLat(p, projection);
        return new pwg.point(ll);
    };
    //!in global system the local and global are same
    OpenLayerGraphicsContext.prototype.localToGlobal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    OpenLayerGraphicsContext.prototype.globalToLocal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    OpenLayerGraphicsContext.prototype.getResolution = function () {
        return this.map_.frameState_.viewState.resolution;
    };

    OpenLayerGraphicsContext.prototype.getExtent = function () {
        return this.map_.getSize();
    };

    pwg.utils.injectTransformEx(OpenLayerGraphicsContext.prototype);

    //plotting layer
    function PWGLayer(opts) {
        ol.layer.Layer.call(this, opts);
        this.context = new OpenLayerGraphicsContext();
        this.context.drawing = new pwg.ContextDrawing2D();
        this.uicontext = new pwg.UiContext(this);
        this.uicontext.uitool = this.uicontext.tools.editing;
    }
    ol.inherits(PWGLayer, ol.layer.Layer);
    PWGLayer.TYPE = "PWG_LAYER";

    PWGLayer.prototype.setMap = function (map) {
        ol.layer.Layer.prototype.setMap.call(this, map);
        this.map_ = map;
        this.context.map_ = map;
    }
    PWGLayer.prototype.getMap = function () {
        return this.map_;
    };
    PWGLayer.prototype.getSourceState = function () {
        return "ready";
    };

    PWGLayer.prototype.render = function (context) {
        context.save();
        this.context.drawing.setRenderContext2D(context);
        if (this.workspace) {
            this.workspace.renderEx(this.context.drawing);
        }
        ///////////////////////////////////////////////////////////
        context.restore();
        context.save();
        this.uicontext.render(this.context);
        context.restore();
    };

    PWGLayer.prototype.getType = function () {
        return PWGLayer.TYPE;
    };

    /////////////////////////////////////////////////////////////////////
    function MouseEvent(type, button, pixel, lonlat, global,alt, ctrl, shift) {
        var e = {
            type: type,
            button: button,
            pixel: pixel,
            lonlat: lonlat,
            global: global,
            world: global,
            alt: alt,
            ctrl: ctrl,
            shift: shift
        };
        return e;
    }
    /**
        just for plotting
     */
    function PWGInteraction(layer) {
        this.owner = layer;
        this.uihandle = undefined;
        ol.interaction.Interaction.call(this, {
            handleEvent: PWGInteraction.handleEvent
        });
    }
    ol.inherits(PWGInteraction, ol.interaction.Interaction);
    var MapUiEvents = ol.MapBrowserEventType;

    function cvt_map_event_to_pwg_event(et) {
        if (et == MapUiEvents.POINTERDOWN)
            return pwg.MOUSE_DOWN;
        if (et == MapUiEvents.POINTERUP)
            return pwg.MOUSE_UP;
        if (et == MapUiEvents.POINTERMOVE)
            return pwg.MOUSE_MOVE;
        if (et == MapUiEvents.DBLCLICK)
            return pwg.MOUSE_UP;
        else
            return "none";
    }

    PWGInteraction.handleEvent = function (mapEvent) {
        var uihandle = this.uihandle ? this.uihandle : this.owner.uicontext;
        if (!uihandle)
            return true;
        var browserEvent = mapEvent.originalEvent;
        var done = false;
        var etype = cvt_map_event_to_pwg_event(mapEvent.type);
        if (etype != "none") {
            var map = mapEvent.map;
            var point = mapEvent.coordinate;
            var delta = browserEvent.shiftKey ? -this.delta_ : this.delta_;
            var pixel = mapEvent.pixel;
            var event = mapEvent.pointerEvent;

            var x = pixel[0];
            var y = pixel[1];
            var lonlat = this.owner.context.globalToLonlat(point[0], point[1]);
            var e = new MouseEvent(etype,
                event.button, new pwg.point(x, y),
                lonlat,
                new pwg.point(point[0], point[1]),
                event.altKey,event.ctrlKey, event.shiftKey);

            if (mapEvent.type == MapUiEvents.POINTERDOWN && uihandle.onmousedown) {
                done = uihandle.onmousedown(e);
            } 
            else
            if (mapEvent.type == MapUiEvents.POINTERMOVE && uihandle.onmousemove) {
                if (event.buttons != 0) {
                    e.button = event.buttons - 1;
                }
                done = uihandle.onmousemove(e);
            } 
            else
            if (mapEvent.type == MapUiEvents.POINTERUP && uihandle.onmouseup) {
                done = uihandle.onmouseup(e);
            } 
            else
            if (mapEvent.type == MapUiEvents.DBLCLICK && uihandle.ondblclick) {
                e.button = 2;
                done = uihandle.ondblclick(e);
            }
            this.owner.changed();
        }
        return !done;
    };
    that.Layer = PWGLayer;
    that.Interaction = PWGInteraction;
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
if (typeof pwg == "undefined")
    pwg = {};
pwg.mapbox = function (mapbox) {
    var that = pwg.mapbox;

    function OverLayerBase(opts) {
        if (opts && opts.map)
            this.map = opts.map || undefined;
    }
    pwg.inherits(OverLayerBase, pwg.Object);
    OverLayerBase.prototype.setMap = function (map) {
        this.map = map;
        this.t = this.map.transform;
        return this;
    };
    OverLayerBase.prototype.lnglat2pix = function (lng, lat) {
        if (this.map != undefined && this.map.project instanceof Function) {
            var lnglat = this.map.project(new mapboxgl.LngLat(
                lng, lat));
            return [lnglat.x, lnglat.y];
        }
        return [lng, lat];
    };
    ///////////////////////////////////////////////////////////////
    function GraphicsMapboxContext() { }
    GraphicsMapboxContext.prototype.constuctor = GraphicsMapboxContext;
    GraphicsMapboxContext._coordinate = new mapbox.MercatorCoordinate(0, 0, 0);
    GraphicsMapboxContext._lnglat = new mapbox.LngLat(0, 0, 0);
    const using_mapbox_mercator=false;
    const earthRadius = 6378137;
    const earthCircumference = 2 * Math.PI * earthRadius; // meters
    const minbb=[-20037508.34,-20048966.1];
    const maxbb=[20037508.34, 20048966.1];
    const xlength = earthCircumference;//maxbb[0]-minbb[0];
    const ylength = earthCircumference;//maxbb[1]-minbb[1];
    function from_mapbox_coordinate(p) {
        p.x=(p.x-0.5)*xlength;
        p.y=(0.5-p.y)*ylength;
        return p;
    };
    
    function to_mapbox_coordinate(p)
    {
        p.x=p.x/xlength+0.5;
        p.y=0.5-p.y/ylength;
        return p;
    }

    GraphicsMapboxContext.prototype.pixelToGlobal = function (px, py) {
        var t = this.t;
        var p = pwg.defined(py) ? { x: px, y: py } : px;
        p = t.pointCoordinate(p);
        if(!using_mapbox_mercator)
        {
            p = from_mapbox_coordinate(p);   
        }
        return new pwg.point(p);
    };

    GraphicsMapboxContext.prototype.globalToPixel = function (px, py) {
        var t = this.t;
        var coord = GraphicsMapboxContext._coordinate;
        if (pwg.defined(py)) {
            coord.x = px;
            coord.y = py;
        }
        else {
            coord.x = px.x;
            coord.y = px.y;
        }
        if(!using_mapbox_mercator)
        {
            coord = to_mapbox_coordinate(coord);   
        }
        var p = t._coordinatePoint(coord);
        return new pwg.point(p);
    };

    // GraphicsMapboxContext.prototype.globalToPixel = function (px, py) {
    //     if (typeof py == "undefined") {
    //         py = px.y;
    //         px = px.x;
    //     }
    //     var bounds = this.bounds;
    //     px = (px - bounds.x) / bounds.width;
    //     py = (py - bounds.y) / bounds.height;
    //     var vp = this.viewport;
    //     px = vp.x + vp.width * px; 
    //     py = vp.y + vp.height * py;
    //     return new pwg.point(px, py);
    // };

    // GraphicsMapboxContext.prototype.pixelToGlobal = function (px, py) {
    //     if (typeof py == "undefined") {
    //         py = px.y;
    //         px = px.x;
    //     }
    //     var viewport = this.viewport;
    //     px = (px - viewport.x) / viewport.width;
    //     py = (py - viewport.y) / viewport.height;
    //     var bounds = this.bounds;
    //     px = bounds.x + bounds.width * px;
    //     py = bounds.y + bounds.height * py;
    //     return new pwg.point(px, py);
    // };


    //!globe transform interface
    GraphicsMapboxContext.prototype.lonlatToGlobal = function (lon, lat) {
        var t = this.t;
        var lnglat = GraphicsMapboxContext._lnglat;
        if (pwg.defined(lat)) {
            lnglat.lng = lon;
            lnglat.lat = lat;
        }
        else {
            lnglat.lng = lon.x;
            lnglat.lat = lon.y;
        }
        var p = t.locationCoordinate(lnglat);
        if(!using_mapbox_mercator)
        {
            p = from_mapbox_coordinate(p);
        }
        return new pwg.point(p);
    };

    GraphicsMapboxContext.prototype.globalToLonlat = function (px, py) {
        var t = this.t;
        var coord = GraphicsMapboxContext._coordinate;
        if (pwg.defined(py)) {
            coord.x = px;
            coord.y = py;
        }
        else {
            coord.x = px.x;
            coord.y = px.y;
        }
        if(!using_mapbox_mercator)
        {
            p = to_mapbox_coordinate(coord);
        }
        var p = t.coordinateLocation(coord);
        return new pwg.point(p.lng, p.lat);
    };

    //!in global system the local and global are same
    GraphicsMapboxContext.prototype.localToGlobal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    GraphicsMapboxContext.prototype.globalToLocal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };


    GraphicsMapboxContext.prototype.get_zoom_level = function () {
        return this.t.zoom;
    };
    pwg.pointMinAdjustRatio = 0.2;
    pwg.pointAdjustEnableLevel = 16;
    pwg.miniEnableLevel = 16;
    GraphicsMapboxContext.prototype.get_point_adjust_ratio = function () {
        var t = this.t;
        if (t.zoom < pwg.pointAdjustEnableLevel) {
            var ratio = 1.0 / Math.pow(2, pwg.pointAdjustEnableLevel - t.zoom);
            return ratio < pwg.pointMinAdjustRatio ? pwg.pointMinAdjustRatio : ratio;
        }
        else {
            return 1;
        }
    };
    GraphicsMapboxContext.prototype.get_mini_adjust_ratio = function () {
        var t = this.t;
        if (t.zoom < pwg.miniEnableLevel)
            return Math.pow(2, pwg.miniEnableLevel - t.zoom);
        else
            return 1;
    };

    GraphicsMapboxContext.prototype.getExtent = function () {
        return null;
    };

    GraphicsMapboxContext.prototype.update = function () {
        var t = this.t;
        this.viewport = new pwg.rectangle(0, 0, t.size.x, t.size.y);
        this.zoom = this.get_zoom_level();
        this.pointAdjustRatio = this.get_point_adjust_ratio();
        this.miniAdjustRatio = this.get_mini_adjust_ratio();
        var minp = this.pixelToGlobal({ x: 0, y: 0 });//t.pointCoordinate({ x: 0, y: 0 });
        var maxp = this.pixelToGlobal(t.size);//t.pointCoordinate(t.size);
        //this.bounds = new pwg.rectangle(minp.x, minp.y, maxp.x - minp.x, maxp.y - minp.y);
        this.bounds = new pwg.rectangle(minp,maxp);
        var p1 = this.globalToLonlat(minp.x,minp.y);
        var p2 = this.globalToLonlat(maxp.x,maxp.y);
        this.__runtime_lonlat_bounding_box = new pwg.rectangle(p1,p2);
    };

    GraphicsMapboxContext.prototype.lnglat2pix = function (lon, lat) {
        var p = this.lonlatToGlobal(lon, lat);
        var px = this.globalToPixel(p.x, p.y);
        return px;
    };

    pwg.defineClassProperties(GraphicsMapboxContext, {
        // zoom:{get:function(){return this.get_zoom_level();}},
        // pointAdjustRatio:{get:function(){return this.get_point_adjust_ratio();}},
        // miniAdjustRatio:{get:function(){return this.get_mini_adjust_ratio();}}
    });

    pwg.utils.injectTransformEx(GraphicsMapboxContext.prototype);

    ///////////////////////////////////////////////////////////////
    function CanvasOverLayer(_opts) {
        pwg.super(this, OverLayerBase, _opts);
        this.canvas = this._init();
        if (_opts && _opts.map) {
            this.setMap(_opts.map);
            console.warn(`register map moveend rerender handler..`);
            _opts.map.on("move", () => {
                this.render();
            });
        }
    }
    pwg.inherits(CanvasOverLayer, OverLayerBase);
    CanvasOverLayer.prototype._init = function () {
        var canvasContainer = this.map._canvasContainer,
            mapboxCanvas = this.map._canvas,
            canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.className = "overlay-canvas";
        canvas.width = parseInt(mapboxCanvas.style.width) * pwg.DEVICE_PIXEL_RATIO;
        canvas.height = parseInt(mapboxCanvas.style.height) * pwg.DEVICE_PIXEL_RATIO;
        canvas.style.width = mapboxCanvas.style.width;
        canvas.style.height = mapboxCanvas.style.height;
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvasContainer.appendChild(canvas);
        this.canvas = canvas;

        this.context = new GraphicsMapboxContext();
        this.context.t = this.map.transform;
        this.context.drawing = new pwg.ContextDrawing2D();
        this.context.drawing.annotationContext=new pwg.xlabel.AnnotationContext();
        this.uicontext = new pwg.UiContext(this);
        this.uicontext.uitool = this.uicontext.tools.editing;
        var that = this;
        this.workspace = new pwg.Workspace(this.context, "yz");
        this.workspace.on = function (name, e) {
            if (that.on) {
                return that.on(name, e);
            }
        };
        this.uicontext.on = this.workspace.on;
        this._last_down_p = null;
        var map = this.map;
        map.on('mousedown', function (e) { that.onmouseevent(e); });
        map.on('mouseup', function (e) { that.onmouseevent(e); });
        map.on('mousemove', function (e) { that.onmouseevent(e); });
        return canvas;
    };

    CanvasOverLayer.prototype.render = function (ectx) {

        var context = this.context;
        context.update();
        var ctx = ectx?ectx:this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    };
    
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
            this.workspace.renderEx(context);
        }
        ctx.restore();
        ///////////////////////////////////////////////////////////
        ctx.save();
        this.uicontext.render(this.context);
        ctx.restore();
        if (pwg.worker) {
            var viewport = context.viewport.clone();
            //var minp = context.pixelToGlobal(0, 0);
            //var maxp = context.pixelToGlobal(viewport.width, viewport.height);
            //var bounds2 = new pwg.rectangle({ x: minp.x, y: minp.y, width: maxp.x - minp.x, height: maxp.y - minp.y });
            var bounds = context.bounds;
            var __runtime_lonlat_bounding_box=context.__runtime_lonlat_bounding_box;
            var ratio = pwg.DEVICE_PIXEL_RATIO;
            var message = { 
                            name: "update-map-frame",
                            pixelRatio:ratio,
                            pointMinAdjustRatio:pwg.pointMinAdjustRatio,
                            pointAdjustEnableLevel:pwg.pointAdjustEnableLevel,
                            miniEnableLevel:pwg.miniEnableLevel,
                            zoom: context.zoom, 
                            viewport: viewport, 
                            bounds: bounds,
                            __runtime_lonlat_bounding_box:__runtime_lonlat_bounding_box
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

    function create_mouse_event(type, button, pixel, lonlat, global, alt, ctrl, shift) {
        var e = {
            type: type,
            button: button,
            pixel: pixel,
            lonlat: lonlat,
            global: global,
            world: global,
            alt: alt,
            ctrl: ctrl,
            shift: shift
        };
        return e;
    }

    CanvasOverLayer.prototype.tryGetUiCommand = function (e) {
        var px = new pwg.point(e.offsetX, e.offsetY);
        var global = this.context.pixelToGlobal(px);
        var lnglat = this.context.globalToLonlat(global);
        var ee = create_mouse_event("context-menu", 0, px, lnglat, global, false, false);
        return this.uicontext.tryGetUiCommand(ee);
    };

    CanvasOverLayer.prototype.onmouseevent = function (e) {
        var done = false;
        var xe = e.originalEvent;
        if (xe.altKey)
            return done;
        var uihandler = this.uicontext;
        if (uihandler) {
            var etype = e.type;
            var ktype = etype === "mousemove" ? pwg.MOUSE_MOVE : (etype === "mousedown" ? pwg.MOUSE_DOWN : pwg.MOUSE_UP);
            var button = xe.button;
            if (e.type == 'mousemove') {
                if (xe.buttons & 0x1)
                    button = 0;
                else
                    button = pwg.MOUSE_BUTTON_NONE;
            }
            var px = new pwg.point(xe.offsetX, xe.offsetY);
            var lnglat = new pwg.lonlat(e.lngLat.lng, e.lngLat.lat);
            var global = this.context.lonlatToGlobal(lnglat);
            var ee = create_mouse_event(ktype, button, px, lnglat, global, xe.ctrlKey, xe.shiftKey);
            if (etype == 'mousemove') {
                done = uihandler.onmousemove(ee);
            }
            else if (etype == 'mousedown') {
                this._last_down_p = ee.pixel;
                done = uihandler.onmousedown(ee);
            }
            else if (etype == 'mouseup') {
                done = uihandler.onmouseup(ee) || this._last_down_p.equals(ee.pixel);
            }
        }
        if (done) {
            this.canvas.style.cursor = 'crosshair';
            this.map.getCanvas().style.cursor = 'crosshair';
            e.preventDefault();
            this.render();
        }
        else {
            this.map.getCanvas().style.cursor = 'default';
            this.canvas.style.cursor = 'default';
        }
    };

    CanvasOverLayer.prototype.loadGeojson = function (geojson) {
        // 只允许上传指定格式的geojson
        // {
        //   "type": "Feature",
        //   "properties": {},
        //   "geometry": {
        //     "coordinates": [经度, 纬度],
        //     "type": "Point"
        //   }
        // }
        let coords = null;
        if (
            geojson &&
            geojson.type === 'Feature' &&
            geojson.geometry &&
            geojson.geometry.type === 'Point' &&
            Array.isArray(geojson.geometry.coordinates)
        ) {
            coords = geojson.geometry.coordinates;
            console.log(coords)
        } else {
            console.warn('请上传合法geojson!')
        }
    }

    pwg.mapbox.Layer = CanvasOverLayer;
};


/*
pwg graphics lib wenyongning@njnu.edu.cn
编译时间:2025-07-08 10:28:21.448831
*/
pwg = pwg || {};
pwg.jxt = function () {
    pwg.jxtSnapDistance = 20;
    pwg.jxtSnapDisplayScale = 0.5;
    pwg.jxtSnapDisplay = true;
    pwg.jxtSnapEnable = true;

    function JxtCanvas(container) {
        this._container = container;
        var canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.className = "overlay-canvas"; //
        canvas.width = parseInt(container.style.width) * pwg.DEVICE_PIXEL_RATIO;
        canvas.height = parseInt(container.style.height) * pwg.DEVICE_PIXEL_RATIO;
        canvas.style.width = container.style.width;
        canvas.style.height = container.style.height;
        container.appendChild(canvas);
        this.canvas = canvas;
        this.context = this;
        this.drawing = new pwg.ContextDrawing2D();
        this.drawing.annotationContext = new pwg.xlabel.AnnotationContext();
        this.uicontext = new pwg.UiContext(this);
        this.uicontext.uitool = this.uicontext.tools.editing;
        var that = this;
        this.workspace = new pwg.Workspace(this, "jxt");
        this.workspace.on = function (name, e) {
            if (that.on) {
                return that.on(name, e);
            }
        };
        this.uicontext.on = this.workspace.on;
        this.last_mouse_p = new pwg.point(0, 0);

        this.offset = {
            x: 10,
            y: 10
        };
        this.scale = 1;
        canvas.onmousedown = function (e) {
            e.type = "mousedown";
            that.onmouseevent(e);
            that.last_mouse_p.x = e.offsetX;
            that.last_mouse_p.y = e.offsetY;
        };
        canvas.onmousemove = function (e) {
            e.type = "mousemove";
            if (!that.onmouseevent(e)) {
                if (e.buttons == 1) {
                    var dx = e.offsetX - that.last_mouse_p.x;
                    var dy = e.offsetY - that.last_mouse_p.y;
                    that.offset.x += dx / that.scale;
                    that.offset.y += -dy / that.scale;
                    that.render();
                }
            } else {
                that.render();
            }

            that.last_mouse_p.x = e.offsetX;
            that.last_mouse_p.y = e.offsetY;
        };
        canvas.onmouseup = function (e) {
            e.type = "mouseup";
            if (that.onmouseevent(e)) {
                that.render();
            }
            that.last_mouse_p.x = e.offsetX;
            that.last_mouse_p.y = e.offsetY;
        };
        canvas.onmousewheel = function (e) {
            e.type = "mousewheel";
            var cp1 = that.pixelToGlobal(e.offsetX, e.offsetY);
            var d = e.wheelDelta || -e.deltaY + 40;
            that.scale *= (1 + d / 2400);
            that.scale = pwg.clamp(that.scale, 0.2, 16);
            var cp2 = that.pixelToGlobal(e.offsetX, e.offsetY);
            var dx = cp1.x - cp2.x;
            var dy = cp1.y - cp2.y;
            that.offset.x -= dx;
            that.offset.y -= dy;

            that.render();
        };
        canvas.oncontextmenu = function (e) {};
    }

    pwg.inherits(JxtCanvas, pwg.Object);
    pwg.defineClassId(JxtCanvas, "pwg.JxCanvas");

    JxtCanvas.prototype.pixelToGlobal = function (px, py) {
        if (!pwg.defined(py)) {
            py = px.y;
            px = px.x;
        }
        py = this.canvas.offsetHeight - py;
        var x = px / this.scale - this.offset.x;
        var y = py / this.scale - this.offset.y;
        return new pwg.point(x, y);
    };

    JxtCanvas.prototype.globalToPixel = function (x, y) {
        if (!pwg.defined(y)) {
            y = x.y;
            x = x.x;
        }
        var px = (x + this.offset.x) * this.scale;
        var py = (y + this.offset.y) * this.scale;
        py = this.canvas.offsetHeight - py;
        return new pwg.point(px, py);
    };

    JxtCanvas.prototype.lonlatToGlobal = function (lon, lat) {
        return lat ? new pwg.point(lon, lat) : new pwg.point(lon);
    };

    JxtCanvas.prototype.globalToLonlat = function (px, py) {

        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    JxtCanvas.prototype.localToGlobal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    JxtCanvas.prototype.globalToLocal = function (px, py) {
        return py ? new pwg.point(px, py) : new pwg.point(px);
    };

    JxtCanvas.prototype.get_zoom_level = function () {
        return this.scale;
    };
    JxtCanvas.prototype.get_point_adjust_ratio = function () {
        var ratio = this.scale;
        return ratio;
    };
    JxtCanvas.prototype.get_mini_adjust_ratio = function () {
        var ratio = this.scale;
        return ratio;
    };

    JxtCanvas.prototype.getExtent = function () {
        return null;
    };

    JxtCanvas.prototype.update = function () {
        this.viewport = new pwg.rectangle(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.zoom = Math.log(this.scale) / Math.log(2);
        this.pointAdjustRatio = this.get_point_adjust_ratio();
        this.miniAdjustRatio = this.get_mini_adjust_ratio();
    };

    function draw_arrow_part(drawing, p0, pa, length, angle) {
        var ax = pa.subtract(p0);
        ax = ax.normalize();
        ax = ax.rotate(angle);
        ax = ax.multiply(length);
        var pt = pa.add(ax);
        drawing.moveTo(pt.x, pt.y);
        drawing.lineTo(pa.x, pa.y);
    }

    function make_align_grid_lines(context) {
        var drawing = context.drawing;
        var vp = context.viewport;
        var upLeft = context.pixelToGlobal(0, 0);
        var bottomRight = context.pixelToGlobal(vp.width, vp.height);

        var x0 = Math.min(upLeft.x, bottomRight.x);
        var x1 = Math.max(upLeft.x, bottomRight.x);
        var y0 = Math.min(upLeft.y, bottomRight.y);
        var y1 = Math.max(upLeft.y, bottomRight.y);
        var snapDistance = pwg.jxtSnapDistance;
        x0 = Math.round(x0 / snapDistance - 1) * snapDistance;
        x1 = Math.round(x1 / snapDistance + 1) * snapDistance;
        y0 = Math.round(y0 / snapDistance - 1) * snapDistance;
        y1 = Math.round(y1 / snapDistance + 1) * snapDistance;

        for (var y = y0; y < y1; y += snapDistance) {
            var p0 = context.globalToPixel(x0, y);
            var p1 = context.globalToPixel(x1, y);
            drawing.moveTo(p0.x, p0.y);
            drawing.lineTo(p1.x, p1.y);
        }

        for (var x = x0; x < x1; x += snapDistance) {
            var p0 = context.globalToPixel(x, y0);
            var p1 = context.globalToPixel(x, y1);
            drawing.moveTo(p0.x, p0.y);
            drawing.lineTo(p1.x, p1.y);
        }
    }

    JxtCanvas.prototype.render = function (ectx) {
        var context = this.context;
        context.update();
        var ctx = ectx ? ectx : this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        context.drawing.setRenderContext2D(ctx);
        var p0 = this.globalToPixel(0, 0);
        var px = this.globalToPixel(100, 0);
        var py = this.globalToPixel(0, 100);
        var drawing = context.drawing;

        drawing.resetTransform();
        if (this.scale > pwg.jxtSnapDisplayScale && pwg.jxtSnapEnable && pwg.jxtSnapDisplay) {
            drawing.beginPath();
            drawing.stroke.setWidth(1.0);
            drawing.stroke.setColor('#999999');
            drawing.stroke.setType(1, 3);
            make_align_grid_lines(context);
            drawing.strokeExec();
        }

        drawing.stroke.setWidth(1.0);
        drawing.stroke.setColor('#333333');
        drawing.stroke.setType(0, 2);
        drawing.beginPath();

        drawing.moveTo(px.x, px.y);
        drawing.lineTo(p0.x, p0.y);
        drawing.lineTo(py.x, py.y);
        draw_arrow_part(drawing, p0, px, 10, -145);
        draw_arrow_part(drawing, p0, px, 10, 145);

        draw_arrow_part(drawing, p0, py, 10, -145);
        draw_arrow_part(drawing, p0, py, 10, 145);
        drawing.strokeExec();

        drawing.strokeRect(p0.x - 5, p0.y - 5, 10, 10);
        ctx.restore();
        ctx.save();
        if (this.workspace) {
            this.workspace.renderEx(context);
        }
        ctx.restore();
        ///////////////////////////////////////////////////////////
        ctx.save();
        this.uicontext.render(this.context);
        ctx.restore();
    };

    function create_mouse_event(type, button, pixel, lonlat, global, alt, ctrl, shift) {
        var e = {
            type: type,
            button: button,
            pixel: pixel,
            lonlat: lonlat,
            global: global,
            world: global,
            alt: alt,
            ctrl: ctrl,
            shift: shift
        };
        return e;
    }

    JxtCanvas.prototype.onmouseevent = function (e) {
        var done = false;
        if (e.altKey)
            return done;
        var uihandler = this.uicontext;
        if (uihandler) {
            var etype = e.type;
            var ktype = etype === "mousemove" ? pwg.MOUSE_MOVE : (etype === "mousedown" ? pwg.MOUSE_DOWN : pwg.MOUSE_UP);
            var button = e.button;
            if (e.type == 'mousemove') {
                if (e.buttons & 0x1)
                    button = 0;
                else
                    button = pwg.MOUSE_BUTTON_NONE;
            }
            var px = new pwg.point(e.offsetX, e.offsetY);
            var global = this.pixelToGlobal(px);
            if (pwg.jxtSnapEnable) {
                var snapDistance = pwg.jxtSnapDistance;
                global.x = Math.round(global.x / snapDistance) * snapDistance;
                global.y = Math.round(global.y / snapDistance) * snapDistance;
            }

            var lnglat = global;

            var ee = create_mouse_event(ktype, button, px, lnglat, global, e.ctrlKey, e.shiftKey);
            if (etype == 'mousemove') {
                done = uihandler.onmousemove(ee);
            } else if (etype == 'mousedown') {
                this.last_mouse_p = ee.pixel;
                done = uihandler.onmousedown(ee);
            } else if (etype == 'mouseup') {
                done = uihandler.onmouseup(ee) || this.last_mouse_p.equals(ee.pixel);
            }
        }
        if (done) {
            this.canvas.style.cursor = 'crosshair';
            e.preventDefault();
        } else {
            this.canvas.style.cursor = 'default';
        }
        return done;
    };
    pwg.utils.injectTransformEx(JxtCanvas.prototype);
    pwg.JxtCanvas = JxtCanvas;
};


export default pwg
