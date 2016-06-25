var constants = require('../json/constants.js');

module.exports = {
    "player": {
        "displayName": "player",
        "hp": 100,
        "ap": 30,
        "lv": 1,
        "protoDeck": ["attack_physical",
            "attack_fire",
            "attack_frost"
        ],
        "resistance": {
            [constants.ATTRIBUTE_TYPE_PHYSICAL]: 500,
            [constants.ATTRIBUTE_TYPE_FIRE] : 0,
            [constants.ATTRIBUTE_TYPE_FROST] : 0,
            [constants.ATTRIBUTE_TYPE_NATURE] : 0,
            [constants.ATTRIBUTE_TYPE_SHADOW] : 0,
            [constants.ATTRIBUTE_TYPE_HOLY] : 0,
        }
    },
    "1": {
        "displayName": "몹1",
        "hp": 100,
        "ap": 30,
        "lv": 1,
        "protoDeck": ["attack_physical",
            "attack_fire",
            "attack_frost"
        ],
        "resistance": {
            [constants.ATTRIBUTE_TYPE_PHYSICAL]: 500,
            [constants.ATTRIBUTE_TYPE_FIRE] : 0,
            [constants.ATTRIBUTE_TYPE_FROST] : 0,
            [constants.ATTRIBUTE_TYPE_NATURE] : 0,
            [constants.ATTRIBUTE_TYPE_SHADOW] : 0,
            [constants.ATTRIBUTE_TYPE_HOLY] : 0,
        }
    }
}
