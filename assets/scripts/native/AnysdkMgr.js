/**
 * 微信接口类，与第三方支付
 * cc.vv.anysdkMgr来使用
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _isCapturing: false,
        test_url: null,
        curInfs: null,
        isShowPayAlert: true,
        _payType: null,
    },

    // use this for initialization
    onLoad: function () {},

    init: function () {
        //com.ypgames.zymj
        this.ANDROID_API = "com/ypgames/zymj/WXAPI";
        this.ANDROID_API_PAY = 'com/ypgames/zymj/utils/XqtWxPay';
        this.IOS_API = "AppController";
    },

    login: function () {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            console.log("cc.sys.OS_ANDROID");
            jsb.reflection.callStaticMethod(this.ANDROID_API, "Login", "()V");
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(this.IOS_API, "login");
        } else {
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    //开始支付
    startPlay: function (infs) {
        this._payType = infs.type;
        cc.vv.WebUtil.startPayByWap(infs);
        cc.vv.alert.show('', '是否充值成功?', () => {
            console.log('yes recharge');
            G.curNode.emit('pay_result_update');
        });
    },

    setIosAuto: function () {
        if (cc.sys.os == cc.sys.OS_IOS) {
            console.log('setAuto');
            jsb.reflection.callStaticMethod(this.IOS_API, "setAuto");
            return;
        }
    },

    onCreatePlayOrder(orderInfs) {
        console.log('onCreatePlayOrder', orderInfs);
        let infs = orderInfs.split('_');
    },


    share: function (title, desc, type) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.ANDROID_API, "Share", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V", cc.vv.SI.appweb, title, desc, type);
            // jsb.reflection.callStaticMethod(this.ANDROID_API, "Share", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V","http://www.yp6868.com",title,desc,type);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:type:", cc.vv.SI.appweb, title, desc, type);
        } else {
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    shareResult: function (type, isHavaDiamond) {
        if (this._isCapturing) {
            return;
        }
        console.log('isHavaDiamond=' + isHavaDiamond);
        this._isCapturing = true;
        var size = cc.director.getWinSize();
        var fileName = "result_share.jpg";
        var currentDate = new Date();
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if (jsb.fileUtils.isFileExist(fullPath)) {
            jsb.fileUtils.removeFile(fullPath);
        }

        var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height), cc.Texture2D.PIXEL_FORMAT_RGBA4444, gl.DEPTH24_STENCIL8_OES);

        texture.setPosition(cc.p(size.width / 2, size.height / 2));
        texture.begin();
        cc.director.getRunningScene().visit();
        texture.end();
        texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);

        var self = this;
        var tryTimes = 0;
        var fn = function () {
            if (jsb.fileUtils.isFileExist(fullPath)) {
                var height = 100;
                var scale = height / size.height;
                var width = Math.floor(size.width * scale);

                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    jsb.reflection.callStaticMethod(self.ANDROID_API, "ShareIMG", "(Ljava/lang/String;IIZZ)V", fullPath, width, height, type, true);
                } else if (cc.sys.os == cc.sys.OS_IOS) {
                    jsb.reflection.callStaticMethod(self.IOS_API, "shareIMG:width:height:type:diamond:", fullPath, width, height, type, isHavaDiamond);
                } else {
                    console.log("platform:" + cc.sys.os + " dosn't implement share.");
                }
                self._isCapturing = false;
            } else {
                tryTimes++;
                if (tryTimes > 10) {
                    console.log("time out...");
                    return;
                }
                setTimeout(fn, 50);
            }
        }
        setTimeout(fn, 50);
    },

    /**
     * 对应native 平台，返回微信登陆code的回调函数
     */
    onLoginResp: function (code) {
        console.log("login wechat resp",code);
        var self = this;
        var fn = function (ret) {
            cc.vv.timeout.unschedule(self.checkWXAuto, self);
            if (ret.errcode == 0) {
                cc.sys.localStorage.removeItem("wx_account");
                cc.sys.localStorage.removeItem("wx_sign");
                cc.sys.localStorage.removeItem("hall");
                cc.sys.localStorage.removeItem("appweb");
                cc.sys.localStorage.setItem("wx_account", ret.account);
                cc.sys.localStorage.setItem("wx_sign", ret.sign);
                cc.sys.localStorage.setItem("hall", ret.halladdr);
                cc.sys.localStorage.setItem("appweb", ret.appweb);
                cc.vv.SI = {};
                cc.vv.SI.hall = ret.halladdr;
                //添加金币场ip，应用于原生平台
                cc.sys.localStorage.setItem("coinUrl", JSON.stringify(ret.goldHallAddr));
                cc.vv.http.coinUrl = ret.goldHallAddr;
                cc.vv.SI.appweb = ret.appweb;
                //额外要添加的信息
                cc.vv.userMgr.login_id = ret.userid;
                if (cc.vv.baseInfoMap == null) {
                    cc.vv.baseInfoMap = {};
                }
                if (ret.headimgurl) {
                    var url = ret.headimgurl /*+ ".jpg"*/ ;
                }
                cc.vv.userMgr.img_url = url;
                var info = {
                    name: ret.name,
                    sex: ret.sex,
                    url: url,
                }
                //当errcode为0时，检查是否超时。
                if (cc.vv.LoginHandler) {
                    cc.vv.LoginHandler.emit("login_checkout_push");
                }
                cc.vv.LogUtil.sendLog('/wechat_auth','ok');
            }

            if (ret.errcode == -7) {
                console.log("ret", ret);
                cc.vv.downloadAlert.show("提示", ret.errmsg, () => {
                    console.log('ok');
                }, () => {
                    cc.vv.WebUtil.open();
                });
                cc.vv.LogUtil.sendLog('/wechat_auth','fail，errcode===-7');
                return;
            }
            cc.vv.userMgr.onAuth(ret);

        }
        let version = cc.vv.initVersion._localVersion;
        //把code发给服务器，创建/查询用户。回调函数返回用户信息。可能会返回用户失败。  
        if (version === '') {
            version = G.VERSION.substr(1);
        }
        cc.vv.http.sendRequest("/wechat_auth", {
            code: code,
            os: cc.sys.os,
            version: version
        }, fn, cc.vv.http.wxUrl);
        cc.vv.wc.hide();
        cc.vv.timeout.timeoutOne(self.checkWXAuto, self, 10);
        cc.vv.LogUtil.sendLog('/wechat_auth','loaing request servers for wechar resp');
    },

    checkWXAuto: function () {
        cc.vv.login_alert.show("提示", "获取微信信息失败，请重新登陆！");
    },
    onShareResp: function () {
        var account = cc.sys.localStorage.getItem("wx_account");
        var userId = cc.vv.userMgr.userId;
        var fn = function (ret) {
            if (ret.errcode == 0) {
                cc.vv.alert.show("提示", "分享成功");
                var fs = function (ret) {
                    console.log("ret.errcode=" + ret.errcode);
                    if (ret.errcode == 0) {
                        console.log("share succuse ret=" + ret);
                        cc.vv.userMgr.gems = ret.data.gems;
                        console.log(ret);
                        console.log("cc.vv.userMgr.gems" + cc.vv.userMgr.gems);
                        if (cc.vv.hallHandle) {
                            cc.vv.hallHandle.emit("refreshGemTip_push");
                        }
                    } else {
                        console.log("ret.errcode!=0 in onShareResp");
                    }
                }
                cc.vv.http.sendRequest("/getGems", {
                    account: account
                }, fs);
            } else {
                // cc.vv.alert.show("提示","分享失败");
            }

            if (cc.vv.hallHandle) {
                cc.vv.hallHandle.emit("close_share_win_push");
            }
        }

        cc.vv.http.sendRequest("/share", {
            userId: userId
        }, fn);
    }
});