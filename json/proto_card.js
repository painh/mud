//physical
var DAMAGE_TYPE_PHYSICAL = 0;
var DAMAGE_TYPE_FIRE = 1;
var DAMAGE_TYPE_FROST = 2;
var DAMAGE_TYPE_NATURE = 3;
var DAMAGE_TYPE_SHADOW = 4;
var DAMAGE_TYPE_HOLY = 5;

var CARD_TYPE_PASSIVE = 0;
var CARD_TYPE_ACTIVE = 1;

module.exports = {
    "attack_physical" : {
        "displayName" : "물리공격",
        "type" : CARD_TYPE_ACTIVE,
        "damageType" : DAMAGE_TYPE_PHYSICAL,
        "rageSpend" : 10,
        "rageGain" : 0,
    },
    "attack_fire" : {
        "displayName" : "화염공격",
        "type" : CARD_TYPE_ACTIVE,
        "damageType" : DAMAGE_TYPE_PHYSICAL,
        "rageSpend" : 10,
        "rageGain" : 0,
    },
    "attack_frost" : {
        "displayName" : "냉기공격",
        "type" : CARD_TYPE_ACTIVE,
        "damageType" : DAMAGE_TYPE_FROST,
        "rageSpend" : 10,
        "rageGain" : 0,
    },
    "attack_nature" : {
        "displayName" : "자연공격",
        "type" : CARD_TYPE_ACTIVE,
        "damageType" : DAMAGE_TYPE_NATURE,
        "rageSpend" : 10,
        "rageGain" : 0,
    },
    "attack_shadow" : {
        "displayName" : "암흑공격",
        "type" : CARD_TYPE_ACTIVE,
        "damageType" : DAMAGE_TYPE_SHADOW,
        "rageSpend" : 10,
        "rageGain" : 0,
    },
    "attack_holy" : {
        "displayName" : "신성공격",
        "type" : CARD_TYPE_ACTIVE,
        "damageType" : DAMAGE_TYPE_HOLY,
        "rageSpend" : 10,
        "rageGain" : 0,
    },
};
