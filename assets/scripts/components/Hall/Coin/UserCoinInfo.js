cc.Class({
    extends: cc.Component,

    properties: {
        _userInfo: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad for userCoinInfo.js');
        if (cc.vv == null) {
            return;
        }
        this._userInfo = this.getUserInfo();
        if (this._userInfo === null) {
            console.log("have mistake from this._userinfo");
            return;
        }
        cc.vv.userCoinInfo = this;
        cc.vv.utils.addClickEvent(this._userInfo, this.node, "UserCoinInfo", "onClicked");
    },

    getUserInfo: function () {
        if (this.node.parent.name === 'mjgame') {
            return cc.find('Canvas/userCoinInfo');
        }
        if (this.node.parent.parent.name === 'hall') {
            return cc.find('Canvas/coinHall/userCoinInfo');
        }
        return null;
    },

    showLabel: function (node, str) {
        if (node) {
            const label = node.getComponent(cc.Label).string = str;
            // node.string=str;
        } else {
            console.log('node is null or undefinded');
        }
    },

    show: function (name, userId, iconSprite, sex, ip, coins) {
        if (userId) {
            this._userInfo.active = true;
            try {
                this._userInfo.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = iconSprite.spriteFrame;
                this.showLabel(this._userInfo.getChildByName('name'), cc.vv.gameNetMgr.setName(name, 26, true));
                this.showLabel(this._userInfo.getChildByName("id"), '' + userId);
                this.showLabel(this._userInfo.getChildByName('coins'), '' + coins);
                if (!ip) {
                    ip = '无';
                }
                this.showLabel(this._userInfo.getChildByName('ip'), '' + ip.replace("::ffff:", ""));
            } catch (error) {
                console.log('error=', error);
            }
            var sex_female = this._userInfo.getChildByName("sex_female");
            sex_female.active = false;

            var sex_male = this._userInfo.getChildByName("sex_male");
            sex_male.active = false;
            if (sex == 1) {
                sex_male.active = true;
            } else if (sex == 2) {
                sex_female.active = true;
            }
        }
    },

    onClicked: function (event) {
        console.log("aaaa");
        this._userInfo.active = false;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});