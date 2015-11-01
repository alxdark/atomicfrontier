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
    init: function(params) {
        Database.call(this, params);
    },
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
