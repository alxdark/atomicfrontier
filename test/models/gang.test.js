var expect = require('chai').expect;
var deserializer = require('../../src/atomic').models.deserializer;
var Gang = require('../../src/models/gang');
var Name = require('../../src/models/name');
var Character = require('../../src/models/character');

function makeSimpleGang() {
    var gang = new Gang({kind:"Bicycle Gang"});
    var c = new Character({
        gender: "female",
        age: 22,
        name: "Laura Dern",
        traits: {Firearms:2}
    });
    var c2 = new Character({
        gender: "male",
        age: 18,
        name: "Dave Powers",
        traits: {Intimidate:2}
    });
    gang.add(c);
    gang.add(c2);
    return gang;
}

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
    it("no name gang can be expressed as a string", function() {
        var gang = makeSimpleGang();

        expect(gang.toString()).to.equal('2 member Bicycle Gang (Laura Dern and Dave Powers): Laura Dern. Age 22. Firearms 2. Dave Powers. Age 18. Intimidate 2. ');
    });
    it("no name gang can be expressed as HTML", function() {
        var gang = makeSimpleGang();

        expect(gang.toHTML()).to.equal('<p>2 member Bicycle Gang (Laura Dern and Dave Powers): </p><div class="more"><p>Laura Dern. Age 22. Firearms 2. </p><p>Dave Powers. Age 18. Intimidate 2. </p></div>');
    });
    it("gang with name can be expressed as a string", function() {
        var gang = makeSimpleGang();
        gang.name = "5th Streeters";
        expect(gang.toString()).to.equal('The 5th Streeters (Bicycle Gang; Laura Dern and Dave Powers): Laura Dern. Age 22. Firearms 2. Dave Powers. Age 18. Intimidate 2. ');
    });
    it("gang with name can be expressed as HTML", function() {
        var gang = makeSimpleGang();
        gang.name = "5th Streeters";
        expect(gang.toHTML()).to.equal('<p>The 5th Streeters (Bicycle Gang; Laura Dern and Dave Powers): </p><div class="more"><p>Laura Dern. Age 22. Firearms 2. </p><p>Dave Powers. Age 18. Intimidate 2. </p></div>');
    });
});