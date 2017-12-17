function get13Shui(_quickChatInfo) {
    // console.log('get13Shui');
    let file = 'zy/chat/';
    // let _quickChatInfo = {};
    _quickChatInfo["item0"] = {
        index: 0,
        content: "幺鸡二条，不打要着!",
        sound: file + "c_1.mp3",
    };
    _quickChatInfo["item1"] = {
        index: 1,
        content: "不好意思我有事先走了!",
        sound: file + "c_2.mp3",
    };
    _quickChatInfo["item2"] = {
        index: 2,
        content: "快点撒 你在研究原子弹啊!",
        sound: file + "c_3.mp3",
    };
    _quickChatInfo["item3"] = {
        index: 3,
        content: "今天这个运气还可以!",
        sound: file + "c_4.mp3",
    };
    _quickChatInfo["item4"] = {
        index: 4,
        content: "之个牌还安逸呢!",
        sound: file + "c_5.mp3",
    };
    _quickChatInfo["item5"] = {
        index: 5,
        content: "牌从门前过，不如摸一个!",
        sound: file + "c_6.mp3",
    };
    _quickChatInfo["item6"] = {
        index: 6,
        content: "出门遇警察!",
        sound: file + "c_7.mp3",
    };
    _quickChatInfo["item7"] = {
        index: 7,
        content: "你真勒是神雕侠侣噢!",
        sound: file + "c_8.mp3",
    };
    _quickChatInfo["item8"] = {
        index: 8,
        content: "好霉噢 简直霉起冬瓜灰!",
        sound: file + "c_9.mp3",
    };
    // console.log('_quickChatInfo=', _quickChatInfo);
    return _quickChatInfo;
}

module.exports = {
    get13Shui: get13Shui,
}