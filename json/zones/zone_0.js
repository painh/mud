module.exports = {
    "entry": {
        "protoId": "entry",
        "displayName": "인트로",
        "description": "인트로 설명",
        "proto_objects": {"1": {"protoId": 1, "respawnSec": 1}},
        "exits" : { "동" : "entry_2"}
    },
    "entry_2": {
        "protoId": "entry_2",
        "displayName": "인트로2",
        "description": "인트로 설명",
        "proto_objects": {"1": {"protoId": 1, "respawnSec": 1}},
        "exits" : { "서" : "entry"}
    }
};