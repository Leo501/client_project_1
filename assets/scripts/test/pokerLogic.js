const shunzieType = [
    '0,1,2,3,4', //1~5
    '2,3,4,5,6',
    '3,4,5,6,7',
    '4,5,6,7,8',
    '5,6,7,8,9',
    '6,7,8,9,10',
    '7,8,9,10,11',
    '8,9,10,11,12',
    '9,10,11,12,0', //9~a
];
/**
 *产生一个52张（没有大小王）的数据
 *第1位为数字
 *第2位为花色
 * 返回一个16进制的字符串
 */
const creatPokerArr = function () {
    let pokers = [];
    for (let i = 1; i < 5; i++) {
        let color = i;
        for (let j = 0; j < 13; j++) {
            let type = color + j.toString(16);
            // console.log('type=', color);
            pokers.push(type);
        }
    }
    return pokers;
};

/**
 * 输入一个10进制的数字转成16进制的字符串，
 * 返回一个对象。 可以得知花色，数字，数组所在位置。
 * @param {*String } a 
 */
const poker10To16 = function (a) {
    let a10 = a;
    let color = a10 >> 3 * 4;
    let numb = a10 >> 2 * 4 & 15;
    let idx = a10 & 255;
    // console.log('color=', color, 'numb=', numb, 'idx=', idx);
    return {
        color: color,
        numb: numb,
        idx: idx,
    };
};

/**
 * 打印扑克信息
 * @param {*Array} pokers 
 */
const showPokersInfo = function (pokers) {
    console.log('showPokersInfo');
    if (Array.isArray(pokers)) {
        pokers.forEach((item) => {
            let info = poker10To16(item);
            console.log('color=', info.color, 'numb=', info.numb, 'idx=', info.idx, 'poker=', item);
        });
    } else {
        console.log('showPokersInfo pokers is not Array');
    }
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
            // console.log('0~', i);
            let idx = Math.floor(Math.random() * i);
            // console.log('idx=', idx);
            let temp = array[i];
            array[i] = array[idx];
            array[idx] = temp;
        }
        pokers = array.slice(0);
    }
    // console.log('arr', pokers.toString());
    return pokers;
};

/**
 * 产生一个52张无序数组
 */
const createRandomPokers = function () {
    console.log('createRandomPokers');
    let pokers = creatPokerArr();
    randomPokers(pokers);
    // return pokers;
    return randomPokers(pokers);
};

/**
 * 输入扑克数组，把16进制扑克数据低两位(重新)加上位置后，转成10进制
 * 低两位是位置
 * 第三位是数字 0~12 为1~k
 * 第四位为花色 1~4为黑红梅方
 * 返回一个十进制数
 * @param {*Array} pokers 
 */
const createPokerInfo = function (pokers) {
    let pokerInfo = [];
    if (Array.isArray(pokers)) {
        for (let i = 0; i < pokers.length; i++) {
            let idx16 = i.toString(16); // 把i转成16进制字符串
            idx16 = (idx16.length === 1 ? 0 + idx16 : idx16);
            let poker = pokers[i].toString(16);
            //如果已经添加了位置，就去除后，再设置新的位置
            if (poker.length === 4) {
                //注意poker是String类型高位显示花色，低位显示数字
                poker = poker.substr(0, 2);
                // console.log('length=4', poker, poker.substr(0, 2));
            }
            //合并字符串
            poker += idx16;
            //把16进制转成10进制
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
            let info = poker10To16(pokers[i]);
            let numb = info.numb;
            if (!sameNumb[numb]) {
                // console.log('numb is null ,create a array');
                sameNumb[numb] = [];
            }
            sameNumb[numb].push(pokers[i]);
        }
    } else {
        console.log('pokers is not Array ');
    }
    console.log('sameNumb=', sameNumb);
    return sameNumb;
};

/**
 * 计算出相同的花色的牌数
 * @param {*Array} pokers 
 */
const calculateSameColor = function (pokers) {
    let sameColor = {};
    if (Array.isArray(pokers)) {
        for (let i = 0; i < pokers.length; i++) {
            /*Math.floor(pokers[i] / 13);*/
            let info = poker10To16(pokers[i]);
            let color = info.color;
            // console.log('color=', color);
            if (!sameColor[color]) {
                // console.log('numb is null ,create a array');
                sameColor[color] = [];
            }
            sameColor[color].push(pokers[i]);
        }
    }
    console.log('sameColor=', sameColor);
    //对各花色进行排序
    let keys = Object.keys(sameColor);
    keys.forEach((key) => {
        sortNumbs(sameColor[key], true);
    });
    return sameColor;
};

/**
 * 得到牌数为1张，2张，3张，4张等等数组
 * 返回一个对应张数的数组
 * @param {*Object} numbSet 牌数字对象 
 * @param {*function} func 符合条件函数
 */
const calculateSetFuction = function (numbSet, func) {
    let array = {};
    let keys = Object.keys(numbSet);
    for (let i = 0; i < keys.length; i++) {
        let arr = numbSet[keys[i]];
        if (func(arr)) {
            array.push(arr);
        }
    }
    return array;
};

/**
 * 从pokers数据中取出数字
 * @param {*Array} pokers 
 */
const getNumbFromPokers = function (pokers) {
    let array = [];
    console.log('pokers=', pokers);
    if (Array.isArray(pokers)) {
        pokers.forEach((poker) => {
            let info = poker10To16(poker);
            console.log('info=', info);
            array.push(info.numb);
        });
    }
    return array;
};

/**1~12~0
 * poker10To16比较两个数的大小
 * @param {*Inter} a 
 * @param {*Inter} b 
 */
const comparefnc = function (a, b) {
    let infoA = poker10To16(a);
    let infoB = poker10To16(b);
    // console.log(infoA, infoB);
    //两个数字相等 颜色小的在前
    if (infoA.numb === infoB.numb) {
        return infoA.color - infoB.color;
    } else if (infoA.numb === 0) { //a为0 
        return -1;
    } else if (infoB.numb === 0) { //b为0 
        return 1;
    }
    //都不相等且都不为0
    return infoB.numb - infoA.numb;
};


/**1~12~0
 * 比较两个数的大小
 * @param {*Inter} a 
 * @param {*Inter} b 
 */
const comparefnc1 = function (a, b) {
    let infoA = a;
    let infoB = b;
    // console.log(infoA, infoB);
    //两个数字相等 颜色小的在前
    if (infoA === 0) { //a为0 
        return -1;
    } else if (infoB === 0) { //b为0 
        return 1;
    }
    //都不相等且都不为0
    return infoB - infoA;
};

/**0~12
 * poker10To16比较两个数的大小
 * @param {*Inter} a 
 * @param {*Inter} b 
 */
const comparefnc2 = function (a, b) {
    let infoA = poker10To16(a);
    let infoB = poker10To16(b);
    // console.log('comparefnc2', infoA, infoB);
    //两个数字相等 颜色小的在前
    if (infoA.numb === infoB.numb) {
        return infoA.color - infoB.color;
    } else if (infoA.numb === 0) { //a为0 
        return -1;
    } else if (infoB.numb === 0) { //b为0 
        return 1;
    }
    //都不相等且都不为0
    return infoA.numb - infoB.numb;
};
/**0~12
 * 比较两个数的大小
 * @param {*Inter} a 
 * @param {*Inter} b 
 */
const comparefnc3 = function (a, b) {
    let infoA = a;
    let infoB = b;
    // console.log(infoA, infoB);
    //两个数字相等 颜色小的在前
    if (infoA === 0) { //a为0 
        return -1;
    } else if (infoB === 0) { //b为0 
        return 1;
    }
    //都不相等且都不为0
    return infoA - infoB;
};

/**
 * 对扑克手牌进行排序0为A是最大，最小是1为数字2;
 * @param {*Array} pokers 
 */
const sortPokers = function (pokers, isPoker) {
    if (Array.isArray(pokers)) {
        if (isPoker) {
            pokers.sort(comparefnc);
        } else {
            pokers.sort(comparefnc1);
        }
    } else {
        console.log('sortPokers-- pokers is not array');
    }
};

/**
 * 对扑克数字进行排序 0为A是最小,12为k是最大
 * @param {*Array} pokers 
 */
const sortNumbs = function (pokers, isPoker) {
    if (Array.isArray(pokers)) {
        if (isPoker) {
            // console.log('comparefnc2');
            pokers.sort(comparefnc2);
        } else {
            // console.log('comparefnc3');
            pokers.sort(comparefnc3);
        }
    } else {
        console.log('sortPokers-- pokers is not array');
    }
    console.log('');
};

/**
 * 是否为顺子 注意10JQKA
 * @param {*Array} pokers 
 * 要求pokers为有序
 */
const isShunzhi = function (numbs) {
    if (Array.isArray(numbs)) {
        //先排序
        sortNumbs(numbs, false);
        if (numbs[0] === 0 && numbs[1] === 9) {
            console.log('查看是否为0,9,10,11,12');
            let maxIdx = numbs.length - 1;
            for (let i = maxIdx; i > 1; i--) {
                console.log('i=', i, numbs[i], numbs[i - 1]);
                //如果两个数不相连，说明不是
                if (numbs[i] - numbs[i - 1] !== 1) {
                    return false;
                }
            }
            return true;
        } else {
            let maxIdx = numbs.length - 1;
            for (let i = maxIdx; i > 0; i--) {
                console.log('i=', i, numbs[i], numbs[i - 1]);
                //如果两个数不相连，说明不是
                if (numbs[i] - numbs[i - 1] !== 1) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
};

/**
 * 从数字数组中，得到长度为N的数组 
 * @param {*numbSet} numbSet 
 */
const calculateNArrays = function (numbSet) {
    let liangZi = {};
    let keys = Object.keys(numbSet);
    for (let i = 0; i < keys.length; i++) {
        let arrays = numbSet[keys[i]];
        let size = arrays.length;
        if (!liangZi[size]) {
            liangZi[size] = [];
        }
        liangZi[size].push(arrays);
    }
    console.log('LiangZi=', liangZi);
    return liangZi;
};

/**
 * 计算出五同
 * @param {*Objest} pokers 
 */
const calculateWutongs = function (numbSet) {
    let wutongs = {};
    let keys = Object.keys(numbSet);
    for (let i = 0; i < keys.length; i++) {
        let arr = numbSet[keys[i]];
        let size = arr.length - 5;
        if (size > -1) {
            let start = 0;
            while (start <= size) {
                wutongs.push(keys.slice(start, 4 + start));
                start++;
            }
        }
    }
    console.log('wutongs=', wutongs);
    return wutongs;
};

/**
 * 计算出同花顺所有可能 返回一个数组
 * @param {* Array} pokers 
 * return Objest 
 */
const calculateTonghuashuns = function (colorSet) {
    let tonghuashuns = {};
    let keys = Object.keys(colorSet);
    for (let i = 0; i < /*keys.length*/ 1; i++) {
        let arr = colorSet[keys[i]];
        // console.log('push arr=', arr);
        let size = arr.length - 5;
        if (size > -1) {
            // console.log('arr=', arr);
            if (poker10To16(arr[0]).numb === 0) { //如果第一个为0,当0，9，10，11，12
                let last = arr.slice(arr.length - 4, arr.length);
                last.push(arr[0]);
                let numbs = getNumbFromPokers(last);
                console.log('array=', last, 'numbs=', numbs);
                if (isShunzhi(numbs)) {
                    tonghuashuns[-1] = last;
                }
            }
            let start = 0;
            while (start <= size) {
                let array = arr.slice(start, start + 5);
                let numbs = getNumbFromPokers(array);
                console.log('array=', array, 'numbs=', numbs);
                if (isShunzhi(numbs)) {
                    tonghuashuns[start] = array;
                }
                start++;
            }
        }
    }
    console.log('tonghuashuns=', tonghuashuns);
    return tonghuashuns;
};
/**
 * 计算铁枝四带一
 */
const calculateTieZhi = function (nArray) {
    let result = [];
    let keys = Object.keys(nArray);
    let lastOne = null;
    let tieZhiS = [];
    if (nArray[4]) {
        tieZhiS = nArray[4];
        //先找1
        keys.forEach((key) => {
            let arr = nArray[key];
            if (Array.isArray(arr[0]) && arr[0].length === 1) {
                lastOne = arr[0][0];
            }
        });
        if (lastOne === null) {
            keys.forEach((key) => {
                let arr = nArray[key];
                if (Array.isArray(arr[0]) && arr[0].length === 2) {
                    lastOne = arr[0][0];
                }
            });
        }
        
    }
    return result;
};

module.exports = {
    createRandomPokers: createRandomPokers,
    createPokerInfo: createPokerInfo,
    poker10To16: poker10To16,
    showPokersInfo: showPokersInfo,
    calculateSameNumb: calculateSameNumb,
    calculateSameColor: calculateSameColor,
    sortPokers: sortPokers,
    getNumbFromPokers: getNumbFromPokers,
    isShunzhi: isShunzhi,
    calculateTonghuashuns: calculateTonghuashuns,
    calculateNArrays: calculateNArrays,
}