/**
 * Created by gthpg on 2017-06-04.
 */
var items = require('../json/proto_item');
var constants = require('../json/constants.js');
var objClass = require('./obj');
var g_makeTexts;
var g_utils;

var g_eventManager = null;

var ActionEventManager = function () {
    this.list = {};
};

ActionEventManager.prototype.On = function (event, user) {
};

module.exports = function (makeTexts, utils) {
    g_makeTexts = makeTexts;
    g_utils = utils;

    if (g_eventManager == null)
        g_eventManager = new ActionEventManager();

    return g_eventManager;
};