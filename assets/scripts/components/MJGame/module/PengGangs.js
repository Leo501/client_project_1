cc.Class({
    extends: cc.Component,

    properties: {},

    // use this for initialization
    onLoad: function () {
        console.log('penGangs.js');
        if (!cc.vv) {
            return;
        }

        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName("myself");
        var pengangroot = myself.getChildByName("penggangs");
        var realwidth = cc.director.getVisibleSize().width;
        var scale = realwidth / 1280;
        pengangroot.scaleX *= scale;
        pengangroot.scaleY *= scale;

        var self = this;
        this.node.on('peng_notify', function (data) {
            //刷新所有的牌
            console.log("peng_notify", data.detail);
            var data = data.detail;
            self.onPengGangChanged(data);
        });

        this.node.on('chi_notify', function (data) {
            console.log("chi_notify");
            self.onPengGangChanged(data.detail);
        });

        this.node.on('gang_notify', function (data) {
            //刷新所有的牌
            console.log("gang_notify", data.detail);
            var data = data.detail;
            self.onPengGangChanged(data.seatData);
        });

        this.node.on('show_defect_card_bre', function (data) {
            self.onGameBein();
        });

        this.node.on('game_holds', function (data) {
            console.log('game_holds', data.detail);
        });

        this.node.on('game_begin', function (data) {
            console.log("game_begin of penggangs");
            self.onGameBein();
        });

        this.node.on('game_over', function (data) {
            console.log("game_over of penggangs");
        });

        this.node.on('game_over_ready', function (data) {
            console.log("game_over_ready of penggangs.js");
            self.onGameBein();
        });

        this.node.on('refresh_sync_infs', function (data) {
            console.log("refresh_sync_infs of pengGang.js");
            var seats = cc.vv.gameNetMgr.seats;
            var func1 = function () { //playing 状态
                for (var i in seats) {
                    self.onPengGangChanged(seats[i]);
                }
            };
            cc.vv.gameStatusHandle.runStatusAction(null, null, func1, null);
        });

        var seats = cc.vv.gameNetMgr.seats;
        console.log("onPengGangChanged of onLoad");
        if (!cc.vv.gameStatusHandle.isPlaying()) {
            console.log('resetPengGangs');
            this.onGameBein();
        } else {
            for (var i in seats) {
                this.onPengGangChanged(seats[i]);
            }
        }
    },

    onGameBein: function () {
        console.log('');
        this.hideSide("myself");
        this.hideSide("right");
        this.hideSide("up");
        this.hideSide("left");
    },

    hideSide: function (side) {
        console.log("hideSide of penggangs.js");
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");
        var str = " ";
        if (pengangroot) {
            for (var i = 0; i < pengangroot.childrenCount; ++i) {
                pengangroot.children[i].active = false;
            }
        }
    },

    onPengGangChanged: function (seatData) {
        console.log("onPengGangChanged seatData=" + seatData);

        if (null === seatData.angangs && null === seatData.diangangs && null === seatData.wangangs && null === seatData.pengs && null === seatData.chis) {
            console.log("onPengGangChanged is null return");
            return;
        }

        var localIndex = cc.vv.gameNetMgr.getLocalIndex(seatData.seatindex);

        //二人麻将,只要myself跟up,三人是myself left rigth
        localIndex = cc.vv.setPeople.getReadIdx(localIndex);
        if (localIndex < 0) {
            console.log('PengGangs.js onPengGangChanged loacalIndex<0');
            return;
        }
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);

        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");

        for (var i = 0; i < pengangroot.childrenCount; ++i) {
            pengangroot.children[i].active = false;
        }
        //初始化杠牌
        var index = 0;
        var str = " ";
        var angangs = seatData.angangs;
        if (angangs) {
            str += (" onPengGangChanged angangs=" + angangs.length);
            for (var i = 0; i < angangs.length; ++i) {
                var mjid = angangs[i];
                // this.initPengAndGangs(pengangroot,side,pre,index,mjid,"angang");
                this.initGangPengChiHandler(pengangroot, side, pre, index, mjid, "angang");
                index++;
            }
        }

        var diangangs = seatData.diangangs;
        if (diangangs) {
            str += (" onPengGangChanged diangangs=" + diangangs.length);
            for (var i = 0; i < diangangs.length; ++i) {
                var mjid = diangangs[i];
                // this.initPengAndGangs(pengangroot,side,pre,index,mjid,"diangang");
                this.initGangPengChiHandler(pengangroot, side, pre, index, mjid, "minggang");
                // this.initPengAndGangs(pengangroot,side,pre,index,mjid,"angang");
                index++;
            }
        }

        var wangangs = seatData.wangangs;
        if (wangangs) {
            str += (" onPengGangChanged diangangs=" + wangangs.length);
            for (var i = 0; i < wangangs.length; ++i) {
                var mjid = wangangs[i];
                // this.initPengAndGangs(pengangroot,side,pre,index,mjid,"wangang");
                this.initGangPengChiHandler(pengangroot, side, pre, index, mjid, "minggang");
                index++;
            }
        }

        //初始化碰牌
        var pengs = seatData.pengs;
        if (pengs) {
            str += (" onPengGangChanged: pengs=" + pengs.length);
            for (var i = 0; i < pengs.length; ++i) {
                var mjid = pengs[i];
                // this.initPengAndGangs(pengangroot,side,pre,index,mjid,"peng");
                this.initGangPengChiHandler(pengangroot, side, pre, index, mjid, "peng");
                index++;
            }
        }

        var chis = seatData.chis;
        if (chis) {
            str += (" onPengGangChanged: chi=" + chis.length);
            var len = seatData.chis.length / 3;
            for (var i = 0; i < len; i++) {
                var mjidArr = [];
                mjidArr.push(chis[i * 3 + 0]);
                mjidArr.push(chis[i * 3 + 1]);
                mjidArr.push(chis[i * 3 + 2]);
                // this.initChi(pengangroot,side,pre,index,mjidArr,"chi");
                this.initGangPengChiHandler(pengangroot, side, pre, index, mjidArr, "chi");
                index++;
            }
        }
        console.log(str);
    },

    onChiChanged: function (seatData) {
        console.log("onChiChanged" + seatData.chipaiarr);
    },

    //添加吃处理
    initChi: function (pengangroot, side, pre, index, mjidArr, flag) {
        console.log("initChi" + mjidArr);
        var pgroot = null;
        pgroot = pengangroot.children[index];
        pgroot.active = true;

        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for (var s = 0; s < sprites.length; ++s) {
            var sprite = sprites[s];
            if (sprite.node.name == "gang") {
                sprite.node.active = false;
                continue;
            } else {
                // console.log("s="+s);
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjidArr[s]);
                sprite.node.active = true;
            }
        }

    },

    initGangPengChiHandler: function (pengangroot, side, pre, index, mjid, flag) {
        console.log("initGangPengChiHandler of flag=" + flag);
        var pgroot = null;
        pgroot = pengangroot.children[index];
        pgroot.active = true;

        this.initSprites(pgroot);
        switch (flag) {
            case "chi":
                this.chiHandler(pgroot, side, pre, mjid);
                break;
            case "peng":
                this.pengHandler(pgroot, side, pre, mjid);
                break;
            case "angang":
                this.anGangHandler(pgroot, side, pre, mjid);
                break;
            case "minggang":
                this.mingGangHandler(pgroot, side, pre, mjid);
                break;
        }

    },

    initSprites: function (pgroot) {
        console.log("initSprites of penggangs.js");
        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        var str = " ";
        for (var i in sprites) {
            str += " i=" + i;
            var sprite = sprites[i];
            sprite.node.scaleX = 1.0;
            sprite.node.scaleY = 1.0;
            if (sprites[i].node.name == "gang") {
                sprite.node.active = false;
                continue;
            }
            sprite.node.active = true;
        }
        console.log(str);
    },

    anGangHandler: function (pgroot, side, pre, mjid) {
        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for (var s = 0; s < sprites.length; ++s) {
            var sprite = sprites[s];
            if (sprite.node.name == "gang") {
                sprite.node.active = true;
                sprite.node.scaleX = 1.0;
                sprite.node.scaleY = 1.0;
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
            } else {
                //如果是暗杠的话，就是隐藏牌号。
                sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
            }
        }
    },

    mingGangHandler: function (pgroot, side, pre, mjid) {
        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for (var s = 0; s < sprites.length; ++s) {
            var sprite = sprites[s];
            if (sprite.node.name == "gang") {
                sprite.node.scaleX = 1.0;
                sprite.node.scaleY = 1.0;
                sprite.node.active = true;

                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
            } else {
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
            }
        }
    },

    pengHandler: function (pgroot, side, pre, mjid) {
        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for (var s = 0; s < sprites.length; ++s) {
            var sprite = sprites[s];
            if (sprite.node.name == "gang") {
                sprite.node.active = false;
            } else {
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
            }
        }
    },

    chiHandler: function (pgroot, side, pre, mjidArr) {
        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for (var s = 0; s < sprites.length; ++s) {
            var sprite = sprites[s];
            if (sprite.node.name == "gang") {
                sprite.node.active = false;
                continue;
            } else {
                sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjidArr[s]);
            }
        }
    },

    initPengAndGangs: function (pengangroot, side, pre, index, mjid, flag) {
        var pgroot = null;
        pgroot = pengangroot.children[index];
        pgroot.active = true;

        var sprites = pgroot.getComponentsInChildren(cc.Sprite);
        for (var s = 0; s < sprites.length; ++s) {
            var sprite = sprites[s];
            if (sprite.node.name == "gang") {
                var isGang = flag != "peng";
                sprite.node.active = isGang;
                sprite.node.scaleX = 1.0;
                sprite.node.scaleY = 1.0;
                if (flag == "angang") {
                    sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
                } else {
                    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
                }
            } else {
                //如果是暗杠的话，就是隐藏牌号。
                if (flag == "angang") {
                    console.log("angang set empty frame");
                    sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(side);
                } else {
                    sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, mjid);
                }
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});