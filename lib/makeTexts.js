let constants = require('../json/constants.js');
let g_cards = require('../json/proto_card');
let moment = require('moment');
let help = require('../lib/help');
help = new help();

const COLOR_SELECTED = "#00ff00";
const COLOR_STRONG = "#ff0000";

const COLOR_RED = "#C41F3B";
const COLOR_ORANGE = "#FF7D0A";
const COLOR_GREEN = "#ABD473";
const COLOR_LIGHT_BLUE = "#69CCF0";
const COLOR_JADE_GREEN = "#00FF96";
const COLOR_PINK = "#F58CBA";
const COLOR_WHITE = "#FFFFFF";
const COLOR_LIGHT_YELLOW = "#FFF569";
const COLOR_BLUE = "#0070DE";
const COLOR_PURPLE = "#9482C9";
const COLOR_TAN = "#C79C6E";
const COLOR_STRONG_MAGENTA = "#A330C9";

const COLOR_POOR = "#9D9D9D";
const COLOR_COMMON = "#FFFFFF";
const COLOR_UNCOMMON = "#1EFF00";
const COLOR_RARE = "#0070DD";
const COLOR_EPIC = "#A335EE";
const COLOR_LEGENDARY = "#FF8000";
const COLOR_ARTIFACT = "#E6CC80";
const COLOR_HEIRLOOM = "#E6CC80";

const COLOR_ITEM = COLOR_GREEN;
const COLOR_OBJ = COLOR_RED;
const COLOR_KEYWORD = "#00FF00";

let SKILL_COLOR_TABLE = {};

let MakeTexts = function () {
    let list = help.MakeList();
    let html = `== 도움 ==
도움 <항목> 명령어를 이용하여, 더 자세한 설명을 볼 수 있습니다.
예시) 도움 가이드    
`;
    for (let i in list) {
        html += this.ColorTag(i, COLOR_GREEN) + " : " + list[i] + "\n";
    }
    this.helpContext = this.ReplaceNLToBr(html);
};

SKILL_COLOR_TABLE[constants.ATTRIBUTE_TYPE_PHYSICAL] = ["물리", COLOR_WHITE];
SKILL_COLOR_TABLE[constants.ATTRIBUTE_TYPE_FIRE] = ["화염", COLOR_ORANGE];
SKILL_COLOR_TABLE[constants.ATTRIBUTE_TYPE_FROST] = ["냉기", COLOR_LIGHT_BLUE];
SKILL_COLOR_TABLE[constants.ATTRIBUTE_TYPE_NATURE] = ["자연", COLOR_GREEN];
SKILL_COLOR_TABLE[constants.ATTRIBUTE_TYPE_SHADOW] = ["암흑", COLOR_PURPLE];
SKILL_COLOR_TABLE[constants.ATTRIBUTE_TYPE_HOLY] = ["신성", COLOR_LIGHT_YELLOW];


MakeTexts.prototype.ColorTag = function (str, color) {
    return `<font color="${color}"> ${str} </font>`;
};

MakeTexts.prototype.Attribute = function (attr) {
    return this.ColorTag(SKILL_COLOR_TABLE[attr][0], SKILL_COLOR_TABLE[attr][1]);
};

MakeTexts.prototype.IGA = function (str) {
    return str + "(이)가 ";
};

MakeTexts.prototype.ULLUL = function (str) {
    return str + "(을)를 ";
};

MakeTexts.prototype.WAGWA = function (str) {
    return str + "(와)과 ";
};

MakeTexts.prototype.CombatStart = function (src, desc) {
    var str = `${this.WAGWA(src)} ${desc} 전투를 시작합니다.`;
    return this.ColorTag(str, COLOR_STRONG);
};

MakeTexts.prototype.AttackString = function (src, desc, ap, skill) {
    var str = `${this.IGA(src.displayName)} ${this.ULLUL(desc.displayName)} 공격하였습니다. [${this.Attribute(skill.attribute)}][-${ap}][${desc.hp}]`;
    return str;
};

MakeTexts.prototype.ItemDescript = function (roomItem) {
    return roomItem.proto.desc + '<br/>';
};

MakeTexts.prototype.ItemGet = function (userObj, roomItem) {
    return `${this.IGA(userObj.displayName)} ${this.ULLUL(roomItem.proto.displayName)} 가졌습니다. <br/>`;
};

MakeTexts.prototype.MakeRoomPacket = function (room, socket) {
    var description = `=== ${room.protoData.displayName} ===<br/> ${room.protoData.description} <br/>`;

    for (var item of room.items) {

        if (item.state == constants.ROOM_ITEM_STATE_NOT_YET_GEN)
            continue;

        var displayName = this.ColorTag(item.proto.displayName, COLOR_ITEM);

        description += `${this.IGA(displayName)}있습니다. <br/>`;
    }

    for (var obj of room.objects) {
        if (obj == socket.user.GetObj())
            continue;

        var displayName = this.ColorTag(obj.displayName, COLOR_OBJ);

        description += `${this.IGA(displayName)} 서 있습니다. <br/>`;
    }

    description += room.exitDesc;
    return description;
};

MakeTexts.prototype.Talk = function (who, msg) {
    return `${this.IGA(who)} [${msg}] 라고 말 합니다.</br>`;
};

MakeTexts.prototype.skillsList = function (title, list) {
    var retStr = `[${title}]<br/>`;
    var deckList = [];

    for (var i in list) {
        var cardId = list[i];
        deckList.push(g_cards[cardId].displayName);
    }
    retStr += deckList.join("<br/>") + "<br/>";

    return retStr;
};

MakeTexts.prototype.Skills = function (obj) {
    var deck = this.skillsList("덱", obj.deck);
    var hands = this.skillsList("핸드", obj.hands);

    return hands + deck;
};

MakeTexts.prototype.Cursor = function (obj) {
    var list = [];
    //    list.push("[" + moment().format('YYYYMMDD hh:mm:ss') + "]");
    list.push(`[${moment().format('hh:mm:ss')}]`);
    list.push(this.ColorTag(`[${obj.hp}]`, COLOR_JADE_GREEN));
    list.push(this.ColorTag(`[${obj.rage}]`, COLOR_LIGHT_BLUE));

    var cur = list.join(" ") + " <br/>";

    if (obj.InCombat()) {
        var skills = [];
        for (var i = 0; i < obj.hands.length; ++i) {
            var cardId = obj.hands[i];
            var idx = (i + 1);
            var str = `[${idx}: ${g_cards[cardId].displayName}] `;
            str = this.ColorTag(str, SKILL_COLOR_TABLE[g_cards[cardId].attribute][1]);
            if (i == obj.activeSkill)
                str = this.ColorTag(str, COLOR_SELECTED);
            skills.push(str);
        }

        cur += skills.join(" ");
    }
    return cur;
};

MakeTexts.prototype.UseActiveSkill = function (protoId) {
    var str = this.ColorTag(`[${g_cards[protoId].displayName}]`, SKILL_COLOR_TABLE[g_cards[protoId].attribute][1]);
    return this.ColorTag(`${str}을 다음 턴에 사용합니다.<br/>`, COLOR_SELECTED);
};

MakeTexts.prototype.CardsPopup = function (popList) {
    if (popList.length == 0)
        return '';

    var list = [];
    for (var i in popList) {
        var protoId = popList[i];
        list.push(`[${g_cards[protoId].displayName}]`);
    }

    var str = list.join(" ") + "이 사용가능하게 되었습니다.<br/>";
    return str;
};

MakeTexts.prototype.TargetDead = function (obj) {
    return `${this.IGA(obj.displayName)} 죽었습니다.`;
};

MakeTexts.prototype.Spawn = function (obj) {
    return `${this.IGA(obj.displayName)} 나타났습니다.`;
};

MakeTexts.prototype.TimeNotiMorning = function () {
    return "아침이 되었습니다.";
};

MakeTexts.prototype.TimeNotiNoon = function () {
    return "정오가 되었습니다.";
};

MakeTexts.prototype.TimeNotiNight = function () {
    return "밤이 되었습니다.";
};

MakeTexts.prototype.TimeNotiMidnight = function () {
    return "자정이 되었습니다.";
};

MakeTexts.prototype.InvalidCmdInCombat = function () {
    return "전투중엔 사용할 수 없는 명령어입니다.";
};

MakeTexts.prototype.ReplaceKeyword = function (str) {
    return str.replace(/\[(.*)\]/g, "<font color='#00FF00'>$1</font>");
};

MakeTexts.prototype.ReplaceNLToBr = function (str) {
    return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
};

MakeTexts.prototype.GetMapText = function (coordinateMap, userRoom) {
    let htmlStr = `<table class='tblMap'>`;
    let sightSize = 5;
    for (var i = userRoom.protoData.y - sightSize; i < userRoom.protoData.y + sightSize; ++i) {
        htmlStr += '<tr>';
        for (var j = userRoom.protoData.x - sightSize; j < userRoom.protoData.x + sightSize; ++j) {
            if ((i in coordinateMap) && (j in coordinateMap[i])) {
                let room = coordinateMap[i][j];
                if (room.protoId == userRoom.protoData.protoId)
                    htmlStr += `<td class="tblCurRoom">${room.displayName}</td>`;
                else
                    htmlStr += `<td class="tblRoom">${room.displayName}</td>`;
            }
            else
                htmlStr += `<td class=""></td>`;


        }
        htmlStr += '</tr>';
    }

    htmlStr += `</table>`;

    return htmlStr;
};

MakeTexts.prototype.GetHelp = function () {
    return this.helpContext;
};

MakeTexts.prototype.GetHelpDetail = function (key) {
    let detail = help.GetDetail(key);

    if (detail === false)
        return "존재하지 않는 항목입니다.";

    return detail.detail;
};

let g_makeTexts = null;

module.exports = function () {
    if (g_makeTexts)
        return g_makeTexts;

    g_makeTexts = new MakeTexts();
    return g_makeTexts;
}();
