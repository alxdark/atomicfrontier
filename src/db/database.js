var ion = require('../ion');
var RarityTable = require('../tables/rarity_table');

function parseQuery(db) {
    // if this has already been parsed, then return
    if (!ion.isUndefined(arguments[1]) && arguments[1].ands) {
        return arguments[1];
    }
    var params = getMemo();
    for (var i=0; i < arguments.length; i++) {
        buildQuery(db, params, arguments[i]);
    }
    return params;
}
function buildQuery(db, params, arg) {
    if (ion.isString(arg) && arg !== "") {
        params = split(arg).reduce(db.cbTagCollector, params);
    } else if (ion.isArray(arg)) {
        for (var i=0; i < arg.length; i++) {
            params = split(arg[i]).reduce(db.cbTagCollector, params);
        }
    }
}
function getMemo() {
    return {ands: [], nots: []};
}
function split(string) {
    return string.trim().toLowerCase().split(/\s+/);
}
// This just loops, matches and returns without knowing anything about it.
function finder(db, params) {
    var results = new RarityTable(ion.identity, false);
    for (var i=0, len = db.models.length; i < len; i++) {
        var model = db.models[i];

        // tag matching is common to all items, so it's handled internally by
        // the db class. Database sub-classes can implement a matches() method
        // to handle other kinds of criteria. matches() is a no-op for the
        // base Database implementation.
        if (matchesTags(params.tags, model) && db.matches(params, model)) {
            results.add(model.frequency, model);
        }
    }
    return results;
}
function matchesTags(terms, model) {
    // Star is not necessary. If you pass no terms in, it still matches.
    var result = ((terms.ands.length === 1 && terms.ands[0] === "*") ||
        ((ion.intersection(model.tags, terms.ands).length === terms.ands.length) &&
        (ion.intersection(model.tags, terms.nots).length === 0))
    );
    if (!result && terms.or) {
        return matchesTags(terms.or, model);
    }
    return result;
}

module.exports = ion.define({
    /**
     * A basic models database that provides a pretty complete ability to search for models
     * by their tags.
     *
     * Your model specs that you register with the db can include string tags, such as
     * "ElectricalEngineering" or "common", but these tags (which are usually declared over and
     * over in your models specs) quickly increase your JS file size.
     *
     *      // kinda bad
     *      db.register("coffee cup!1!.5!common house br");
     *
     * If you provide an array of tags in the constructor for `Database` or one of its
     * subclasses, then you can refer to those tags by their index in the same array, which
     * reduces the size of data files.:
     *
     *      // potentially better
     *      var db = new ItemDatabase(['uncommon','common','house','br']);
     *      db.register("coffee cup!1!.5!1 3 4");
     *
     * @class ion.db.Database
     * @constructor
     *
     * @param tags {Array} an array of tags
     */
    init: function(tags, strategy) {
        this.models = [];
        this.lookupArray = tags || [];

        // TODO: I can't see why this isn't in the db functionality, why is it a public member of a database?
        this.cbTagCollector = function(memo, tag) { // the last two arguments are never passed to this method..
            if (tag === "|") {
                var newMemo = getMemo();
                memo.or = newMemo;
                return newMemo;
            }
            // If a lookup array has been provided, then the tags are given as indexes into that array,
            // not as the tag strings themselves. For saving space in data files. However, I don't understand
            // why this is in a function that is called for queries, rather than in the registration method
            // itself... ?
            if (this.lookupArray) {
                tag = this.lookupArray[parseInt(tag,10)] || tag;
            }
            if (tag.charAt(0) === "-") {
                memo.nots.push(tag.substring(1));
            } else {
                memo.ands.push(tag);
            }
            return memo;
        }.bind(this);
    },
    /**
     * @for ion.db.Database
     * @method matches
     *
     * @param params {Object} conditions to match (tags are handled by the base class,
     *      but sub-classed DBs can look at other conditions).
     * @param model {ion.models.Model} the model object to examine (will be the type
     *      handled by the specific database implementation).
     * @return {Boolean} true if it matches, false otherwise
     */
    matches: ion.identity,
    /**
     *  Register models with the database. The exact arguments and format varies by the
     *  type of model (different models implement this with different subclasses).
     *
     *  @for ion.db.Database
     *  @method register
     *
     */
    register: ion.identity,
    /**
     * Find a single model in this database. The parameters object can include any query
     * parameters that are supported by a particular database (e.g. "minValue" for the
     * item database). All databases support tag queries.
     *
     * @for ion.db.Database
     * @method find
     *
     * @param [params] {Object}
     *      @param tags {String} tags to match
     * @return {ion.models.Model} a single model object that matches, returned according
     *      to its frequency
     */
    find: function(params) {
        return this.findAll(params).get();
    },
    /**
     * Find all models that match in the database, returned in a `ion.tables.RarityTable`
     * instance. The parameters object can include any query parameters that are supported
     * by a particular database (e.g. "minValue" for the item database). All databases support
     * tag queries.
     *
     * @for ion.db.Database
     * @method findAll
     *
     * @param [params] {Object}
     *      @param tags {String} tags to match
     * @return {ion.tables.RarityTable} all matching models in a rarity table.
     */
    findAll: function(params) {
        if (ion.isString(params) || ion.isArray(params)) {
            params = {tags: params};
        }
        params.tags = parseQuery(this, params.tags);
        return finder(this, params);
    }
});
