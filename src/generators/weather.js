"use strict";

var ion = require('../ion');
var Weather = require('../models/weather');

// From: http://biology.fullerton.edu/dsc/school/climate.html
// Which is enough to fake it, I think.

// Cloud type classifications
// http://www.crh.noaa.gov/lmk/?n=cloud_classification

// Mean monthly temperatures, high and low. r = rainfall, t = thunderstorms
// 0 - nothing
// 1 - rain
// 2 - thunderstorms

var averages = [
    {lo: 34, hi: 61,  mn: 48, rain: 1}, // Jan
    {lo: 40, hi: 69,  mn: 54, rain: 1},
    {lo: 46, hi: 74,  mn: 60, rain: 1}, // Mar
    {lo: 53, hi: 83,  mn: 68, rain: 1},
    {lo: 61, hi: 93,  mn: 77, rain: 0}, // May
    {lo: 70, hi: 103, mn: 86, rain: 0},
    {lo: 77, hi: 109, mn: 93, rain: 2}, // Jul
    {lo: 75, hi: 107, mn: 92, rain: 2},
    {lo: 68, hi: 100, mn: 84, rain: 2}, // Sep
    {lo: 55, hi: 87,  mn: 71, rain: 0},
    {lo: 43, hi: 73,  mn: 57, rain: 1}, // Nov
    {lo: 34, hi: 62,  mn: 48, rain: 1}
];
var months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

/**
 * Weather generator. The weather.js is based on the Mojave desert so it is hot, sunny and pretty
 * monotonous.
 *
 * @static
 * @method createWeather
 * @for atomic
 *
 * @param month {String} Three-letter abbreviation for the month of the year (Jan-Dec)
 * for which weather.js is being generated.
 *
 * @return {atomic.models.Weather} An object describing the weather.js forecast.
 */
module.exports = function(month) {
    var index = ion.isUndefined(month) ? new Date().getMonth() : months.indexOf(month.toLowerCase()),
        monthly = averages[index],
        weather = new Weather({
            low: (monthly.lo + ion.roll("1d10-5")),
            high: (monthly.hi + ion.roll("1d10-5")),
            rain: "clear skies"
        });

    if (monthly.rain === 0 && ion.test(8)) {
        weather.rain = ion.random(["cloudy skies", "high clouds"]);
    } else if (monthly.rain === 1 && ion.test(10)) {
        weather.rain = ion.random(["light rain", "strong winds"]);
    } else if (monthly.rain === 2 && ion.test(10)) {
        weather.rain = "thunderstorms";
    }
    return weather;
};
