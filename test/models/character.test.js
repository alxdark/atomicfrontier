var expect = require('chai').expect;
var Character = require('../../src/models/character');
var Name = require('../../src/models/name');
var Bag = require('../../src/models/bag');

describe("ion.models.Character", function() {
    var boy, girl;
    beforeEach(function() {
        boy = new Character({gender: "male"});
        girl = new Character({gender: "female"});
    });
    it("defaults to male, because, something", function() {
        expect(new Character().male).to.be.true;
    });
    it("changes a trait with positive value", function() {
        boy.changeTrait("Happy", 3);
        expect(boy.trait("Happy")).to.equal(3);
        boy.changeTrait("Happy", 2);
        expect(boy.trait("Happy")).to.equal(5);
    });
    it("changes a trait with a negative value, but not past zero", function() {
        boy.changeTrait("Happy", 3);
        boy.changeTrait("Happy", -2);
        expect(boy.trait("Happy")).to.equal(1);
        boy.changeTrait("Happy", -2);
        expect(boy.trait("Happy")).to.equal(0);
    });
    it("calculates points as the sum of all traits", function() {
        boy.changeTrait("Happy", 3);
        boy.changeTrait("Mechanics", 2);
        boy.changeTrait("Scuba", 0);
        expect(boy.points).to.equal(5);
    });
    it("shows the correct gender", function() {
        expect(boy.male).to.be.true;
        expect(girl.male).to.be.false;
    });
    it("shows the correct personal pronoun", function() {
        expect(boy.personal).to.equal("he");
        expect(girl.personal).to.equal("she");
    });
    it("shows the correct objective pronoun", function() {
        expect(boy.objective).to.equal("him");
        expect(girl.objective).to.equal("her");
    });
    it("shows the correct reflexive pronoun", function() {
        expect(boy.reflexive).to.equal("himself");
        expect(girl.reflexive).to.equal("herself");
    });
    it("shows the correct possessive pronoun", function() {
        expect(boy.possessive).to.equal("his");
        expect(girl.possessive).to.equal("her");
    });
    it("has a toString/toHTML", function() {
        // This is a minimal test to verify this code was copied over correctly.
        // TODO: More extensive tests
        var name = new Name({given: "Mabel", family: "Grange"});
        var inv = new Bag();
        inv.add("oranges", 3);

        var ch = new Character({gender: "female", name: name, age: 18,
            appearance: ["Has a scar on her left cheek"], inventory: inv});

        expect(ch.toString()).to.equal('Mabel Grange. Age 18. Has a scar on her left cheek. Possessions: 3 orangeses.');
        expect(ch.toHTML()).to.equal('<p>Mabel Grange. Age 18. Has a scar on her left cheek. </p><div class="more"><p></p><p>Possessions: 3 orangeses.</p></div>');
    });
});