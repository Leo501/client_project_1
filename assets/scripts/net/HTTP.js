/**
 * 用于http通讯
 * 是全局单例
 * 通过cc.vv.http使用。
 */

// var URL = "http://192.168.0.103:7000";
var URL = "http://139.129.109.236:8000";
// var URL = "http://101.37.81.210:7000";

cc.VERSION = 20161204;

var HTTP = cc.Class({
    extends: cc.Component,

    statics: {
        sessionId: 0,
        userId: 0,
        master_url: URL,
        url: URL,
        wxUrl: URL,
        sendRequest: function (path, data, handler, extraUrl) {
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.timeout = 5000;
            var str = "?";
            for (var k in data) {
                if (str != "?") {
                    str += "&";
                }
                str += k + "=" + data[k];
            }
            if (extraUrl == null) {
                extraUrl = HTTP.url;
            }
            var requestURL = extraUrl + path + encodeURI(str);
            console.log("RequestURL:" + requestURL);
            xhr.open("GET", requestURL, true);
            if (cc.sys.isNative) {
                xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    // console.log("http res(" + xhr.responseText.length + "):" + xhr.responseText);
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if (handler !== null) {
                            handler(ret);
                        } /* code */
                    } catch (e) {
                        console.log(e);
                    } finally {
                        if (cc.vv && cc.vv.wc) {
                            //       cc.vv.wc.hide();    
                        }
                    }
                }
            };
            if (cc.vv && cc.vv.wc) {
                //cc.vv.wc.show();
            }
            xhr.send();
        },
    },
});