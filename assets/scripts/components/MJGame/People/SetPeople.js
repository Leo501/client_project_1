//人数键值对
const menSetPoker = {
    '0': 2,
    '1': 3,
    '2': 4,
    '3': 5,
    '4': 6,
};
cc.Class({
    extends: cc.Component,

    properties: {},

    /**是否是二人麻将 */
    isERMJ: function () {
        if (this.getMenPoker() == 2) {
            console.log('isERMj');
            return true;
        }
        // if (cc.vv && cc.vv.gameNetMgr.conf) {
        //     if (cc.vv.gameNetMgr.conf.type == 0/*2*/) {
        //         return true;
        //     }
        // }
        return false;
    },

    /**是否是三人麻将 */
    isThreeMJ: function () {
        // if (cc.vv && cc.vv.gameNetMgr.conf) {
        //     if (cc.vv.gameNetMgr.conf.type == 1) {
        //         return true;
        //     }
        // }
        if (this.getMenPoker() == 3) {
            return true;
        }
        return false;
    },

    /**是否是四人麻将 */
    isFourMJ: function () {
        // if (cc.vv && cc.vv.gameNetMgr.conf) {
        //     if (cc.vv.gameNetMgr.conf.type == 0) {
        //         return true;
        //     }
        // }
        if (this.getMenPoker() == 4) {
            return true;
        }
        return false;
    },

    /**是否为5人 */
    isFive: function () {
        if (this.getMenPoker() == 5) {
            return true;
        }
        return false;
    },


    getMen: function () {
        var men = 4;
        if (this.isThreeMJ()) {
            men = 3;
        }
        if (this.isERMJ()) {
            men = 2;
        }
        return men;
    },

    getMenPoker: function () {
        let value = menSetPoker[cc.vv.gameNetMgr.conf.type];
        if (isNaN(parseInt(value))) {
            value = -1;
        }
        return value;
    },

    /**
     * 隐藏方向
     * 0为东也叫庄
     * 1为南
     * 2为西
     * 3为北
     */
    hide_single: function (i) {
        //设置二人，不要南北
        if (this.isERMJ() && (i % 2) == 1) {
            return true;
        }
        //设置三人,不要西
        if (this.isThreeMJ() && i == 2) {
            return true;
        }
        return false;
    },

    getMenIdxArr: function () {
        let idxArr = [];
        switch (this.getMenPoker()) {
            case 2:
                {
                    idxArr = [0, 2];
                    break;
                }
            case 3:
                {
                    idxArr = [0, 1, 3];
                    break;
                }
            case 4:
                {
                    idxArr = [0, 1, 2, 3];
                    break;
                }
            case 5:
                {
                    idxArr = [0, 1, 2, 3, 4];
                    break;
                }
            case 6:
                {
                    idxArr = [0, 1, 2, 3, 4, 5];
                    break;
                }
        }
        return idxArr;
        // if(this.getMenPoker()==2) {
        //     return [0,2];
        // }
    },

    getMenNameArr: function () {
        let idxArr = [];
        switch (this.getMenPoker()) {
            case 2:
                {
                    idxArr = ['bottom', 'up'];
                    break;
                }
            case 3:
                {
                    idxArr = ['bottom', 'right', 'left'];
                    break;
                }
            case 4:
                {
                    idxArr = ['bottom', 'right', 'up', 'left'];
                    break;
                }
            // case 5:
            //     {
            //         idxArr = [0, 1, 2, 3, 4];
            //         break;
            //     }
            // case 6:
            //     {
            //         idxArr = [0, 1, 2, 3, 4, 5];
            //         break;
            //     }
        }
        return idxArr;
    },

    getReadIdx: function (i) {
        //处理2人
        if (this.isERMJ() && i == 1) {
            return 2;
        }
        //处理3人
        if (this.isThreeMJ() && i == 2) {
            return 3;
        }

        return i;
    },

    getSeats: function () {
        var sides = ["myself", "right", "up", "left"];
        if (this.isERMJ()) { //修改成二人
            sides = ["myself", "up"];
        }
        if (this.isThreeMJ()) { //修改成三人
            sides = ["myself", "right", "left"];
        }
        return sides;
    },

    /**
     * 把seats的下标转成本地下标。
     */
    getSideIdx: function (idx) {
        var localIndex = cc.vv.gameNetMgr.getLocalIndex(idx);
        //二人麻将
        if (cc.vv.setPeople.isERMJ()) {
            localIndex = 2;
        }
        //三人麻将
        if (cc.vv.setPeople.isThreeMJ() && localIndex == 2) {
            localIndex = 3;
        }
        return localIndex;
    },

    hi: function () {
        cc.log("hi");
    }

});