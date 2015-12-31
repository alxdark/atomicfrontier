var expect = require('chai').expect;
var Die = require('../../src/dice/dice').Die;
var Dice = require('../../src/dice/dice').Dice;
var FudgeDie = require('../../src/dice/dice').FudgeDie;
require('../before');

describe("Dice (all kinds)", function() {
    it("assigns face and color", function() {
        var die = new Die(6, "red");
        expect(die.faces).to.equal(6);
        expect(die.color).to.equal("red");
    });
    it("adds dice as numeric members", function() {
        var dice = new Dice(new Die(6,"red"), new Die(6,"white"), new Die(6,"blue"));
        expect(dice[1].color).to.equal("white");
    });
    it("clones a dice object via the constructor", function() {
        var dice = new Dice(new Die(6,"red"), new Die(6,"white"), new Die(6,"blue"));
        var clone = new Dice(dice);
        expect(clone[1].color).to.equal("white");
    });
    it("rolls between 1 and N", function() {
        var die = new Die(6, "red");
        expect(die.value).to.be.above(0).and.be.below(7);
    });
    it("rolls different numbers with each roll", function() {
        var die = new Die(6);
        var value = die.value;
        die.roll();
        expect(die.value).not.to.equal(value);
    });
    it("has a string representation", function() {
        var die = new Die(6, "blue");
        die.value = 4;
        expect(die.toString()).to.equal("[blue 4]");
    });
    it("stacks in a dice object", function() {
        var dice = new Dice(new Die(6,"blue"), new Die("4","red"));
        dice.roll();
        expect(dice.toString()).to.match(/[blue \d] [red \d]/);
    });
    it("pushes a die onto a dice object", function() {
        var dice = new Dice();
        dice.push(new Die(6,"red"));
        dice.push(new Die(4,"blue"));
        expect(dice.toString()).to.match(/[red \d] [blue \d]/);
    });
    describe("fudge die", function() {
        it("rolls +/- or blank", function() {
            var fd = new FudgeDie("red");
            expect(fd.toString()).to.equal("[red  ]");
            // this is uncanny... I'm pretty sure it's accurate though.
            expect(fd.roll()).to.equal(-1);
            expect(fd.roll()).to.equal(-1);
            expect(fd.roll()).to.equal(-1);
            expect(fd.roll()).to.equal(-1);
            expect(fd.roll()).to.equal(-1);
            expect(fd.roll()).to.equal(0);
        });
    });
});