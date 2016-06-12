var moment = require('moment');

var protoList = require('../json/proto_object.json');
var Obj = function(protoName, roomId) {
    var protoData = protoList[protoName];
    for(var i in protoData)
        this[i] = protoData[i];

    this.roomId = roomId;
    this.maxHp = protoData.hp;
    this.combatTargets = [];
}

Obj.prototype.GetCursor = function() {
    return  "["+moment().format('YYYYMMDD hh:mm:ss')+ "] [" + this.hp + "/" + this.maxHp + "]<br/>";
}

module.exports = Obj;
