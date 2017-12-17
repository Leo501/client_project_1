/**
 * 全局对象
 * 用于定义全局变量与实例
 * 作用与cc.vv.xxx一样。
 * cc.vv.xxx是旧接口，请用G.xxx对象代替
 */
//
const LoaderMng = require('LoaderMng');
const AnimationUtil = require('AnimationUtil');

window.G = {
    VERSION: 'v2.0.0',
    curNode: null,
    nodePoolArr: {},
    loaderMng: new LoaderMng(),
    payType: {
        'card': 0,
        'coin': 1,
    },

    //公共对象
    animUtil: new AnimationUtil(),

    //========定义扑克对象=========
    //扑克图片资源对象 ,定义在pokerSrcMng.js中
    pokerSrcMng: null,
    //扑克管理对象，用于与网络通信，和操作、显示。是扑克主要脚本。
    pokerGame: null,
}