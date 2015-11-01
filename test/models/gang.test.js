var expect = require('chai').expect;
var deserializer = require('../../src/atomic').models.deserializer;
var Gang = require('../../src/models/gang');
var Character = require('../../src/models/character');

describe("atomic.models.Gang", function() {
    it("contains members", function() {
        var gang = new Gang();
        expect(gang.members.length).to.equal(0);
    });
    it("can add members", function() {
        var gang = new Gang();
        var c = new Character();

        gang.add(c);
        expect(gang.members.length).to.equal(1);
    });
    it("can be serialized/deserialized", function() {
        var gang = new Gang();

        var string = JSON.stringify(gang);

        var newGang = deserializer(string);
        expect(newGang.members).to.be.eql([]);
        expect(newGang.type).to.be.equal("Gang");
    });
});