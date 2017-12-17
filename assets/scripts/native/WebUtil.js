/**
 * 通过原生浏览器访问接口类
 * cc.vv.webUtil使用
 */
cc.Class({
    extends: cc.Component,

    properties: {
        ANDROID_API: null,
        IOS_API: null,
        url_android: null,
        url_ios: null
    },

    // use this for initialization
    init: function () {
        console.log("onLoad updatePackage.js");
        this.ANDROID_API = "com/ypgames/zymj/WXAPI";
        this.IOS_API = "AppController";
        this.url_android = "https://www.yp6868.com/download/android/ZYMJ.apk";
        this.url_ios = "https://www.yp6868.com/ZYMJ.plist";

        this.url_android = this.url_ios = "https://www.yp6868.com/download/zunyi.html";
    },

    open: function () {

        if (cc.sys.os == cc.sys.OS_ANDROID) {
            console.log("android ");
            jsb.reflection.callStaticMethod(this.ANDROID_API, "Open", "(Ljava/lang/String;)V", this.url_android);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            console.log("this url=" + this.url_ios, "this api=" + this.IOS_API);
            jsb.reflection.callStaticMethod(this.IOS_API, "open:", this.url_ios);
        }
    },

    openUrl: function (url) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            console.log("android ");
            jsb.reflection.callStaticMethod(this.ANDROID_API, "Open", "(Ljava/lang/String;)V", url);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(this.IOS_API, "open:", url);
        } else {
            console.log('test url=', url);
        }
    },

    mergeUrl: function (url, data) {
        var str = "?";
        for (var k in data) {
            if (str != "?") {
                str += "&";
            }
            str += k + "=" + data[k];
        }
        console.log('aaaaaaaaaaaaaaaaa' + encodeURI(str));
        return url + encodeURI(str);
    },

    startPayByWap: function (data) {
        const url = this.mergeUrl('http://www.yp6868.com/zy_agent/Userrecharge.html', {
            // action: 'tj',
            userId: cc.vv.userMgr.userId,
            money: data.money,
            goodsNum: data.gem,
            type: data.type,
            give: data.give,
        });
        console.log('url=', url);
        this.openUrl(url);
    },

});