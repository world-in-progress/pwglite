if (typeof pwg == 'undefined')
    pwg = {};
pwg.resource = function () {
    /*加载系统使用的资源*/
    function __load__() {
        var drawing = pwg.drawing;
        var define = drawing.define;
        {
            var circle = new paper.Shape.Circle(0, 0, 64);
            circle.fillColor = "red";
            circle.strokeColor = "black";
            circle.strokeWidth = "3";
            define("circle-0", circle);
        }
        {
            // define("熔断器", "pwg/svg/熔断器.png");
            // define("变压器", "pwg/svg/变压器.png");
        }
        {
            //define("D1", pwg.ROOT_PATH+"/pwg/svg/electric-wave.svg");
        }
    }
    __load__();
    // pwg.resource.define =define;
    // pwg.resource.using  =pwg.drawing.usingSVG;
};

