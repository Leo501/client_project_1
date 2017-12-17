/**麻将信息顶部的显示组件 */
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
        _mj_title_text: null,
        _ju_num_text: null, //局数显示
        _show_btn: null, //按钮展开
        _show_all_node: null, //信息节点
        _show_doc_text: null, //各个信息的显示体
        _show_doc_text_ji: null, //各个信息的显示体
    },

    // use this for initialization
    onLoad: function () {
        console.log("初始化麻将信息组件");
        console.log(cc.vv.gameNetMgr.conf);

        var mj_title_text = this.node.getChildByName("mj_title_text");
        this._mj_title_text = mj_title_text;
        let round = mj_title_text.getChildByName('round');
        if (cc.vv.gameType.isCardGame()) {
            this._ju_num_text = round.getChildByName("ju_num_text").getComponent(cc.Label);
            this._ju_num_text.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
        } else if (cc.vv.gameType.isCoinGame()) {
            round.active = false;
        }
        this._show_btn = mj_title_text.getChildByName("show_btn");

        cc.vv.utils.addClickEvent(this._show_btn, this.node, "MjTitleText", "showOrClose");

        this._show_all_node = mj_title_text.getChildByName("show_scr_node")
            .getChildByName("view").getChildByName("show_all_node"); //view/show_all_node
        const coin = this._show_all_node.getChildByName('coin');
        const people = this._show_all_node.getChildByName('people');

        const show_scr_node = mj_title_text.getChildByName("show_scr_node");
        const view = mj_title_text.getChildByName("show_scr_node").getChildByName("view");

        this._show_doc_text = this._show_all_node.getChildByName("show_doc_text");
        this._show_doc_text.parent = mj_title_text;
        this._show_doc_text.active = false;

        this._show_doc_text_ji = this._show_all_node.getChildByName("show_doc_text_ji");
        this._show_doc_text_ji.parent = mj_title_text;
        this._show_doc_text_ji.active = false;

        if (cc.vv.gameType.isCardGame()) {
            coin.active = false;
            people.active = false;
            this._show_doc_text.y = 0;
            this._show_doc_text_ji.y = 0;
        } else if (cc.vv.gameType.isCoinGame()) {
            show_scr_node.y = 50;
            view.height = 190;
            const coinConfig = cc.vv.gameNetMgr.coinConfig;
            const configSet = cc.vv.gameCoinNetMgr.configSet;
            // console.log('coinConfig=', coinConfig, 'coinConfigSet=', coinConfigSet);
            const baseInfo = configSet.basePointSet[coinConfig.basePoint];
            const typeInfo = configSet.seatTypeSet[coinConfig.seatType];
            console.log('basePoint=' + baseInfo, 'seatType=' + typeInfo);
            coin.getChildByName('info').getComponent(cc.Label).string = baseInfo;
            people.getChildByName('info').getComponent(cc.Label).string = typeInfo;
            // try {} catch (e) {

            // }
        }
        this.initShowDoc();
        this.addHandle();
        //默认展开
        if (this._mj_title_text) {
            this._mj_title_text.setPosition(cc.p(-566, 286));
        }
    },

    showOrClose: function () {
        if (!this._show_btn.getComponent(cc.Toggle).isChecked) {
            // console.log("展开"); //-566,286
            var openA = cc.moveTo(0.5, cc.p(-566, 286));
            this._mj_title_text.runAction(openA);
        } else {
            // console.log("关闭"); //-745,286
            var closeA = cc.moveTo(0.5, cc.p(-745, 286));
            this._mj_title_text.runAction(closeA);
        }
    },

    initShowDoc: function () {
        var conf = cc.vv.gameNetMgr.conf;
        var index = 0;
        if (conf) {
            var jiPaiRule = conf.jiPaiRule;
            console.log('jiPaiRule=', jiPaiRule);
            if (jiPaiRule) {
                var node = cc.instantiate(this._show_doc_text);
                node.parent = this._show_all_node;
                node.setPosition(this._show_doc_text.x, this._show_doc_text.y - (index) * this._show_doc_text.height);
                var textLable = node.getComponent(cc.Label);
                textLable.string = "鸡牌规则：";
                node.active = true;
                index++;
                for (var i = 0; i < jiPaiRule.length; i++) {
                    var node = cc.instantiate(this._show_doc_text_ji);
                    node.parent = this._show_all_node;
                    node.setPosition(this._show_doc_text_ji.x, this._show_doc_text_ji.y - (index) * this._show_doc_text_ji.height);
                    var textLable = node.getComponent(cc.Label);
                    switch (parseInt(jiPaiRule[i])) {
                        case 0:
                            textLable.string = "金鸡";
                            break;
                        case 1:
                            textLable.string = "银鸡";
                            break;
                        case 2:
                            textLable.string = "乌鸡";
                            break;
                        case 3:
                            textLable.string = "挖鸡";
                            break;
                        case 4:
                            textLable.string = "翻上下鸡";
                            break;
                    }
                    node.active = true;
                    index++;
                }
            }
            var chongfengJi = conf.chongfengJi;
            console.log('chongfengJi=', chongfengJi);
            if (chongfengJi) {
                var node = cc.instantiate(this._show_doc_text);
                node.parent = this._show_all_node;
                node.setPosition(this._show_doc_text.x, this._show_doc_text.y - (index) * this._show_doc_text.height);
                var textLable = node.getComponent(cc.Label);
                textLable.string = "冲锋鸡：";
                node.active = true;
                index++;
                for (var i = 0; i < chongfengJi.length; i++) {
                    var node = cc.instantiate(this._show_doc_text_ji);
                    node.parent = this._show_all_node;
                    node.setPosition(this._show_doc_text_ji.x, this._show_doc_text_ji.y - (index) * this._show_doc_text_ji.height);
                    var textLable = node.getComponent(cc.Label);
                    switch (parseInt(chongfengJi[i])) {
                        case 0:
                            textLable.string = "冲金鸡";
                            break;
                        case 1:
                            textLable.string = "冲银鸡";
                            break;
                        case 2:
                            textLable.string = "冲乌鸡";
                            break;
                        case 3:
                            textLable.string = "冲挖鸡";
                            break;
                    }
                    node.active = true;
                    index++;
                }
            }
        }
        this._show_all_node.height = (index + 2) * this._show_doc_text.height;
    },

    addHandle: function () {
        var self = this;
        this.node.on('game_num', function (data) {
            try {
                self._ju_num_text.string = "" + cc.vv.gameNetMgr.numOfGames + "/" + cc.vv.gameNetMgr.maxNumOfGames + "局";
            } catch (error) {
                console.log('--------------------------------------------addHandle error', error);
            }
        });
    },



    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});