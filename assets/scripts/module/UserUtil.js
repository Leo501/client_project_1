function getLocalIndex(seatIdx) {
    // console.log('seatIdx=', seatIdx);
    return cc.vv.gameNetMgr.getLocalIndex(seatIdx);
}

function getSeatIdxById(seatId) {
    // console.log('getSeatIdxById');
    return cc.vv.gameNetMgr.getSeatIndexByID(seatId);
}

function getLocalIdxById(seatId) {
    // console.log('getLocalIdxById');
    let seatIdx = getSeatIdxById(seatId);
    return getLocalIndex(seatIdx);
}

function getSeatById(userId) {
    // console.log('getSeatById=', userId);
    return cc.vv.gameNetMgr.getSeatByID(userId);
}
module.exports = {
    getLocalIdx: getLocalIndex,
    getSeatIdxById: getSeatIdxById,
    getLocalIdxById: getLocalIdxById,
    getSeatById: getSeatById,
}