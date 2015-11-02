var ion = require('../ion');
var Model = require('../models/model');
var Database = require('./database');

function parseTags(db, arg) {
    var memo = getMemo();
    if (ion.isString(arg) && arg !== "") {
        memo = split(arg).reduce(db.cbTagCollector, memo);
    }
    return memo.ands;
}
function getMemo() {
    return {ands: [], nots: []};
}
function split(string) {
    return string.trim().toLowerCase().split(/\s+/);
}
function getClustering(tags) {
    // TODO: Where is this documented?
    var prefix = "cluster:";
    return tags.filter(function(tag) {
        return (tag.indexOf(prefix) > -1);
    })[0].substring(8);
}

module.exports = ion.define(Database, {
    /**
     *  A database for looking up store configuration definitions. Only tag queries are
     *  supported.
     *
     * @class atomic.db.StoreDatabase
     * @extends atomic.db.Database
     *
     * @constructor
     * @param tags {Array} an array of tags
     */

    init: function(params) {
        Database.call(this, params);
    },
    /**
     * Find and return a store configuration. Only tag-based searches are supported.
     *
     * @method find
     * @param [params] {Object}
     * @param [params.tags] {String} a tag query
     * @return {atomic.models.Store} store
     */
    /**
     * One or more strings, with the following fields separated with a ! character:
     * <ul>
     * <li>Name[; alternative name][; alternative name]</li>
     * <li>Policies of store</li>
     * <li>profession of owner</li>
     * <li>trait of owner</li>
     * <li>inventory tag search</li>
     * <li>inventory total value</li>
     * <li>inventory minValue of items</li>
     * <li>inventory maxValue of items</li>
     * <li>one or more space-separated tags (starting with frequency: common, uncommon, or rare)</li>
     * </ul>
     * The tags can either be the numerical index of the tag in the array as it was provided in the database's constructor
     * (very space efficient), or the tag string itself.
     *
     * @for atomic.db.StoreDatabase
     * @method register
     */
    register: function() {
        var opts, inv;
        for (var i=0, len = arguments.length; i < len; i++) {
            var parts = arguments[i].split('!'),
                names = parts[0].trim().split(/\s*;\s*/),
                policy = parts[1],
                owner_profession = parts[2],
                owner_trait = parts[3],
                bag_tags = parts[4],
                bag_total_value = parts[5],
                bag_min_value = parts[6],
                bag_max_value = parts[7],
                tags = parseTags(this, parts[8]),
                frequency = tags.shift();

            // So you can search for a store by name (converted to tags)
            for (var j=0; j < names.length; j++) {
                tags[tags.length] = ion.toTag(names[j]);
            }
            var owner = {};
            if (owner_profession) { owner.profession = owner_profession; }
            if (owner_trait) {
                owner.traits = {};
                owner.traits[owner_trait] = ion.roll(3)+1;
            }

            this.models[this.models.length] = opts = new Model({
                frequency: frequency,
                names: names,
                policy: policy,
                owner: owner,
                tags: tags
            });

            // Only if at least one of these was set...
            if (bag_tags || bag_total_value || bag_min_value || bag_max_value) {
                opts.inventory = inv = {fillBag: false, cluster: getClustering(tags)};
                if (bag_tags) { inv.tags = bag_tags; }
                if (bag_total_value) { inv.totalValue = parseInt(bag_total_value,10); }
                if (bag_min_value) { inv.minValue = parseInt(bag_min_value,10); }
                if (bag_max_value) { inv.maxValue = parseInt(bag_max_value,10); }
            }
        }
    }
});
