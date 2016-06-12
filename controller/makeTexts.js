var MakeTexts = function() {}

MakeTexts.prototype.AttackString = function(src, desc, ap) {
    var str = src + "(이)가 " + desc + "(을)를 공격하였습니다. [-" + ap + "]";
    return str;
}

MakeTexts.prototype.MakeRoomPacket = function(room, socket) {
    var description = "=== " + room.protoData.displayName + "===<br/>" +
        room.protoData.description + "<br/>";

    for (var i in room.objects) {
        var obj = room.objects[i];
        if (obj == socket.obj)
            continue;

        description += obj.displayName + "(이)가 서 있습니다." + "<br/>";
    }

    return description;
}
module.exports = function() {
    console.log('make text constructor!');
    return new MakeTexts();
}();
