var expect = require('chai').expect;
var ion = require('../../src/ion');
var sinon = require('sinon');
var Character = require('../../src/models/character');
var Name = require('../../src/models/name');
var createCharacter = require('../../src/generators/character').createCharacter;
var createRace = require('../../src/generators/character').createRace;
var createKit = require('../../src/generators/bag').createKit;
require('../seedrandom');

describe("createCharacter()", function() {
    beforeEach(function() {
        Math.seedrandom('belgium');
    });
    it("returns a Character instance", function() {
        var c = createCharacter();
        expect(c.constructor).to.equal(Character);
    });
    it("works with no parameters", function() {
        expect(createCharacter()).to.not.be.null;
    });
    it("sets gender correctly", function() {
        expect(createCharacter({gender: "female"}).gender).to.equal('female');
        expect(createCharacter({gender: "male"}).gender).to.equal('male');
    });
    it("sets name as a string", function() {
        var c = createCharacter({name: "Jed Bumpkins"});
        expect(c.name.given).to.equal("Jed");
        expect(c.name.family).to.equal("Bumpkins");
    });
    it("sets name as a Name object", function() {
        var name = new Name({given: "Jed", family: "Bumpkins"});
        var c = createCharacter({name: name});
        expect(c.name.given).to.equal("Jed");
        expect(c.name.family).to.equal("Bumpkins");

        // partial name
        name = new Name({given:"Jed"});
        c = createCharacter({name: name});
        expect(c.name.given).to.equal("Jed");
        expect(c.name.family).to.equal("Collins");

        name = new Name({family:"Bumpkins"});
        c = createCharacter({name: name});
        expect(c.name.family).to.equal("Bumpkins");
        expect(c.name.given).to.not.equal("Jed");
    });
    it("sets age correctly", function() {
        var c = createCharacter({age:22});
        expect(c.age).to.equal(22);

        c = createCharacter({age:10});
        expect(c.age).to.equal(10);

        c = createCharacter({age: -2});
        expect(c.age).to.equal(1);
    });
    it("sets race correctly", function() {
        var c = createCharacter({race: "anglo"});
        expect(c.race).to.equal("anglo");
    });
    it("sets profession corectly", function() {
        var c = createCharacter({profession: 'trader'});
        expect(c.profession).to.equal("Trader");
    });
    it("accepts 'soldier' as a valid profession", function() {
        var c = createCharacter({profession: 'soldier'});
        expect(c.honorific).to.equal("Marine Sergeant");
    });
    it("creates equipment (or not) as specified", function() {
        var c = createCharacter({equip: false});
        expect(c.inventory.entries.length).to.equal(0);

        c = createCharacter({equip: true});
        expect(c.inventory.entries.length).not.to.equal(0);
    });
    it("creates equipment appropriate for profession of character (2)", function() {
        var c = createCharacter({profession: "craftsperson"});
        var kit = c.inventory.entries.filter(function(entry) {
            return entry.item.is('kit:craftsperson');
        });
        expect(kit.length).to.be.above(0);
    });
    it("sets traits correctly, if specified", function() {
        var traits = {basketweaving: 50, sewing: 50};
        var c = createCharacter({traits: traits});
        expect(c.trait("basketweaving")).to.equal(50);
        expect(c.trait("sewing")).to.equal(50);

        // changing the traits object does not change the character. obj has been copied.
        traits.basketweaving = 10;
        expect(c.trait("basketweaving")).to.equal(50);
    });
    it("increases Spanish as a trait for some Hispanics", function() {
        try {
            sinon.stub(ion, "nonNegativeGaussian").returns(100);
            var c = createCharacter({race: "hispanic"});
            expect(c.trait("Spanish")).to.be.above(99);
        } finally {
            ion.nonNegativeGaussian.restore();
        }
    });
    it("creates traits appropriate to the character's age", function() {
        // TODO: This shows up how little age effects traits.
        // I would expect the physical traits to slowly reduce back down
        // to zero, while steadily accumulating other traits.
        var c = createCharacter();
        // This is 11 trait points, plus one innate and one for Spanish
        expect(ion.sum(ion.values(c.traits))).to.equal(13);

        c = createCharacter({age: 60, race: "anglo"});
        expect(ion.sum(ion.values(c.traits))).to.equal(16);
    });
    it("throws error if profession is invalid", function() {
        expect(function() {
            createCharacter({profession: "testvalue"});
        }).to.throw;
    });
});
describe("assignRace()", function() {
    it("returns an ethnic/race string", function() {
        try {
            var array = [true, false];
            sinon.stub(ion, "test", function() {
                return array.shift();
            });

            var r = createRace();
            expect(r).to.equal("hispanic");

            r = createRace();
            expect(r).to.equal("anglo");
        } finally {
            ion.test.restore();
        }
    });
});