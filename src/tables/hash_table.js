"use strict";

var ion = require('../ion');

module.exports = ion.define({
    /**
     * A table of elements you select by key. Similar to a JavaScript object, but with a couple
     * of additional conveniences for building tables.
     * @example
     *     var table = new atomic.tables.HashTable(function(value) {
     *         return ion.roll(value);
     *     });
     *     table.put("a", "b", "c", "3d6");
     *     table.put("d", "4d6");
     *
     *     table.get("b");
     *     => 12
     *
     * @class atomic.tables.HashTable
     *
     * @constructor
     * @param [outFunction] {Function} A function to run on values supplied to the put method
     * before they are returned. If no function is supplied, the value itself is returned.
     */
    init: function(outFunction) {
        this.outFunction = outFunction || ion.identity;
        this.hash = {};
    },
    /**
     * Add something to this table, under one or more keys.
     * @example
     *     var table = new atomic.tables.HashTable();
     *     table.put(1,2,3, "A");
     *     table.put(4,5, "B");
     *     table.get(4);
     *     => "B"
     *
     * @method put
     *
     * @param keys* {Object} keys under which the value will be returned (1 or more). The
     * key "default" will be used to return a value for any key that is not in the table.
     * @param value {Object} Something to add to the table, can be any type
     */
    put: function() {
        var value = arguments[arguments.length-1];
        for (var i=0; i < arguments.length-1; i++) {
            this.hash[arguments[i]] = value;
        }
        return this;
    },
    /**
     * Get an item from the table, based on a key.
     *
     * @method get
     *
     * @param key {Object} the key of the item to return
     * @return {Object} An item from the table, or null if the key isn't present
     */
    get: function(key) {
        var values = this.hash[key];
        if (values) {
            return this.outFunction(values);
        } else if (this.hash["default"]) {
            return this.outFunction(this.hash["default"]);
        }
        return null;
    }
});
