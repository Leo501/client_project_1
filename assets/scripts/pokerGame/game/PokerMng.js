cc.Class({
    extends: cc.Component,

    properties: {
        //扑克id数组
        _pokerArr: null,
        //扑克模板
        pokerModel: cc.Node,
        //牌型数组
        _pokerTypeArr: null,
        //扑克排列脚本
        _pokerListScript: null,
        //现在选中的扑克
        _selectPokerArrObj: null,
        //选中且放上去的扑克
        _selectedArr: null,
        //十三张的时候
        _poker13zheng: null,
        _poker8zheng: null,
        _poker3zheng: null,
        //5张是比较特殊
        _poker5zheng: null,
        _poker10zheng: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad PokerMng.js');
        //设置成全局对象，方便于通信
        G.pokerMngNode = this;
        this._selectedArr = {};
        this._selectPokerArrObj = [];
        this._pokerListScript = this.node.getComponent('pokerList');
    },

    //设置poker数组
    setPokerArr: function (arr) {
        console.log('setPokerArr arr=', arr);
        this._pokerArr = arr;
    },

    //
    getPokerArr: function () {
        console.log('getPokerArr =', this.getPokerArr);
        return this._pokerArr;
    },

    backToPokerArr: function (arr) {
        let idxArr = this._pokerArr.splice(0);
        idxArr.push.apply(idxArr, arr);
        console.log('idxArr', idxArr);
        G.pokerSrcMng.sortPoker(idxArr);
        // this._pokerArr = idxArr;
        this.initPokerList(idxArr);
    },

    //重新置对象
    resetSelectedArr: function () {
        this._selectPokerArrObj = [];
    },

    back13zhengStatus: function () {
        console.log('back13zhengStatus');
        this.initPokerList(this._poker13zheng);
    },

    back8zhengStatus: function () {
        console.log('back8zhengStatus');
        this.initPokerList(this._poker8zheng);
    },

    pushToSelectedArr: function (arr) {
        // arr.forEach((item) => {
        //     //目前最多放5个
        //     if (this._selectedArr.length < 5) {
        //         this._selectedArr.push(item);
        //     }
        // });
    },

    /**初始化扑克列表 */
    initPokerList: function (arr) {
        console.log('initPokerList arr=', arr);
        this._pokerArr = arr;

        if (arr == null | arr == undefined) {
            return;
        }
        if (arr.length === 0) {
            this.node.removeAllChildren();
            return;
        }
        //通过id数组新建扑克
        this.initPokerArr(this._pokerArr);
        //排列扑克的位置
        this._pokerListScript.initData();
    },

    /**新建一个实体 */
    createPoker: function (idx, id) {
        //产生一个实体
        let item = cc.instantiate(this.pokerModel);
        let script = item.getComponent('PokerItem');
        //设置id 换图
        script.setId(id, idx);
        this.node.addChild(item);
    },

    /** 通过id数组新建一个扑克数组 */
    initPokerArr: function (arr) {
        //清空节点
        this.node.removeAllChildren();
        if (this._pokerArr != null) {
            this._pokerArr.forEach((value, idx) => {
                this.createPoker(idx, value);
            });
        }
    },

    //取得选中的扑克,最多只能选5张
    getSelectPokerArr: function () {
        console.log('getSelectPokerArr');
        //得到本次选择的牌
        let selectPokerArrObj = {};
        let idxArr = [];
        //从后向前遍历
        let children = this.node.children;
        for (let i = children.length - 1; i > -1; i--) {
            let item = children[i];
            let script = item.getComponent('PokerItem');
            if (script.isSelectStatus()) {
                if (idxArr.length > 5) {
                    break;
                }
                idxArr.push(script.getInfo().id);
            }
        }
        return idxArr;
    },

    //删除牌并刷新牌
    deletPokerArrAndRefresh: function (idxArr) {
        idxArr.forEach((item, idx) => {
            let readIdx = item - idx;
            this._pokerArr.splice(readIdx, 1);
        });
        this.initPokerList(this._pokerArr);
    },

    //根据selectArr 自动选择选中的牌   selectArr是id数组下标
    autoSelectPokerArr: function (selectArr) {
        //进行自动选择前，先全部设置为未选择。
        this.setPokerAllUnselect();
        //找出选中扑克
        if (Array.isArray(selectArr)) {
            let children = this.node.children;
            selectArr.forEach((value) => {
                // console.log('autoSelectPoker');
                let script = this.node.children[value].getComponent('PokerItem');
                script.autoSelect();
            });
        }
    },

    //全部设置为未选中状态
    setPokerAllUnselect: function () {
        console.log('setPokerAllUnselect ');
        this.node.children.forEach((node, idx) => {
            // console.log('node.name', node.name);
            let script = node.getComponent('PokerItem');
            script.autoUnselect();
        });
    },

    //called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});
