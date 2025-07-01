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