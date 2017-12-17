/**牌墩 */
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
        _Brandwall: null,
        index: 0,
        lastIndex: 0,
        zhuangSide: null,
        paiDuPos: 0,
        gangNum: 0,
        sprite: null,
        zhuang: null,
        isgang: false,
        gangBrandwall: null,
        animation: null,
        pre: null,
        paiqiang: false,
        // holdSprite:null,
        node_rooster: null, //鸡牌节点
    },

    // use this for initialization
    onLoad: function () {
        this.paiqiang = false;
        this.hidepaiqiang();
        this.initEventHandler();
        this.animation = cc.find("Canvas/mjAnimation").getComponent(cc.Animation);
        this.animation.node.active = false;
        if (cc.vv.gameNetMgr.isGameSync) {
            this.initView();
            this.initpaiqiang();
            if (cc.vv.gameNetMgr.paiDuPos != 0) {
                // this.initcaishen();
                this.initBrandwalls();
            }
        }
        if (!this.node_rooster) {
            var gameChild = this.node.getChildByName("game");
            this.node_rooster = gameChild.getChildByName("play_fan_rooster_node");
            this.node_rooster.active = false;
        }

        //如果有数据了，就直接显示。
        if (cc.vv.gameNetMgr.isPaidun) {
            console.log("initBrandwalls in onLoad function from brandwall.js");
            this.initView();
            this.initpaiqiang();
            if (cc.vv.gameNetMgr.paiDuPos != null && cc.vv.gameNetMgr.paiDuPos != 0) {
                this.initBrandwalls();
            }
            cc.vv.gameNetMgr.isPaidun = false;
        }

    },

    initEventHandler: function () {
        var self = this;
        this.node.on('game_begin', function (data) {
            console.log("game_begin of folds");
            // self.initcaishen(data);
            self.initView();
            self.initBrandwalls();
            self.zhuang = cc.vv.gameNetMgr.button;
        });

        /**定缺决定返回 */
        this.node.on('game_dingque_return', function () {
            console.log("game_dingque_return of brandwall.js");
            self.initBrandwalls();
        });

        this.node.on('show_defect_card_bre', function (data) {
            console.log("show_defect_card_bre", data);
            self.zhuang = cc.vv.gameNetMgr.button;
            self.initView();
            self.initBrandwalls();
        });

        this.node.on('mopai_push', function (data) {
            console.log("mo_pai of folds");
            self.initBrandwalls();
        });

        this.node.on('game_mopai', function (data) {
            console.log("mo_pai of folds");
            self.initBrandwalls();
        });

        this.node.on('refresh_sync_infs', function (data) {
            console.log("refresh_sync_infs of Brandwall.js");
            // //定缺状态
            // var func1 = function() {
            //         self.initView();
            //         self.initpaiqiang();
            //     }
            //游戏状态&定缺状态
            var func2 = function () {
                self.initView();
                self.initpaiqiang();
                self.initBrandwalls();
            }
            cc.vv.gameStatusHandle.runStatusAction(null, func2, func2, null);
        });

        this.node.on('game_over', function (data) {
            console.log("game_over of folds");
            self.paiqiang = false;
            self.hidepaiqiang();
            self.node_rooster.active = false;
        });

        /**飞牌 */
        this.node.on('show_fly_card', function (data) {
            console.log("飞牌  show_fly_card");
            self.getOneCardForCh();
        });

        this.node.on('initpaiqiang', function (data) {
            console.log("initpaiqiang of folds");
            self.hidepaiqiang();
            self.animation.node.active = true;
            self.playAnims();
            // self.initpaiqiang();
        });
        this.node.on('paidun_push', function (data) {
            console.log("paidu_push of folds", data);
            self.initView();
            cc.vv.gameNetMgr.isPaidun = false;
        });
        this.node.on('initBrand', function (data) {
            console.log("initBrand of folds");
            self.initView();
            // self.initcaishen();
            self.initBrandwalls();
        });
        this.node.on('gang_notify', function (data) {
            console.log("gang_notify");
            self.isgang = true;
        });
    },

    playAnims: function (data) {
        var self = this;
        this.animation.play("mjanimation");
        this.animation.on('finished', self.initpaiqiang, this);
    },

    initView: function () {
        this._Brandwall = [];
        var game = this.node.getChildByName("game");
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.button);
        var side = cc.vv.mahjongmgr.getSide(localIndex);
        this.zhuangSide = side;
        // var sides = ["myself", "right", "up", "left"];
        //反方位
        var sides = ["myself", "left", "up", "right"];
        var number = 0;
        switch (side) {
            case "myself":
                number = 0;
                break;
            case "right":
                number = 3;
                if (cc.vv.setPeople.isERMJ()) {
                    number = 2;
                }
                break;
            case "up":
                number = 2;
                break;
            case "left":
                number = 1;
                break;
        }
        for (var i = 0; i < sides.length; ++i) {
            if (i + number > 3) {
                var sideName = sides[i + number - 4];
            } else {
                var sideName = sides[i + number];
            }
            // var sideName = sides[(sides.length - number) % 4];
            var sideRoot = game.getChildByName(sideName);
            var BrandwallRoot = sideRoot.getChildByName("Brandwall");
            //顺向注册
            for (var j = 0; j < BrandwallRoot.children.length; ++j) {
                var s = "pai_" + (j + 1);
                var n = BrandwallRoot.getChildByName(s);
                // n.active = true;
                this._Brandwall.push(n);
            }
        }
    },

    //要取得paiDuPos/
    initBrandwalls: function () {
        if (!this.paiqiang) {
            //点亮全部牌墙
            this.initpaiqiang();
        }
        console.log("要取得paiDuPos->" + cc.vv.gameNetMgr.paiDuPos);
        var num = cc.vv.gameNetMgr.paiDuPos * 2;
        console.log("num->" + num);
        var gangNum = cc.vv.gameNetMgr.getGangs();
        if (gangNum == null) {
            console.log("gangNum has error");
            return;
        }
        console.log("gangNum=" + gangNum);
        console.log("cc.vv.gameNetMgr.numOfMJ=" + cc.vv.gameNetMgr.numOfMJ);

        var len = 108 - cc.vv.gameNetMgr.numOfMJ + num - gangNum;
        if (gangNum % 2 == 1) {
            len++;
        }
        for (var j = num; j < len; ++j) {
            this._Brandwall[j % 108].active = false;
        }
        this.index = 106 - cc.vv.gameNetMgr.numOfMJ + num - gangNum;
        this.gangNum = num - 2;
        for (var i = 0; i < gangNum; i++) {
            console.log("断线重连........杠" + gangNum);
            this.initGang();
            if (this.gangNum % 2 == 0) {
                this.gangNum += 1;
            } else {
                this.gangNum -= 3;
            }
            if (this.gangNum < 0) {
                this.gangNum = 106;
            }
        }
        // //*******************old
        // for (var j = num + 6; j < 108 - cc.vv.gameNetMgr.numOfMJ + num + 6 - gangNum; ++j) {
        //     this._Brandwall[j % 108].active = false;
        // }
        // this.index = 106 - cc.vv.gameNetMgr.numOfMJ + num + 6 - gangNum;
        // this.gangNum = num + 4;
        // for (var i = 0; i < gangNum; i++) {
        //     console.log("断线重连........杠" + gangNum);
        //     this.initGang();
        // }//*********************** */
        //test
        // this.getOneCardForCh();
    },

    /**获取一个鸡牌 */
    getOneCardForCh: function () {
        //
        var indexNum = this.gangNum;
        console.log("获取一个鸡牌->" + this._Brandwall[indexNum].name);
        // var sprite = this._Brandwall[indexNum].getComponent(cc.Sprite);
        // this.sprite = sprite;
        //
        var sprite = this._Brandwall[indexNum].getComponent(cc.Sprite);
        this.sprite = sprite;
        //转世界坐标
        var newVec2 = sprite.node.convertToWorldSpaceAR(cc.v2(0, 0));
        if (!this.node_rooster) {
            var gameChild = this.node.getChildByName("game");
            this.node_rooster = gameChild.getChildByName("play_fan_rooster");
            this.node_rooster.active = false;
        }
        newVec2 = this.node_rooster.parent.convertToNodeSpaceAR(newVec2);
        console.log("newVec2=" + newVec2);
        this.node_rooster.setPosition(newVec2);
        // this.node_rooster.anchorX = 0.5;
        // this.node_rooster.anchorY = 0.5;
        this.node_rooster.width = sprite.node.width;
        this.node_rooster.height = sprite.node.height;
        this.node_rooster.scaleX = sprite.node.scaleX;
        this.node_rooster.scaleY = sprite.node.scaleY;
        this.node_rooster.getComponent(cc.Sprite).spriteFrame = sprite.spriteFrame;
        this.node_rooster.opacity = 255;
        this.node_rooster.active = true;
        this.flyToCenterScreen();
    },

    /**飞向中间 */
    flyToCenterScreen: function () {
        // return;
        var realwidth = cc.director.getVisibleSize().width;
        var realheight = cc.director.getVisibleSize().height;
        console.log("飞向中间->" + realwidth + "|" + realheight);
        var p = this.node_rooster.parent.convertToNodeSpaceAR(cc.p(realwidth / 2, realheight / 2 + 50))
        console.log("p=" + p);
        var actionBy = cc.moveTo(0.3, p);
        var finish = cc.callFunc(this.setSpriteFrame, this);
        var seq = cc.sequence(actionBy, finish);
        // this.sprite.node.runAction(actionBy);
        this.node_rooster.runAction(seq);
        // return;
        // var spr = this.node_rooster.getComponent(cc.Sprite);
        // spr.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", cc.vv.gameNetMgr.showChCard);
        // spr.node.active = true;
        var self = this;
        cc.vv.timeout.timeoutOne(function () {
            self.node_rooster.active = false;
        }, self, 1);

    },
    /**设置图片 */
    setSpriteFrame: function () {
        // return;
        console.log("设置图片");
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.button);
        var pre = cc.vv.mahjongmgr.getFoldWallPre(localIndex);
        // this.holdSprite = sprite.spriteFrame;
        if (cc.vv.setPeople.isERMJ()) {
            pre = "B_";
        }
        this.pre = pre;
        this.node_rooster.width = 100;
        this.node_rooster.height = 139;
        this.node_rooster.scaleX = 1;
        this.node_rooster.scaleY = 1;
        var spr = this.node_rooster.getComponent(cc.Sprite);
        spr.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID("M_", cc.vv.gameNetMgr.showChCard);
        spr.node.active = true;
        // cc.vv.timeout.timeoutOne(function() {
        //     spr.node.active = false;
        // }, self, 1.1);

    },
    /**初始化财神 */
    initcaishen: function (data) {
        return;
        // console.log("cc.vv.gameNetMgr.paiDuPos" + cc.vv.gameNetMgr.paiDuPos);
        // var num = cc.vv.gameNetMgr.paiDuPos * 2;
        // console.log("num = " + num);
        // var sprite = this._Brandwall[num - 2].getComponent(cc.Sprite);
        // sprite.node.getChildByName("caishen").active = true;
        // this.sprite = sprite;
        // var localIndex = cc.vv.gameNetMgr.getLocalIndex(cc.vv.gameNetMgr.button);
        // var pre = cc.vv.mahjongmgr.getFoldPre(localIndex);
        // // this.holdSprite = sprite.spriteFrame;
        // if (cc.vv.setPeople.isERMJ()) {
        //     pre = "B_";
        // }
        // this.pre = pre;
        // sprite.spriteFrame = cc.vv.mahjongmgr.getSpriteFrameByMJID(pre, cc.vv.gameNetMgr.caishu);
    },
    initmopai: function () {
        this.index++;
        // if(this.index > 135)
        // {
        //     this.index = 0;
        // }
        this._Brandwall[this.index % 108].active = false;
    },
    reset: function () {
        if (this.sprite == null) {
            return;
        }
        var game = this.node.getChildByName("game");
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(this.zhuang);
        var pre = cc.vv.mahjongmgr.getSide(localIndex);
        console.log("pre   " + pre);
        if (cc.vv.setPeople.isERMJ()) {
            pre = "up";
        }
        this.sprite.spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(this.pre);
        // this.sprite.spriteFrame = this.holdSprite;
        // var sides = ["myself","right","up","left"];
        // for(var i = 0; i < sides.length; ++i){
        //     var sideRoot = game.getChildByName(sides[i]);
        //     var BrandwallRoot = sideRoot.getChildByName("Brandwall");
        //     for(var j = 0; j < BrandwallRoot.children.length; ++j){
        //         var s = "pai_" + (j+1);
        //         var n = BrandwallRoot.getChildByName(s);
        //         n.active = true;           
        //     }
        // }
    },

    /**
     * 牌墙全部点亮
     */
    initpaiqiang: function () {
        // console.log("initpaiqiang...........................");
        this.animation.node.active = false;
        var game = this.node.getChildByName("game");
        var sides = ["myself", "left", "up", "right"];
        for (var i = 0; i < sides.length; ++i) {
            var sideRoot = game.getChildByName(sides[i]);
            var BrandwallRoot = sideRoot.getChildByName("Brandwall");
            for (var j = 0; j < BrandwallRoot.children.length; ++j) {
                var s = "pai_" + (j + 1);
                var n = BrandwallRoot.getChildByName(s);
                n.getComponent(cc.Sprite).spriteFrame = cc.vv.mahjongmgr.getEmptySpriteFrame(sides[i]);
                n.active = true;
            }
        }
        this.paiqiang = true;
    },
    /**
     * 牌墙全部隐藏
     */
    hidepaiqiang: function () {
        // console.log("hidepaiqiang...........................");
        var game = this.node.getChildByName("game");
        var sides = ["myself", "left", "up", "right"];
        for (var i = 0; i < sides.length; ++i) {
            var sideRoot = game.getChildByName(sides[i]);
            var BrandwallRoot = sideRoot.getChildByName("Brandwall");
            for (var j = 0; j < BrandwallRoot.children.length; ++j) {
                var s = "pai_" + (j + 1);
                var n = BrandwallRoot.getChildByName(s);
                if ((j + 1) % 2 != 0) {
                    n.getChildByName("caishen").active = false;
                }
                n.active = false;
            }
        }

    },

    /** 隐藏杠牌 */
    initGang: function () {
        this._Brandwall[this.gangNum].active = false;
        console.log("gangis" + this.gangNum);


    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});