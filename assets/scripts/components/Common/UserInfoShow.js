cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _userinfo: null,
        _userDistance: null,
        _distanceInfs: null
    },

    // use this for initialization
    onLoad: function () {
        if (cc.vv == null) {
            return;
        }
        var self = this;
        this._userinfo = cc.find("Canvas/userinfo");
        this._userinfo.active = false;

        cc.vv.utils.addClickEvent(this._userinfo, this.node, "UserInfoShow", "onClicked", 3);

        if (this.node.parent.name == "mjgame") {
            var node = cc.find("Canvas/userinfo/distanceInfs");
            console.log("userInfoShow node=", node);
            this.initDistance(node);
            this.node.on("user_distance", function (data) {
                console.log("user_distance");
                console.log(data.detail);
                self.showDistance(data.detail);
            });
        }

        cc.vv.userinfoShow = this;

    },

    show: function (name, userId, iconSprite, sex, ip) {
        if (userId != null && userId > 0) {
            this._userinfo.active = true;
            try {
                this._userinfo.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = iconSprite.spriteFrame;
                this._userinfo.getChildByName("name").getComponent(cc.Label).string = cc.vv.gameNetMgr.setName(name, 16, true);
                this._userinfo.getChildByName("id").getComponent(cc.Label).string = "" + userId;
                this._userinfo.getChildByName("ip").getComponent(cc.Label).string = "" + ip.replace("::ffff:", "");
            } catch (error) {
                console.log('error=', error);
            }
            var sex_female = this._userinfo.getChildByName("sex_female");
            sex_female.active = false;

            var sex_male = this._userinfo.getChildByName("sex_male");
            sex_male.active = false;

            if (sex == 1) {
                sex_male.active = true;
            } else if (sex == 2) {
                sex_female.active = true;
            }
        }

        if (this.node.parent.name == "mjgame") {
            console.log("ready acquireDistance, userId=", userId);
            this.resetDistance();
            cc.vv.location.acquireDistance(userId);
        }

    },

    initDistance: function (node) {
        console.log("init distanceInfs");
        this._distanceInfs = [];
        var childNode = node.children;
        for (var i = 0; i < childNode.length; i++) {
            var child = childNode[i];
            if (child.name == "infs") {
                child.active = false;
                this._distanceInfs.push(child);
            }
        }
    },

    resetDistance: function () {
        Array.isArray(this._distanceInfs) && this._distanceInfs.forEach((element) => {
            // console.log("element",element);
            element.active = false;
        });
    },

    showDistance: function (data) {
        // this.resetDistance();
        Array.isArray(data) && data.forEach((item, idx) => {
            // console.log(item,idx);
            this.showItem(item, idx);
        });
    },

    /**显示数据 */
    showItem: function (data, idx) {
        console.log("showDistance");
        console.log(data);
        var node = this._distanceInfs[idx];
        node.active = true;
        node.getChildByName("name").getComponent(cc.Label).string = "与" + cc.vv.gameNetMgr.getNameByID(data.userId) + ":";
        node.getChildByName("distance").getComponent(cc.Label).string = data.distance > -1 ? "相距" + cc.vv.location.convertToKmOrM(data.distance) : "未定位";
    },

    onClicked: function () {
        this._userinfo.active = false;
    }

});