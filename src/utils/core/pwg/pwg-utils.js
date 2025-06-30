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

    XmlConstants = {
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