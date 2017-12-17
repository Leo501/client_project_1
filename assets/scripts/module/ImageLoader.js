function loadImage(url, code, callback) {
    cc.loader.load({
        url: url,
        type: 'jpg',
    }, function (err, tex) {
        console.log("err =" + err);
        var spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height));
        callback(code, spriteFrame);
    });
};

function getBaseInfo(userid, callback) {
    if (cc.vv.baseInfoMap == null) {
        cc.vv.baseInfoMap = {};
    }
    cc.vv.http.sendRequest('/base_info', {
        userid: userid
    }, function (ret) {
        var url = null;
        if (ret.headimgurl) {
            url = ret.headimgurl /*+ ".jpg"*/ ;
        }
        console.log("base_info of url=" + url);
        var info = {
            name: ret.name,
            sex: ret.sex,
            url: url,
        }
        cc.vv.baseInfoMap[userid] = info;
        callback(userid, info);

    }, cc.vv.http.master_url);
};

function setInfo(userid, info) {

    if (cc.vv.baseInfoMap == null) {
        cc.vv.baseInfoMap = {};
    }
    cc.vv.baseInfoMap[userid] = info;
};

cc.Class({
    extends: cc.Component,
    properties: {},

    // use this for initialization
    onLoad: function () {
        this.setupSpriteFrame();
    },

    setUserID: function (userid) {
        if (cc.sys.isNative == false) {
            return;
        }
        if (!userid) {
            return;
        }
        if (cc.vv.images == null) {
            cc.vv.images = {};
        }

        var self = this;
        getBaseInfo(userid, function (code, info) {
            if (info && info.url) {
                loadImage(info.url, userid, function (err, spriteFrame) {
                    self._spriteFrame = spriteFrame;
                    self.setupSpriteFrame();
                });
            }
        });
    },

    setUserIDOfInfo: function (userid, url) {
        console.log("userid=" + userid);
        console.log("img_url=" + url);
        if (cc.sys.isNative == false) {
            console.log("!cc.sys.isNative ");
            return;
        }
        if (!userid) {
            console.log("userid is null");
            return;
        }
        if (!url) {
            console.log("url is null");
            this.setUserID(userid);
            return;
        }

        var self = this;
        // console.log('setUserIdOfInfo',url);
        loadImage(url, userid, function (err, spriteFrame) {
            self._spriteFrame = spriteFrame;
            self.setupSpriteFrame();
        });
    },

    setupSpriteFrame: function () {
        if (this._spriteFrame) {
            var spr = this.getComponent(cc.Sprite);
            if (spr) {
                spr.spriteFrame = this._spriteFrame;
            }
        }
    },

    refreshSpriteFrame: function () {
        if (this._spriteFrame) {
            var spr = this.getComponent(cc.Sprite);
            if (spr) {
                spr.spriteFrame = cc.vv.mahjongmgr.seticon();
            }
        }
    }

});