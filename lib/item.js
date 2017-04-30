var utils = require('./utils.js');
var MakeTexts = require('./makeTexts.js');
var constants = require('../json/constants.js');

var protoList = require('../json/proto_item.js');
var Item = function (protoName, roomId) {
    this.protoData = protoList[protoName];
    this.protoId = protoName;
    this.roomId = roomId;

    for (var i in protoData)
        this[i] = protoData[i];
};

Item.prototype.GetDesc = function () {
    return this.protoData['desc'];
};

Item.prototype.SetOwner = function (obj) {
    this.owner = obj;
    this.roomId = constants.ROOM_ID_INVALID;
};

Item.prototype.SetRoomId = function (roomId) {
    this.owner = constants.OWNER_INVALID;
    this.roomId = roomId;
};


module.exports = Item;
