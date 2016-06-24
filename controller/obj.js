var utils = require('./utils.js');
var MakeTexts = require('./makeTexts.js');
var constants = require('../json/constants.js');

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

    this.activeSkill = constants.ACTIVE_SKILL_NONE;

    this.refreshHands(true);
}

Obj.prototype.InCombat = function() {
    return this.combatTargets.length > 0;
}

Obj.prototype.GetCursor = function() {
    return MakeTexts.Cursor(this);
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

Obj.prototype.refreshHands = function(drawFull) {
    var len = this.hands.length;

    if (len >= constants.HANDS_MAX_CNT)
        return;

    if (drawFull)
        this.hands = this.hands.concat(utils.ArrayRandom(this.deck, constants.HANDS_MAX_CNT - len));
    else
        this.hands = this.hands.concat(utils.ArrayRandom(this.deck, 1));
}

Obj.prototype.SendMsg = function(msg, showCursor) {
    if(!this.socket)
        return;

    return this.socket.SendMsg(msg, showCursor);
}

module.exports = Obj;
