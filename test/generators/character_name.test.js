var expect = require('chai').expect;
var createCharacterName = require('../../src/generators/character_name');
var Name = require('../../src/models/name');
require('../seedrandom');

describe("createCharacterName()", function() {
    beforeEach(function() {
        Math.seedrandom('belgium');
    });
    it("returns a name instance", function() {
        var n = createCharacterName();
        expect(n.constructor).to.equal(Name);
    });
    it("has a first and last name, but no nickname", function() {
        var n = createCharacterName();
        expect(n.given).to.equal("Bert");
        expect(n.first).to.equal("Bert");

        expect(n.family).to.equal("Diaz");
        expect(n.last).to.equal("Diaz");

        expect(n.nickname).to.be.undefined;
    });
    it("creates an ethnically appropriate name", function() {
        var n = createCharacterName({race: "hispanic"});
        expect(n.family).to.equal("Cabrera");
    });
    it("creates a gender appropriate name", function() {
        var n = createCharacterName({gender: "female"});
        expect(n.given).to.equal("Barb");
    });
});