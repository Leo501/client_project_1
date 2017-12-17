cc.Class({
    extends: cc.Component,

    properties: {
        //精灵组件
        _poKerSprite: cc.Sprite,
        //存储信息
        _info: null,
        //抬起高度
        _riseHeight: 30,
        _isOnload: false,
        _ristTime: 0.1,
    },

    // use this for initialization
    onLoad: function () {
        this._isOnload = true;
        console.log('onLoad PokerItem.js');
        if (this._info === null) {
            this._info = {
                isSelect: false, //false为未选中，true为选中
                id: -1,
                idx: -1,
            };
        }
        //取得sprite组件
        this._poKerSprite = this.node.getComponent(cc.Sprite);
        if (this._info.id > -1) {
            //更新图片
            this.setPokerSpriteFrameById(this._info.id);
        }
    },

    //先执行这函数，再执行onLoad函数.
    setId: function (id, idx) {
        //如果还没有定义的话
        if (this._info === null) {
            this._info = {
                isSelect: false,
                id: -1,
                idx: -1,
            };
        }
        this._info.id = id;
        this._info.idx = idx;
        if (this._isOnload) {
            //更新图片
            this.setPokerSpriteFrameById(id);
        }
    },

    getInfo: function () {
        return this._info;
    },

    //通过PokerSrcMng脚本来设置更新图片
    setPokerSpriteFrameById: function (id) {
        let spriteFrame = G.pokerSrcMng.getSpriteFrameByPokerID(id);
        if (spriteFrame === null) {
            console.log(' find spriteFrame error /n -------------------------------');
            return;
        }
        this._poKerSprite.spriteFrame = spriteFrame;
    },

    //让其选中or取消选中
    onBtnSelectOrunSelect: function (event) {
        // console.log()
        let oldSelect = this._info.isSelect;
        //选中取反
        this._info.isSelect = !this._info.isSelect;
        let oldPosi = this.node.position;
        //未选中，抬起
        if (!oldSelect) {
            G.animUtil.playMoveTo(this.node, this._ristTime, cc.v2(oldPosi.x, this._riseHeight));
        } else { //已选中，还原
            G.animUtil.playMoveTo(this.node, this._ristTime, cc.v2(oldPosi.x, 0));
        }
    },

    //自动选择
    autoSelect: function () {
        // console.log('autoSelect');
        this._info.isSelect = true;
        let oldPosi = this.node.position;
        this.node.stopAllActions();
        // this.node.setPosition(cc.v2(oldPosi.x, this._riseHeight));
        this.node.runAction(cc.moveTo(this._ristTime, cc.v2(oldPosi.x, this._riseHeight)));
    },

    //自动取消选择
    autoUnselect: function (isSelect) {
        // console.log('autoUnselect');
        this._info.isSelect = false;
        let oldPosi = this.node.position;
        this.node.stopAllActions();
        // this.node.setPosition(cc.v2(oldPosi.x, 0));
        this.node.runAction(cc.moveTo(this._ristTime, cc.v2(oldPosi.x, 0)));
    },

    //是否选中状态，用于取扑克
    isSelectStatus: function () {
        console.log('isSelectStatus');
        return this._info.isSelect;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});