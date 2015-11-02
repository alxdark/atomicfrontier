var ion = require('../ion');

module.exports = ion.define({
    /**
     * A set data structure. This is going to be built into future versions of JavaScript,
     * so this object follows that API where feasible.
     *
     * @class atomic.models.IonSet
     * @param [array] {Array} initial items for set
     */
    init: function(array) {
        this.hash = {};
        for (var i=0; i < (array || []).length; i++) {
            this.add(array[i]);
        }
    },
    /**
     * Remove all items from the set.
     *
     * @method clear
     */
    clear: function() {
        this.hash = {};
    },
    /**
     * Add a value to the set. The set will only contain one value with the same
     * `toString()` presentation, so most primitives will be unique in the set. For
     * objects, the object will need to produce a unique `toString()` value (there
     * is no `hashValue()` for JavaScript objects).
     *
     * @method add
     * @param value {Object} The value to add to the set
     */
    add: function(value) {
        this.hash[(value).toString()] = value;
    },
    /**
     * Remove a value from the set (as in adding, the value is found through its
     * `toString()` representation).
     *
     * @method remove
     * @param value {Object} The value to remove
     */
    remove: function(value) { // Delete in proposed API but that's a reserved keyword
        delete this.hash[(value).toString()];
    },
    /**
     * Is this value in the set?
     * @method has
     * @return {Boolean} true if the object (as represented by its `toString()` value) is in the set, false otherwise.
     */
    has: function(value) {
        return typeof (this.hash[(value).toString()]) !== "undefined";
    },
    /**
     * Number of items in the set
     * @method size
     * @return {Number} The number of items in the set
     */
    size: function() {
        return ion.keys(this.hash).length;
    },
    /**
     * Return items of set as an array
     * @method toArray
     * @return {Array} The contents of this set as an array
     */
    toArray: function() {
        return ion.values(this.hash);
    }
});