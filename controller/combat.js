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

Combat.prototype.getTarget = function(obj, skill) {
    var ret = null;
    switch (skill.target) {
        case constants.TARGET_SELF:
            ret = obj;
            break;

        case constants.TARGET_ORDER_AGGRO:
            var targetList = obj.combatTargets;
            if (targetList.length == 0)
                return null;

            ret = targetList[0];

            if (ret.IsDead()) {
                utils.RemoveFromList(targetList, ret);
                return null;
            }
            break;


    }

    return ret;
}

Combat.prototype.attack = function(obj) {
    if (obj.IsDead())
        return;

    if (!obj.InCombat())
        return;

    this.rage += 10;
    this.rage = Math.min(this.maxRage, this.rage);

    var activeSkill = obj.GetActiveSkill();
    obj.UseCard();
    var skill = protoCards[activeSkill];

    var target = this.getTarget(obj, skill);
    if (!target)
        return;

    var targetResi = target.resistance[skill.attribute];

    var targetResistance = targetResi / resistance[obj.lv];

    var ap = obj.GetAP() * skill.factor;
    var finalDamage = parseInt(ap * (1 - targetResistance));
    target.hp -= finalDamage;

    var str = g_makeTexts.AttackString(obj, target, finalDamage, skill);
    g_roomManager.SendMsgToRoom(target.roomId, str);

    if (target.IsDead()) {
        var str = g_makeTexts.TargetDead(target);
        g_roomManager.SendMsgToRoom(target.roomId, str);
    }
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
        else {
            if (!obj.InCombat())
                continue;
            obj.TurnEnd();
            if (obj.socket) // 전투 메시지 이후 커서 출력용
                obj.socket.SendMsg('');
        }
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
    if (!obj.InCombat()) {

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
