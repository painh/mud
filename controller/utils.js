var Utils = function() {}

Utils.RemoveFromList = function(list, obj)
{
    var idx = list.indexOf(obj);
    if(idx == -1)
        return;

    list.splice(idx, 1);
} 


module.exports = Utils;
