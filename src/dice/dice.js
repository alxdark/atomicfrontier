"use strict";

var ion = require('../ion');

function sum(dice) {
    dice.value = [].reduce.call(dice, function(sum, die) { return sum + die.value; }, 0);
}

var Die = ion.define({
    /**
     * ***If you want to roll some dice to get a number, use the `atomic.roll()` utility method.
     * It is simpler and more flexible.***
     *
     * If you are modeling a game where you need to record the value of each
     * die rolled, you will need to model each individual die, and that is
     * the purpose of this class. It models a die with a number of faces and
     * a color. The die is always oriented such that one face is "up", or
     * the selected value of the die.
     *
     * Rolling changes this face up side, randomly, as you'd expect if you
     * rolled a die.
     *
     * @class atomic.dice.Die
     * @constructor
     * @param faces {Number} The number of faces on a white die
     * @param [color=white] {String} The color of the die
     */
    init: function(faces, color) {
        /**
         * The number of polyhedral faces on the die.
         * @property {Number} faces
         */
        this.faces = faces;
        /**
         * The color of the die.
         * @property {String} [color="white"]
         */
        this.color = color;
        /**
         * The value of the face up side of the die.
         * @property {Number} value
         */
        this.roll();
    },
    /**
     * Roll the die
     *
     * @method roll
     * @return {Number} the new face of the die after rolling
     */
    roll: function() {
        this.value = ion.roll(this.faces);
        return this.value;
    },
    /**
     * The symbol to represent the face up of the die
     *
     * @method symbol
     * @return {String} the symbol for the face up of the die
     */
    symbol: function() {
        return this.value.toString();
    },
    toString: function() {
        return ion.format("[{0} {1}]", this.color, this.symbol());
    }
});

/**
 * Models a fudge die. This is a six-sided die with two blank sides, two "+"
 * symbols, and two "-" symbols on its faces. These translate into the values
 * -1, 0 or 1.
 * @class atomic.dice.FudgeDie
 * @extends atomic.dice.Die
 */
var FudgeDie = ion.define(Die, {
    /**
     * @class atomic.dice.FudgeDie
     * @constructor
     */
    init: function(color) {
        Die.call(this, 6, color);
    },
    roll: function() {
        this.value = ion.roll(3)-2;
        return this.value;
    },
    symbol: function() {
        return (this.value === -1) ? "-" : ((this.value === 1) ? "+" : " ");
    }
});

/**
 * ***If you want to roll some dice to get a number, use the `ion.roll()` utility method.
 * It is simpler and more flexible.***
 *
 * A set of dice. Helps to roll an entire set of dice, get the sum of the
 * dice, and so forth.
 *
 * @class atomic.dice.Dice
 * @constructor
 * @param [dice]* {atomic.dice.Die} One or more dice to include in this set of dice.
 * Or, can be an array of dice or dice objects. (Correct?)
 */
var Dice = ion.define({
    init: function () {
        this.length = 0;
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg instanceof Dice || ion.isArray(arg)) {
                for (var j = 0; j < arg.length; j++) {
                    this[this.length++] = arg[j];
                }
            } else {
                this[this.length++] = arguments[i];
            }
        }
        sum(this);
    },
    /**
     * Add a die to this set of dice.
     *
     * @method push
     * @param die {atomic.dice.Die} A die to add to the set of dice.
     */
    push: function (die) {
        this[this.length++] = die;
        sum(this);
    },
    /**
     * Roll this set of dice.
     *
     * @method roll
     * @return {Number} The new sum of all the die after rolling
     */
    roll: function () {
        [].map.call(this, function (obj) {
            return obj.roll();
        });
        sum(this);
        return this.value;
    },
    /**
     * @method toString
     * @return {String} A string describing the dice rolled.
     */
    toString: function () {
        return [].map.call(this, function (obj) {
            return obj.toString();
        }).join(' ');
    }
});

module.exports.Die = Die;
module.exports.FudgeDie = FudgeDie;
module.exports.Dice = Dice;