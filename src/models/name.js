var ion = require('../ion');
var Model = require('./Model');

module.exports = ion.define(Model, {
    /**
     * A person's name (given and family name).
     *
     * @class ion.models.Name
     * @extends ion.models.Model
     *
     * @constructor
     * @param [data] {Object} A data object initializing properties of a name.
     * @param [data.given] {String} Given or first name
     * @param [data.family] {String} Family or last name
     */
    init: function(data) {
        /**
         * First or given name
         * @property given
         * @type {String}
         */
        /**
         * Last or family name
         * @property family
         * @type {String}
         */
        /**
         * Nick name. Used currently for gang members, sometimes for traders.
         * @property nickname
         * @type {String}
         */
        Model.call(this, data);
        this.type = "Name";
    },
    properties: {
        /**
         * A read-only synonym property for the given name.
         *
         * @property first
         * @type {String}
         */
        first: function() {
            return this.given;
        },
        /**
         * A read-only synonym property for the family name.
         *
         * @property last
         * @type {String}
         */
        last: function() {
            return this.family;
        }
    },
    /**
     * @method toString
     * @return {String} Full name (first and last)
     */
    toString: function() {
        return (this.nickname) ? this.nickname : ion.format("{given} {family}", this);
    }
});

