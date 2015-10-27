"use strict";

var ion = require('../ion');

module.exports = ion.define({
    /**
     * A table of stuff you select by rolling 1d100.
     *
     *     var table = new ion.tables.Table();
     *     table.add(50, "heads")
     *     table.add(50, "tails");
     *     table.get();
     *     => "heads"
     *
     * @class ion.tables.Table
     *
     * @constructor
     * @param inFunction {Function} A function to run on values supplied to the add method. For
     *  example, you might create a function to convert item names to true Item objects, as a
     *  convenience when building the table.
     */
    init: function(outFunction) {
        this.outFunction = outFunction || ion.identity;
        this.rows = [];
        this.sum = 0;
    },
    /**
     * Add something to this table. You can either specify the specific percentage that this
     * element should be selected, or you can provide the range of die roll numbers (this
     * latter approach is easier when you're adapting an existing pen-and-paper table).
     *
     * The percentages must add up to 100% (or 100 on 1d100).
     *
     *     var table = new ion.tables.Table();
     *     table.add(50, object); // will occur 50% of the time
     *     table.add(1, 70, object); // Will occur 70% of the time, on a roll of 1 to 70
     *
     * @method add
     * @param percentOrStartRoll {Number} % chance occurrence of 100%, or the start number on 1d100
     * @param [endRoll] {Number}
     * @param object  {Object} Element to add to the table, can be any type
     */
    add: function() {
        var start, end, object, chance;
        if (arguments.length === 3) {
            start = arguments[0];
            end = arguments[1];
            object = arguments[2];
            chance = (end-start)+1;
            if (start < 1 || start > 100 || end < 1 || end > 100) {
                throw new Error("Dice ranges must be from 1 to 100");
            }
        } else {
            chance = arguments[0];
            object = arguments[1];
            if (chance < 1 || chance > 100) {
                throw new Error("Dice ranges must be from 1 to 100");
            }
        }
        if (typeof object === "undefined") {
            throw new Error("Object is undefined");
        }
        this.rows.push({chance: chance, object: object});
        this.sum += chance;
        return this;
    },
    /**
     * Get an item from the table, based on percentages.
     *
     * @method get
     * @return {Object} An item from the table
     */
    get: function() {
        if (Math.round(this.sum) !== 100) {
            throw new Error("Table elements do not add up to 100%, but rather to " + Math.round(this.sum));
        }
        var result = ion.roll(100);
        for (var i=0, len = this.rows.length; i < len; i++) {
            if (result <= this.rows[i].chance) {
                return this.outFunction(this.rows[i].object);
            }
            result -= this.rows[i].chance;
        }
    },
    /**
     * @method size
     * @return {Number} the number of items in the table.
     */
    size: function() {
        return this.rows.length;
    }
});
