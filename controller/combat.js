var g_makeTexts;
var g_combat;
var g_roomManager;
var utils = require('./utils');

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



    target.hp -= obj.GetAP();

    var str = g_makeTexts.AttackString(obj.displayName, target.displayName, obj.ap);
    g_roomManager.sendMsgToRoom(target.roomId, str);
    if (obj.socket)
        obj.socket.sendMsg('');

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
    g_roomManager.sendMsgToRoom(src.roomId, str);
}

Combat.prototype.RemoveObj = function(obj) {
    for (var i in obj.combatTargets) {
        var targetObj = obj.combatTargets[i];

        utils.RemoveFromList(targetObj.combatTargets, obj);
    }
    utils.RemoveFromList(this.combatList, obj);

}

module.exports = function(makeTexts, roomManager) {
    if (g_combat)
        return g_combat;

    g_makeTexts = makeTexts;
    g_combat = new Combat();
    g_roomManager = roomManager;
    return g_combat;
}
