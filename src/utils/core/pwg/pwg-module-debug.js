if(typeof __pwg_base__=='undefined')
    __pwg_base__ = '/pwg/';
    
function __pwg_include__(file) {
    document.write('<script type="text/javascript" src="' + __pwg_base__ + file + '"></script>');
}
function __pwg_module_init__() {
    var files =
    `
    pwg-base.js
    pwg-math.js
    pwg-utils.js
    pwg-drawing.js
    pwg-styles.js
    pwg-json.js
    pwg-location.js
    pwg-graphics-base.js
    pwg-graphics-frame.js
    pwg-graphics-scene.js
    pwg-cad.js
    pwg-route.js
    pwg-xpath.js
    pwg-xlabel.js
    pwg-tube-union.js
    pwg-tower.js
    pwg-device.js
    pwg-uicontext.js
    pwg-module-inline.js
    pwg-ol.js
    pwg-mapbox.js
    `;
    files = files.split('\n');
    for (var i = 0, l = files.length; i < l; i++) {
        var fi = files[i].trim();
        if(fi.length>3)
            __pwg_include__(fi);
    }
}
__pwg_module_init__();