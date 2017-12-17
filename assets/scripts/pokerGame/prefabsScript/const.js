// 'use strict';

//牌色
var colorType = {
    HEITAO: 3,
    HONGTAO: 2,
    MEIHUA: 1,
    FANGKUA: 0
};

//牌型
var cardType = {
    WUTONG: 0,  //五同
    TONGHUASHUN: 1, //同花顺
    TIEZHI: 2,  //铁支，(炸弹)
    HULU: 3,    //葫芦,(三带二)
    TONGHUA: 4, //同花
    SHUNZI: 5,  //顺子
    SANTIAO: 6, //三条
    LIANGDUI: 7, //两对
    DUIZI: 8, //对子
    WULONG: 9 //乌龙
}

//结算类型
var resType = {
    SANSHUNZI: 0,
    SANTONGHUA: 1,
    LIUDUIBAN: 2,       //六对半
    SITAOSANTIAO: 3,    //四套三条
    SANFENTIANXIA: 4,   //三套炸弹
    SANTONGHUASHUN: 5,
    YITIAOLONG: 6,
    QINGLONG: 7,
}

//通道号
var channelNO = {
    HEAD: 0,
    MIDDLE: 1,
    BOTTON: 2
}

//最小顺子
var minFiveShunZi = [12, 3, 2, 1, 0];
var minThreeShunZi = [12, 1, 0];

//每色牌长度
var eachColorLen = 13;

//比较结果描述
var compareResult = {
    LESS: -1,
    EQUAL: 0,
    GREATER: 1,
    ERROR: 2,
}

//带马的牌
var daiMa = {
    0: 3,
    1: 8,
    2: 12
}

var channelErrType = {
    HEAD_MIDDLE_ERROR: 0,
    HEAD_BOTTON_ERROR: 1,
    MIDDLE_BOTTON_ERROR: 2
}

module.exports = {
    colorType: colorType,
    cardType: cardType,
    resType: resType,
    channelNO: channelNO,
    minFiveShunZi: minFiveShunZi,
    minThreeShunZi: minThreeShunZi,
    eachColorLen: eachColorLen,
    compareResult: compareResult,
    daiMa: daiMa,
    channelErrType: channelErrType
};
