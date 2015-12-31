var expect = require('chai').expect;
var sinon = require('sinon');
var ion = require('../../src/ion');
var createCharacter = require('../../src/generators/character').createCharacter;
var createAppearance = require('../../src/generators/appearance');
require('../before');


describe("createAppearance()", function() {
    // Kind of hard to test this as it just spits out a string, based on tons of randomness.

    var character;
    beforeEach(function() {
        character = createCharacter();
    });

    it("returns a string description", function() {
        var a = createAppearance(character);
        expect(a.constructor).to.equal(String);
    });
    it("will not work without a character", function() {
        expect(function() {
            createAppearance();
        }).to.throw;
    });
    it("will return a gender-specific description", function() {
        try {
            sinon.stub(ion, "test").returns(true);

            expect(character.gender).to.equal("male");

            var a = createAppearance(character);
            expect(a).to.match(/Brown ivy league haircut/);

            character.gender = "female";
            a = createAppearance(character);
            expect(a).to.match(/Bobbed brown hair/);
        } finally {
            ion.test.restore();
        }
    });
    it("creates visual and behavioral distinctions, by chance", function() {
        try {
            sinon.stub(ion, "test").returns(true);

            var a = createAppearance(createCharacter({gender:"male"}));
            expect(a).to.match(/wears browline glasses/);
            expect(a).to.match(/has a tattoo/);
            expect(a).to.match(/scar on his left arm/);
            expect(a).to.match(/artificial hand/);
        } finally {
            ion.test.restore();
        }
    });
    it("can also create a very plain character appearance", function() {
        try {
            sinon.stub(ion, "test").returns(false);

            var a = createAppearance(createCharacter());
            expect(a).to.equal("Bobbed brown hair, short stature");
        } finally {
            ion.test.restore();
        }
    });
});