var expect = require('chai').expect;
var rewire = require('rewire');
var ion = require('../../src/ion');
var placeNames = rewire('../../src/generators/place_name');
var RarityTable = require('../../src/tables/rarity_table');
require('../before');

function stub(index) {
    var patterns = new RarityTable(ion.identity, false);
    patterns.add('common', placeNames.__get__("patterns").rows[index]);
    return placeNames.__set__("patterns", patterns);
}

describe("createPlaceName()", function() {
    it("returns a valid landform type with no arg", function() {
        var n = placeNames.createPlaceName();
        expect(n).to.not.equal(null);
    });
    it("returns a valid landform type with invalid arg", function() {
        var n = placeNames.createPlaceName();
        expect(n).to.not.equal(null);
    });
    it("creates a place name appropriate for landform type", function() {
        var n = placeNames.createPlaceName("Water");
        expect(n).to.equal("Big Bar");

        n = placeNames.createPlaceName("Elevation");
        expect(n).to.equal("Griffin Mesa");
    });
    it("regional location form", function() {
        var restore = stub(0);
        expect(placeNames.createPlaceName()).to.equal("Bad Prairie");
        restore();
    });
    it("regional name location form", function() {
        var restore = stub(1);
        expect(placeNames.createPlaceName()).to.equal("Dead Cooper Range");
        restore();
    });
    it("region description location form", function() {
        var restore = stub(2);
        expect(placeNames.createPlaceName()).to.equal("Dead Eagle Flat");
        restore();
    });
    it("name trail location form", function() {
        var restore = stub(3);
        expect(placeNames.createPlaceName()).to.equal("Bell Trail Prairie");
        restore();
    });
    it("real form", function() {
        var restore = stub(4);
        expect(placeNames.createPlaceName()).to.equal("Big Curve");
        restore();
    });
    it("description location form", function() {
        var restore = stub(5);
        expect(placeNames.createPlaceName()).to.equal("Arrow Prairie");
        restore();
    });
    it("name location form", function() {
        var restore = stub(6);
        expect(placeNames.createPlaceName()).to.equal("Hill Prairie");
        restore();
    });
});
describe("getLandformTypes()", function() {
    it("returns landform types capitalized for use", function() {
        expect(placeNames.getLandformTypes()[0]).to.equal("Depression");
    });
});