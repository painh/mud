const helpContext = {
    "가이드": {
        "simple": "게임의 전반적인 가이드를 제공합니다.",
        "detail": `
        
`
    },
    "지도": {
        "simple": "지도를 보여줍니다.",
        "detail": "녹색은 현재 위치를 가르킵니다."
    },
    "쳐": {
        "simple": "<상대> 쳐 명령어로 공격합니다.",
        "detail": "상대를 공격 합니다."
    }
};

var Help = function () {

};

Help.prototype.MakeList = function () {
    let list = {};
    for (let i in helpContext) {
        list[i] = helpContext[i].simple;
    }

    return list;
};

Help.prototype.GetDetail = function (key) {
    if(key in helpContext)
        return helpContext[key];

    return false;
};



module.exports = Help;
