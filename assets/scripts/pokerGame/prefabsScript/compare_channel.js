'use strict';
var cn = require("const");
var card = require("channel_card_type");
var userChannel = {};      //通道牌型记录

exports.setChannelData = function (userId, channel, type, pai) {
    if (userChannel[userId] === undefined) {
        userChannel[userId] = [];
    }
    var isExistChannel = false;
    for (let i = 0; i < userChannel[userId].length; ++i) {
        let channelData = userChannel[userId][i];
        if (channelData != null && channelData.channel == channel) {
            channelData.pai = [].concat(pai);
            channelData.type = type;
            isExistChannel = true;
            break;
        }
    }
    if (!isExistChannel) {
        userChannel[userId].push({
            channel: channel,
            type: type,
            pai: pai,
        });
    }
    if ((channel == cn.channelNO.HEAD && pai.length < 3)
        || (channel == cn.channelNO.MIDDLE && pai.length < 5)
        || (channel == cn.channelNO.BOTTON && pai.length < 5)) {
        console.log("fewer number channel data ", userChannel[userId]);
        return null;
    }

    //比大小
    var channelRes = exports.compareTwoChannel(userId, channel);
    if (channelRes != null && channelRes.result != cn.compareResult.LESS && channelRes.result != cn.compareResult.ERROR) {
        console.log("cancel user channel ", userId, channel);
        exports.cancelChannelNO(userId, channel);
        return channelRes;
    } else {
        console.log("full number channel data ", userChannel[userId]);
        return null;
    }
}

exports.updateLestData = function (userId, holds) {
    var holdTmp = [].concat(holds);
    console.log("updateLestData holds 1 = ", holdTmp);
    for (var i = 0; i <= userChannel[userId].length; ++i) {
        var channelData = userChannel[userId][i];
        if (channelData != null && channelData.pai != null && channelData.pai.length > 0) {
            for (var j = 0; j < channelData.pai.length; ++j) {
                var index = holdTmp.indexOf(channelData.pai[j]);
                if (index != -1) {
                    holdTmp.splice(index, 1);
                }
            }
        }
    }
    console.log("updateLestData holds 2 = ", holdTmp);
    card.updateCardPais(userId, holdTmp);
}

exports.getChannelData = function (userId, channel) {
    if (userChannel[userId] == null || userChannel[userId].length <= 0) {
        return null;
    }
    for (var i = 0; i < userChannel[userId].length; ++i) {
        var data = userChannel[userId][i];
        if (data != null && data.channel == channel) {
            return data;
        }
    }
    return null;
}

//是否设置过通道,只要设置一个就算
exports.isSetChannel = function (userId) {
    if (userChannel[userId] == null || userChannel[userId].length <= 0) {
        return false;
    } else {
        return true;
    }
}

//是否该通道已设置
exports.isSetChannelNO = function (userId, channel) {
    if (userId == null || channel == null || userChannel[userId] == null || userChannel[userId].length <= 0) {
        return false;
    }
    for (var i = 0; i < userChannel[userId].length; ++i) {
        var channelData = userChannel[userId][i];
        if (channelData != null && channelData.channel == channel) {
            if (channel == cn.channelNO.HEAD && channelData.pai != null && channelData.pai.length == 3) {
                return true;
            } else if (channel != cn.channelNO.HEAD && channelData.pai != null && channelData.pai.length == 5) {
                return true;
            }
        }
    }
    return false;
}

//是否设置了通道或部分通道,是否可以取消通道
exports.isPutCardInChannel = function (userId, channel) {
    if (userId == null || channel == null || userChannel[userId] == null || userChannel[userId].length <= 0) {
        return false;
    }
    for (var i = 0; i < userChannel[userId].length; ++i) {
        var channelData = userChannel[userId][i];
        if (channelData != null && channelData.channel == channel && channelData.pai != null && channelData.pai.length > 0) {
            return true;
        }
    }
    return false;
}

//取消通道设置
exports.cancelChannelNO = function (userId, channel) {
    for (var i = 0; i < userChannel[userId].length; ++i) {
        var channelData = userChannel[userId][i];
        if (channelData != null && channelData.channel == channel) {
            delete userChannel[userId][i];
            userChannel[userId][i] = null;
            break;
        }
    }
}

exports.compare = function (userId1, userId2, channel) {
    if (userChannel[userId1] == null || userChannel[userId2] == null) {
        console.log("err: compare data error ");
        return cn.compareResult.ERROR;
    }
    var user1Channel = {};
    var user2Channel = {};
    console.log("compare channel data = ", userId1, userChannel[userId1]);
    for (var i = 0; i < userChannel[userId1].length; ++i) {
        if (userChannel[userId1][i] == null) {
            continue;
        }
        console.log("compare channel no is ", userId1, userChannel[userId1][i], userChannel[userId1][i].channel);
        if (userChannel[userId1][i].channel == channel) {
            user1Channel = userChannel[userId1][i];
            break;
        }
    }
    for (var i = 0; i < userChannel[userId2].length; ++i) {
        if (userChannel[userId2][i] == null) {
            continue;
        }
        if (userChannel[userId2][i].channel == channel) {
            user2Channel = userChannel[userId2][i];
            break;
        }
    }
    console.log("1 2 ", user1Channel, user2Channel);
    if (Object.keys(user1Channel).length > 0 && Object.keys(user2Channel).length > 0) {
        return compareChannels(user1Channel, user2Channel);
    } else {
        return cn.compareResult.EQUAL;
    }
}

function compareChannels(user1Channel, user2Channel) {
    if (user1Channel.type == -1) {
        user1Channel.type = cn.cardType.WULONG;
    }
    if (user2Channel.type == -1) {
        user2Channel.type = cn.cardType.WULONG;
    }

    if (user1Channel.type < user2Channel.type) {
        return cn.compareResult.GREATER;
    } else if (user1Channel.type == user2Channel.type) {
        if (user1Channel.pai.toString() == user2Channel.pai.toString()) {
            return cn.compareResult.EQUAL;
        } else {
            if (user1Channel.type == cn.cardType.SHUNZI) {
                if (user1Channel.channel == cn.channelNO.HEAD) {
                    if (user1Channel.pai.toString() == user2Channel.pai.toString()) {
                        return cn.compareResult.EQUAL;
                    } else if (cn.minThreeShunZi.toString() == user1Channel.pai.toString()) {
                        return cn.compareResult.LESS;
                    } else if (cn.minThreeShunZi.toString() == user2Channel.pai.toString()) {
                        return cn.compareResult.GREATER;
                    }
                } else {
                    if (user1Channel.pai.toString() == user2Channel.pai.toString()) {
                        return cn.compareResult.EQUAL;
                    } else if (cn.minFiveShunZi.toString() == user1Channel.pai.toString()) {
                        return cn.compareResult.LESS;
                    } else if (cn.minFiveShunZi.toString() == user2Channel.pai.toString()) {
                        return cn.compareResult.GREATER;
                    }
                }
            }

            //铁支 葫芦 三条 两对和对子 特殊处理
            if (user1Channel.type == cn.cardType.TIEZHI
                || user1Channel.type == cn.cardType.HULU
                || user1Channel.type == cn.cardType.SANTIAO
                || user1Channel.type == cn.cardType.LIANGDUI
                || user1Channel.type == cn.cardType.DUIZI) {
                return compareSamePais(user1Channel, user2Channel);
            } else {
                for (let j = 0; j < user1Channel.pai.length; ++j) {
                    if ((user1Channel.pai[j] % cn.eachColorLen) < (user2Channel.pai[j] % cn.eachColorLen)) {
                        return cn.compareResult.LESS;
                    } else if ((user1Channel.pai[j] % cn.eachColorLen) > (user2Channel.pai[j] % cn.eachColorLen)) {
                        return cn.compareResult.GREATER;
                    }
                }
                if (user1Channel.channel == cn.channelNO.HEAD) {
                    return cn.compareResult.LESS;
                } else {
                    return cn.compareResult.EQUAL;
                }
            }
        }
    } else {
        return cn.compareResult.LESS;
    }
}

//获取值数量
function getValInfo(typeData, paiValNum) {
    for (let i = 0; i < typeData.length; ++i) {
        let data = typeData[i];
        data = data % cn.eachColorLen;
        if (data != null) {
            if (paiValNum[data] === undefined) {
                paiValNum[data] = {};
                paiValNum[data].num = 0;
                paiValNum[data].pai = [];
            }
            ++paiValNum[data].num;
            paiValNum[data].pai.push(typeData[i]);
        }
    }
}


//比较含有相同牌的组合 铁支 葫芦 三条 两对和对子
function compareSamePais(user1Channel, user2Channel) {
    var channel1Pai = [].concat(user1Channel.pai);
    var channel2Pai = [].concat(user2Channel.pai);

    //先找出相同数据排序
    console.log("pai xu 1 ", channel1Pai);
    channel1Pai = sortSamePaisz(channel1Pai, user1Channel);
    console.log("pai xu 11 ", channel1Pai);
    console.log("pai xu 2 ", channel2Pai);
    channel2Pai = sortSamePaisz(channel2Pai, user2Channel);
    console.log("pai xu 22 ", channel2Pai);

    //直接比大小
    var len = Math.min(channel1Pai.length, channel2Pai.length);
    for (let j = 0; j < len; ++j) {
        if ((channel1Pai[j] % cn.eachColorLen) < (channel2Pai[j] % cn.eachColorLen)) {
            return cn.compareResult.LESS;
        } else if ((channel1Pai[j] % cn.eachColorLen) > (channel2Pai[j] % cn.eachColorLen)) {
            return cn.compareResult.GREATER;
        }
    }
    if (user1Channel.channel == cn.channelNO.HEAD) {
        return cn.compareResult.LESS;
    }
}

function sortSamePaisz(channelPai, userChannel) {
    var paiValNum1 = {};
    var paiValsz = [];
    getValInfo(channelPai, paiValNum1);
    for (let paiVal in paiValNum1) {
        if (paiValNum1[paiVal] != null && userChannel.type != cn.cardType.HULU) {
            if (paiValNum1[paiVal].num > 1) {
                paiValsz = paiValNum1[paiVal].pai.concat(paiValsz);
            }
        } else if (paiValNum1[paiVal] != null && userChannel.type == cn.cardType.HULU) {
            if (paiValNum1[paiVal].num == 3) {
                paiValsz = paiValNum1[paiVal].pai.concat(paiValsz);
                break;
            }
        }
    }
    for (let paiVal in paiValNum1) {
        if (paiValNum1[paiVal] != null && userChannel.type == cn.cardType.HULU) {
            if (paiValNum1[paiVal].num == 2) {
                paiValsz = paiValsz.concat(paiValNum1[paiVal].pai);
                break;
            }
        } else if (paiValNum1[paiVal] != null && userChannel.type != cn.cardType.HULU) {
            if (paiValNum1[paiVal].num == 1) {
                paiValsz = paiValNum1[paiVal].pai.concat(paiValsz);
            }
        }
    }

    return paiValsz;
}

exports.compareTwoChannel = function (userId, channel) {
    var channel1 = {};
    var channel2 = {};
    var channel3 = {};
    for (var i = 0; i < userChannel[userId].length; ++i) {
        if (userChannel[userId][i] == null) {
            continue;
        }
        if (userChannel[userId][i].channel == cn.channelNO.HEAD) {
            channel1 = userChannel[userId][i];
        } else if (userChannel[userId][i].channel == cn.channelNO.MIDDLE) {
            channel2 = userChannel[userId][i];
        } else if (userChannel[userId][i].channel == cn.channelNO.BOTTON) {
            channel3 = userChannel[userId][i];
        }
    }

    //一个玩家的头道小于中道，中道小于尾道
    var compResult = cn.compareResult.LESS;
    if (Object.keys(channel1).length > 0 && Object.keys(channel2).length > 0) {
        if (exports.isSetChannelNO(userId, channel1.channel) && exports.isSetChannelNO(userId, channel2.channel)) {
            compResult = compareChannels(channel1, channel2);
        }
    }
    if (compResult == cn.compareResult.GREATER || compResult == cn.compareResult.EQUAL) {
        return {
            channel1: cn.channelNO.HEAD,
            channel2: cn.channelNO.MIDDLE,
            result: compResult,
            type: cn.channelErrType.HEAD_MIDDLE_ERROR
        };
    }
    if (Object.keys(channel1).length > 0 && Object.keys(channel3).length > 0) {
        if (exports.isSetChannelNO(userId, channel1.channel) && exports.isSetChannelNO(userId, channel3.channel)) {
            compResult = compareChannels(channel1, channel3);
        }
    }
    if (compResult == cn.compareResult.GREATER || compResult == cn.compareResult.EQUAL) {
        return {
            channel1: cn.channelNO.HEAD,
            channel2: cn.channelNO.BOTTON,
            result: compResult,
            type: cn.channelErrType.HEAD_BOTTON_ERROR
        };
    }
    if (Object.keys(channel2).length > 0 && Object.keys(channel3).length > 0) {
        if (exports.isSetChannelNO(userId, channel2.channel) && exports.isSetChannelNO(userId, channel3.channel)) {
            compResult = compareChannels(channel2, channel3);
        }
    }
    if (compResult == cn.compareResult.GREATER || compResult == cn.compareResult.EQUAL) {
        return {
            channel1: cn.channelNO.MIDDLE,
            channel2: cn.channelNO.BOTTON,
            result: compResult,
            type: cn.channelErrType.MIDDLE_BOTTON_ERROR
        };
    }

    return null;
}

exports.addEachScore = function (userId, score) {
    if (userChannel[userId].score === undefined) {
        userChannel[userId].score = 0;
    }
    userChannel[userId].score += score;
}

exports.getTotalScore = function (userId) {
    if (userChannel[userId].score === undefined) {
        userChannel[userId].score = 0;
    }
    return userChannel[userId].score;
}

exports.deleteUserChannel = function (userId) {
    if (userChannel[userId] == null) {
        return;
    }
    delete userChannel[userId];

}