var ion = require('../ion');
var Database = require('./database');

module.exports = ion.define(Database, {
    init: function(params) {
        Database.call(this, params);
    },
    register: function() {
        for (var i=0, len = arguments.length; i < len; i++) {
            var parts = arguments[i].split('!');
            this.models[this.models.length] = {};
        }
    }
});