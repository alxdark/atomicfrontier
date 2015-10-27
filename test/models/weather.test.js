var expect = require('chai').expect;
var Weather = require('../../src/models/Weather');

describe("atomic.models.Weather", function() {
    it("behaves like a Model subclass", function() {
        var weather = new Weather();
        expect(weather.type).to.equal("Weather");
    });
});