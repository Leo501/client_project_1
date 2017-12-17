const PlayCardLogic = require('play_card_control');
const typeBoardNameSet = {
    '0': 'yxc_wt', //五同
    '1': 'yxc_ths', //同花顺
    '2': 'yxc_tz', //铁支
    '3': 'yxc_hl', //葫芦
    '4': 'yxc_th', //同花
    '5': 'yxc_sz', //顺子
    '6': 'yxc_st', //三条
    '7': 'yxc_ld', //两对
    '8': 'yxc_dz', //对子
};

const typeBoardSendSet = {
    'yxc_wt': 0, //五同
    'yxc_ths': 1, //同花顺
    'yxc_tz': 2, //铁支
    'yxc_hl': 3, //葫芦
    'yxc_th': 4, //同花
    'yxc_sz': 5, //顺子
    'yxc_st': 6, //三条
    'yxc_ld': 7, //两对
    'yxc_dz': 8, //对子
}

const channelSize = {
    0: 3, //首道
    1: 5, //中道
    2: 5, //尾道
}
cc.Class({
    extends: cc.Component,

    properties: {
        //gamePoker节点
        gamePoker: cc.Node,
        _gamePokerPlayAnim: null,
        //选择显示板
        showBoard: cc.Node,
        //牌型选择显示板
        typeBoard: cc.Node,
        //扑克显示板
        pokerBoard: cc.Node,
        //确定取消板
        btnBoard: cc.Node,
        //尾道
        poker_wd: cc.Node,
        //中道
        poker_zd: cc.Node,
        //头道
        poker_td: cc.Node,
        //选错提示
        errorTip: cc.Node,
        //PokerMng的脚本
        _pokerBoardScript: null,
        //牌型数组
        _pokerTypeArr: null,
        //可以选择的牌
        _canSelePoker: null,
        resultNode: cc.Node,
        seats: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad PokerGame.js');
        G.pokerGame = this.node;
        this.addLocalEvent();
        this.addTypeBtnEvent();
        this._pokerBoardScript = this.pokerBoard.getComponent('PokerMng');
        //不显示
        this.poker_wd.active = false;
        this.poker_zd.active = false;
        this.poker_td.active = false;
        // //添加一个属性来确定放了几张牌
        this.poker_wd.pokerArr = [];
        this.poker_zd.pokerArr = [];
        this.poker_td.pokerArr = [];
        //先关闭。 收到扑克牌后再显示
        this.gamePoker.active = false;
        this._gamePokerPlayAnim = this.gamePoker.getComponent(cc.Animation);
        this._pokerBoardScript.selectType = -1;
        // this.addComponent("PokerRoom");
        //通过代码来添加PokerGameResult脚本
        this.addComponent('PokerRoom');
        this.addComponent("PokerBiPaiMng");
        this.addComponent("PokerGameResult");
        this.addComponent('PokerOver');
    },

    //进入动画
    runEnterAnima: function () {
        console.log('runEnterAnima');
        // this._gamePokerPlayAnim.play('PokerGameEnter');
        this.gamePoker.active = true;
        // this.gamePoker.y = 720;
        // this.gamePoker.runAction(cc.moveTo(0.5, cc.p(0, 0)));
    },

    runExitAnima: function () {
        console.log('runExitAnima');
        // this._gamePokerPlayAnim.play('PokerGameExit');
        this.gamePoker.active = false;
    },

    //添加本地事件
    addLocalEvent: function () {
        //刷新扑克
        this.node.on('game_poker_holds', (event) => {
            // console.log('game_poker_holds data=' + event.detail);
            let data = event.detail;
            setTimeout(() => {
                console.log('delay 2s show data=', data);
                // this.gamePoker.active = true;
                //进场动画
                this.runEnterAnima();
                this.poker_wd.active = false;
                this.poker_zd.active = false;
                this.poker_td.active = false;
                this._pokerBoardScript.initPokerList(data.slice(0));
                this.setTypeBtnEnable(this.showBoard, 'touch_wd', true);
                this.setTypeBtnEnable(this.showBoard, 'touch_zd', true);
                this.setTypeBtnEnable(this.showBoard, 'touch_td', true);
                //自己通过接口得到牌型
                PlayCardLogic.releaseUserData(cc.vv.userMgr.userId);
                let conf = cc.vv.gameNetMgr.conf;
                console.log('conf=', conf.headNoType);
                //自己通过接口得到牌型
                let getTypes = PlayCardLogic.getInitCardTypes(cc.vv.userMgr.userId, data, conf.headNoType);
                this.initTypeBtnEnable(getTypes);
                let holds = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex].holds;
                PlayCardLogic.setGameSeats(cc.vv.userMgr.userId, holds.slice(0));
            }, 2000);
        });

        //初始化扑克
        this.node.on('game_sync_poker_holds', (event) => {
            console.log('game_poker_holds data=' + event.detail);
            let data = event.detail;
            // this.gamePoker.active = true;
            //进场动画
            this.runEnterAnima();
            this.poker_wd.active = false;
            this.poker_zd.active = false;
            this.poker_td.active = false;
            this._pokerBoardScript.initPokerList(data);
            this.setTypeBtnEnable(this.showBoard, 'touch_wd', true);
            this.setTypeBtnEnable(this.showBoard, 'touch_zd', true);
            this.setTypeBtnEnable(this.showBoard, 'touch_td', true);
        });


        //得到牌型，
        this.node.on('card_type', (event) => {
            console.log('card_type data=', event.detail);
            let data = event.detail;
            this._pokerTypeArr = data;
            // this.initTypeBtnEnable(data);
        });

        //得到某个牌型的扑克
        this.node.on('card_pai', (event) => {
            console.log('card_type data=', event.detail);
            let data = event.detail;
            this._pokerTypeArr = data.retIndex;
        });

        //得到剩余牌型，剩余牌
        this.node.on('chu_card', (event) => {
            console.log('chu_card data=', event.detail);
            //自己通过接口得到牌型
            PlayCardLogic.releaseUserData(cc.vv.userMgr.userId);
            //得到选牌类型    
            this.initTypeBtnEnable(getTypes);
            let holds = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex].holds;
            let conf = cc.vv.gameNetMgr.conf;
            let getTypes = PlayCardLogic.getInitCardTypes(cc.vv.userMgr.userId, holds, conf.headNoType);
            //刷新自己的手牌
            this._pokerBoardScript.initPokerList(holds.slice(0));
            PlayCardLogic.setGameSeats(cc.vv.userMgr.userId, holds.slice(0));
        });

        //取消选择中的扑克
        this.node.on('cannel_chu_pai', (event) => {
            console.log('chu_card data=', event.detail);
            let data = event.detail;
            // this._pokerBoardScript.initPokerList(data.lestPais);
            // this.initTypeBtnEnable(data.lestPaisType);
        });

        this.node.on('play_out', (event) => {
            // console.log('play_out data=', event.detail);
            this.btnBoard.active = false;
            this.gamePoker.active = false;
            //把本人的手牌数据
            this._pokerBoardScript.setPokerArr([]);
            // //添加一个属性来确定放了几张牌
            this.poker_wd.pokerArr = [];
            this.poker_zd.pokerArr = [];
            this.poker_td.pokerArr = [];
            //清除数据
            PlayCardLogic.releaseUserData(cc.vv.userMgr.userId);
        });

        this.node.on('game_over', (event) => {
            console.log('game_over');
            this.btnBoard.active = false;
            this.gamePoker.active = false;
            //把本人的手牌数据
            this._pokerBoardScript.setPokerArr([]);
            // //添加一个属性来确定放了几张牌
            this.poker_wd.pokerArr = [];
            this.poker_zd.pokerArr = [];
            this.poker_td.pokerArr = [];
            //清除数据
            PlayCardLogic.releaseUserData(cc.vv.userMgr.userId);
        });

        this.node.on('play_out_ready', (event) => {
            // console.log('play_out data=', event.detail);
            let data = event.detail;
            let userId = cc.vv.userMgr.userId;
            //如果是本人
            if (userId == data.userId) {
                this.btnBoard.active = false;
                // this.gamePoker.active = false;
                this.runExitAnima();
                // //把本人的手牌数据
                // this._pokerBoardScript.setPokerArr([]);
                // // //添加一个属性来确定放了几张牌
                // this.poker_wd.pokerArr = [];
                // this.poker_zd.pokerArr = [];
                // this.poker_td.pokerArr = [];
                // //清除数据
                // PlayCardLogic.releaseUserData(cc.vv.userMgr.userId);
            }
            // this.showSeatInfo(event.detail);
        });

        this.node.on('chu_card_error', (event) => {
            console.log('chu_card_error data=', event.detail);
            // this.btnBoard.active = false;
            // this.gamePoker.active = false;
            // this.showSeatInfo(event.detail);
        });

    },

    // showErrorTip: function (str) {
    //     this.errorTip.opacity = 255;
    //     let label = this.errorTip.getComponent(cc.Label);
    //     label.string = str;
    //     G.animUtil.playFadeOut_1(this.errorTip, 2.5);
    // },

    //确定发送or全部取消
    onBtnComfirmOrCancel: function (event) {
        console.log('onBtnComfirmOrCancel name=' + event.target);
        switch (event.target.name) {
            case 'yxc_qd':
                { //确定
                    this.sendPaiResult();
                    break;
                }
            case 'yxc_qx':
                { //取消
                    console.log('全部取消');
                    PlayCardLogic.releaseUserData(cc.vv.userMgr.userId);
                    //刷新自己的手牌
                    let holds = cc.vv.gameNetMgr.seats[cc.vv.gameNetMgr.seatIndex].holds;
                    this._pokerBoardScript.initPokerList(holds.slice(0));
                    let conf = cc.vv.gameNetMgr.conf;
                    //自己通过接口得到牌型
                    PlayCardLogic.setGameSeats(cc.vv.userMgr.userId, holds.slice(0));
                    let getTypes = PlayCardLogic.getInitCardTypes(cc.vv.userMgr.userId, holds, conf.headNoType);
                    //得到选牌类型    
                    this.initTypeBtnEnable(getTypes);
                    this.setPokerImg([], this.poker_wd, true);
                    this.setPokerImg([], this.poker_zd, true);
                    this.setPokerImg([], this.poker_td, true);
                    this.btnBoard.active = false;
                    break;
                }
        }
    },

    //把三道选完后，发送给服务器
    sendPaiResult: function () {
        console.log('sendPaiResult');
        let sendData = [];
        sendData.push({
            channel: 2,
            pai: this.poker_wd.pokerArr
        });
        sendData.push({
            channel: 1,
            pai: this.poker_zd.pokerArr
        });
        sendData.push({
            channel: 0,
            pai: this.poker_td.pokerArr
        });
        console.log('sendData=', sendData);
        cc.vv.net.send('play_out', sendData);
    },

    //点击放置事件 主要用于选择显示板
    onBtnTouch: function (event) {
        console.log('onBtnTouch event=', event);
        let targetName = event.target.name;
        switch (targetName) {
            case 'touch_wd':
                {
                    //有两道完成时，
                    if (this.isFinishTwoChannel()) {
                        this.showChannelPaiAndRefresh([], this.poker_wd, 2);
                    } else {
                        this.getSelectedPokerArrAndSend(this.poker_wd, 5, 'touch_wd', 2);
                    }
                    break;
                }
            case 'touch_zd':
                {
                    //有两道完成时
                    if (this.isFinishTwoChannel()) {
                        this.showChannelPaiAndRefresh([], this.poker_zd, 1);
                    } else {
                        this.getSelectedPokerArrAndSend(this.poker_zd, 5, 'touch_zd', 1);
                    }
                    break;
                }
            case 'touch_td':
                {
                    //有两道完成时，
                    if (this.isFinishTwoChannel()) {
                        this.showChannelPaiAndRefresh([], this.poker_td, 0);
                    } else {
                        this.getSelectedPokerArrAndSend(this.poker_td, 3, 'touch_td', 0);
                    }
                    break;
                }
        }
    },

    autoTouch_td: function (idxArr) {
        // cc.vv.net.send('chu_card', {
        //     type: this._pokerBoardScript.selectType,
        //     channel: 0,
        //     pai: idxArr,
        // });
        // G.pokerSrcMng.sortPoker(idxArr);
        // this.setPokerImg(idxArr, this.poker_td, true);
        // this.setTypeBtnEnable(this.showBoard, 'touch_td', false);
    },

    //得到本次选择的牌。
    getSelectedPokerArrAndSend: function (node, size, name, channel, lastArr) {
        let idxArr = null;
        if (Array.isArray(lastArr)) {
            idxArr = lastArr;
        } else {
            //得到最大的长度为5
            idxArr = this._pokerBoardScript.getSelectPokerArr();
        }

        if (Array.isArray(node.pokerArr) && node.pokerArr.length === size) {
            console.log('牌够了，不去放牌');
            return;
        }
        //本道原来的牌，跟现在选中的牌。如果长度大于size，说明放多了。
        let allSize = idxArr.length + node.pokerArr.length;
        if (allSize > size) {
            let idxArrSize = size - node.pokerArr.length;
            //idxArrSize<0的话。就会出问题。会从后向前取
            idxArr = idxArr.slice(0, idxArrSize < 0 ? 0 : idxArrSize);
        }
        //与本道原有数据合并,得到最新的手牌
        let newArr = node.pokerArr.concat(idxArr);
        //去除多余的手牌
        G.pokerSrcMng.sortPoker(newArr);
        this.showChannelPaiAndRefresh(newArr, node, channel);
    },

    //得到选中的后，刷新channel的显示，刷新手牌，刷新可选择牌型
    showChannelPaiAndRefresh: function (channelPais, node, channel) {
        console.log('showChannelPaiAndRefresh', channelPais);

        //通过接口，得到剩余手牌，牌型
        let data_pai = PlayCardLogic.chuCard(cc.vv.userMgr.userId, {
            type: -1,
            channel: channel,
            pai: channelPais,
        });

        if (data_pai.type == -1) {
            console.log('重复放了');
            return;
        }
        //刷新channel牌
        this.setPokerImg(channelPais, node, true);
        //刷新剩余牌型
        this.initTypeBtnEnable(data_pai.lestPaiTypes);
        console.log('data_pai.lestPais=', data_pai.lestPais);
        //说明牌放错了，提示错误
        if (data_pai.isError == 1) {
            console.log('pai 放错了', );
            //放错道，清空该道数据。到后面刷新手牌
            this.showErrorTip(channel, data_pai.type);
        }
        //少于6张，可以查看下能否自动全部选好。
        if (data_pai.lestPais.length < 6) {
            let isNoAuto = this.checkAutoHandle(data_pai.lestPais);
            if (isNoAuto) {
                //说明是只剩首道还没有放。且少等于5张
                //刷新剩余手牌
                this._pokerBoardScript.initPokerList(data_pai.lestPais.slice(0));
            }
            return;
        }
        //刷新剩余手牌
        this._pokerBoardScript.initPokerList(data_pai.lestPais.slice(0));
    },

    //如果有任意两道张数够了，自动放完最后一道。（最后一道可以是首道，中道。尾道）
    checkAutoHandle: function (lastPai) {
        console.log('checkAutoHandle');
        //说明没有两道完成。
        if (lastPai.length > 5) {
            return true;
        }
        let wdPokerSize = this.poker_wd.pokerArr.length;
        let zdPokerSize = this.poker_zd.pokerArr.length;
        let tdPokerSize = this.poker_td.pokerArr.length;
        if (wdPokerSize == 5 && zdPokerSize == 5) { //完成了尾道跟中道
            this.autoLastPai(this.poker_td, 3, lastPai, 0);
        } else if (wdPokerSize == 5 && tdPokerSize == 3) { //完成了尾道跟首道
            this.autoLastPai(this.poker_zd, 5, lastPai, 1);
            // this.getSelectedPokerArrAndSend(this.poker_zd, 5, 'touch_zd', 1, lastPai);
        } else if (zdPokerSize == 5 && tdPokerSize == 3) {
            this.autoLastPai(this.poker_wd, 5, lastPai, 2);
            // this.getSelectedPokerArrAndSend(this.poker_wd, 5, 'touch_wd', 2, lastPai);
        } else {
            return true;
        }
    },

    //是否完成三道中的两道
    isFinishTwoChannel: function () {
        let wdPokerSize = this.poker_wd.pokerArr.length;
        let zdPokerSize = this.poker_zd.pokerArr.length;
        let tdPokerSize = this.poker_td.pokerArr.length;
        if (wdPokerSize == 5 && zdPokerSize == 5) { //完成了尾道跟中道
            return true;
        } else if (wdPokerSize == 5 && tdPokerSize == 3) { //完成了尾道跟首道
            return true;
            // this.getSelectedPokerArrAndSend(this.poker_zd, 5, 'touch_zd', 1, lastPai);
        } else if (zdPokerSize == 5 && tdPokerSize == 3) {
            return true;
        } else {
            return false;
        }
    },

    autoLastPai: function (node, size, lastPai, channel) {
        console.log('autoLastPai');
        let allSize = lastPai.length + node.pokerArr.length;
        if (allSize == size) {
            //与本道原有数据合并,得到最新的手牌
            let newArr = node.pokerArr.concat(lastPai);
            G.pokerSrcMng.sortPoker(newArr);
            let data_pai = PlayCardLogic.chuCard(cc.vv.userMgr.userId, {
                type: -1,
                channel: channel,
                pai: newArr,
            });

            if (data_pai.type == -1) {
                console.log('重复放了');
                return;
            }
            //说明牌放错了，提示错误
            if (data_pai.isError == 1) {
                console.log('pai 放错道了');
                //放错道，清空该道数据
                this.showErrorTip(channel, data_pai.type);
                //清空channel牌
                this.initTypeBtnEnable(data_pai.lestPaiTypes);
                // this.setPokerImg([], node, true);
                this._pokerBoardScript.initPokerList(data_pai.lestPais);
                return;
            }
            //刷新channel牌
            this.setPokerImg(newArr, node, true);
            this.initTypeBtnEnable([]);
            this._pokerBoardScript.initPokerList([]);
            this.btnBoard.active = true;
        } else {
            console.log('autoLastPai error');
        }
    },

    //刷新channel的显示,清除该道手牌，刷新手牌，刷新可选择牌型
    cancelChannelPai: function (node, channelNo) {
        let data_pai = PlayCardLogic.cancelChuCard(cc.vv.userMgr.userId, channelNo);
        if (data_pai == null) {
            return;
        }
        //刷新剩余手牌
        this._pokerBoardScript.initPokerList(data_pai.lestPais.slice(0));
        this.initTypeBtnEnable(data_pai.lestPaiTypes);
        //清空该道手牌
        this.setPokerImg([], node, true);
    },

    //点击取消事件 主要用于选择显示板
    onBtnCloseSelect: function (event) {
        console.log('onBtnCloseSelect event=', event);
        let targetName = event.target.name;
        let type = -1;
        switch (targetName) {
            case 'close_wd':
                { //尾道
                    this.setTypeBtnEnable(this.showBoard, 'touch_wd', true);
                    this.cancelChannelPai(this.poker_wd, 2);
                    break;
                }
            case 'close_zd':
                { //中道
                    this.setTypeBtnEnable(this.showBoard, 'touch_zd', true);
                    this.cancelChannelPai(this.poker_zd, 1);
                    break;
                }
            case 'close_td':
                { //头道
                    this.setTypeBtnEnable(this.showBoard, 'touch_td', true);
                    this.cancelChannelPai(this.poker_td, 0);
                    break;
                }
        }
        this.btnBoard.active = false;
        // cc.vv.net.send('cannel_chu_card', type);
    },

    //设置尾道or中道or头道图片 主要用于选择显示板
    setPokerImg: function (idArr, pokerNode, isAll) {
        console.log('setPokerImg');
        //显示出来
        pokerNode.active = true;
        pokerNode.pokerArr = idArr;
        //isAll来区别是全部放置，还是只放部分
        if (isAll) {
            pokerNode.pokerCount = 5;
            pokerNode.children.forEach((item, idx) => {
                //说明已经够了，
                if (idx > 4) {
                    return;
                }
                let spriteFrame = G.pokerSrcMng.getSpriteFrameByPokerID(idArr[idx]);
                let sprite = item.getComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
            });
        } else {
            console.log('部分放置');
            let startIdx = pokerNode.pokerCount - 1;
            let idx = 0;
            let maxSize = 5 - pokerNode.pokerCount;
            //取最小的长度，不能超过5
            let size = idArr.size < maxSize ? idArr.size : maxSize;
            for (; startIdx < size; startIdx++) {
                let item = pokerNode.children[startIdx];
                let spriteFrame = G.pokerSrcMng.getSpriteFrameByPokerID(idArr[idx++]);
                let sprite = item.getComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
            }
        }
    },

    /**
     * 0 首道
     * 1 中道
     * 2 尾道
     * 出错的道
     */
    showErrorTip: function (type, errorType) {
        let name = 'errTip' + errorType;
        this.resetChannel(type);
        this.errorTip.children.forEach((item, idx) => {
            let nameNode = item.name;
            if (nameNode == name) {
                item.active = true;
            } else item.active = false;
        });

        G.animUtil.playFadeOut_1(this.errorTip, 2.5);
    },

    //清空数据和显示
    resetChannel: function (type) {
        let node = null;
        if (type === 0) {
            node = this.poker_td;
        } else if (type === 1) {
            node = this.poker_zd;
        } else if (type === 2) {
            node = this.poker_wd;
        }
        if (node) {
            //清空该道手牌
            this.setPokerImg([], node, true);
            return;
        }
        console.log('resetChannel error');
    },

    //添加牌型点击事件
    addTypeBtnEvent: function () {
        console.log('addTypeBtnEvent');
        this.typeBoard.children.forEach((item, idx) => {
            cc.vv.utils.addClickEvent(item, this.node, 'PokerGame', "onBtnTypeSelect");
        });
    },

    //设置牌型点击事件
    onBtnTypeSelect: function (event) {
        // console.log('onBtnCloseSelect event=', event);
        let targetName = event.target.name;
        // console.log('typeBoardSendSet[targetName]=', typeBoardSendSet[targetName]);
        let data_pai = PlayCardLogic.getCardPaiOfType(cc.vv.userMgr.userId, typeBoardSendSet[targetName]);
        console.log('data_pai', data_pai);
        this._pokerBoardScript.autoSelectPokerArr(data_pai.retIndex);
        // cc.vv.net.send('get_card_pai_of_type', typeBoardSendSet[targetName]);
    },

    //设置按键是否能点击
    setTypeBtnEnable: function (node, btnName, enabel) {
        console.log('setTypeBtnEnable', btnName);
        let btnNode = node.getChildByName(btnName);
        if (btnName) {
            let btn = btnNode.getComponent(cc.Button);
            btn.enableAutoGrayEffect = true;
            btn.interactable = enabel;
        }
    },

    //设置牌型btn
    initTypeBtnEnable: function (arr) {
        console.log('arr', arr);
        this.initTypeBtnAllUnenable();
        if (Array.isArray(arr)) {
            arr.forEach((value) => {
                // console.log('value', value, 'typeBoardNameSet[value]', typeBoardNameSet[value]);
                this.setTypeBtnEnable(this.typeBoard, typeBoardNameSet[value], true);
            });
        }
    },

    //全部不能点击
    initTypeBtnAllUnenable: function () {
        this.typeBoard.children.forEach((item, idx) => {
            let btn = item.getComponent(cc.Button);
            btn.enableAutoGrayEffect = true;
            btn.interactable = false;
        });
    },

    showScoreReuslt: function (item, data) {
        let iconNode = item.getChildByName('icon');
        const icon = iconNode.getComponent("ImageLoader");
        icon.setUserID(data.userId);
        let scoreNode = item.getChildByName('score');
        let score = scoreNode.getComponent(cc.Label);
        score.string = data.score;
    },

    showSeatInfo: function (seatData) {
        this.resultNode.active = true;
        this.seats.children.forEach((item, idx) => {
            this.showScoreReuslt(item, seatData[idx]);
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

});