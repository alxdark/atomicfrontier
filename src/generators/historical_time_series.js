"use strict";
var ion = require('../ion');

var sevenDays = (7*24*60*60*1000);
var daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var daysOfMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function advanceToDayOfWeek(date, params) {
    var pubDate = new Date(date.getTime());
    while(params.dayOfWeek && daysOfWeek[pubDate.getDay()] !== params.dayOfWeek) {
        pubDate.setDate(pubDate.getDate()+1);
    }
    return pubDate;
}

var periods =  {
    'weekly': function(date) {
        date.setTime(date.getTime() + sevenDays);
    },
    'monthly': function(date) {
        if (date.getDate() !== 1) {
            date.setDate(1);
        }
        date.setMonth(date.getMonth()+1);
    },
    'biweekly': function(date, params) {
        var i = (date.getDate() === 1) ? 15 : 1;
        date.setDate(i);
        if (i === 1) {
            date.setMonth(date.getMonth()+1);
        }
    },
    'bimonthly': function(date) {
        date.setMonth(date.getMonth()+2);
    }
};

// TODO: Seasonal, volume/issues?

/**
 * Create a date series for periodicals, in the past.
 *
 * @static
 * @for atomic
 * @method createTimeSeries
 *
 * @param [params] {Object} params
 *      @param [params.period='weekly'] {String} one of 'weekly', 'monthly', 'biweekly' or 'bimonthly'
 *      @param [params.dayOfWeek] {String} one of 'Saturday' to 'Sunday', if you want the dates to be
 *          adjusted to the next day of the week (for example if a periodical is always published on Mondays).
 *      @param [params.startDate='1955-12-31'] {String|Date} a string (in format 'YYYY-MM-DD') or a date object that is the date
 *          after which the sequence will start.
 *      @param [params.endDate='1958-07-14'] {String|Date} a string (in format 'YYYY-MM-DD') or a date object that is the date
 *          before which the sequence will end.
 * @return {Array} an array of string dates in the format 'Monday 2 Jan 1956'.
 */
function timeSeries(params) {
    params = params || {};
    params.period = params.period || 'weekly';
    params.startDate = params.startDate || '1955-12-31';
    params.endDate = params.endDate || '1958-07-14'; // TODO: what's the canonical date?
    params.format = params.format || 'full';
    if (!periods[params.period]) {
        throw new Error(params.period + " is not a valid period.");
    }
    params.startDate = new Date(params.startDate);
    params.endDate = new Date(params.endDate);

    var date = params.startDate;

    var dateStrings = [];
    while(true) {
        // advance time according to the period function.
        periods[params.period](date, params);

        // publications often adjust the date to the nearest day of week, or do something that's close enough to this
        var pubDate = advanceToDayOfWeek(date, params);
        if (pubDate >= params.endDate) {
            break;
        }
        // format
        if (params.format === 'full') {
            var str = ion.format("{0} {1} {2} {3}",
                daysOfWeek[pubDate.getDay()], pubDate.getDate(), daysOfMonth[pubDate.getMonth()], pubDate.getFullYear());
        } else {
            var str = ion.format("{0} {1}", daysOfMonth[pubDate.getMonth()], pubDate.getFullYear());
        }
        dateStrings.push(str);
    }
    return dateStrings;
}

module.exports = timeSeries;