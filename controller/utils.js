var Utils = function() {}

Utils.RemoveFromList = function(list, obj) {
    var idx = list.indexOf(obj);
    if (idx == -1)
        return;

    list.splice(idx, 1);
}

Utils.ArrayRandom = function(list, n) {
    var ret = [];

    if (!n)
        n = 1;

    for (var i = 0; i < n; ++i) {
        if(list.length == 0)
            break;
        var ri = Math.floor(Math.random() * list.length);
        var rs = list.splice(ri, 1)[0];
        ret.push(rs);
    }

    return ret;
}


module.exports = Utils;
