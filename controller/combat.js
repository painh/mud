var g_makeTexts;
var g_combat;
var g_roomManager;
var utils = require('./utils');
var constants = require('../json/constants.js');
var resistance = require('../json/resistance.js');
var protoCards = require('../json/proto_card.js');

var Combat = function() {
    this.combatList = [];
}

Combat.prototype.attack = function(obj) {
    obj.Turn();
    if (obj.IsDead())
        return;

    var targetList = obj.combatTargets;
    if (targetList.length == 0)
        return;

    var target = targetList[0];

    if (target.IsDead()) {
        utils.RemoveFromList(targetList, target);
        return;
    }

    var activeSkill = obj.GetActiveSkill();
    obj.UseCard();
    var skill = protoCards[activeSkill];
    var targetResi = target.resistance[skill.attribute];

    var targetResistance = targetResi / resistance[obj.lv];

    var ap = obj.GetAP() * skill.factor;
    console.log([ap, targetResistance]);
    target.hp -= ap * targetResistance;

    var str = g_makeTexts.AttackString(obj.displayName, target.displayName, obj.ap, skill);
    g_roomManager.SendMsgToRoom(target.roomId, str);
    if (obj.socket)
        obj.socket.SendMsg('');

}

Combat.prototype.worldTicker = function() {
    //TODO combatlist를 만들어서 속도 기분으로 소팅하는 식으로 선빵을 만들어야함...
    var self = g_combat;

    for (var i in self.combatList) {
        var obj = self.combatList[i];
        self.attack(obj);
    }

    var deadList = [];
    for (var i in self.combatList) {
        var obj = self.combatList[i];
        if (obj.IsDead())
            deadList.push(obj);
    }

    for (var i in deadList) {
        var obj = deadList[i];
        g_roomManager.OnObjDead(obj);
        utils.RemoveFromList(self.combatList, deadList[i]);
    } 
}

Combat.prototype.Combat = function(src, desc) {
    if (src.combatTargets.indexOf(desc) == -1) {
        src.combatTargets.push(desc);
    }

    if (desc.combatTargets.indexOf(src) == -1) {
        desc.combatTargets.push(src);
    }

    if (this.combatList.indexOf(desc) == -1)
        this.combatList.push(desc);

    if (this.combatList.indexOf(src) == -1)
        this.combatList.push(src);

    var str = g_makeTexts.CombatStart(src.displayName, desc.displayName);
    g_roomManager.SendMsgToRoom(src.roomId, str); 
}

Combat.prototype.RemoveObj = function(obj) {
    for (var i in obj.combatTargets) {
        var targetObj = obj.combatTargets[i];

        utils.RemoveFromList(targetObj.combatTargets, obj);
    }
    utils.RemoveFromList(this.combatList, obj);

}

Combat.prototype.CombatUserInput = function(obj, idx) {
    if(!obj.InCombat()) {

    }

    var len = obj.hands.length;

    if (len >= constants.HANDS_MAX_CNT)
        return;

    var protoId = obj.hands[idx];
    obj.SetActiveSkill(idx);
    obj.SendMsg(g_makeTexts.UseActiveSkill(protoId), false);
}

module.exports = function(makeTexts, roomManager) {
    if (g_combat)
        return g_combat;

    g_makeTexts = makeTexts;
    g_combat = new Combat();
    g_roomManager = roomManager;
    return g_combat;
}
