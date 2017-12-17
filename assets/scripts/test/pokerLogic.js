/**
 *产生一个52张（没有大小王）的数据
 */
const creatPokerArr = function () {
    let pokers = [];
    // for (let i = 0; i < 52; i++) {
    //     pokers.push(i);
    // }
    for (let i = 1; i < 5; i++) {
        let color = i;
        for (let j = 0; j < 13; j++) {
            let type = color + j.toString(16);
            console.log('type=', color);
            pokers.push(type);
        }
    }
    return pokers;
};

/**
 * 输入一个10进制的数字转成16进制的字符串，可以得知花色，数字，数组所在位置。
 * @param {*String } a 
 */
const poker10To16 = function (a) {
    let a10 = a;
    let color = a10 >> 3 * 4;
    let numb = a10 >> 2 * 4 & 15;
    let idx = a10 & 255;
    console.log('color=', color, 'numb=', numb, 'idx=', idx);
    return {
        color: color,
        numb: numb,
        idx: idx,
    };
};

/**
 * 打乱数组
 * @param {* Array} arr 
 */
const randomPokers = function (arr) {
    let pokers = [];
    let array = arr || [];
    if (array.length > 0) {
        for (let i = array.length - 1; i > 0; i--) {
            console.log('0~', i);
            let idx = Math.floor(Math.random() * i);
            console.log('idx=', idx);
            let temp = array[i];
            array[i] = array[idx];
            array[idx] = temp;
        }
        pokers = array.slice(0);
    }
    console.log('arr', pokers.toString());
    return pokers;
};

/**
 * 产生一个52张无序数组
 */
const createRandomPokers = function () {
    console.log('createRandomPokers');
    let pokers = creatPokerArr();
    return randomPokers(pokers);
};

/**
 * 输入扑克10进制数组，转成16进制后得到
 * 低两位是位置
 * 第三位是数字
 * 第四位为花色
 * @param {*Array} pokers 
 */
const createPokerInfo = function (pokers) {
    let pokerInfo = [];
    if (Array.isArray(pokers)) {
        for (let i = 0; i < pokers.length; i++) {
            let idx16 = i.toString(16); // 转成16进制字符串
            idx16 = (idx16.length === 1 ? 0 + idx16 : idx16);
            let poker = pokers[i].toString(16);
            // console.log('poker', poker, poker.substr(0, 2));
            //如果已经有位置，就去除后，再设置新的位置
            if (poker.length === 4) {
                poker = poker.substr(0, 2);
                // console.log('length=4', poker, poker.substr(0, 2));
            }
            poker += idx16;
            // console.log(poker, parseInt(poker, 16));
            pokerInfo.push(parseInt(poker, 16));
        }
    }
    return pokerInfo;
};

/**
 * 计算出相同的数字的牌数
 * @param {* Array} pokers 
 */
const calculateSameNumb = function (pokers) {
    let sameNumb = {};
    if (Array.isArray(pokers)) {
        for (let i = 0; i < pokers.length; i++) {
            let numb = pokers[i];

            console.log('numb=', numb);
            if (!sameNumb[numb]) {
                console.log('numb is null ,create a array');
                sameNumb[numb] = [];
            }
            sameNumb[numb].push(pokers[i]);
        }
    } else {
        console.log('pokers is not Array ');
    }
    console.log('sameNumb=', sameNumb);
};

/**
 * 计算出相同的花色的牌数
 * @param {*Array} pokers 
 */
const calculateSameColor = function (pokers) {
    let sameColor = {};
    if (Array.isArray(pokers)) {
        for (let i = 0; i < pokers.length; i++) {
            let color = Math.floor(pokers[i] / 13);
            console.log('color=', color);
            if (!sameColor[color]) {
                console.log('numb is null ,create a array');
                sameColor[color] = [];
            }
            sameColor[color].push(pokers[i]);
        }
    }
    console.log('sameColor=', sameColor);
};

/**
 * 是否为顺子 注意10JQKA
 * @param {*Array} pokers 
 * 要求pokers为有序
 */
const isShunzhi = function (pokers) {
    if (Array.isArray(pokers)) {

    }
}

/**
 * 计算出五同
 * @param {*Objest} pokers 
 */
const calculateWutongs = function (numbSet) {
    let wutongs = {};
    let keys = Object.keys(numbSet);
    for (let i = 0; i < keys.length; i++) {
        let arr = numbSet[keys[i]];
        if (arr.length === 5) {
            wutongs.push(keys);
        }
    }
};

/**
 * 计算出同花顺所有可能 返回一个数组
 * @param {* Array} pokers 
 */
const calculateTonghuashuns = function (colorSet) {
    let tonghuashuns = {};
    let keys = Object.keys(colorSet);
    for (let i = 0; i < keys.length; i++) {
        let arr = colorSet[keys[i]];
        // if (arr.length === 5) {
        //     let isShunzhi = false;

        // }
    }
};

module.exports = {
    createRandomPokers: createRandomPokers,
    createPokerInfo: createPokerInfo,
    poker10To16: poker10To16,
}