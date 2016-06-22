var moment = require('moment');
var utils = require('./utils.js');

var HANDS_MAX_CNT = 6;

var protoList = require('../json/proto_object.json');
var Obj = function(protoName, roomId) {
    var protoData = protoList[protoName];
    for (var i in protoData)
        this[i] = protoData[i];

    this.roomId = roomId;
    this.maxHp = protoData.hp;
    this.combatTargets = [];
    this.maxRage = 100;
    this.rage = 0;
    this.deck = this.protoDeck.slice(0);
    this.hands = [];
    this.refreshHands();
}

Obj.prototype.GetCursor = function() {
    return "[" + moment().format('YYYYMMDD hh:mm:ss') + "] [" + this.hp + "/" + this.maxHp + "] [" + this.rage + "/" + this.maxRage + "]<br/>";
}

Obj.prototype.Turn = function() {
    this.rage += 10;
    this.rage = Math.min(this.maxRage, this.rage);
}

Obj.prototype.GetAP = function() {
    return this.ap;
}

Obj.prototype.IsDead = function() {
    if (this.hp <= 0)
        return true;

    return false;
}

Obj.prototype.refreshHands = function() {
    var len = this.hands.length;

    if (len >= HANDS_MAX_CNT)
        return;

    this.hands = this.hands.concat(utils.ArrayRandom(this.deck, HANDS_MAX_CNT - len));
}

module.exports = Obj;
