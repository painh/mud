var utils = require('./utils.js');
var MakeTexts = require('./makeTexts.js');
var constants = require('../json/constants.js');

var protoList = require('../json/proto_object.js');
var Obj = function(protoName, roomId) {
    var protoData = protoList[protoName];

    this.protoId = protoName;
    this.roomId = roomId;
    this.maxHp = protoData.hp;
    this.combatTargets = [];
    this.maxRage = 100;
    this.rage = 0;
    this.hands = [];
    this.activeSkillIDX = constants.ACTIVE_SKILL_NONE;

    this.resistance = [];

    this.resistance[constants.ATTRIBUTE_TYPE_PHYSICAL] = 100;
    this.resistance[constants.ATTRIBUTE_TYPE_FIRE] = 0;
    this.resistance[constants.ATTRIBUTE_TYPE_FROST] = 0;
    this.resistance[constants.ATTRIBUTE_TYPE_NATURE] = 0;
    this.resistance[constants.ATTRIBUTE_TYPE_SHADOW] = 0;
    this.resistance[constants.ATTRIBUTE_TYPE_HOLY] = 0;

    for (var i in protoData)
        this[i] = protoData[i];

    this.deck = this.protoDeck.slice(0);

    this.refreshHands();
}

Obj.prototype.SetActiveSkill = function(idx) {
    if (idx >= this.hands.length)
        return;
    this.activeSkillIDX = idx;
}

Obj.prototype.GetActiveSkill = function() {
    if (this.activeSkillIDX == constants.ACTIVE_SKILL_NONE)
        return "attack_normal";

    return this.hands[this.activeSkillIDX];
}

Obj.prototype.InCombat = function() {
    return this.combatTargets.length > 0;
}

Obj.prototype.GetCursor = function() {
    return MakeTexts.Cursor(this);
}

Obj.prototype.AddRage = function(rage) { 
    this.refreshHands();
} 

Obj.prototype.TurnEnd = function() { 
    this.refreshHands();
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

    var popList = [];

    if (drawFull)
        popList = utils.ArrayRandom(this.deck, constants.HANDS_MAX_CNT - len);
    else
        popList = utils.ArrayRandom(this.deck, 1);

    this.hands = this.hands.concat(popList);
    this.SendMsg(MakeTexts.CardsPopup(popList), true);
}

Obj.prototype.UseCard = function() {
    if (this.activeSkillIDX == constants.ACTIVE_SKILL_NONE)
        return;

    utils.RemoveFromList(this.hands, this.hands[this.activeSkillIDX]);
    this.activeSkillIDX = constants.ACTIVE_SKILL_NONE;
}


Obj.prototype.SendMsg = function(msg, showCursor) {
    if (!this.socket)
        return;

    return this.socket.SendMsg(msg, showCursor);
}

module.exports = Obj;
