var ion = require('../ion');

var sevenDays = (7*24*60*60*1000);
var daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var daysOfMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function advanceToDayOfWeek(date, params) {
    var pubDate = new Date(date.getTime());
    while(params.dayOfWeek && daysOfWeek[pubDate.getUTCDay()] !== params.dayOfWeek) {
        pubDate.setUTCDate(pubDate.getUTCDate()+1);
    }
    return pubDate;
}

var periods =  {
    'weekly': function(date) {
        date.setTime(date.getTime() + sevenDays);
    },
    'monthly': function(date) {
        if (date.getUTCDate() !== 1) {
            date.setUTCDate(1);
        }
        date.setUTCMonth(date.getUTCMonth()+1);
    },
    'biweekly': function(date, params) {
        var i = (date.getUTCDate() === 1) ? 15 : 1;
        date.setUTCDate(i);
        if (i === 1) {
            date.setUTCMonth(date.getUTCMonth()+1);
        }
    },
    'bimonthly': function(date) {
        date.setUTCMonth(date.getUTCMonth()+2);
    }
};

function formatDate(pubDate, format) {
    var monthYear = daysOfMonth[pubDate.getUTCMonth()] + " " + pubDate.getUTCFullYear();
    if (format === 'full') {
        return daysOfWeek[pubDate.getUTCDay()] + " " + pubDate.getUTCDate() + " " + monthYear;
    }
    return monthYear;
}

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
 *      @param [params.startDate='1956-01-01'] {String|Date} a string (in format 'YYYY-MM-DD') or a date object that
 *          is the date on which the sequence will start.
 *      @param [params.endDate='1958-07-14'] {String|Date} a string (in format 'YYYY-MM-DD') or a date object that
 *          is the date before which the sequence will end.
 * @return {Array} an array of string dates in the format 'Monday 2 Jan 1956'.
 */
function timeSeries(params) {
    params = params || {};
    params.period = params.period || 'weekly';
    var period = periods[params.period];
    if (!period) {
        throw new Error(params.period + " is not a valid period.");
    }
    params.startDate = params.startDate || '1956-01-01';
    params.endDate = params.endDate || '1958-07-14'; // TODO: what's the canonical date?
    params.format = params.format || 'full';
    params.startDate = new Date(params.startDate);
    params.endDate = new Date(params.endDate);

    var dateStrings = [];
    for (var date = params.startDate; date < params.endDate; period(date, params)) {
        // pub date moves the date to a day of the week, but keeps calculating using the existing date.
        var pubDate = advanceToDayOfWeek(date, params);
        if (pubDate < params.endDate) {
            var dateString = formatDate(pubDate, params.format);
            dateStrings.push(dateString);
        }
    }
    return dateStrings;
}

module.exports = timeSeries;