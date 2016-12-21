var ion = require('../ion');
var Table = require('./table');

// Simple random function that doesn't execute and return functions stored in table.
function rand(coll) {
    return coll[ ~~(Math.random()*coll.length) ];
}

module.exports = ion.define(Table, {
    /**
     * A table of elements that occur based on the rarity keywords "common", "uncommon" and "rare".
     * Unless you set `useStrict` to false, you must specify at least one value for each frequency,
     * or you will raise an exception when you try and retrieve a value.
     *
     * If all three frequencies are provided, common values are returned about 65% of the time,
     * uncommon values 30% of the time, and rare values 5% of the time. If `useStrict` is set to
     * false and some categories are missing, the categories are adjusted in a logical way to
     * cover the gap. For example, rare will be returned more often if common or uncommon are missing;
     * less often when paired with uncommon than common, and 100% of the time if both common and
     * uncommon are missing.
     * @example
     *     var table = new atomic.tables.RarityTable();
     *     table.add("common", "A");
     *     table.add("uncommon", "B");
     *     table.add("rare", "B");
     *     table.get();
     *     => "A"
     *
     * @class atomic.tables.RarityTable
     * @extends atomic.tables.Table
     *
     * @constructor
     * @param [outFunction] {Function} A function to run on values supplied to the add method before
     * they are returned. If no function is supplied, the value itself is returned.
     * @param [useStrict=true] {boolean} Should this table throw an error if something is not
     * supplied for all three frequency categories?
     */
    init: function(outFunction, useStrict) {
        this.common = [];
        this.uncommon = [];
        this.rare = [];
        if (arguments.length === 1) {
            useStrict = outFunction;
        }
        outFunction = ion.isFunction(outFunction) ? outFunction : ion.identity;
        this.useStrict = ion.isBoolean(useStrict) ? useStrict : true;
        Table.call(this, outFunction);
    },
    /**
     * Add a value to the table with the frequency `common`, `uncommon` or `rare`.
     * Common occurs about 65% of the time, uncommon about 30% of the time, and
     * rare occurs 5% of the time. (Items in each bucket are equally weighted for
     * selection). These percentages are adjusted if the table is created with
     * strict mode disabled, and items are not placed in each of the three categories.
     *
     * @method add
     * @param frequency {String} `common`, `uncommon` or `rare`
     * @param object {Object} the object to put into the table
     * @return {atomic.tables.RarityTable}
     *
     */
    add: function(frequency, object) {
        switch(frequency) {
            case "common":
            case "uncommon":
            case "rare":
                this[frequency].push(object);
                this.rows.push(object); // referenced as a public property
                break;
            default:
                throw new Error(frequency + " is not valid (use rare, uncommon, common)");
        }
        return this;
    },
    /**
     * Returns a value from the table based on the rarity keywords frequency of occurrence.
     * If the table is created in strict mode, and at least one value hasn't been supplied
     * for each of the three frequencies, an exception will be thrown.
     *
     * @method get
     * @return {Object}
     */
    get: function() {
        // Unless useStrict is on, it's an error not to include items in each category.
        if (this.useStrict && (this.rare.length === 0 || this.common.length === 0 || this.uncommon.length === 0)) {
            throw new Error("RarityTable must have at least one common, uncommon, and rare element");
        }
        var common = ((this.common.length) ? 65 : 0);
        var uncommon = ((this.uncommon.length) ? 30 : 0);
        var rare = ((this.rare.length) ? 5 : 0);
        var roll = ion.roll(common+uncommon+rare);

        if (roll <= common && common !== 0) {
            return this.outFunction(rand(this.common));
        } else if (roll <= (common+uncommon) && uncommon !== 0) {
            return this.outFunction(rand(this.uncommon));
        } else if (roll <= (common+uncommon+rare) && rare !== 0) {
            return this.outFunction(rand(this.rare));
        }
        return null;
    }
});