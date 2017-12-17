/**
 * 麻将的图片与声音管理类。
 * 
 */
var mahjongSprites = [];
cc.Class({
    extends: cc.Component,

    properties: {
        leftAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        iconAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        rightAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        shaiziAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
        bottomAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        bottomFoldAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        pengPrefabSelf: {
            default: null,
            type: cc.Prefab
        },
        chiPrefabSelf: {
            default: null,
            type: cc.Prefab
        },

        pengPrefabLeft: {
            default: null,
            type: cc.Prefab
        },

        chiPrefabLeft: {
            default: null,
            type: cc.Prefab
        },

        emptyAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        //出牌提示动画
        outcard_tip: {
            default: null,
            type: cc.Prefab
        },


        /**鸡牌显示图集 */
        jiPaiShowBgAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        defectAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        holdsEmpty: {
            default: [],
            type: [cc.SpriteFrame]
        },

        _sides: null,
        _pres: null,
        /**出的牌 */
        _foldPres: null,
        /**牌墩 */
        _foldWallPres: null,
    },

    onLoad: function () {
        if (cc.vv == null) {
            return;
        }
        this._sides = ["myself", "right", "up", "left"];
        this._pres = ["M_", "R_", "B_", "L_"];
        this._foldPres = ["B_", "R_", "B_", "L_"];
        //变为顺时针拿牌
        this._foldWallPres = ["B_", "R_", "B_", "L_"];
        cc.vv.mahjongmgr = this;
        //筒
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("dot_" + i);
        }

        //条
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("bamboo_" + i);
        }

        //万
        for (var i = 1; i < 10; ++i) {
            mahjongSprites.push("character_" + i);
        }

        //中、发、白
        mahjongSprites.push("red");
        mahjongSprites.push("green");
        mahjongSprites.push("white");

        //东西南北风
        mahjongSprites.push("wind_east");
        mahjongSprites.push("wind_west");
        mahjongSprites.push("wind_south");
        mahjongSprites.push("wind_north");
    },

    getMahjongSpriteByID: function (id) {
        return mahjongSprites[id];
    },

    getMahjongType: function (id) {

        if (id >= 0 && id < 9) {
            //筒
            return 0;
        } else if (id >= 9 && id < 18) {
            //条
            return 1;
        } else if (id >= 18 && id < 27) {
            //万
            return 2;
        } else if (id >= 27 && id < 30) {
            //中 发 白
            return 3;
        } else if (id >= 30 && id < 34) {
            //风
            return 4;
        }


    },

    getSpriteFrameByMJID: function (pre, mjid) {
        var spriteFrameName = this.getMahjongSpriteByID(mjid);
        spriteFrameName = pre + spriteFrameName;
        if (pre == "M_") {
            return this.bottomAtlas.getSpriteFrame(spriteFrameName);
        } else if (pre == "B_") {
            return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
        } else if (pre == "L_") {
            return this.leftAtlas.getSpriteFrame(spriteFrameName);
        } else if (pre == "R_") {
            return this.rightAtlas.getSpriteFrame(spriteFrameName);
        }
    },

    /**获取一组数最小的数 */
    getSmallNumByArr: function (arr) {
        if (!arr) {
            return null;
        }
        if (arr.length == 0) {
            return null;
        }
        var smallNum = arr[0];
        for (var i = 1, len = arr.length; i < len; i++) {
            if (arr[i] < smallNum) {
                smallNum = arr[i];
            }
        }
        return smallNum;
    },

    /**通过手牌获取每个花色的张数 */
    getSomeCardsColorArrByHolds: function (holds) {
        var reArr = [0, 0, 0]; //筒条万
        for (var i = 0, len = holds.length; i < len; i++) {
            if (holds[i] < 9) {
                reArr[0]++;
            } else if (holds[i] < 18) {
                reArr[1]++;
            } else {
                reArr[2]++;
            }
        }
        return reArr;
    },

    /**根据缺id获取定缺的icon资源名 */
    getDefectSpriteFrameById: function (defect_id) {
        switch (parseInt(defect_id)) {
            case 6:
                return this.defectAtlas.getSpriteFrame("Btn_wan_up_new");
            case 5:
                return this.defectAtlas.getSpriteFrame("Btn_tiao_up_new");
            case 4:
                return this.defectAtlas.getSpriteFrame("Btn_tong_up_new");
            case 3:
                return this.defectAtlas.getSpriteFrame("Tip_wan");
            case 2:
                return this.defectAtlas.getSpriteFrame("Tip_tiao");
            case 1:
                return this.defectAtlas.getSpriteFrame("Tip_tong");
        }
        return this.defectAtlas.getSpriteFrame("Tip_wan");
    },

    /**通过ID获取一个显示的背景图 */
    getOneShowBgSprFrameById: function (showId) {
        switch (showId) {
            case 0:
                return this.jiPaiShowBgAtlas.getSpriteFrame("Tip_Chongjinji02");
            case 1:
                return this.jiPaiShowBgAtlas.getSpriteFrame("Tip_Chongyinji03");
            case 2:
                return this.jiPaiShowBgAtlas.getSpriteFrame("Tip_Chongwuji04");
            case 3:
                return this.jiPaiShowBgAtlas.getSpriteFrame("Tip_Chongwaji05");
        }
        return this.jiPaiShowBgAtlas.getSpriteFrame("Tip_Zerenji01");
    },

    getAudioURLByMJID: function (id) {
        console.log("id=" + id);
        return this.getZYSounds(id);
        // var realId = 0;
        // if(id >= 0 && id < 9){//筒
        //     realId = id + 19;
        // }
        // else if(id >= 9 && id < 18){//条
        //     realId = id -8;
        // }
        // else if(id >= 18 && id < 27){//万
        //     realId = id - 8;
        // }
        // console.log("getAudioURLByMJID  zy/Mah/" + realId + ".mp3");
        // // W_BaiBan
        // return "zy/Mah/" + realId + ".mp3";
        // return "nv/" +"Mah/" +"W_BaiBan" + ".mp3";

    },

    getZYSounds: function (id) {
        var realId = -1;
        var pros = ["2", "", "1", ""]; //tong tiao wan
        var idx = 0;
        var fengPai = ["HongZhong", "FaCai", "BaiBan", "DongFeng", "XiFeng", "NanFeng", "BeiFeng"];
        if (id >= 0 && id < 9) {
            idx = 0;
            realId = id + 1;
        } else if (id >= 9 && id < 18) {
            idx = 1;
            realId = id - 8;
        } else if (id >= 18 && id < 27) {
            idx = 2;
            realId = id - 17;
        } else if (id >= 27 && id < 34) {
            idx = 3;
            var fengIdx = id - 27;
            realId = fengPai[fengIdx];
        }
        var pro = pros[idx];
        var soundName = "zy/Mah/" + pro + realId + ".mp3";
        // var soundName="nv/" +"Mah/" +"W_BaiBan" + ".mp3";


        console.log(soundName);
        return soundName;

    },

    /**
     *  MINGGANG: 0, // 明杠
        ANGANG: 1, // 暗杠
        WANGANG: 2 //转弯杠
        diangang:3//一般的杠
     */
    getActionSounds: function (type) {
        console.log("getActionSounds", type);
        var name = "";
        switch (type) {
            case "chi":
                name = "";
                break;
            case "peng":
                name = "peng";
                break;
            case "1":
                name = "angang";
                break;
            case "0":
                name = "minggang";
                break;
            case "2":
                name = "zhuanwangang";
                break;
            case "3":
                name = "gang";
                break;
            case "hu":
                name = "dahu";
                break;
            case "zimo":
                name = "zimo";
                break;
            case "ting":
                name = 'ting';
                break;
        }
        var fileName = "zy/Action/" + name + ".mp3";
        // var fileName = "gy/Action/" + name + ".mp3";
        console.log(fileName);
        cc.vv.audioMgr.playSFX(fileName);
        // return fileName;
    },

    getEmptySpriteFrame: function (side) {
        if (side == "up") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_up");
        } else if (side == "myself") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
        } else if (side == "left") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_left");
        } else if (side == "right") {
            return this.emptyAtlas.getSpriteFrame("e_mj_b_right");
        }
    },

    getHoldsEmptySpriteFrame: function (side) {
        // console.log("getHoldsEmptySpriteFrame："+side);
        if (side == "up") {
            return this.emptyAtlas.getSpriteFrame("e_mj_up");
        } else if (side == "myself") {
            return null;
        } else if (side == "left") {
            return this.emptyAtlas.getSpriteFrame("e_mj_left");
        } else if (side == "right") {
            // console.log("getHoldsEmptySpriteFrame：right");
            return this.emptyAtlas.getSpriteFrame("e_mj_right");
        }
    },
    getshaiziSpriteFrame: function (number) {
        var s = "shaizi" + number;
        return this.shaiziAtlas.getSpriteFrame(s);
    },

    sortMJ: function (mahjongs, dingque) {
        var self = this;
        // var caishen = dingque;
        var caishen = 0;
        mahjongs.sort(function (a, b) {
            if (caishen >= 0) {
                if (a == b) {
                    return 0;
                }
                if (a == caishen) {
                    return -1;
                }
                if (b == caishen) {
                    return 1;
                }
                if (a == 29) {
                    return caishen - b;
                }
                if (b == 29) {
                    return a - caishen;
                }
                return a - b;
            }
            return a - b;
        });
    },

    sortPoker: function (arr) {
        arr.sort(function (a, b) {
            let a_yushu=a%13;
            let b_yushu=b%13;
            let a_shang=a/13;
            let b_shang=b/13;
            if(a==b) {
                return 0;
            }
            //A的点数大于B的点数时，A在B的前面。
            if(a_yushu>b_yushu) {
                return -1;
            }if(a_yushu===b_yushu) {
                return a_shang-b_shang;
            }else {
                return 1;
            }
        });
    },

    seticon: function () {
        return this.iconAtlas.getSpriteFrame("dy_play_wenhao");
    },
    getSide: function (localIndex) {

        return this._sides[localIndex];
    },

    getPre: function (localIndex) {
        return this._pres[localIndex];
    },

    /**获取前缀 */
    getFoldPre: function (localIndex) {
        return this._foldPres[localIndex];
    },
    /**获取牌墩前缀 */
    getFoldWallPre: function (localIndex) {
        return this._foldWallPres[localIndex];
    }
});