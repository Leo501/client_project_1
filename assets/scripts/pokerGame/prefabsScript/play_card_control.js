//常量
var constant = require('constant');
var cn = require('const');

var card = require('channel_card_type');
var channel = require('compare_channel');
var headNoType = 0;
var gameSeatsOfUsers = null;
// gameSeatsOfUsers 存放玩家对应的座位数据, 包含手牌, 改为客户端信息即可

exports.setGameSeats = function (userId, holds, headType) {
    gameSeatsOfUsers = {};
    headNoType = headType;
    var countMap = calCardRes(holds);
    console.log("gameSeatsOfUsers userId ", userId);
    gameSeatsOfUsers[userId] = { holds: holds, countMap: countMap };
    console.log('set gameSeatsOfUsers ', gameSeatsOfUsers);

}
//得到刚发13张时候的牌型
exports.getInitCardTypes = function (userId, holds) {
    var cards = card.calCardRes(userId, holds);
    console.log('cards=', cards);
    return cards;
}

//获取牌型对应的牌
exports.getCardPaiOfType = function (userId, type) {
    if (userId == null || type < 0 || type > 8) {
        log.info("err: getCardPaiOfType userId type ", userId, type);
        return;
    }
    if (typeof type == 'string') {
        type = Number.parseInt(type);
    }
    var isSetChannel = channel.isSetChannel(userId);
    var lestType = [];
    if (!isSetChannel) {
        var seatData = gameSeatsOfUsers[userId];
        if (seatData != null) {
            lestType = card.calCardRes(userId, seatData.holds);
        }
    } else {
        lestType = card.calCardRes(userId);
    }
    console.log("lest type from client ", lestType, type);
    if (lestType != null && lestType.length > 0 && lestType.indexOf(type) != -1) {
        var lestPai = [].concat(card.getLestPai(userId));
        var retPais = card.getUserCardInfo(userId, type);
        if (retPais == null) {
            console.log("not get return pai ", type);
            return;
        }
        var retIndex = [];
        if (lestPai != null) {
            if (!isSetChannel) {
                retIndex = card.returnPaisIndex(userId, retPais, seatData.holds);
            } else {
                retIndex = card.returnPaisIndex(userId, retPais, lestPai);
            }
        } else {
            console.log("err: can not find type pai ", type);
        }
        console.log("index type ", type, retPais, retIndex, lestPai);
        // userMgr.sendMsg(userId, 'card_pai_push', { retIndex: retIndex, type: type });
        return { retIndex: retIndex, type: type };
    } else {
        console.log("err: client send type is , all lest type is ", type, lestType);
    }
}

//获取剩余牌对应的牌型
/**
 * cardData={
 *      channel:0,1,2 对应于首道，中道，尾道
 *      pai：
 * }
 * 
 * reture {tyep:0为正确的，不为0说明有问题
 *  为0时，data={ laset:pai,paiTypes}
 * }
 */
exports.chuCard = function (userId, cardData) {
    // cardData = JSON.parse(cardData);
    if (cardData == null || typeof cardData != 'object') {
        // log.error("err: receive client data error ", userId, cardData);
        return;
    }

    //校验
    var isSet = channel.isSetChannelNO(userId, cardData.channel);
    if (isSet) {
        console.log("err: receive client channel NO error ", userId, cardData.channel, channel.getChannelData(cardData.channel));
        return sendOriginData(userId, cardData);
    }

    //
    if (cardData.channel < cn.channelNO.HEAD || cardData.channel > cn.channelNO.BOTTON) {
        // log.error("err: receive client channel error ", userId, cardData.channel);

        return sendOriginData(userId, cardData);
    }
    if ((cardData.channel == cn.channelNO.HEAD && cardData.pai.length > 3)
        || (cardData.channel == cn.channelNO.MIDDLE && cardData.pai.length > 5)
        || (cardData.channel == cn.channelNO.BOTTON && cardData.pai.length > 5)) {
        log.error("err: receive client channel pai count error ", userId, cardData.channel, cardData.pai);

        return sendOriginData(userId, cardData);
    }

    var paiCountMap = {};
    console.log("gameSeatsOfUsers userId ", userId);
    var seatData = gameSeatsOfUsers[userId];
    for (var i = 0; i < cardData.pai.length; ++i) {
        var index = seatData.holds.indexOf(cardData.pai[i]);
        if (index == -1) {
            log.error("err: receive client pai data error ", userId, cardData.pai);

            return sendOriginData(userId, cardData);
        }
        paiCountMap[cardData.pai[i]] = (paiCountMap[cardData.pai[i]] === undefined) ? 1 : ++paiCountMap[cardData.pai[i]];
    }
    for (var pai in paiCountMap) {
        var paiVal = Number.parseInt(pai);
        if (paiCountMap[paiVal] > seatData.countMap[paiVal]) {
            log.error("err: receive client a pai num error ", userId, paiVal, paiCountMap[paiVal]);

            return sendOriginData(userId, cardData);
        }
    }
    cardData.pai = card.sortPai(cardData.pai);

    console.log("chuCard type 1 ", cardData.pai, cardData.type);
    var channelPaiNum = (cardData.channel == cn.channelNO.HEAD) ? 3 : 5;
    var type = card.calCardType(userId, cardData.pai, channelPaiNum);
    console.log("chuCard type 2 ", cardData.pai, type);

    //设置通道的牌型
    if (cardData.type != -1) {
        if (type.indexOf(cardData.type) == -1) {
            console.log("err: client send type error ", cardData.type);
            cardData.type = (type != null && type.length > 0) ? type[type.length - 1] : cn.cardType.WULONG;
        }
    } else {
        cardData.type = (type != null && type.length > 0) ? type[type.length - 1] : cn.cardType.WULONG;
    }
    console.log("chuCard type 4 ", cardData.pai, cardData.type);

    var result = channel.setChannelData(userId, cardData.channel, cardData.type, cardData.pai);
    if (result == null) {

        //返回操作成功以及剩余牌型
        card.delSelPaiFromHolds(userId, cardData.pai);
        var retPaiTypes = card.calCardRes(userId);
        var retPais = card.getLestPai(userId);
        console.log("chu card success ", retPaiTypes, retPais, cardData.type);

        // //发送剩余数据
        // userMgr.sendMsg(userId, 'chu_card_push', {
        //     lestPaiTypes: retPaiTypes, lestPais: retPais, type: cardData.type,
        //     channel: cardData.channel, isError: 0, errMsg: ''
        // });
        return {
            lestPaiTypes: retPaiTypes,
            lestPais: retPais,
            type: cardData.type,
            channel: cardData.channel,
            isError: 0,
            errMsg: ''
        };
    } else {
        if (seatData != null && seatData.holds != null) {
            channel.updateLestData(userId, seatData.holds);
        }
        return sendOriginData(userId, cardData, result);
    }
}

//获取手牌牌型
var calCardRes = function (holds) {
    var countMap = {};
    for (var i = 0; i < holds.length; ++i) {
        var pai = holds[i];
        if (pai != null) {
            if (countMap[pai] == null) {
                countMap[pai] = 1;
            }
            else {
                countMap[pai] += 1;
            }
        }
    }
    return countMap;
}

//发送原有数据
function sendOriginData(userId, cardData, result) {
    //返回剩余牌型
    var retPaiTypes = card.calCardRes(userId);
    var retPais = card.getLestPai(userId);
    console.log("chu card failed ", retPaiTypes, retPais, cardData.type);

    //发送剩余数据
    // userMgr.sendMsg(userId, 'chu_card_push', );
	var type = (result == null || result.type == null) ? -1 : result.type;
    return {
        lestPaiTypes: retPaiTypes,
        lestPais: retPais,
        typePai: cardData.type,
        channel: cardData.channel,
        isError: 1,
        type: type,
    }
}

//取消通道设置
exports.cancelChuCard = function (userId, channelNO) {
    //校验
    if (!channel.isPutCardInChannel(userId, channelNO)) {
        console.log("err: client has cancel channel data ", userId, channelNO);
        return null;
    } else {
        var data = channel.getChannelData(userId, channelNO);
        if (data != null) {
            var lestPaisType = [];
            var lestPais = [];
            console.log("channel pai ", userId, channelNO, data.pai);
            card.pushPaisToUserCard(userId, data.pai);
            if (channel.isSetChannel(userId)) {
                lestPaisType = card.calCardRes(userId);
            } else {
                console.log("gameSeatsOfUsers userId ", userId);
                var seatData = gameSeatsOfUsers[userId];
                if (seatData != null) {
                    lestPaisType = card.calCardRes(userId, seatData.holds);
                }
            }
            lestPais = card.getLestPai(userId);
            channel.cancelChannelNO(userId, channelNO);
            console.log("lest type lest pai ", userId, channelNO, lestPaisType, lestPais);
            // userMgr.sendMsg(userId, 'cannel_chu_pai_push', { lestPaisType: lestPaisType, lestPais: lestPais });
            return { lestPaiTypes: lestPaisType, lestPais: lestPais };
        }
    }
}

//释放玩家数据
exports.releaseUserData = function (userId) {
    console.log('log releaseUserData ', userId);
    if (gameSeatsOfUsers != null) {
        delete gameSeatsOfUsers[userId];
        card.deleteUserCard(userId);
        channel.deleteUserChannel(userId);
    }
    headNoType = 0;
}