var ion = require('../ion');
var Database = require('./database');
var Item = require('../models/item');

var REMOVE_BRACES = /\{.*\}|\(.*\)/g,
    REMOVE_WHITESPACE = /\W|\s/g;

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
function makeSearchName(string) {
    return string.replace(REMOVE_BRACES,'').replace(REMOVE_WHITESPACE,'').toLowerCase();
}

module.exports = ion.define(Database, {
    /**
     *
     * @class atomic.db.ItemDatabase
     * @extends atomic.db.Database
     *
     * @constructor
     * @param tags {Array} an array of tags
     */
    init: function(tags) {
        Database.call(this, tags);
    },
    matches: function(params, model) {
        return !((ion.isNumber(params.minValue) && model.value < params.minValue) ||
            (ion.isNumber(params.maxValue) && model.value > params.maxValue) ||
            (ion.isNumber(params.minEnc) && model.enc < params.minEnc) ||
            (ion.isNumber(params.maxEnc) && model.enc > params.maxEnc));
    },
    /**
     * In addition tags, there are some other conditions you can specify for finding an item.
     *
     * @method find
     * @for atomic.db.ItemDatabase
     *
     * @param [params] {Object}
     *      @param [params.tags] {String} one or more tag strings, either to be matched, or to be
     *          excluded (if they start with a "-"). Can also be an array of individual tag strings.
     *      @param [params.minValue=0] {Number} the minimum value a matching item can have
     *      @param [params.maxValue=Number.MAX_VALUE] {Number} the maximum value a matching item can have
     *      @param [params.minEnc=0] {Number} the minimum encumbrance a matching item can have
     *      @param [params.maxEnc=Number.MAX_VALUE] {Number} the maximum encumbrance a matching item can have
     *
     * @return {atomic.models.Item} an item that matches the query
     */
    /**
     * In addition tags, there are some other conditions you can specify for finding an item.
     *
     * @method findAll
     * @for atomic.db.ItemDatabase
     *
     * @param [params] {Object}
     *      @param [params.tags] {String} one or more tag strings, either to be matched, or to be
     *          excluded (if they start with a "-"). Can also be an array of individual tag strings.
     *      @param [params.minValue=0] {Number} the minimum value a matching item can have
     *      @param [params.maxValue=Number.MAX_VALUE] {Number} the maximum value a matching item can have
     *      @param [params.minEnc=0] {Number} the minimum encumbrance a matching item can have
     *      @param [params.maxEnc=Number.MAX_VALUE] {Number} the maximum encumbrance a matching item can have
     *
     * @return {Array} an array of all items that matches the query
     */
    /**
     * Register one or more items (via a short, string-based item specification format) with the
     * search facilities of the library.
     *
     *     db.register(
     *       "35mm camera!10!.5!common household ammo-35mm",
     *       "fancy lad cake!1!1!common preserved food luxury"
     *     );
     *
     * **Specification**
     *
     * `name1; name2!value!encumbrance!tags`
     *
     * The first tag must always be `common`, `uncommon` or `rare`. If a `br` tag is included,
     * this indicates that the item can be found broken, and it will be added to the
     * database twice (once intact, and once broken).
     *
     * @method register
     * @for atomic.db.ItemDatabase
     *
     * @param item* {String} One or more item strings
     */
    register: function() {
        // optimizing on some things, like avoiding push, using for, etc.
        for (var i=0, len = arguments.length; i < len; i++) {
            var string = arguments[i],
                parts = string.split('!'),
                names = parts[0].trim().split(/\s*;\s*/),
                tags = parseTags(this, parts[3]),
                breakable = tags.indexOf("br") > -1,
                params = {
                    value: parseFloat(parts[1]),
                    enc: parseFloat(parts[2]),
                    frequency: tags.shift()
                };
            for (var j=0, len2 = names.length; j < len2; j++) {
                params.name = names[j];

                params.tags = ion.without(tags, 'br');
                params.tags.push(makeSearchName(params.name));
                this.models[this.models.length] = Object.freeze(new Item(params));
            }

            if (!breakable) { continue; }

            params.tags = params.tags.concat(['br']);
            // creating bags fail if items don't have at least some value.
            //params.value = ~~(params.value/2);
            params.value = Math.max(0.5, ~~(params.value/2));
            for (j=0, len2 = names.length; j < len2; j++) {
                params.name = "broken " + names[j];
                params.tags = [makeSearchName(params.name)].concat(tags);
                // TODO Why not store this as config, rather than an item proper?
                // items always have to be created off of it anyway
                this.models[this.models.length] = Object.freeze(new Item(params));
            }
        }
    }
});