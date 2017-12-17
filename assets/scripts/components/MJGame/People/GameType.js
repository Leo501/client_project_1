var gameType = cc.Class({
    extends: cc.Component,

    statics: {
        Type: {
            unknown: 'unknown',
            coin: 'coin',
            card: 'card',
        },
        gameType: null,
        setType: function (type) {
            // console.log('set game type =', type);
            this.gameType = type;
        },

        getType: function () {
            return this.gameType;
        },

        isCoinGame: function () {
            // console.log('isCoinGame');
            if (this.gameType === null) {
                console.log('should set gameType');
                return false;
            }
            return this.gameType === this.Type.coin;
        },

        isCardGame: function () {
            // console.log('isCardGame');
            if (this.gameType === null) {
                console.log('should set gameType');
                return false;
            }
            return this.gameType === this.Type.card;
        },
    },

});