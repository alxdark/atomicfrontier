var expect = require('chai').expect;
var Weather = require('../../src/models/weather');
var createWeather = require('../../src/generators/weather');
require('../before');

describe("createWeather()", function() {
    it("returns a weather.js object", function() {
        var w = createWeather();
        expect(w.constructor).to.equal(Weather);
    });
    it("changes the weather.js with the month", function() {
        var weather = createWeather("jun");
        expect(weather.low).to.equal(70);
        expect(weather.high).to.equal(99);
        expect(weather.rain).to.equal("clear skies");

        weather = createWeather("apr");
        expect(weather.low).to.equal(49);
        expect(weather.high).to.equal(81);
        expect(weather.rain).to.equal("clear skies");
    });
});