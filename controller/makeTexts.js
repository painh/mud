var MakeTexts = function() {}

MakeTexts.prototype.IGA = function(str)
{
    return str + "(이)가 ";
}

MakeTexts.prototype.ULLUL = function(str)
{
    return str + "(을)를 ";
}

MakeTexts.prototype.WAGWA = function(str)
{
    return str + "(와)과 ";
}

MakeTexts.prototype.CombatStart = function(src, desc) {
    var str = this.WAGWA(src) + desc + " 전투를 시작합니다.";
    return str;
}

MakeTexts.prototype.AttackString = function(src, desc, ap) {
    var str = this.IGA(src) + this.ULLUL(desc)+" 공격하였습니다. [-" + ap + "]";
    return str;
}

MakeTexts.prototype.MakeRoomPacket = function(room, socket) {
    var description = "=== " + room.protoData.displayName + "===<br/>" +
        room.protoData.description + "<br/>";

    for (var i in room.objects) {
        var obj = room.objects[i];
        if (obj == socket.obj)
            continue;

        description += this.IGA(obj.displayName) + " 서 있습니다." + "<br/>";
    }

    return description;
}

MakeTexts.prototype.Talk = function(who, msg)
{
    return this.IGA(who)+ " [" + msg + '] 라고 말 합니다.</br>';
}
module.exports = function() {
    console.log('make text constructor!');
    return new MakeTexts();
}();
