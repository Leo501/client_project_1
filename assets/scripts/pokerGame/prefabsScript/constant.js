// 'use strict';
var TingPaiType = {
    PINGHU: 0,  //  平胡
    BIANKADIAO: 1, //边卡掉
    DADUIZI: 2, //大对子
    DAKUANGZI: 3,  //大宽张
    QIXIAODUI: 4, //七小对
    LONGQIDUI: 5, //龙七对
    QINGYISE: 6, //清一色,
    TIANHU: 7, //天胡,
    DIHU: 8, //地胡
    GANGSHANGHUA: 9,  //杠上花
    GANGSHANGPAO: 10, //杠上炮
    QIANGGANGHU: 11 //抢杠胡
};
var TingPaiTypeDescribe = {
    0: "平胡",
    1: "边卡吊",
    2: "大对子",
    3: "大宽张",
    4: "七小对",
    5: "龙七对",
    6: "清一色",
    7: "天胡",
    8: "地胡",
    9: "杠上花",
    10: "滑豆",
    11: "抢杠胡"
};

var HuiPaiScore = {
    0: { zimo: 2, fangpao: 2 },
    1: { zimo: 3, fangpao: 3 },
    2: { zimo: 5, fangpao: 5 },
    3: { zimo: 4, fangpao: 4 },
    4: { zimo: 10, fangpao: 10 },
    5: { zimo: 20, fangpao: 20 },
    6: { zimo: 10, fangpao: 10 },
    7: { zimo: 10 },
    8: { zimo: 10 },
    9: { zimo: 10 },
    10: {},
    11: {}
};

var GangPaiType = {
    MINGGANG: 0, // 明杠
    ANGANG: 1, // 暗杠
    WANGANG: 2, //转弯杠
    NOSCOREGANG: 3 //不得分特殊杠,多用于杠上炮
};

var GangPaiScore = {
    0: { score: 2 },
    1: { score: 3 },
    2: { score: 4 }
};

var HuPaiWay = { // 胡牌方式
    Zimo: 0, //自摸
    FangPao: 1 //放炮
};


var GameStatus = {
    DINGQUE: 0, // 定缺
    PYAYING: 1, // 开始
    GAMEOVER: 2, //游戏结束
    IDLE: 3     //空闲
};

var CreateRoomInfo = {
    paiNum: {
        0: {  // 10局 16房卡
            jushu: 10,
            jushucost: 16
        },
        1: {  // 20局 30房卡
            jushu: 20,
            jushucost: 30
        },
        2: { // 30局 46房卡 
            jushu: 30,
            jushucost: 46
        }
    },
    type: {
        0: { file: "./thirteen_water_gamemgr", seatlen: 2 },     // 2人场
        1: { file: "./thirteen_water_gamemgr", seatlen: 3 },     // 3人场
        2: { file: "./thirteen_water_gamemgr", seatlen: 4 },     // 4人场
        3: { file: "./thirteen_water_gamemgr", seatlen: 5 },     // 5人场
        4: { file: "./thirteen_water_gamemgr", seatlen: 6 }      // 6人场
    },
    jiPaiRule: {
        0: 0, // 金鸡
        1: 1, // 银鸡
        2: 2, // 乌鸡
        3: 3, // 挖鸡
        4: 4, // 上下鸡
    },
    chongfengJi: {
        0: 0, // 冲金鸡
        1: 1, // 冲银鸡
        2: 2, // 冲乌鸡
        3: 3, // 冲挖鸡
    }
};

var JiType = {
    JingJi: 0,
    YingJi: 1,
    WuJi: 2,
    WaJi: 3,
    ShangXiaJi: 4
};

var JiPaiDescribe = {
    0: '金鸡',
    1: '银鸡',
    2: '乌鸡',
    3: '挖鸡',
    4: '上下鸡',
};

var JiPaiScore = {
    [JiType.JingJi]: { frist: 3, other: 2 },
    [JiType.YingJi]: { frist: 2, other: 1 },
    [JiType.WuJi]: { frist: 4, other: 3 },
    [JiType.WaJi]: { frist: 5, other: 4 },
};

var JiPai = {
    0: [9], // 金鸡
    1: [0, 18], // 银鸡
    2: [7], // 乌鸡
    3: [24, 6, 15], // 挖鸡
};

var CongJiPaiTypeCoverZrjPaiType = {
    0: 4,
    1: 5,
    2: 6,
    3: 7,
};

var getJiPaiTypeByPai = function (pai) {
    pai = parseInt(pai);
    for (var i in JiPai) {
        if (~JiPai[i].indexOf(pai)) {
            return i;
        }
    }
    return -1;
};

var PaiType = {
    TONG: 1, //筒
    TIAO: 2, //条
    WAN: 3 //万
};

var operType = {
    PENG: 0, //碰
    ANGANG: 1, //暗杠
    MINGANG: 2, //明杠
    WANGANG: 3, //弯杠
    NOSCOREGANG: 9,
    CHU: 4, //出
    HUO: 5, //胡1
    HUW: 6, //胡2
    HUT: 7, //胡3
    HUF: 8, //胡4
};

var operNum = {
    [operType.PENG]: 3,
    [operType.ANGANG]: 4,
    [operType.MINGANG]: 4,
    [operType.WANGANG]: 1,
    [operType.NOSCOREGANG]: 1,
    [operType.CHU]: 1,
    [operType.HUO]: 1,
    [operType.HUW]: 2,
    [operType.HUT]: 3,
    [operType.HUF]: 4
};

var JpaiNameMap = {
    9: "jingJiScore",
    0: "yingJiZoreScore",
    18: "yingJiEighteenScore",
    7: "wuJiScore",
    24: "waJiScore",
    6: "waJiSixScore",
    15: "waJiFifteenScore",
};


module.exports = {
    PaiType: PaiType,
    TingPaiType: TingPaiType,
    HuiPaiScore: HuiPaiScore,
    GangPaiType: GangPaiType,
    GangPaiScore: GangPaiScore,
    GameStatus: GameStatus,
    CreateRoomInfo: CreateRoomInfo,
    JiType: JiType,
    JiPai: JiPai,
    HuPaiWay: HuPaiWay,
    JiPaiScore: JiPaiScore,
    JiPaiDescribe: JiPaiDescribe,
    TingPaiTypeDescribe: TingPaiTypeDescribe,
    getJiPaiTypeByPai: getJiPaiTypeByPai,
    operType: operType,
    operNum: operNum,
    JpaiNameMap: JpaiNameMap,
    CongJiPaiTypeCoverZrjPaiType: CongJiPaiTypeCoverZrjPaiType
};
