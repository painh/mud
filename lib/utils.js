var Utils = function() {};

Utils.RemoveFromList = function(list, obj) {
    var idx = list.indexOf(obj);
    if (idx == -1)
        return false;

    list.splice(idx, 1);

    return true;
};

Utils.ArrayRandom = function(list, n) {
    var ret = [];

    if (!n)
        n = 1;

    for (var i = 0; i < n; ++i) {
        if (list.length == 0)
            break;
        var ri = Math.floor(Math.random() * list.length);
        var rs = list.splice(ri, 1)[0];
        ret.push(rs);
    }

    return ret;
};

Utils.ArraySet = function(list, obj) {
    if (list.indexOf(obj) != -1)
        return;

    list.push(obj);
};

Utils.NowSec = function() {
    var ts = new Date().getTime();
    return Math.floor(ts / 1000);
};

Utils.Clone = function(obj)
{
    return Object.assign({}, obj);
};


module.exports = Utils;
