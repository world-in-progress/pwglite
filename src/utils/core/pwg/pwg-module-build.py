#build pwg into one js file
import os.path as path
import datetime
files =\
"""
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
    pwg-simple-point.js
    pwg-device.js
    pwg-uicontext.js
    pwg-module-inline.js
    pwg-ol.js
    pwg-mapbox.js
    pwg-jxt.js
"""

base= path.dirname(__file__)+"/"
o = open(base+"pwg-module.js",'w+', encoding="utf-8")
o.write("let pwg;let paper;\n")
memo=("/*\n")
memo+=("pwg graphics lib wenyongning@njnu.edu.cn\n")
memo+=("编译时间:"+str(datetime.datetime.now())+"\n")
memo+=("*/\n")
#o.write(memo)
files = files.split()
for fn in files:
    fi = open(base+fn.strip(), encoding="utf-8")
    o.write(memo)
    lines = fi.read()+"\n\n\n"
    o.write(lines)
    fi.close()
o.write("export default pwg\n")
o.close()
