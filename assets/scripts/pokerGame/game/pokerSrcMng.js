
//0~12 黑桃 13~25 红桃 26~38 梅花 39~51 方块
const pokerSet = {
    '0': '0x01',//从2~A 黑桃
    '1': '0x02',
    '2': '0x03',
    '3': '0x04',
    '4': '0x05',
    '5': '0x06',
    '6': '0x07',
    '7': '0x08',
    '8': '0x09',
    '9': '0x0A',
    '10': '0x0B',
    '11': '0x0C',
    '12': '0x0D',

    '13': '0x11',//从2~A 红桃
    '14': '0x12',
    '15': '0x13',
    '16': '0x14',
    '17': '0x15',
    '18': '0x16',
    '19': '0x17',
    '20': '0x18',
    '21': '0x19',
    '22': '0x1A',
    '23': '0x1B',
    '24': '0x1C',
    '25': '0x1D',

    '26': '0x21',//从2~A 梅花
    '27': '0x22',
    '28': '0x23',
    '29': '0x24',
    '30': '0x25',
    '31': '0x26',
    '32': '0x27',
    '33': '0x28',
    '34': '0x29',
    '35': '0x2A',
    '36': '0x2B',
    '37': '0x2C',
    '38': '0x2D',

    '39': '0x31',//从2~A 方块
    '40': '0x32',
    '41': '0x33',
    '42': '0x34',
    '43': '0x35',
    '44': '0x36',
    '45': '0x37',
    '46': '0x38',
    '47': '0x39',
    '48': '0x3A',
    '49': '0x3B',
    '50': '0x3C',
    '51': '0x3D',
};

const pokerType = {
    '0': 'w_wutiao',
    '1': 'w_tonghuashun',
    '2': 'w_tiezhi',
    '3': 'w_hulu',
    '4': 'w_tonghua',
    '5': 'w_shunzi',
    '6': 'w_santiao',
    '7': 'w_liangdui',
    '8': 'w_duizi',
    '9': 'w_wulong',
}
cc.Class({
    extends: cc.Component,

    properties: {
        //扑克
        pokerAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        //牌型
        typeAtlas: {
            default: null,
            type: cc.SpriteAtlas,
        }
    },

    //取得poker图片，通过id
    getSpriteFrameByPokerID: function (id) {
        if (this.pokerAtlas === null) {
            return null;
        }
        return this.pokerAtlas.getSpriteFrame(pokerSet[id]);
    },

    //取得类型通过id
    getTypeFrameById: function (id) {
        if (this.typeAtlas === null) {
            return null;
        }
        return this.typeAtlas.getSpriteFrame(pokerType[id]);
    },

    // use this for initialization
    onLoad: function () {
        console.log('onLoad pokerSrcMng.js');
        //把实例放到全局变量上
        G.pokerSrcMng = this;
    },

    //排序列表
    sortPoker: function (arr) {
        console.log('sortPoker', arr);
        arr.sort(function (a, b) {
            let a_yushu = a % 13;
            let b_yushu = b % 13;
            let a_shang = a / 13;
            let b_shang = b / 13;
            if (a == b) {
                return 0;
            }
            //A的点数大于B的点数时，A在B的前面。
            if (a_yushu > b_yushu) {
                return -1;
            } if (a_yushu === b_yushu) {
                return a_shang - b_shang;
            } else {
                return 1;
            }
        });

        //

    },

});
