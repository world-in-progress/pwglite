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