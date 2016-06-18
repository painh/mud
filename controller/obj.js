var moment = require('moment');

var protoList = require('../json/proto_object.json');
var Obj = function(protoName, roomId) {
    var protoData = protoList[protoName];
    for(var i in protoData)
        this[i] = protoData[i];

    this.roomId = roomId;
    this.maxHp = protoData.hp;
    this.combatTargets = [];
    this.maxRage = 100;
    this.rage = 0;
}

Obj.prototype.GetCursor = function() {
    return  "["+moment().format('YYYYMMDD hh:mm:ss')+ "] [" + this.hp + "/" + this.maxHp + "] [" + this.rage + "/" + this.maxRage + "]<br/>";
}

Obj.prototype.Turn = function()
{
    this.rage += 10;
    this.rage = Math.min(this.maxRage, this.rage);
}

Obj.prototype.GetAP = function()
{
    return this.ap;
}

Obj.prototype.IsDead = function()
{
    if(this.hp <= 0)
        return true;

    return false;
}

module.exports = Obj;
