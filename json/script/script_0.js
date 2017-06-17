var constants = require('../../json/constants.js');

module.exports = {
    "script_entry": {
        "protoId": "script_entry",
        "script": `퀘스트 테스트 입니다.
[수락] 명령어로 퀘스트를 받을 수 있습니다.`,
        "keyword": [{keyword : "수락", scriptProtoId : "script_entry_수락"}],
    },
    "script_entry_수락": {
        "protoId": "script_entry_수락",
        "recvQuest": "stone",
        "script": "퀘스트를 수락해 주셔서 감사합니다."
    }
}