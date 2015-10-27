var ion = require('../ion');
var Model = require('./Model');
var Builder = require('../builder');

module.exports = ion.define(Model, {
    /**
     * An item.
     * @class ion.models.Item
     * @extends ion.models.Model
     *
     * @constructor
     * @param data {String/Object} The name of the object (as registered with `ion.registerItem`),
     * or the properties to set for this item.
     */
    init: function(data) {
        data = ion.isString(data) ? {name: data} : data;
        /**
         * The name of this item in a pluralization string, e.g. "ox{en}".
         * @property {String} name
         */
        this.name = data.name;
        /**
         * Encumbrance for this item, combining its weight and size.
         * @property {Number} enc
         */
        this.enc = 0;
        /**
         * What someone would pay, in a relevant currency, for this item
         * @property {Number} value
         */
        this.value = 0;
        Model.call(this, data);
        this.type = "Item";
    },
    toString: function() {
        return Builder(this)(this.name, 1)(!!this.title, " (" + this.title + ")").toString();
    },
    toHTML: function() {
        return Builder(this)("p", {}, function(b) {
            b(this.name, 1)(!!this.title, " (<cite>"+this.title+"</cite>)");
        }).toString();
    }
});
