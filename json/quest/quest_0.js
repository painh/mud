var constants = require('../../json/constants.js');

module.exports = {
    "stone": {
        "protoId": "stone",
        "title": "생존 튜토리얼 1",
        "description": "가져 명령어를 이용하여 돌맹이를 집어 드십시오.",
        "enableCondition" : [
            [constants.ACTION_EVENT_ENTER_ROOM, "room_entry"]
        ],
    },
}