var g_makeTexts;
var g_combat;
var g_roomManager;

var Combat = function() {
    this.combatList = [];
}

Combat.prototype.attack = function(obj) {
    var targetList = obj.combatTargets;
    if (targetList.length == 0)
        return;

    var target = targetList[0];
    target.hp -= obj.ap;

    var str = g_makeTexts.AttackString(obj.displayName, target.displayName, obj.ap);
    g_roomManager.sendMsgToRoom(target.roomId, str);
}

Combat.prototype.worldTicker = function() {
    //TODO combatlist를 만들어서 속도 기분으로 소팅하는 식으로 선빵을 만들어야함...
    for (var i in g_combat.combatList) {
        var obj = g_combat.combatList[i];
        g_combat.attack(obj);
    }
}

Combat.prototype.Combat = function(src, desc) {
    if (src.combatTargets.indexOf(desc) == -1) {
        src.combatTargets.push(desc);
    }

    if (desc.combatTargets.indexOf(src) == -1) {
        desc.combatTargets.push(src);
    } 

    if(this.combatList.indexOf(desc) == -1)
        this.combatList.push(desc);

    if(this.combatList.indexOf(src) == -1)
        this.combatList.push(src);
}

module.exports = function(clients, makeTexts, roomManager)
{
    if(g_combat)
        return g_combat;

    g_clients = clients;
    g_makeTexts = makeTexts;
    g_combat = new Combat();
    g_roomManager = roomManager;
    return g_combat;
}
