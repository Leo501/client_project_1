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
let pokersInfo = PokerLogic.createPokerInfo(pokers.slice(0, 13));
console.log('pokers', pokersInfo);
pokersInfo.forEach((item) => {
    console.log('poker10To16=', PokerLogic.poker10To16(item));
});
let pokersInfo_1 = PokerLogic.createPokerInfo(pokersInfo.slice(3, 9));
pokersInfo_1.forEach((item) => {
    console.log('poker10To16_1=', PokerLogic.poker10To16(item));
});