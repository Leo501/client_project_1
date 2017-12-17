'use strict';
var cn = require("const");
var userCard = {};      //玩家手牌牌型集合
var headNoType = 0;     //头道是否支持同花和顺子 0--不支持 1--支持

//设置头道是否支持同花和顺子
exports.setHeadNoType = function (headType) {
    headNoType = headType;
}

//排序
exports.sortPai = function (pais) {
    pais.sort(function (a, b) { return b % cn.eachColorLen - a % cn.eachColorLen; });
    var paiValNum = {};
    for (var i = 0; i < pais.length; ++i) {
        let cardVal = pais[i] % cn.eachColorLen;
        if (paiValNum[cardVal] === undefined) {
            paiValNum[cardVal] = [];
        }
        paiValNum[cardVal].push(pais[i]);
    }
    var retPais = [];
    for (var paiVal in paiValNum) {
        let cardVal = Number.parseInt(paiVal);
        paiValNum[cardVal].sort(function (a, b) {
            return Math.floor(b / cn.eachColorLen, 0) - Math.floor(a / cn.eachColorLen, 0) < 0;
        });
        retPais = paiValNum[cardVal].concat(retPais);
    }
    return retPais;
}

//统计玩家所有牌型
exports.calCardRes = function (userId, holds) {
    //初始化手牌
    var retType = [];
    if (userId == null) {
        return null;
    }
    var typeData = [];
    if (holds != null) {
        if (userCard[userId] === undefined) {
            userCard[userId] = {};
        }
        holds = exports.sortPai(holds);
        console.log("holds 1 = ", holds);
        typeData = getCardInfo(holds);
        userCard[userId].holds = [].concat(holds);
        userCard[userId].countMap = {};
        for (let i = 0; i < holds.length; ++i) {
            let paiTmp = holds[i];
            if (paiTmp != null) {
                userCard[userId].countMap[paiTmp] =
                    (userCard[userId].countMap[paiTmp] === undefined) ? 1 : ++userCard[userId].countMap[paiTmp];
            }
        }
    } else {
        if (userCard[userId] != null && userCard[userId].holds != null && userCard[userId].holds.length > 0) {
            userCard[userId].holds = exports.sortPai(userCard[userId].holds);
            typeData = getCardInfo(userCard[userId].holds);
            console.log("holds 2 = ", userCard[userId].holds);
        } else {
            console.log("err: userCard[userId].holds is null ", userId, userCard[userId].holds);
            return;
        }
    }

    //初始化玩家数据
    userCard[userId].typeData = [].concat(typeData);
    var typeDataTmp = typeData.slice(0, typeData.length);
    if (typeDataTmp.length <= 0) {
        return null;
    }

    //判断牌含有的牌型
    var paiValNum = {};
    var paiTypeNum = {};
    getValTypeInfo(typeDataTmp, paiValNum, paiTypeNum);
    //console.log("pai val num ", paiValNum);

    //判断是否有五同,铁支,三条,对子
    userCard[userId].typeInfo = {};
    userCard[userId].resultInfo = {};
    var typeInfo = userCard[userId].typeInfo;
    var resultInfo = userCard[userId].resultInfo;
    for (let j = 0; j <= cn.cardType.WULONG; ++j) {
        typeInfo[j] = [];
    }
    if (holds != null) {
        if (Object.keys(paiValNum).length >= cn.eachColorLen) {
            resultInfo[cn.resType.YITIAOLONG] = 1;
            if (Object.keys(paiTypeNum).length <= 1) {
                resultInfo[cn.resType.QINGLONG] = 1;
                delete resultInfo[cn.resType.YITIAOLONG];
            }
        }
    }
    calShunZi(userId, paiValNum, typeInfo, 5);
    console.log("user card res SHUNZI = ", typeInfo[cn.cardType.SHUNZI]);

    //判断相同牌或顺子组合
    for (var data in paiValNum) {
        if (paiValNum[data].num >= 5) {
            for (let u = 0; u + 5 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 5);
                typeInfo[cn.cardType.WUTONG].push({ type: cn.cardType.WUTONG, pai: paiData });
            }
        }
        if (paiValNum[data].num >= 4) {
            for (let u = 0; u + 4 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 4);
                typeInfo[cn.cardType.TIEZHI].push({ type: cn.cardType.TIEZHI, pai: paiData });
            }
        }
        if (paiValNum[data].num >= 3) {
            for (let u = 0; u + 3 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 3);
                typeInfo[cn.cardType.SANTIAO].push({ type: cn.cardType.SANTIAO, pai: paiData });
            }
        }
        if (paiValNum[data].num >= 2) {
            for (let u = 0; u + 2 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 2);
                typeInfo[cn.cardType.DUIZI].push({ type: cn.cardType.DUIZI, pai: paiData });
            }
        }
    }

    //判断是否同花
    for (let data in paiTypeNum) {
        if (paiTypeNum[data].num >= 5) {
            for (let u = 0; u + 5 <= paiTypeNum[data].num; ++u) {
                let paiData = paiTypeNum[data].pai.slice(u, u + 5);
                typeInfo[cn.cardType.TONGHUA].push({ type: cn.cardType.TONGHUA, pai: paiData });
            }
        }
    }
    console.log("user card res TONGHUA = ", typeInfo[cn.cardType.TONGHUA]);

    //判断是否葫芦和两对
    if (typeInfo[cn.cardType.SANTIAO].length > 0 && typeInfo[cn.cardType.DUIZI].length > 0) {
        for (let i = 0; i < typeInfo[cn.cardType.DUIZI].length; ++i) {
            let duizi = typeInfo[cn.cardType.DUIZI][i].pai;
            for (let j = 0; j < typeInfo[cn.cardType.SANTIAO].length; ++j) {
                let santiao = typeInfo[cn.cardType.SANTIAO][j].pai;
                if (santiao.indexOf(duizi[i]) == -1) {
                    let huluPai = santiao.concat(duizi);
                    huluPai = exports.sortPai(huluPai);
                    typeInfo[cn.cardType.HULU].push({ type: cn.cardType.HULU, pai: huluPai });
                }
            }
        }
    }
    console.log("user card res HULU = ", typeInfo[cn.cardType.HULU]);

    if (typeInfo[cn.cardType.DUIZI].length > 1) {
        for (let i = 0; i < typeInfo[cn.cardType.DUIZI].length; ++i) {
            if (i + 1 < typeInfo[cn.cardType.DUIZI].length) {
                let pais1 = typeInfo[cn.cardType.DUIZI][i].pai;
                let pais2 = typeInfo[cn.cardType.DUIZI][i + 1].pai;
                let paiData = pais1.concat(pais2);
                typeInfo[cn.cardType.LIANGDUI].push({ type: cn.cardType.LIANGDUI, pai: paiData });
            }
        }
    }
    console.log("user card res LIANGDUI = ", typeInfo[cn.cardType.LIANGDUI]);

    //统计结果
    for (let cardType in typeInfo) {
        typeInfo[cardType].sort(function (a, b) {
            return ((a.pai.toString().length > b.pai.toString().length)
                || (a.pai.toString().length == a.pai.toString().length && a.pai.toString() < b.pai.toString()));
        });
        if (cardType != null && typeInfo[cardType].length > 0 && retType.indexOf(cardType) == -1) {
            cardType = Number.parseInt(cardType);
            retType.push(cardType);
        }
    }
    if (retType.length == 0) {
        retType.push(cn.cardType.WULONG);
    }
    retType.sort(function (a, b) { return b - a; });
    console.log("ret type = ", retType);
    return retType;
}

exports.updateCardPais = function (userId, holds) {
    if (userId == null || holds == null || userCard[userId] == null || userCard[userId].holds == null) {
        return;
    }
    userCard[userId].holds = [].concat(holds);
}
//统计玩家所有牌型
exports.calCardType = function (userId, oneChannelPais, len) {
    //初始化手牌
    var retType = [];
    if (userId == null || oneChannelPais == null) {
        return null;
    }
    var typeData = [];
    oneChannelPais = exports.sortPai(oneChannelPais);
    typeData = getCardInfo(oneChannelPais);

    //初始化玩家数据
    var typeDataTmp = typeData.slice(0, typeData.length);
    if (typeDataTmp.length <= 0) {
        return null;
    }

    //判断牌含有的牌型
    var paiValNum = {};
    var paiTypeNum = {};
    getValTypeInfo(typeDataTmp, paiValNum, paiTypeNum);

    //判断是否有五同,铁支,三条,对子
    var typeInfo = {};
    for (let j = 0; j <= cn.cardType.WULONG; ++j) {
        typeInfo[j] = [];
    }

    //头道支持同花和顺子
    if ((headNoType == 1 && len == 3) || len == 5) {
        calShunZi(userId, paiValNum, typeInfo, len);
    }

    //判断相同牌或顺子组合
    for (var data in paiValNum) {
        if (paiValNum[data].num >= 5) {
            for (let u = 0; u + 5 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 5);
                typeInfo[cn.cardType.WUTONG].push({ type: cn.cardType.WUTONG, pai: paiData });
            }
        }
        if (paiValNum[data].num >= 4) {
            for (let u = 0; u + 4 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 4);
                typeInfo[cn.cardType.TIEZHI].push({ type: cn.cardType.TIEZHI, pai: paiData });
            }
        }
        if (paiValNum[data].num >= 3) {
            for (let u = 0; u + 3 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 3);
                typeInfo[cn.cardType.SANTIAO].push({ type: cn.cardType.SANTIAO, pai: paiData });
            }
        }
        if (paiValNum[data].num >= 2) {
            for (let u = 0; u + 2 <= paiValNum[data].num; ++u) {
                let paiData = paiValNum[data].pai.slice(u, u + 2);
                typeInfo[cn.cardType.DUIZI].push({ type: cn.cardType.DUIZI, pai: paiData });
            }
        }
    }

    //判断是否同花
    if ((headNoType == 1 && len == 3) || len == 5) {
        for (var data in paiTypeNum) {
            if (paiTypeNum[data].num >= len) {
                for (let u = 0; u + len <= paiTypeNum[data].num; ++u) {
                    var paiData = paiTypeNum[data].pai.slice(u, u + len);
                    typeInfo[cn.cardType.TONGHUA].push({ type: cn.cardType.TONGHUA, pai: paiData });
                }
            }
        }
    }
    console.log("user card res fivePaiSz TONGHUA = ", typeInfo[cn.cardType.TONGHUA]);

    //判断是否葫芦和两对
    if (typeInfo[cn.cardType.SANTIAO].length > 0 && typeInfo[cn.cardType.DUIZI].length > 0) {
        for (let i = 0; i < typeInfo[cn.cardType.DUIZI].length; ++i) {
            var duizi = typeInfo[cn.cardType.DUIZI][i].pai;
            for (let j = 0; j < typeInfo[cn.cardType.SANTIAO].length; ++j) {
                var santiao = typeInfo[cn.cardType.SANTIAO][j].pai;
                if (santiao.indexOf(duizi[i]) == -1) {
                    var huluPai = santiao.concat(duizi);
                    huluPai = exports.sortPai(huluPai);
                    typeInfo[cn.cardType.HULU].push({ type: cn.cardType.HULU, pai: huluPai });
                }
            }
        }
    }
    console.log("user card res fivePaiSz HULU = ", typeInfo[cn.cardType.HULU]);

    if (typeInfo[cn.cardType.DUIZI].length > 1) {
        for (let i = 0; i < typeInfo[cn.cardType.DUIZI].length; ++i) {
            if (i + 1 < typeInfo[cn.cardType.DUIZI].length) {
                let pais1 = typeInfo[cn.cardType.DUIZI][i].pai;
                let pais2 = typeInfo[cn.cardType.DUIZI][i + 1].pai;
                let paiData = pais1.concat(pais2);
                typeInfo[cn.cardType.LIANGDUI].push({ type: cn.cardType.LIANGDUI, pai: paiData });
            }
        }
    }
    console.log("user card res fivePaiSz LIANGDUI = ", typeInfo[cn.cardType.LIANGDUI]);

    //统计结果
    for (let cardType in typeInfo) {
        typeInfo[cardType].sort(function (a, b) {
            return ((a.pai.toString().length > b.pai.toString().length)
                || (a.pai.toString().length == a.pai.toString().length && a.pai.toString() < b.pai.toString()));
        });
        if (cardType != null && typeInfo[cardType].length > 0 && retType.indexOf(cardType) == -1) {
            cardType = Number.parseInt(cardType);
            retType.push(cardType);
        }
    }
    if (retType.length == 0) {
        retType.push(cn.cardType.WULONG);
    }
    retType.sort(function (a, b) { return b - a; });
    console.log("fivePaiSz ret retType = ", retType);
    return retType;
}

//根据客户端发送的类型获取对应的牌数组
exports.getUserCardInfo = function (userId, type) {
    if (type >= cn.cardType.WULONG || type < cn.cardType.WUTONG) {
        return null;
    }
    var retPais = [];
    if (userCard[userId] == null) {
        console.log("err: user card info is null");
        return null;
    }
    var typeInfo = userCard[userId].typeInfo;
    if (typeInfo[type].length <= 0) {
        return null;
    }
    //console.log("typeinfo type ", typeInfo[type]);
    if (userCard[userId].selectInfo === undefined) {
        userCard[userId].selectInfo = {};
    }
    var selectInfo = userCard[userId].selectInfo;
    if (selectInfo[type] === undefined) {
        selectInfo[type] = 0;
    }
    var len = 0;
    if (selectInfo[type] >= typeInfo[type].length) {
        selectInfo[type] = 0;
    }
    len = selectInfo[type];
    var userholdsTmp = [];
    userholdsTmp = userholdsTmp.concat(userCard[userId].holds);

    if (type == cn.cardType.TIEZHI) {
        //获取铁支牌
        retPais = getTieZhiPai(userId, typeInfo[type], len);
    } else if (type == cn.cardType.HULU && typeInfo[cn.cardType.SANTIAO].length > 0
        && typeInfo[cn.cardType.DUIZI].length > 0) {

        //获取葫芦牌
        if (selectInfo[cn.cardType.SANTIAO] === undefined) {
            selectInfo[cn.cardType.SANTIAO] = 0;
        }
        if (selectInfo[cn.cardType.SANTIAO] >= typeInfo[cn.cardType.SANTIAO].length) {
            selectInfo[cn.cardType.SANTIAO] = 0;
        }
        if (selectInfo[cn.cardType.DUIZI] === undefined) {
            selectInfo[cn.cardType.DUIZI] = 0;
        }
        if (selectInfo[cn.cardType.DUIZI] >= typeInfo[cn.cardType.DUIZI].length) {
            selectInfo[cn.cardType.DUIZI] = 0;
        }
        retPais = getHuLuPai(userId, typeInfo, typeInfo[cn.cardType.SANTIAO], selectInfo[cn.cardType.SANTIAO], selectInfo[cn.cardType.DUIZI]);
        ++selectInfo[cn.cardType.SANTIAO];
        ++selectInfo[cn.cardType.DUIZI];
    } else if (type == cn.cardType.SANTIAO) {

        //获取三条牌
        if (selectInfo[cn.cardType.DUIZI] === undefined) {
            selectInfo[cn.cardType.DUIZI] = 0;
        }
        if (selectInfo[cn.cardType.DUIZI] >= typeInfo[cn.cardType.DUIZI].length) {
            selectInfo[cn.cardType.DUIZI] = 0;
        }
        retPais = getSanTiaoPai(userId, typeInfo, typeInfo[cn.cardType.SANTIAO], len, selectInfo[cn.cardType.DUIZI]);
        ++selectInfo[cn.cardType.DUIZI];
    } else if (type == cn.cardType.LIANGDUI && typeInfo[cn.cardType.DUIZI].length >= 2) {
        if (selectInfo[cn.cardType.DUIZI] === undefined) {
            selectInfo[cn.cardType.DUIZI] = 0;
        }
        if (selectInfo[cn.cardType.DUIZI] >= (typeInfo[cn.cardType.DUIZI].length - 1)) {
            selectInfo[cn.cardType.DUIZI] = 0;
        }
        retPais = getLiangDui(userId, typeInfo, selectInfo);
    } else if (type == cn.cardType.DUIZI && typeInfo[cn.cardType.DUIZI].length > 0) {
        retPais = getDuiZi(userId, typeInfo, selectInfo);
    } else {
        if (typeInfo[type].length > len) {
            retPais = retPais.concat(typeInfo[type][len].pai);
            exports.delSelPaiFromHolds(userId, typeInfo[type][len].pai);
        } else {
            retPais = retPais.concat(typeInfo[type][0].pai);
            exports.delSelPaiFromHolds(userId, typeInfo[type][0].pai);
        }
    }
    ++selectInfo[type];
    console.log("lest holds = ", retPais, userCard[userId].holds);
    if (retPais != null) {
        retPais = exports.sortPai(retPais);
    }
    userCard[userId].holds = [].concat(userholdsTmp);

    return retPais;
}

function getTieZhiPai(userId, typeData, len) {
    if (typeData == null || typeData[len] == null || typeData[len].pai == null) {
        return null;
    }
    var retPais = [].concat(typeData[len].pai);
    exports.delSelPaiFromHolds(userId, retPais);
    if (userCard[userId].holds.length > 0) {
        retPais = retPais.concat(userCard[userId].holds[0]);
        exports.delSelPaiFromHolds(userId, userCard[userId].holds[0]);
    }
    return retPais;
}

function getHuLuPai(userId, typeInfo, typeData, len, duiziLen) {
    if (typeData == null || typeData[len] == null || typeData[len].pai == null) {
        return null;
    }
    var retPais = [].concat(typeData[len].pai);
    exports.delSelPaiFromHolds(userId, retPais);
    exports.calCardRes(userId, userCard[userId].holds);
    var duiZi = findDuizi(userId, typeInfo, typeData, len, duiziLen);
    if (duiZi != null) {
        retPais = retPais.concat(duiZi);
        exports.delSelPaiFromHolds(userId, duiZi);
    }
    return retPais;
}

function getSanTiaoPai(userId, typeInfo, typeData, len, duiziLen) {
    if (typeData == null || typeData[len] == null || typeData[len].pai == null) {
        return null;
    }
    var retPais = [].concat(typeData[len].pai);
    exports.delSelPaiFromHolds(userId, retPais);
    exports.calCardRes(userId, userCard[userId].holds);
    if (typeInfo[cn.cardType.DUIZI].length > 0) {
        var duiZi = findDuizi(userId, typeInfo, typeData, len, duiziLen);
        if (duiZi != null) {
            retPais = retPais.concat(duiZi);
            exports.delSelPaiFromHolds(userId, duiZi);
            return retPais;
        }
    }
    let duiziTmp = buTwoWulongPai(userId);
    retPais = retPais.concat(duiziTmp);
    exports.delSelPaiFromHolds(userId, duiziTmp);
    return retPais;
}

function getLiangDui(userId, typeInfo, selectInfo) {
    //找出第一个对子
    var retPais = [].concat(typeInfo[cn.cardType.DUIZI][selectInfo[cn.cardType.DUIZI]].pai);
    ++selectInfo[cn.cardType.DUIZI];
    exports.delSelPaiFromHolds(userId, retPais);
    exports.calCardRes(userId, userCard[userId].holds);

    //识别重复对子,找出有效对子
    var retPaiSZ = [];
    for (let i = selectInfo[cn.cardType.DUIZI]; i < typeInfo[cn.cardType.DUIZI].length; ++i) {
        retPaiSZ = typeInfo[cn.cardType.DUIZI][selectInfo[cn.cardType.DUIZI]].pai;
        var isValid = isValidDuiZiByDuizi1(userId, retPais, retPaiSZ);
        if (isValid) {
            break;
        }
        ++selectInfo[cn.cardType.DUIZI];
        selectInfo[cn.cardType.DUIZI] = selectInfo[cn.cardType.DUIZI] % (typeInfo[cn.cardType.DUIZI].length - 1);
    }

    //补齐剩余对子和散牌
    exports.delSelPaiFromHolds(userId, retPaiSZ);
    retPais = retPais.concat(retPaiSZ);
    if (userCard[userId].holds.length > 0) {
        retPais = retPais.concat(userCard[userId].holds[0]);
        exports.delSelPaiFromHolds(userId, userCard[userId].holds[0]);
    }
    return retPais;
}

function getDuiZi(userId, typeInfo, selectInfo) {
    //找出第一个对子
    var retPais = [].concat(typeInfo[cn.cardType.DUIZI][selectInfo[cn.cardType.DUIZI]].pai);
    ++selectInfo[cn.cardType.DUIZI];
    exports.delSelPaiFromHolds(userId, retPais);
    exports.calCardRes(userId, userCard[userId].holds);

    if (userCard[userId].typeInfo[cn.cardType.DUIZI].length > 1) {
        //识别重复对子,找出有效对子
        var retPaiSZ = [];
        for (let i = selectInfo[cn.cardType.DUIZI]; i < typeInfo[cn.cardType.DUIZI].length; ++i) {
            retPaiSZ = typeInfo[cn.cardType.DUIZI][selectInfo[cn.cardType.DUIZI]].pai;
            var isValid = isValidDuiZiByDuizi1(userId, retPais, retPaiSZ);
            console.log("getDuiZi isValid retPais retPaiSZ ", userId, isValid, retPais, retPaiSZ);
            if (isValid) {
                break;
            }
            ++selectInfo[cn.cardType.DUIZI];
            selectInfo[cn.cardType.DUIZI] = selectInfo[cn.cardType.DUIZI] % (typeInfo[cn.cardType.DUIZI].length);
        }

        //补齐剩余对子和散牌
        if (retPaiSZ.length == 0) {
            //补齐散牌
            let holdsTmp = userCard[userId].holds.slice(0, 3);
            retPais = retPais.concat(holdsTmp);
            exports.delSelPaiFromHolds(userId, holdsTmp);
        } else {
            //补齐剩余对子
            exports.delSelPaiFromHolds(userId, retPaiSZ);
            retPais = retPais.concat(retPaiSZ);
            if (userCard[userId].holds.length > 0) {
                retPais = retPais.concat(userCard[userId].holds[0]);
                exports.delSelPaiFromHolds(userId, userCard[userId].holds[0]);
            }
        }
    } else {
        //补齐散牌
        let holdsTmp = userCard[userId].holds.slice(0, 3);
        retPais = retPais.concat(holdsTmp);
        exports.delSelPaiFromHolds(userId, holdsTmp);
    }
    return retPais;
}

function isValidDuiZiByDuizi1(userId, duiZi1, duiZi2) {
    if (duiZi1.length < 2 || duiZi2.length < 2) {
        if ((duiZi1.indexOf(duiZi2[0]) != -1 && userCard[userId].countMap[duiZi2[0]] < 2)
            || (duiZi1.indexOf(duiZi2[1]) != -1 && userCard[userId].countMap[duiZi2[1]] < 2)) {
            return false;
        }
    }
    return true;
}

function findDuizi(userId, typeInfo, typeData, len, duiziLen) {
    if (typeData == null || typeData[len] == null || typeData[len].pai == null) {
        return null;
    }
    var santiao = typeData[len].pai;
    var duizi = typeInfo[cn.cardType.DUIZI][duiziLen].pai;
    if (duizi.length == 2 && santiao.indexOf(duizi[0]) == -1 && santiao.indexOf(duizi[1]) == -1) {
        return duizi.slice(0, 2);
    } else {
        if (santiao.indexOf(duizi[0]) != -1 && santiao.indexOf(duizi[1]) == -1) {
            if (userCard[userId].countMap[duizi[0]] == 2) {
                return duizi.slice(0, 2);
            }
        } else if (santiao.indexOf(duizi[0]) == -1 && santiao.indexOf(duizi[1]) != -1) {
            if (userCard[userId].countMap[duizi[1]] == 2) {
                return duizi.slice(0, 2);
            }
        } else if (santiao.indexOf(duizi[0]) != -1 && santiao.indexOf(duizi[1]) != -1) {
            if (userCard[userId].countMap[duizi[0]] == 2 && userCard[userId].countMap[duizi[1]] == 2) {
                return duizi.slice(0, 2);
            }
        }
    }
    for (let i = 0; i < typeInfo[cn.cardType.DUIZI].length; ++i) {
        var duizi = typeInfo[cn.cardType.DUIZI][i].pai;
        if (duizi == null || duizi.length <= 0) {
            continue;
        }
        if (duizi.length == 2 && santiao.indexOf(duizi[0]) == -1 && santiao.indexOf(duizi[1]) == -1) {
            return duizi.slice(0, 2);
        }
    }
    return null;
}

function buTwoWulongPai(userId) {
    var retPais = [];
    if (userCard[userId].holds.length > 0) {
        let holdsTmp = [];
        holdsTmp.push(userCard[userId].holds[0]);
        holdsTmp.push(userCard[userId].holds[1]);
        retPais = retPais.concat(holdsTmp);
        exports.delSelPaiFromHolds(userId, holdsTmp);
    }
    return retPais;
}

function getCardInfo(holds) {
    var typeInfo = [];
    for (var i = 0; i < holds.length; ++i) {
        typeInfo.push({
            pai: holds[i],
            paiVal: holds[i] % cn.eachColorLen,
            paiType: Number.parseInt(holds[i] / cn.eachColorLen)
        });
    }
    return typeInfo;
}

function getCardColor(pai) {
    if (pai != null) {
        return Number.parseInt(pai / cn.eachColorLen);
    } else {
        return -1;
    }
}

function getValTypeInfo(typeDataTmp, paiValNum, paiTypeNum) {
    for (let i = 0; i < typeDataTmp.length; ++i) {
        let data = typeDataTmp[i];
        if (data != null) {
            if (paiValNum[data.paiVal] === undefined) {
                paiValNum[data.paiVal] = {};
                paiValNum[data.paiVal].num = 0;
                paiValNum[data.paiVal].pai = [];
            }
            ++paiValNum[data.paiVal].num;
            paiValNum[data.paiVal].pai.push(data.pai);
            if (paiTypeNum[data.paiType] === undefined) {
                paiTypeNum[data.paiType] = {};
                paiTypeNum[data.paiType].num = 0;
                paiTypeNum[data.paiType].pai = [];
            }
            ++paiTypeNum[data.paiType].num;
            paiTypeNum[data.paiType].pai.push(data.pai);
            //console.log(" val and type jsfdisdfji ", data.paiVal, paiValNum[data.paiVal].pai);
        }
    }
}

function calShunZi(userId, paiValNum, typeInfo, len) {
    for (var key in paiValNum) {
        let paiVal = Number.parseInt(key);
        if (paiValNum[paiVal] == null
            || paiValNum[paiVal].pai == null
            || paiValNum[paiVal].pai.length <= 0) {
            continue;
        }
        let recordPais = [];
        recordPais.push(paiVal);
        var initNextPaiVal = paiVal;
        if (paiVal == 12) {
            initNextPaiVal = paiVal - cn.eachColorLen; //如果是A, 顺子的下张牌为2,值为1
        }
        for (let j = 1; j <= len - 1; ++j) {
            let nextPaiVal = initNextPaiVal + j;
            //console.log("data ", nextPaiVal, paiValNum[nextPaiVal]);
            if (paiValNum[nextPaiVal] == null
                || paiValNum[nextPaiVal].pai == null
                || paiValNum[nextPaiVal].pai.length <= 0) {
                break;
            }
            recordPais.push(nextPaiVal);
        }
        if (recordPais.length == len) {
            console.log("enter record pai length ", recordPais);
            var recordPaiSet = {};
            for (let l = 0; l < recordPais.length; ++l) {
                let paiValTmp = recordPais[l];
                let index = 0;
                for (let k = 0; k < paiValNum[paiValTmp].pai.length; ++k) {
                    let paiTmp2 = paiValNum[paiValTmp].pai[k];
                    if (paiTmp2 == null) {
                        continue;
                    }
                    if (recordPaiSet[index] === undefined) {
                        recordPaiSet[index] = [];
                    }
                    recordPaiSet[index].push(paiTmp2);
                    ++index;
                }
            }
            if (Object.keys(recordPaiSet).length <= 0) {
                continue;
            }
            console.log("recordPaiSet ", recordPaiSet);
            for (var index in recordPaiSet) {
                var paiSZ = recordPaiSet[index];
                if (exports.isShunZi(paiSZ) && !isExistSameResult(typeInfo[cn.cardType.SHUNZI], paiSZ)) {
                    typeInfo[cn.cardType.SHUNZI].push({ type: cn.cardType.SHUNZI, pai: paiSZ });
                    console.log("type info shunzi ", typeInfo[cn.cardType.SHUNZI]);
                    if (exports.isTongHua(paiSZ)) {
                        typeInfo[cn.cardType.TONGHUASHUN].push({ type: cn.cardType.TONGHUASHUN, pai: paiSZ });
                        console.log("type info tonghuashun ", typeInfo[cn.cardType.TONGHUASHUN]);
                    }
                }
            }
        }
        //console.log("typeInfo ",  typeInfo[cn.cardType.TONGHUASHUN]);
    }
}

exports.returnPaisIndex = function (userId, retPais, holds) {
    var retIndex = [];
    for (let i = 0; i < retPais.length; ++i) {
        var index = 0;
        if (holds == null) {
            index = userCard[userId].holds.indexOf(retPais[i]);
            if (retIndex.indexOf(index) != -1 && index < userCard[userId].holds.length - 1) {
                let holdsTmp = userCard[userId].holds.slice(index + 1, userCard[userId].holds.length);
                let indexTmp = holdsTmp.indexOf(retPais[i]);
                retIndex.push(index + indexTmp + 1);
            } else {
                retIndex.push(index);
            }
        } else {
            holds = exports.sortPai(holds);
            index = holds.indexOf(retPais[i]);
            if (retIndex.indexOf(index) != -1 && index < holds.length - 1) {
                let holdsTmp = holds.slice(index + 1, holds.length);
                let indexTmp = holdsTmp.indexOf(retPais[i]);
                retIndex.push(index + indexTmp + 1);
            } else {
                retIndex.push(index);
            }
        }
    }
    return retIndex;
}

exports.isShunZi = function (pais) {
    var paiValNum = {};
    var paiTypeNum = {};
    pais = exports.sortPai(pais);
    var typeData = getCardInfo(pais);
    getValTypeInfo(typeData, paiValNum, paiTypeNum);
    //console.log("isShunZi val and type setting ", pais, paiValNum);
    for (var key in paiValNum) {
        var paiVal = Number.parseInt(key);
        if (paiVal == 12) {
            paiVal = -1;
        }
        if (pais.length == 3 && paiValNum[paiVal + 1] != null &&
            paiValNum[paiVal + 2] != null) {
            return true;
        } else if (pais.length == 5) {
            var isShunzi = true;
            for (var i = 0; i < 4; ++i) {
                if (paiValNum[paiVal + i + 1] === undefined) {
                    isShunzi = false;
                }
            }
            if (isShunzi) {
                return true;
            }
        }
    }
    return false;
}

function isExistSameResult(typeData, recordPais) {
    if (typeData.length <= 0) {
        return false;
    }
    for (let i = 0; i < typeData.length; ++i) {
        var type = typeData[i];
        if (recordPais.toString() == type.pai.toString()) {
            return true;
        }
    }
    return false;
}

exports.getLestPai = function (userId) {
    if (userCard[userId] == null || userCard[userId].holds == null || userCard[userId].holds.length <= 0) {
        return null;
    } else {
        return userCard[userId].holds;
    }
}

function getValidDuizi(userId, retPais, typeData, index) {
    exports.delSelPaiFromHolds(userId, retPais);
    exports.calCardRes(userId, userCard[userId].holds);
    if (typeData != null && typeData.length > 0) {
        var retPaiSZ = typeData[0].pai;
        exports.delSelPaiFromHolds(userId, retPaiSZ);
        return retPaiSZ;
    } else {
        console.log("get valid duizi error ", userId, typeData);
        return null;
    }
}

exports.delSelPaiFromHolds = function (userId, retPais) {
    if (retPais == null) {
        return;
    }
    for (var i = 0; i < retPais.length; ++i) {
        var index = userCard[userId].holds.indexOf(retPais[i]);
        if (index != -1) {
            userCard[userId].holds.splice(index, 1);
        }
    }
}

exports.getCardType = function (userId, type, pai) {
    pai = exports.sortPai(pai);
    var typeInfo = userCard[userId].typeInfo;
    var retType = [];
    for (var cardType in typeInfo) {
        if (type != -1 && cardType != type) {
            continue;
        }
        cardType = Number.parseInt(cardType);
        var cardData = typeInfo[cardType];
        if (cardData == null || cardData.length <= 0) {
            continue;
        }
        for (var i = 0; i < cardData.length; ++i) {
            if (cardData[i] == null || cardData[i].pai == null || cardData[i].pai.length <= 0) {
                continue;
            }
            cardData[i].pai = exports.sortPai(cardData[i].pai);
            //console.log("card pais   sss ", cardData[i].pai);
            if (pai.toString() == cardData[i].pai.toString()) {
                cardType = Number.parseInt(cardType);
                if (retType.indexOf(cardType) == -1) {
                    retType.push(cardType);
                }
            }
        }
    }
    if (type == -1 && retType.indexOf(cn.cardType.TONGHUA) == -1) {
        if (exports.isTongHua(pai)) {
            retType.push(cn.cardType.TONGHUA);
        }
    }
    return retType;
}

exports.isTongHua = function (pais) {
    var cardColor = -1;
    for (var j = 0; j < pais.length; ++j) {
        var color = getCardColor(pais[j]);
        if (cardColor == -1) {
            cardColor = color;
        } else if (color != cardColor) {
            return false;
        }
    }
    return true;
}

exports.pushPaisToUserCard = function (userId, pais) {
    if (userCard[userId] == null || userCard[userId].holds == null || pais == null) {
        return;
    }
    if (userCard[userId].holds.length < cn.eachColorLen) {
        userCard[userId].holds = userCard[userId].holds.concat(pais);
    }
    userCard[userId].holds = exports.sortPai(userCard[userId].holds);
    console.log("user id lest holds ", userId, userCard[userId].holds);
}

exports.isSpecialType = function (userId, type) {
    if (userCard[userId].resultInfo != null) {
        var resultInfo = userCard[userId].resultInfo;
        if (resultInfo[type] != null && resultInfo[type] == 1) {
            return true;
        }
    }
    return false;
}

exports.setSpecialType = function (userId, type) {
    if (userCard[userId].resultInfo == null) {
        userCard[userId].resultInfo = [];
    }
    userCard[userId].resultInfo[type] = 1;
    console.log("set special type success ", type);
}

exports.getSpecialType = function (userId) {
    if (userCard[userId].resultInfo == null || Object.keys(userCard[userId].resultInfo).length <= 0) {
        return -1;
    }
    console.log("get special type success ", type);
    var type = Object.keys(userCard[userId].resultInfo)[0];
    return type;
}

exports.deleteUserCard = function (userId) {
    if (userCard[userId] == null) {
        return;
    }
    delete userCard[userId];
}