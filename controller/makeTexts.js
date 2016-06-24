var g_cards = require('../json/proto_card');
var moment = require('moment');
var MakeTexts = function() {}

var COLOR_SELECTED = "#00ff00";
var COLOR_STRONG = "#ff0000";

var COLOR_RED = "#C41F3B";
var COLOR_ORANGE = "#FF7D0A";
var COLOR_GREEN = "#ABD473";
var COLOR_LIGHT_BLUE = "#69CCF0";
var COLOR_JADE_GREEN = "#00FF96";
var COLOR_PINK = "#F58CBA";
var COLOR_WHITE = "#FFFFFF";
var COLOR_LIGHT_YELLOW = "#FFF569";
var COLOR_BLUE = "#0070DE";
var COLOR_PURPLE = "#9482C9";
var COLOR_TAN = "#C79C6E";


MakeTexts.prototype.ColorTag = function(str, color) {
    return "<font color=" + color + ">" + str + "</font>";
}
MakeTexts.prototype.IGA = function(str) {
    return str + "(이)가 ";
}

MakeTexts.prototype.ULLUL = function(str) {
    return str + "(을)를 ";
}

MakeTexts.prototype.WAGWA = function(str) {
    return str + "(와)과 ";
}

MakeTexts.prototype.CombatStart = function(src, desc) {
    var str = this.WAGWA(src) + desc + " 전투를 시작합니다.";
    return this.ColorTag(str, COLOR_STRONG);
}

MakeTexts.prototype.AttackString = function(src, desc, ap) {
    var str = this.IGA(src) + this.ULLUL(desc) + " 공격하였습니다. [-" + ap + "]";
    return str;
}

MakeTexts.prototype.MakeRoomPacket = function(room, socket) {
    var description = "=== " + room.protoData.displayName + "===<br/>" +
        room.protoData.description + "<br/>";

    for (var i in room.objects) {
        var obj = room.objects[i];
        if (obj == socket.obj)
            continue;

        var displayName = this.ColorTag(obj.displayName, COLOR_STRONG);

        description += this.IGA(displayName) + " 서 있습니다." + "<br/>";
    }

    return description;
}

MakeTexts.prototype.Talk = function(who, msg) {
    return this.IGA(who) + " [" + msg + '] 라고 말 합니다.</br>';
}

MakeTexts.prototype.skillsList = function(title, list) {
    var retStr = "[" + title + "]<br/>";
    var deckList = [];

    for (var i in list) {
        var cardId = list[i];
        deckList.push(g_cards[cardId].displayName);
    }
    retStr += deckList.join("<br/>") + "<br/>";

    return retStr;
}

MakeTexts.prototype.Skills = function(obj) {
    var deck = this.skillsList("덱", obj.deck);
    var hands = this.skillsList("핸드", obj.hands);

    return hands + deck;
}

MakeTexts.prototype.Cursor = function(obj) {
    var list = [];
//    list.push("[" + moment().format('YYYYMMDD hh:mm:ss') + "]");
    list.push("[" + moment().format('hh:mm:ss') + "]");
    list.push(this.ColorTag("[" + obj.hp + " / " + obj.maxHp + "]", COLOR_JADE_GREEN));
    list.push(this.ColorTag("[" + obj.rage + " / " + obj.maxRage + "]", COLOR_LIGHT_BLUE));

    var cur = list.join(" ") + " <br/>";

    if (obj.InCombat()) {
        var skills = [];
        for (var i = 0; i < obj.hands.length; ++i) {
            var cardId = obj.hands[i];
            var idx = (i + 1);
            var str = " [" + idx + ": " + g_cards[cardId].displayName + "] ";
            if (idx == obj.activeSkill)
                str = this.ColorTag(str, COLOR_SELECTED);
            skills.push(str);
        }

        cur += skills.join(" ");
    }
    return cur;
}

MakeTexts.prototype.UseActiveSkill = function(protoId) {
    return this.ColorTag(" [" + g_cards[protoId].displayName + "] 을 다음 턴에 사용합니다. < br / > ", COLOR_SELECTED);
}

module.exports = function() {
    console.log('make text constructor!');
    return new MakeTexts();
}();
