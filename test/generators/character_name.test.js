var expect = require('chai').expect;
var createCharacterName = require('../../src/generators/character_name');
var Name = require('../../src/models/name');
require('../before');

describe("createCharacterName()", function() {
    it("returns a name instance", function() {
        var n = createCharacterName();
        expect(n.constructor).to.equal(Name);
    });
    it("has a first and last name, but no nickname", function() {
        var n = createCharacterName();
        expect(n.given).to.equal("Ben");
        expect(n.first).to.equal("Ben");

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