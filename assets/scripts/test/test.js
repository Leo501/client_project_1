/* let moment=require('moment');
console.log(moment().format('YYYYMMDDHHmmssSS'));

function merge () {
  var ret = {};
  for (var i in arguments) {
    var m = arguments[i];
    for (var j in m) ret[j] = m[j];
  }
  return ret;
}

console.log(merge({a: 123}, {b: 456})); */


const PokerLogic = require('./pokerLogic');

let pokers = PokerLogic.createRandomPokers();
let pokersInfo = pokers.slice(0, 13);
pokersInfo = PokerLogic.createPokerInfo(pokersInfo);
PokerLogic.showPokersInfo(pokersInfo);
PokerLogic.sortPokers(pokersInfo, true);
pokersInfo = PokerLogic.createPokerInfo(pokersInfo);
PokerLogic.showPokersInfo(pokersInfo);

let colorSet = PokerLogic.calculateSameColor(pokersInfo);
// let thsSet = PokerLogic.calculateTonghuashuns(colorSet);
let numbSet = PokerLogic.calculateSameNumb(pokersInfo);
// console.log('numbSet=', numbSet);
let NArr = PokerLogic.calculateNArrays(numbSet);
// let arrays = [0, 1, 2, 3, 4];

// console.log(PokerLogic.isShunzhi(arrays));
// let pokersInfo_1 = PokerLogic.createPokerInfo(pokersInfo.slice(3, 9));
// pokersInfo_1.forEach((item) => {
//     console.log('poker10To16_1=', PokerLogic.poker10To16(item));
// });