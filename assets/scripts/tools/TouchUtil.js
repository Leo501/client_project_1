cc.Class({
    extends: cc.Component,

    properties: {
        _selectArr: null, //每次选中的选中的下标

        _selectColor: '#D6D3D3',
        _normalColor: '#FFFFFF',
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad');
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            // console.log('onLoad', event);
            this._selectArr = {}; //是一个键值对
            this.startFindTarget(event.getLocation());
        }, this.node);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            this.startFindTarget(event.getLocation());
        }, this.node);

        this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
            console.log('TOUCH_END');
            this.selectEnd();
        }, this.node);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
            console.log('TOUCH_CANCEL');
            this.selectEnd();
        }, this.node);
    },

    startFindTarget: function (v2) {
        console.log('startFindTarget');
        let xSize = this.getXWidth(this.node);
        let childrenSize = this.node.children.length;
        let idx = this.findSelectPai(v2, childrenSize, xSize);
        if (idx > -1) {
            this._selectArr[idx] = idx;
            this.setColor(this.node.children[idx], this._selectColor);
        } else {
            console.log('未选中');
        }
    },

    setSelectAction: function (idxs) {
        console.log('setSelectAction');
        if (Array.isArray(idxs)) {
            idxs.forEach((value) => {
                let node = this.node.children[value];
                let script = node.getComponent('PokerItem');
                script.onBtnSelectOrunSelect();
            });
        }
    },

    //选择完成的操作
    selectEnd: function () {
        let keys = Object.keys(this._selectArr);
        console.log('keys', keys);
        this.setAllColorNormal(this.node);
        this.setSelectAction(keys);
    },

    /**
     * 说明：查找该点所选中的牌
     * locatioV2 移动到的点
     * return 位置下标 -1为未选中任何一个
     */
    findSelectPai: function (locatioV2, size, width) {
        let localPosi = this.node.convertToNodeSpaceAR(locatioV2);
        // console.log('localPosi', localPosi);
        let idx = -1;
        for (let i = 0; i < size; i++) {
            let isSelect = false;
            let item = this.node.children[i];
            isSelect = this.containsPoint(item, localPosi, width, i == (size - 1));
            if (isSelect) {
                idx = i;
                break;
            }
        }
        return idx;
    },

    /**
     *  node
     */
    containsPoint: function (node, posi, width, isLastNode) {
        if (isLastNode) {
            console.log('name=', name)
        }
        let boundingBox = node.getBoundingBox();
        let reaWidth = ((isLastNode) ? boundingBox.width : width);
        let startX = boundingBox.x;
        let endX = boundingBox.x + reaWidth;
        let startY = boundingBox.y;
        let endY = boundingBox.y + boundingBox.height;
        if (posi.x > startX && posi.x < endX && posi.y > startY && posi.y < endY) {
            return true;
        } else {
            return false;
        }
    },

    //通过两个child的距离得到两张牌的实际宽度
    getXWidth: function (node) {
        console.log('getXWidth');
        let children1 = node.children[0];
        let children2 = node.children[1];
        let size = children1.getBoundingBox().x - children2.getBoundingBox().x
        return size < 0 ? -size : size;
    },

    //设置颜色为正常
    setAllColorNormal: function (node) {
        let children = node.children;
        children.forEach((node) => {
            this.setColor(node, this._normalColor);
        });
    },

    setColor: function (node, color) {
        if (node) {
            node.color = (new cc.Color()).fromHEX(color);
        }
    }
});