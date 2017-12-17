cc.Class({
    extends: cc.Component,

    properties: {
        //框的长度
        _boardWidth: null,
        //最大扑克个数
        maxItemCount: -1,
        //扑克个数
        _itemRealCount: null,
        //单个扑克长底
        _itemWidth: null,
        //item的起点,为最大数时的候的起点
        _itemStartPointX: null,
        //根据实际扑克个数时候的起点
        _itemRealStartPointX: null,
        //item的间隔
        _itemInterval: null,
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad pokerList.js');
        if (this.maxItemCount === -1) {
            console.log('maxItemCount为null');
            return;
        }
        this.addTouchEvent();
        // this.initData();
    },

    //开始排列扑克
    initData: function () {
        console.log('initData ');
        const width = this.node.width;
        const scaleX = this.node.scaleX;
        const realWidth = parseInt(width);
        //得到长度
        this._boardWidth = realWidth;
        //得到item实际个数
        this._itemRealCount = this.node.children.length;
        const item = this.node.children[0];
        //得到item长度
        this._itemWidth = item.width;
        //保留1位小数,得到框长度的一半。为一个负数
        const boardHalfWidth = -(this._boardWidth / 2).toFixed(1);
        //得到item长度的一半。为一个正数
        const itemHalfWidth = parseFloat((this._itemWidth / 2).toFixed(1));
        //得到最大数量时的起点
        this._itemStartPointX = parseFloat(boardHalfWidth) + parseFloat(itemHalfWidth);

        const _width = parseFloat((this._boardWidth - this._itemWidth).toFixed(1));
        //如果只有一个扑克时
        if (this._itemRealCount === 1) {
            this._itemRealStartPointX = 0;
            this._itemInterval = 0;
            this.setList();
            return;
        }
        //如果扑克大于1时。
        if (this.maxItemCount > 1) {
            //计算出最大扑克时的间隔
            this._itemInterval = parseFloat((parseFloat(_width) / (this.maxItemCount - 1)).toFixed(1));
        }
        //间隔一半的长度
        const itemHaftInterval = parseFloat((this._itemInterval / 2).toFixed(1));
        //如果实际个数少于最大个数时，
        if (this._itemRealCount < this.maxItemCount) {
            const haftCount = parseInt(this._itemRealCount / 2);
            //如果为单数的话。
            if (haftCount % 2 == 1) {
                //得到实际的起点
                this._itemRealStartPointX = 0 - (this._itemInterval * haftCount);
                // this.setList();                  
            } else {//双数
                this._itemRealStartPointX = 0 - ((haftCount - 1) * this._itemInterval + itemHaftInterval);
            }

        } else if (this._itemRealCount === this.maxItemCount) {
            //如果是实际跟最大相等时，
            this._itemRealStartPointX = this._itemStartPointX;
        } else {
            //如果实际大于最大值时，重新计算出来间隔。起点不变！
            this._itemRealStartPointX = this._itemStartPointX;
            this._itemInterval = parseFloat((parseFloat(_width) / (this._itemRealCount - 1)).toFixed(1));
        }
        //只保留一位小数点
        this._itemRealStartPointX = parseFloat(this._itemRealStartPointX.toFixed(1));
        this.setList();
    },

    //主要是通过起点跟间隔来进行排列
    calculatePosition: function (idx) {
        let x = this._itemRealStartPointX + this._itemInterval * idx;
        return cc.v2(x, 0);
    },

    addTouchEvent: function () {
        console.log('addTouchEvent');
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            console.log('addTouchEvent', event);
        });
    },

    //设置扑克的位置
    setList: function () {
        this.node.children.forEach((item, idx) => {
            let posi = this.calculatePosition(idx);
            item.setPosition(posi);
        });
    },

    testHi: function () {
        console.log('test say hi');
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
