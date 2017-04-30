module.exports = {
    "entry": {
        "protoId": "entry",
        "displayName": "해안",
        "description": "모래 사장이 펼쳐진 바닷가다. 부드러운 모래 벌판이다.",
        "proto_objects": {"1": {"protoId": 1, "respawnSec": 1}},
        "exits": {"동": "entry_2"},
        "items": [{
            'id': 'rock',
            "genDeplySec": 0,
            "genRate": 100
        }]
    },
    "entry_2": {
        "protoId": "entry_2",
        "displayName": "인트로2",
        "description": "인트로 설명",
        "proto_objects": {"1": {"protoId": 1, "respawnSec": 1}},
        "exits": {"서": "entry"}
    }
};