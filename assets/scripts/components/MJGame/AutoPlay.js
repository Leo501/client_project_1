const typeSet = {
    0: 'chuPai',
    1: 'peng',
    2: 'gang',
    3: 'hu',
    4: 'ting',
    5: 'guo',
}
cc.Class({
    extends: cc.Component,

    properties: {
        _isAutoPlay: false,
        rootNode: null,
        exitNode: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('init AutoPlay.js');
        this.rootNode = cc.find('Canvas/autoPlayNode');
        this.rootNode.active = true;
        this.exitNode = this.rootNode.getChildByName('exit');
        const btn_node = cc.find('Canvas/game');
        const btn_autoPlay = cc.find('Canvas/game/autoPlayBtn');
        if (cc.vv.gameType.isCardGame()) {
            btn_autoPlay.active = false;
        }
        cc.vv.utils.addClickEvent(btn_autoPlay, this.node, "AutoPlay", "onClickOpenAuto");
        const btn_exit = this.exitNode.getChildByName('exitBtn');
        cc.vv.utils.addClickEvent(btn_exit, this.node, "AutoPlay", "onClickExitAuto");

        /**自动出牌 */
        this.node.on('auto_play', (event) => {
            console.log('auto play data', event.detail);
            this.selectType({
                type: 'chuPai',
                mjId: event.detail,
            });
        });

        /**设置托管layer */
        this.node.on('set_autoplay_push', (event) => {
            const data = event.detail;
            console.log('set_autoplay', data);
            if (data.type == 0) {
                this.exitNode.active = true;
            } else if (data.type == 1) {
                this.exitNode.active = false;
            }
        });

        /** 设置托管layer */
        this.node.on('show_defect_card_bre', (event) => {
            const data = event.detail;
            console.log('show_defect_card_bre of autoPlay.js', data);
            this.exitNode.active = false;
        });

        this.node.on('game_begin', (event) => {
            console.log('game_begin of autoPlay.js');
            // this.exitNode.active = false;
        });

        /**取消托管显示 */
        this.node.on('game_over', (event) => {
            const data = event.detail;
            console.log('game_over of autoPlay.js', data);
            this.exitNode.active = false;
        });
    },

    onClickOpenAuto: function () {
        this.isAutoPlay = true;
        console.log('onClickAutoPlay');
        cc.vv.net.send('set_autoplay', 0);
    },

    onClickExitAuto: function () {
        console.log('onClickExitAuto');
        cc.vv.net.send('set_autoplay', 1);
    },

    setLabel: function (status) {
        const node = this.node.getChildByName('Label');
        let label = null;
        if (node) {
            label = node.getComponent(cc.Label);
        }
        if (!label) return;
        if (status === 0) {
            label.string = '托管中';
        } else {
            label.string = '托管';
        }
    },

    selectType: function (data) {
        switch (data.type) {
            case 'ting':
                {
                    cc.vv.net.send("baoting", true);
                }
                break;
            case 'chuPai':
                {
                    console.log('chupai');
                    if (isNaN(parseInt(data.mjId))) {
                        console.log('auto chupai fail');
                        cc.vv.alert.show('提示', '自动出牌失败！\n原因是mjId出错', (event) => {
                            console.log("error");
                        });
                        return;
                    }
                    setTimeout((evnet) => {
                        cc.vv.net.send('chupai', data.mjId);
                    }, 1000);
                }
                break;
            case 'hu':
                {
                    cc.vv.net.send("hu");
                }
                break;
            case 'peng':
                {
                    cc.vv.net.send("peng");
                }
                break;
            case 'gang':
                {
                    cc.vv.net.send("gang", data.mjId);
                }
                break;
            case 'guo':
                {
                    cc.vv.net.send("guo");
                }
                break;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});