var g_cards = require('../json/proto_card');
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

MakeTexts.prototype.skillsList = function(title, list)
{
    var retStr = "["+title+"]<br/>";
    var deckList = [];

    for(var i in list)
    {
        var cardId = list[i];
        console.log(cardId);
        deckList.push(g_cards[cardId].displayName);
    }
    retStr += deckList.join("<br/>") + "<br/>";

    return retStr;
}

MakeTexts.prototype.Skills = function(obj)
{ 
    var deck = this.skillsList("덱", obj.deck);
    var hands = this.skillsList("핸드", obj.hands);

    return hands + deck;
}

module.exports = function() {
    console.log('make text constructor!');
    return new MakeTexts();
}();
