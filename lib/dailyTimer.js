/**
 * Created by gthpg on 2017-04-16.
 */
var utils = require('./utils');
var makeText = require('./makeTexts');

var DAY_SEC = 60 * 60;

var g_dailyTimer = null;

var g_io = null;

var DailyTimer = function () {
    this.startSec = utils.NowSec();
    this.deltaSec = 0;

    this.DAY_TIME_MORNING = 0;
    this.DAY_TIME_NOON = 1;
    this.DAY_TIME_NIGHT = 2;
    this.DAY_TIME_MIDNIGHT = 3;

    this.curDayTime = this.DAY_TIME_MORNING;
};

DailyTimer.prototype.worldTicker = function () {
    var curSec = utils.NowSec();
    this.deltaSec = curSec - this.startSec;

    var dayTime = this.deltaSec % DAY_SEC;

    var curDayTime = parseInt(dayTime / DAY_SEC * 4);

    if (curDayTime != this.curDayTime) {
        var str = 'unknown';

        switch (curDayTime) {
            case this.DAY_TIME_MORNING:
                str = makeText.TimeNotiMorning();
                break;

            case this.DAY_TIME_NOON:
                str = makeText.TimeNotiNoon();
                break;

            case this.DAY_TIME_NIGHT:
                str = makeText.TimeNotiNight();
                break;

            case this.DAY_TIME_MIDNIGHT:
                str = makeText.TimeNotiMidnight();
                break;
        }

        g_io.sockets.emit('send:message', str);

        this.curDayTime = curDayTime;
    }
};

module.exports = function (io) {
    if (g_dailyTimer)
        return g_dailyTimer;

    g_io = io;

    g_dailyTimer = new DailyTimer();
    return g_dailyTimer;
};