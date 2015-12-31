var expect = require('chai').expect;
var createPlaceName = require('../../src/generators/place_name').createPlaceName;
var getLandformTypes = require('../../src/generators/place_name').getLandformTypes;
require('../before');

describe("createPlaceName()", function() {
    it("returns a valid landform type with no arg", function() {
        var n = createPlaceName();
        expect(n).to.not.equal(null);
    });
    it("returns a valid landform type with invalid arg", function() {
        var n = createPlaceName();
        expect(n).to.not.equal(null);
    });
    it("creates a place name appropriate for landform type", function() {
        var n = createPlaceName("Water");
        expect(n).to.equal("Big Bar");

        n = createPlaceName("Elevation");
        expect(n).to.equal("Griffin Mesa");
    });
});
describe("getLandformTypes()", function() {
    it("returns landform types capitalized for use", function() {
        expect(getLandformTypes()[0]).to.equal("Depression");
    });
});