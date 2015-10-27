var ion = require('../ion');
var Model = require('./Model');

module.exports = ion.define(Model, {
    /**
     * A weather forecast for a day in a month.
     *
     * @class ion.models.Weather
     * @extends ion.models.Model
     *
     * @constructor
     * @param data {Object} A data object initializing properties of a name.
     */
    init: function(data) {
        Model.call(this, data);
        this.type = "Weather";
    }
});

