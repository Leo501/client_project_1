/**
 * 预制体管理类。
 * 通过G.nodePoolArr[item.name]来取得某个预制体对象。
 */
const Item = cc.Class({
    name: 'Item',
    properties: {
        id: 0,
        name: '',
        numb: 0,
        prefab: cc.Prefab,
        _pool: null,
        _reuseArr: [],
    },
    init: function (data) {
        console.log('init Item');
        if (data) {
            this.id = data.id;
            this.name = data.name;
            this.numb = data.numb;
            this.prefab = data.prefab;
        }
        this._pool = new cc.NodePool();
        for (let i = 0; i < this.numb; i++) {
            let item = cc.instantiate(this.prefab);
            this._pool.put(item);
        }
    },

    getItem: function () {
        let item = null;
        if (this._pool && this._pool.size() > 0) {
            item = this._pool.get();
        } else {
            console.log('instantiate');
            item = cc.instantiate(this.prefab);
        }
        this._reuseArr.push(item);
        return item;
    },

    putItem: function (item) {
        if (this._pool) {
            this._pool.put(item);
            return 1;
        } else {
            return -1;
        }
    },
    //回收item，用于下次使用。
    recycle: function () {
        this._reuseArr.forEach(function (element) {
            // console.log('element=', element);
            this.putItem(element);
        }, this);
        this._reuseArr = [];
    },

});

cc.Class({
    extends: cc.Component,

    properties: {
        prefabItemArr: {
            default: [],
            type: Item,
        }
    },

    onLoad: function () {
        console.log('onLoad NodePoolMng.js');
        this.prefabItemArr.forEach((item, idx) => {
            item.init();
            G.nodePoolArr[item.name] = item;
        });
    },

    // getPrefabItemByName: function (name) {
    //     console.log('arr=', this.prefabItemArr);
    //     for (let i = 0; i < this.prefabItemArr.length; i++) {
    //         const item = this.prefabItemArr[i];
    //         if (name === item.name) {
    //             return item;
    //         }
    //     }
    //     return null;
    // },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});