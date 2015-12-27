(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.atomic = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var lib = {};

var ion = require('./ion');
ion.extend(lib,  ion);
ion.extend(lib, {
    version: '1.0.0',
    Builder: require('./builder')
});
lib.db = {
    Database: require('./db/database'),
    EncounterDatabase: require('./db/encounter_database'),
    ItemDatabase: require('./db/item_database'),
    ProfessionDatabase: require('./db/profession_database'),
    StoreDatabse: require('./db/store_database')
};
lib.tables = {
    Table: require('./tables/table'),
    HashTable: require('./tables/hash_table'),
    RarityTable: require('./tables/rarity_table')
};
lib.models = {
    Bag: require('./models/bag'),
    Character: require('./models/character'),
    Family: require('./models/family'),
    Gang: require('./models/gang'),
    IonSet: require('./models/ion_set'),
    Item: require('./models/item'),
    Model: require('./models/model'),
    Name: require('./models/name'),
    Profession: require('./models/profession'),
    Relationship: require('./models/relationship'),
    Store: require('./models/store'),
    Weather: require('./models/weather')
};
lib.dice = require('./dice/dice');

lib.createAppearance = require('./generators/appearance');
lib.createCharacterName = require('./generators/character_name');
lib.createCollectible = require('./generators/memorabilia');
lib.createCorporateName = require('./generators/corporate_name');
lib.createStore = require('./generators/store');
lib.createWeather = require('./generators/weather');

ion.extend(lib, require('./generators/bag'));
ion.extend(lib, require('./generators/character'));
ion.extend(lib, require('./generators/data'));
ion.extend(lib, require('./generators/family'));
ion.extend(lib, require('./generators/gang'));
ion.extend(lib, require('./generators/memorabilia'));
ion.extend(lib, require('./generators/place_name'));
ion.extend(lib, require('./generators/reading'));
ion.extend(lib, require('./generators/relationships'));
ion.extend(lib.models, require('./models/lib'));

// exports in Browserify as window.atomic
module.exports = lib;
},{"./builder":2,"./db/database":3,"./db/encounter_database":4,"./db/item_database":5,"./db/profession_database":6,"./db/store_database":7,"./dice/dice":8,"./generators/appearance":9,"./generators/bag":10,"./generators/character":11,"./generators/character_name":12,"./generators/corporate_name":13,"./generators/data":14,"./generators/family":15,"./generators/gang":16,"./generators/memorabilia":17,"./generators/place_name":18,"./generators/reading":19,"./generators/relationships":20,"./generators/store":21,"./generators/weather":22,"./ion":23,"./models/bag":25,"./models/character":26,"./models/family":27,"./models/gang":28,"./models/ion_set":29,"./models/item":30,"./models/lib":31,"./models/model":32,"./models/name":33,"./models/profession":34,"./models/relationship":35,"./models/store":36,"./models/weather":37,"./tables/hash_table":38,"./tables/rarity_table":39,"./tables/table":40}],2:[function(require,module,exports){
var ion = require('./ion');

// throws lots of errors in strict mode jshint, doesn't like this style of (legal) code

var map = Array.prototype.map;

/**
 * Passes each element of the array to the function, which is passed three parameters:
 * the builder, the item in the list, and the item's index in the list.
 * @example
 *     builder(list, function(b, item, index) {
 *         b("#"+index + " " +item.name);
 *     });
 *
 * @method builder
 * @param array {Array}
 * @param func {Function}
 * @chainable
 */
function each(array, func) {
    var oldContext = this.context;
    (array || []).forEach(function(item, index) {
        this.context = item;
        func.call(this.context, this, item, index);
    }, this);
    this.context = oldContext;
}
/**
 * Appends the string. If there are additional values appended afterwards, they
 * are interpolated as if the string was a format string (see `ion.format()`).
 *
 * @method builder
 * @param string {String}
 * @chainable
 */
function format() {
    if (arguments.length === 1) {
        this.str += arguments[0];
    } else if (arguments[1]) {
        this.str += ion.format.apply(this.context, arguments);
    }
}
/**
 * If the expression is true, execute the true function, otherwise execute the
 * false function, in either case, the function will be passed one parameter:
 * the builder.
 * @example
 *     builder(!!this.parent, function(b) {
 *         b("Only added if this.parent was present");
 *     }, function(b) {
 *         b("Only added if this.parent was NOT present");
 *     });
 *
 * @method builder
 * @param expr {Boolean}
 * @param trueFn {Function}
 * @param falseFn {Function}
 * @chainable
 */
function either(expr, trueFn, falseFn) {
    if (expr) {
        trueFn.call(this.context, this);
    } else {
        falseFn.call(this.context, this);
    }
}
/**
 * If the expression is true, execute the function. The function is passed one
 * parameter: the builder.
 * @example
 *     builder(!!this.parent, function(b) {
 *         b("Only added if this.parent was present");
 *     });
 *
 * @method builder
 * @param expr {Boolean}
 * @param func {Function}
 * @chainable
 */
function when(expr, func) {
    if (expr) {
        func.call(this.context, this);
    }
}
/**
 * Adds an HTML tag, and then calls the supplied function to create
 * content nested in the tag. The function is passed one argument:
 * the builder.
 * @example
 *     builder("p", {class: "person"}, function(b) {
 *         b(character.toString();
 *     });
 *
 * @method builder
 * @param name {String} the tag name
 * @param attrs {Object} name/value attribute pairs
 * @param func {Function} a callback function
 * @chainable
 */
function tag(name, attrs, func) {
    this.str += "<"+name;
    for (var attr in attrs) {
        this.str += ' '+attr+'="'+attrs[attr]+'"';
    }
    this.str += ">";
    func.call(this.context, this);
    this.str += "</"+name+">";
}
/**
 * Adds an HTML tag, and then calls the supplied function to create
 * content nested in the tag. The function is passed one argument:
 * the builder.
 * @example
 *     builder("p", {class: "person"}, character.toString());
 *
 * @method builder
 * @param name {String} the tag name
 * @param attrs {Object} name/value attribute pairs
 * @param string {String} a string to add as the content of the tag
 * @chainable
 */
function simpletag(name, attrs, string) {
    this.str += "<"+name;
    for (var attr in attrs) {
        this.str += ' '+attr+'="'+attrs[attr]+'"';
    }
    this.str += ">"+string+"</"+name+">";
}
/**
 * If the expression evaluates as true, appends the string.
 * @example
 *     builder(!!this.parent, "Only added if this.parent was present");
 *
 * @method builder
 * @param expr {Boolean}
 * @param string {String}
 * @chainable
 */
function append(expr, string) {
    if (expr) {
        this.str += string;
    }
}
/**
 * Add the string, pluralized.
 * @example
 *     builder("plum", 3).toString()
 *     => "3 plums"
 *
 * @method builder
 * @param string {String}
 * @param count {Number}
 * @chainable
 */
function plural(string, count) {
    this.str += ion.pluralize(string, count);
}
function toString() {
    return this.str;
}

/**
 * This constructor returns a function that can be called with many different parameter
 * signatures to create toString() and toHTML() output (these different parameters are
 * documented as different "methods").
 * @example
 *     var b = ion.Builder();
 *     b("p", {class: 'foo'}, "Some text in the paragraph tag.");
 *     b.toString();
 *     => "<p class='foo'>Some text in the paragraph tag.</p>");
 *
 * @class atomic.Builder
 */
module.exports = function(ctx) {
    if (!ctx) {
        throw new Error("No context obj to Builder");
    }
    var bldr = function() {
        var arglist = map.call(arguments, function(arg) {
            if (arg instanceof Array) return 'a';
            return (typeof arg).substring(0,1);
        }).join('');
        switch(arglist) {
            case 'af': each.apply(bldr, arguments); break;
            case 'bf': when.apply(bldr, arguments); break;
            case 'bff': either.apply(bldr, arguments); break;
            case 'bs': append.apply(bldr, arguments); break;
            case 'sof': tag.apply(bldr, arguments); break;
            case 'sos': simpletag.apply(bldr, arguments); break;
            case 'sn': plural.apply(bldr, arguments); break;
            default: format.apply(bldr, arguments);
        }
        return bldr;
    };
    bldr.context = ctx;
    bldr.str = "";
    bldr.toString = toString;
    return bldr;
};

},{"./ion":23}],3:[function(require,module,exports){
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
     * @example
     *      // potentially better
     *      var db = new ItemDatabase(['uncommon','common','house','br']);
     *      db.register("coffee cup!1!.5!1 3 4");
     *
     * @class atomic.db.Database
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
     * @for atomic.db.Database
     * @method matches
     *
     * @param params {Object} conditions to match (tags are handled by the base class,
     *      but sub-classed DBs can look at other conditions).
     * @param model {atomic.models.Model} the model object to examine (will be the type
     *      handled by the specific database implementation).
     * @return {Boolean} true if it matches, false otherwise
     */
    matches: ion.identity,
    /**
     *  Register models with the database. The exact arguments and format varies by the
     *  type of model (different models implement this with different subclasses).
     *
     *  @for atomic.db.Database
     *  @method register
     *
     */
    register: ion.identity,
    /**
     * Find a single model in this database. The parameters object can include any query
     * parameters that are supported by a particular database (e.g. "minValue" for the
     * item database). All databases support tag queries.
     *
     * @for atomic.db.Database
     * @method find
     *
     * @param [params] {Object}
     * @param [params.tags] {String} tags to match
     * @return {atomic.models.Model} a single model object that matches, returned according
     *      to its frequency
     */
    find: function(params) {
        return this.findAll(params).get();
    },
    /**
     * Find all models that match in the database, returned in a `atomic.tables.RarityTable`
     * instance. The parameters object can include any query parameters that are supported
     * by a particular database (e.g. "minValue" for the item database). All databases support
     * tag queries.
     *
     * @for atomic.db.Database
     * @method findAll
     *
     * @param [params] {Object}
     * @param [params.tags] {String} tags to match
     * @return {atomic.tables.RarityTable} all matching models in a rarity table.
     */
    findAll: function(params) {
        if (ion.isString(params) || ion.isArray(params)) {
            params = {tags: params};
        }
        params.tags = parseQuery(this, params.tags);
        return finder(this, params);
    }
});

},{"../ion":23,"../tables/rarity_table":39}],4:[function(require,module,exports){
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
},{"../ion":23,"./database":3}],5:[function(require,module,exports){
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
},{"../ion":23,"../models/item":30,"./database":3}],6:[function(require,module,exports){
var ion = require('../ion');
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

module.exports = ion.define(Database, {
    /**
     *
     * @class atomic.db.ProfessionDatabase
     * @extends atomic.db.Database
     *
     * @constructor
     * @param tags {Array} an array of tags
     */
    init: function(params) {
        Database.call(this, params);
    },
    /**
     * Register a profession. Once the professions are registered, they can be found by their
     * tags by searching the database. The names of the profession are also added as tags,
     * so "Coast Guard" (as a profession name) could be found with the tag `CoastGuard`.
     *
     * Each profession has two parameters that are passed in as a couple. The first is the
     * spec described below; the second is a post-training function that may be called to
     * do profession-specific alteration of the character. This is a string that is interpreted
     * as the body of a function that is passed one parameter: `c` for the character object..
     *
     *     // Tags were registered with db.registerTags(), so they can be referenced
     *     // by index, either base-10 or base-36.
     *     db.register(atomic.models.Profession,
     *       "Doctor!46!4d 4h 4i 2u 3r!2 5f 21 2r 2s", "c.honorific = 'Doctor';",
     *     );
     *
     * **Specification**
     *
     * `name1; name2!seed traits!supplemental traits!tags`
     *
     * Seed traits are traits that members of the profession will always have to some degree
     * or another. The supplemental traits are other qualities that may be picked up during
     * participation in the profession. Finally, tags may be associated with the profession.
     * The first tag must always be `common`, `uncommon` or `rare`.
     *
     * @method register
     * @for atomic.db.ProfessionDatabase
     *
     * @param class {atomic.models.Profession} a profession class or subclass that implements
     *      game-specific training for a character.
     * @param spec {String} one or more strings specifying professions to include.
     * @param function {String} function body of a post-training processing method.
     */
    register: function() {
        var Clazz = arguments[0];

        for (var i=1, len = arguments.length; i < len; i += 2) {
            var parts = arguments[i].split('!'),
                names = parts[0].trim().split(/\s*;\s*/),
                seeds = parseTags(this, parts[1]),
                traits = parseTags(this, parts[2]),
                tags = parseTags(this, parts[3]),
                freq = tags.shift(),
                func = arguments[i+1] ? new Function("c", arguments[i+1]) : ion.identity;

            // So you can search for professions by name (converted to tags)
            for (var j=0; j < names.length; j++) {
                tags[tags.length] = ion.toTag(names[j]);
            }
            this.models[this.models.length] = new Clazz({
                names: names, tags: tags, seeds: seeds, supplements: traits, postprocess: func, frequency: freq
            });
        }
    }
});

},{"../ion":23,"./database":3}],7:[function(require,module,exports){
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

},{"../ion":23,"../models/model":32,"./database":3}],8:[function(require,module,exports){
"use strict";

var ion = require('../ion');

function sum(dice) {
    dice.value = [].reduce.call(dice, function(sum, die) { return sum + die.value; }, 0);
}

var Die = ion.define({
    /**
     * ***If you want to roll some dice to get a number, use the `atomic.roll()` utility method.
     * It is simpler and more flexible.***
     *
     * If you are modeling a game where you need to record the value of each
     * die rolled, you will need to model each individual die, and that is
     * the purpose of this class. It models a die with a number of faces and
     * a color. The die is always oriented such that one face is "up", or
     * the selected value of the die.
     *
     * Rolling changes this face up side, randomly, as you'd expect if you
     * rolled a die.
     *
     * @class atomic.dice.Die
     * @constructor
     * @param faces {Number} The number of faces on a white die
     * @param [color=white] {String} The color of the die
     */
    init: function(faces, color) {
        /**
         * The number of polyhedral faces on the die.
         * @property {Number} faces
         */
        this.faces = faces;
        /**
         * The color of the die.
         * @property {String} [color="white"]
         */
        this.color = color;
        /**
         * The value of the face up side of the die.
         * @property {Number} value
         */
        this.roll();
    },
    /**
     * Roll the die
     *
     * @method roll
     * @return {Number} the new face of the die after rolling
     */
    roll: function() {
        this.value = ion.roll(this.faces);
        return this.value;
    },
    /**
     * The symbol to represent the face up of the die
     *
     * @method symbol
     * @return {String} the symbol for the face up of the die
     */
    symbol: function() {
        return this.value.toString();
    },
    toString: function() {
        return ion.format("[{0} {1}]", this.color, this.symbol());
    }
});

/**
 * Models a fudge die. This is a six-sided die with two blank sides, two "+"
 * symbols, and two "-" symbols on its faces. These translate into the values
 * -1, 0 or 1.
 * @class atomic.dice.FudgeDie
 * @extends atomic.dice.Die
 */
var FudgeDie = ion.define(Die, {
    /**
     * @class atomic.dice.FudgeDie
     * @constructor
     */
    init: function(color) {
        Die.call(this, 6, color);
    },
    roll: function() {
        this.value = ion.roll(3)-2;
        return this.value;
    },
    symbol: function() {
        return (this.value === -1) ? "-" : ((this.value === 1) ? "+" : " ");
    }
});

/**
 * ***If you want to roll some dice to get a number, use the `ion.roll()` utility method.
 * It is simpler and more flexible.***
 *
 * A set of dice. Helps to roll an entire set of dice, get the sum of the
 * dice, and so forth.
 *
 * @class atomic.dice.Dice
 * @constructor
 * @param [dice]* {atomic.dice.Die} One or more dice to include in this set of dice.
 * Or, can be an array of dice or dice objects. (Correct?)
 */
var Dice = ion.define({
    init: function () {
        this.length = 0;
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg instanceof Dice || ion.isArray(arg)) {
                for (var j = 0; j < arg.length; j++) {
                    this[this.length++] = arg[j];
                }
            } else {
                this[this.length++] = arguments[i];
            }
        }
        sum(this);
    },
    /**
     * Add a die to this set of dice.
     *
     * @method push
     * @param die {atomic.dice.Die} A die to add to the set of dice.
     */
    push: function (die) {
        this[this.length++] = die;
        sum(this);
    },
    /**
     * Roll this set of dice.
     *
     * @method roll
     * @return {Number} The new sum of all the die after rolling
     */
    roll: function () {
        [].map.call(this, function (obj) {
            return obj.roll();
        });
        sum(this);
        return this.value;
    },
    /**
     * @method toString
     * @return {String} A string describing the dice rolled.
     */
    toString: function () {
        return [].map.call(this, function (obj) {
            return obj.toString();
        }).join(' ');
    }
});

module.exports.Die = Die;
module.exports.FudgeDie = FudgeDie;
module.exports.Dice = Dice;
},{"../ion":23}],9:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Table = require('../tables/table');
var RarityTable = require('../tables/rarity_table');
var createCharacterName = require('../generators/character_name');

// Not thrilled with these, just because they're not easily role-played.
/*
 var adjectives = [ "Addict", "Agoraphobic", "Ambitious", "Anarchist",
 "Annoying", "Apologetic", "Argumentative", "Arrogant",
 "Authoritarian", "Bad Loser", "Beatnik", "Bitter",
 "Bleeding Heart", "Blind Follower", "Blunt", "Born Again",
 "Brainiac", "Brave", "Brutally Honest", "Buffoon", "Busybody",
 "Cautious", "Charlatan", "Civilised", "Claustrophobic", "Clumsy",
 "Cold", "Competitive", "Complainer", "Confident", "Conformist",
 "Conniver", "Considerate", "Cool Under Fire", "Cowardly",
 "Creative", "Curious", "Curmudgeon", "Cynical", "Defeatist",
 "Determined", "Devil's Advocate", "Diplomatic", "Disorganised",
 "Distracted", "Drunk", "Drunkard", "Easy Going", "Efficient",
 "Egotistical", "Ends Justifies the Means",
 "Fascinated by the Exotic", "Flirt", "Forgiving ", "Freeloader",
 "Friendly", "Generous", "Gentle", "Good Samaritan", "Gossip",
 "Greedy", "Gregarious", "Grouchy", "Happy", "Happy-Go-Lucky",
 "Hard of Hearing", "Hardened", "Hates Robots", "Hedonist",
 "Honest", "Hopeless Romantic", "Hot Tempered", "Idealistic",
 "Ignorant", "Impatient", "Impulsive", "Intellectual",
 "Know-It-All", "Knucklehead", "Lazy", "Liar", "Loud Mouth",
 "Loyal", "Machiavellian", "Manic-Depressive", "Manipulator",
 "Mischievous", "Modest", "Naive", "Neatnik", "Nervous",
 "Non-Committal", "Nosy", "Optimist", "Overanalytical", "Pacifist",
 "Paranoid", "Perfectionist", "Pessimist", "Philosophical",
 "Practical", "Principled", "Progressive", "Proud", "Rationalist",
 "Rebel", "Rebel without a Clue", "Reckless", "Relaxed",
 "Reluctant", "Sarcastic", "Scatter Brain",
 "Seen a Lot of Strange Stuff", "Selfish", "Sensitive", "Serious",
 "Sheltered Upbringing", "Short Tempered", "Show Off", "Shy",
 "Skeptic", "Slapdash", "Slob", "Sour Puss", "Stubborn",
 "Stutterer", "Superstitious", "Suspicious", "Talkative",
 "Tattletale", "Technophobic", "Teetotaler", "Thespian",
 "Traditionalist", "Treacherous", "Trusting", "Uncertain",
 "Unflappable", "Unpredictable", "Unprincipled", "Vengeful",
 "Wallflower", "Weak Willed", "Wisecracker" ];
 */

// TODO: Multiple tattoos, adjectives, etc.
var sailorTats = [
    'a sailing ship with the words "Homeward Bound" below it',
    'an anchor'
];
var milTats = [
    'an American {flag|eagle}',
    'an eagle carrying an American flag'
];
var tats = [
    'a skull{| in flames| with wings| and crossbones}',
    'a chinese dragon',
    'a {black panther|tiger|lion|wolf}',
    'a mermaid',
    'a snake wrapped around a {cross|rose}',
    'a pair of dice',
    'a four leaf clover with the word "lucky" across it',
    'a heart with the name "{name}" across it',
    'the name "{name}"',
    '{a crystal|an eight} ball',
    'a {star|cross|phoenix|lion|tiger|crown|fish|scorpion|lucky clover|yin-yang symbol}',
    'an {angel|anchor|ankh}',
    'a heart and dagger',
];
var maleTats = [
    'a{| blonde| brunette| redhead} pin-up {girl|cowgirl}',
    'a pin-up girl {in a sailor\'s suit|in a WAC uniform|in a space suit}',
    'a woman on a clamshell'
];
var femaleTats = [
    'a {butterfly|swallow|dragonfly|rose|fairy|heart|lotus flower}',
    'two intertwined roses'
];
var injuries = [
    'missing a tooth',
    'missing {possessive} {left|right} {ear|foot|hand}',
    'has been burnt on {possessive} {left|right} arm',
    'walks with a limp',
    'wears an eyepatch',
    'cast on {left|right} arm',
    'scar on {possessive} {left|right} arm',
    'scar on {left|right} side of {possessive} {leg|torso|face}'
];
var prosthetics = [
    'hook for a {right|left} hand',
    'artificial {hand|leg|arm}',
    'glass eye'
];
var behaviors = [
    "will {be very loyal to|betray or abandon} the players in a crisis",
    "will trade generously with players",
    "will demand compensation for minor tasks",
    "if angered, will drag the player group into unnecessary fights",
    "will fight to the death if necessary",
    "if left alone, will {drink|gamble} away any money {personal} has",
    "will expect {a share in profits|payment} to join the group",
    "smokes when {personal} can get them",
    "values fine wines and liquors",
    "chews gum when {personal} can get it"
];

// "has a child but avoids the responsibility of being a parent"
// "will only stay with the party long enough to save money to travel {out west|east}"
// "if included as a member of the group, will sacrifice or bear any burden"
// "will start a fight with anyone not pulling their own weight"
// "hates off-road travel and will fight to avoid it"
// "always lobbies for one more scavenging trip, just to be sure"

var statureTable = new Table()
    .add(10, "tall stature")
    .add(10, "short stature")
    .add(5, "short and heavy-set")
    .add(5, "tall and heavy-set")
    .add(70, null);

// Adjusts a smidge for Hispanic hair color, below
var hairColor = new Table()
    .add(15, "black")
    .add(50, "brown")
    .add(15, "blond")
    .add(3, "red")
    .add(10, "auburn (brownish-red)")
    .add(7, "chestnut (reddish-brown)");

// Any long hair?
var maleHairStyle = new Table()
    .add(30, "{0} crew cut haircut")
    .add(25, "{0} side part haircut")
    .add(25, "{0} ivy league haircut")
    .add(20, "{0} pompadour haircut");

// Thank god for Wikipedia:
// http://en.wikipedia.org/wiki/Hairstyles_in_the_1950s
// Many of the women's hairstyles == short hair, with crazy names and slight alterations
var femaleHairStyle = new RarityTable()
    .add('common', "bobbed {0} hair")
    .add('common', "short {curly|straight} {0} hair")
    .add('uncommon', "long {curly|wavy|straight} {0} hair, usually worn {in a ponytail|under a scarf|in a bun}")
    .add('uncommon', "{0} pageboy haircut")
    .add('rare', "long {curly|wavy|straight} {0} hair")
    .add('rare', "cropped {0} hair");

function hairStyle(character, statements) {
    var color = hairColor.get(), string = null;
    if (character.race === "hispanic" && color === "blond") {
        color = ion.random(["brown","black"]);
    }
    if (character.age > 40 && ion.test(character.age)) {
        color = ion.random(["gray","silver","white"]);
    }
    // So, I wanted dudes with mohawks.
    if (character.is('low') && character.male && character.age < 30 && ion.test(25)) {
        string = "{0} mohawk";
    } else {
        string = (character.male) ? maleHairStyle.get() : femaleHairStyle.get();
    }
    statements.push(ion.resolve(string, color));
}

function stature(character, app) {
    var stat = statureTable.get();
    if (stat) {
        app.push(stat);
    }
}

function markings(character, app) {
    // A little over-elaborated.
    var chanceGlasses = character.has('glasses') ? 70 : 10;
    if (ion.test(chanceGlasses)) {
        if (ion.test(20)) {
            app.push(character.male ? "wears browline glasses" : "wears cat eye glasses");
        } else if (ion.test(30)) {
            app.push("wears horn-rimmed glasses");
        } else {
            app.push("wears glasses");
        }
    }

    // Totally heterosexist. Write something different and send to me.
    // Also, this is out of all proportion to the value it brings to the table...
    var chanceTattoos = (character.has('tattoos') ||
    character.has('military:tattoos') ||
    character.has('sailor:tattoos')) ? 30 : 5;

    chanceTattoos += (character.male) ? 15 : 0;
    if (ion.test(chanceTattoos)) {
        var tattoo = null,
            name = createCharacterName({gender: character.male ? "female" : "male"}).given;

        if (character.has('military:tattoo') && ion.test(80)) {
            tattoo = milTats;
        } else if (character.has('sailor:tattoo') && ion.test(80)) {
            tattoo = sailorTats;
        } else if (character.male && ion.test(20)) {
            tattoo = maleTats;
        } else if (!character.male && ion.test(20)){ // TODO ion.test(20, !character.male)
            tattoo = femaleTats;
        } else {
            tattoo = tats;
        }
        tattoo = ion.resolve(tattoo, {name: name});

        /* TODO?
         var string = ion.resolve("has a tattoo of {0} on {1} {2} {3}",
         tattoo, character.possessive, ['left', 'right'], ['shoulder','bicep','forearm','arm']);
         */
        var string = ion.format("has a tattoo of {0} on {1} {2} {3}",
            tattoo,
            character.possessive,
            ion.random(['left', 'right']),
            ion.random(['shoulder','bicep','forearm','arm']));
        app.push(string);
    }

    var injuryChance = character.has('injuries') ? 15 : 3;
    if (ion.test(injuryChance)) {
        app.push(ion.resolve(injuries, character));
    }

    var prosthChance = character.has('prosthetics') ? 5 : 1;
    if (ion.test(prosthChance)) {
        app.push(ion.resolve(prosthetics, character));
    }
}
function adjective(character, statements) {
    // Do not like the adjectives. Will only use behaviors, and greatly expand them.
    // Adjectives are not enough to describe how an NPC will act in a game.
    if (ion.test(30)) {
        statements.push(ion.resolve(behaviors, character));
    } /*else {
     statements.push(ion.random(adjectives));
     }*/
}

/**
 * Describe a character's appearance and behavior. This description will be different
 * each time the character is passed to this function.
 * @example
 *     atomic.createAppearance(character)
 *     => "Long brown hair, short stature"
 *
 * @static
 * @method createAppearance
 * @for atomic
 *
 * @param character {atomic.models.Character} The character to describe.
 * @return {String} A description of the appearance and behavior of the character
 */
module.exports = function(character) {
    if (!character) { throw new Error("Character required"); }
    var app = [],
        statements = [];
    hairStyle.call(this, character, app);
    stature.call(this, character, app);
    markings.call(this, character, app);
    adjective.call(this, character, statements);

    return [app, statements].reduce(function(array, subarray) {
        if (subarray.length) {
            array.push(ion.sentenceCase(subarray.join(', ')));
        }
        return array;
    }, []).join('. ');
};

},{"../generators/character_name":12,"../ion":23,"../tables/rarity_table":39,"../tables/table":40}],10:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Bag = require('../models/bag');
var IonSet = require('../models/ion_set');
var db = require('./data').itemDatabase;

var containers = {
    "Safe": {
        desc: ["Safecracking+1", "Safecracking", "Safecracking-1", "Safecracking-2", "Safecracking-3", "Safecracking-4"],
        query: {
            totalValue: "3d8+15",
            tags: "cash | firearm -scifi | secured | luxury -food",
            maxEnc: 10,
            fillBag: false
        }
    },
    "Lockbox": {
        desc: ["Unlocked", "Lockpicking", "Lockpicking-1", "Lockpicking-2"],
        query: {
            totalValue: "2d6+2",
            tags: "cash | secured | firearm -scifi -br | asetofkeys | luxury -food",
            maxEnc: 3,
            fillBag: true
        }
    },
    "Trunk": {
        desc: ["Unlocked", "Lockpicking+2, can be broken open", "Lockpicking+3, can be broken open", "Lockpicking+4, can be broken open"],
        query: {
            totalValue: "2d6",
            tags: "clothing | armor | firearm -scifi -br | unique",
            maxEnc: 10,
            fillBag: false
        }
    },
    "Cash Register": {
        desc: ["easily opened"],
        query: {
            totalValue: "6d50/100",
            tags: "cash",
            fillBag: true
        }
    },
    "Cash On Hand": {
        desc: ["under the counter", "in a lockbox"],
        query: {
            totalValue: "20+4d6",
            tags: "currency -cash | currency",
            fillBag: true,
            maxValue: 7
        }
    },
    "Clothes Closet": {
        desc: ["no lock"],
        query: {
            totalValue: "1d8+5",
            tags: "clothing -research -industrial -military",
            fillBag: false
        }
    }
};
// A container of containers.
// "vault"

var containerTypes = Object.keys(containers).sort();

// Uses the existing API to get the right frequency of objects, but can lead to many duplicates.
// of all the fill* methods, this is the only one that respects all the createBag() options,
// the rest are specific to creating a believable kit.

function fill(bag, opts) {
    var bagValue = opts.totalValue;
    while (bagValue > 0) {
        // Take the the max value or the bag value, unless they are less than the min value,
        // then take the min value. For that reason, the item's value has to be tested below
        // to verify it is less than the remaining bag value (if it's not, just quit and return
        // the bag).
        opts.maxValue = Math.max(Math.min(opts.maxValue, bagValue), opts.minValue);

        // Because maxValue changes every query, we can't cache any of this.
        var item = db.find(opts);
        if (item === null || item.value > bagValue) {
            return bag;
        }
        bag.add(item);
        bagValue -= item.value;
    }
    return bag;
}
function getClusterSpread(value) {
    switch(value) {
        case "low":
            return ion.roll("2d3+5"); // 7-11
        case "medium":
            return ion.roll("2d3+2"); // 4-8
        case "high":
            return ion.roll("1d3+2"); // 3-5
    }
}
function getClusterCount(value) {
    switch(value) {
        case "low":
            return ion.roll("1d3*2"); // 2-6
        case "medium":
            return ion.roll("(1d3*2)+2"); // 3-8
        case "high":
            return ion.roll("(1d3*2)+4"); // 6-10
    }
}
// Try and create duplicates on purpose
/*
 function stockpile(bag, opts) {
 var bagValue = opts.totalValue;
 while (bagValue > 0) {
 var count = cluster(opts.cluster);
 // Take the the max value or the bag value, unless they are less than the min value,
 // then take the min value. For that reason, the item's value has to be tested below
 // to verify it is less than the remaining bag value (if it's not, just quit and return
 // the bag).
 opts.maxValue = Math.max(Math.min(opts.maxValue, bagValue), opts.minValue);

 // Because maxValue changes every query, we can't cache any of this.
 var item = db.find(opts);
 if (item === null || (item.value*count) > bagValue) {
 return bag;
 }
 bag.add(item, count);
 bagValue -= (item.value * count);
 }
 return bag;
 }
 */
function fillCurrency(bag, amount) {
    if (amount > 0) {
        var currencies = db.findAll({tags: 'currency', maxValue: amount});
        while(amount > 0) {
            var currency = currencies.get();
            if (currency === null) {
                return;
            }
            bag.add(currency);
            amount -= currency.value;
        }
    }
}
function kitWeapon(bag, kitTag) {
    var weaponType = (ion.test(60)) ? "firearm" : "melee";
    var weapon = db.find([weaponType, kitTag, "-br"]);
    if (weapon) {
        bag.add(weapon);
        if (weapon.is('firearm')) {
            var ammo = db.find(["ammo", weapon.typeOf('ammo'), "-bundled"]);
            if (ammo) {
                bag.add(ammo, ion.roll("4d4"));
            }
            if (ion.test(20)) {
                weapon = db.find(["melee", kitTag, "-scifi"]);
                if (weapon) {
                    bag.add(weapon);
                }
            }
        }
    }
}
function kitToCount(bag, count, tagsArray) {
    for (var i=0; i < count; i++) {
        var item = db.find(ion.random(tagsArray));
        if (item) {
            bag.add( item );
        }
    }
    return bag;
}
function kitUniques(bag, count, tags) {
    var set = new IonSet();
    for (var i=0; i < count; i++) {
        var item = db.find(tags);
        if (item) {
            set.add( item );
        }
    }
    return setToBag(bag, set);
}
function setToBag(bag, set) {
    set.toArray().forEach(function(item) {
        bag.add(item);
    });
    return bag;
}
function kitChanceOfFill(bag, gender, kitTag) {
    return function(chance, count, tags) {
        if (ion.test(chance)) {
            kitUniques(bag, count, ion.format(tags, gender, kitTag));
        }
    };
}
function createParams(params) {
    params = ion.extend({}, params || {});
    params.totalValue = params.totalValue || 20;
    // TODO? ion.defB(params, "fillBag", true);
    params.fillBag = ion.isBoolean(params.fillBag) ? params.fillBag : true;
    // TODO? ion.defN(params, "minValue", 0);
    params.minValue = ion.isNumber(params.minValue) ? params.minValue : 0;
    params.maxValue = ion.isNumber(params.maxValue) ? params.maxValue : Number.MAX_VALUE;
    params.minEnc = ion.isNumber(params.minEnc) ? params.minEnc : 0;
    params.maxEnc = ion.isNumber(params.maxEnc) ? params.maxEnc : Number.MAX_VALUE;

    if (params.maxValue <= 0 || params.maxEnc <= 0 ||
        params.minValue > params.maxValue || params.minEnc > params.maxEnc) {
        throw new Error('Conditions cannot match any taggable: ' + JSON.stringify(params));
    }
    if (!ion.isUndefined(params.totalValue) && params.totalValue <= 0) {
        throw new Error("Bag value must be more than 0");
    }
    return params;
}

/**
 * Generate the possessions that would be on the person of an active NPC (e.g. out on patrol,
 * out for a night on the town, out on a raid or in the middle of criminal activity).
 *
 * @static
 * @method createKit
 * @for atomic
 *
 * @param params {Object}
 *     @param params.profession {String|atomic.models.Profession} profession name or instance
 *     @param [params.gender] {String} gender of character (male or female)
 *
 * @return {atomic.models.Bag} A bag of items on the person of that NPC
 */
module.exports.createKit = function(params) {
    var bag = new Bag(),
        kitTag = (ion.isString(params.profession)) ?
        "kit:"+params.profession : params.profession.typeOf('kit');

    kitWeapon(bag, kitTag);

    // Clothes: head, body, feet, and some accessories. By gender and profession.
    var kitFill = kitChanceOfFill(bag, params.gender, kitTag);
    kitFill(100, 1, 'body {0} {1}');
    kitFill(30, 1, 'head {0} {1}');
    kitFill(50, 1, 'coat {0} {1}');
    kitFill(30, 1, 'accessories {0} {1} -br');
    kitFill(100, 1, 'feet {0} {1}');
    kitFill(100, ion.roll("1d3-1"), '{1} -clothing -firearm -melee -br | kit:personal -br');

    // OK to have duplicates for this, even desirable (though rare).
    kitToCount(bag, ion.roll("2d3-2"), ['ration','ration','food -fresh']);

    if (bag.value() < 20) {
        fillCurrency(bag, ion.roll(20-bag.value()));
    }
    return bag;
};

/**
 * Generate a collection of items.
 * @example
 *     var bag = atomic.createBag({
 *         totalValue: 500,
 *         minValue: 10,
 *         tags: "firearm"
 *     });
 *     bag.toString()
 *     => "2 Browning Automatic Rifles, a M14 Rifle...and a pulse rifle."
 *
 * @static
 * @method createBag
 * @for atomic
 *
 * @param [params] {Object}
 *      @param [params.tags] {String} One or more query tags specifying the items in the bag
 *      @param [params.minValue] {Number}
 *      @param [params.maxValue] {Number}
 *      @param [params.minEnc] {Number}
 *      @param [params.maxEnc] {Number}
 *      @param [params.totalValue=20] {Number} The total value of the bag
 *      @param [params.fillBag=true] {Boolean} Should the bag's value be filled with
 *      currency if it hasn't been filled any other way? Usually currency has a value of
 *      1 or less, and can cover a gap otherwise caused by search criteria, but this
 *      isn't always desirable.
 */
function createBag(params) {
    params = createParams(params);
    var bag = fill(new Bag(), params);
    if (params.fillBag !== false) {
        fillCurrency(bag, params.totalValue - bag.value());
    }
    return bag;
}
module.exports.createBag = createBag;

/**
 * Like creating a bag but with many more repeated items (purposefully repeated, not
 * accidentally repeated), as if collected for a cache, shop, or storeroom. Honors the
 * `totalValue` limit (in fact will usually fall short of it), but `fillBag` will always be
 * treated as false.
 *
 * @static
 * @method createStockpile
 * @for atomic
 *
 * @param [params] {Object}
 *      @param [params.tags] {String} One or more query tags specifying the items in the bag
 *      @param [params.cluster="medium"] {String} "low", "medium" or "high". Alters the amount
 *          of stockpiling from a little to a lot.
 *      @param [params.minValue] {Number}
 *      @param [params.maxValue] {Number}
 *      @param [params.minEnc] {Number}
 *      @param [params.maxEnc] {Number}
 *      @param [params.totalValue=20] {Number} The total value of the stockpile. In practice,
 *          the stockpile will be worth less than this. Must be at least 20.
 */
module.exports.createStockpile = function(params) {
    // A very different approach where a lot of the values wouldn't even matter.
    params = createParams(params);
    params.cluster = params.cluster || "medium";
    params.fillBag = false;
    params.tags = params.tags || "";

    if (params.cluster === "none") {
        return createBag(params);
    }

    var bag = new Bag();
    var count = getClusterSpread(params.cluster);
    var tags = "-currency ".concat(params.tags);

    kitUniques(bag, count, params.tags);

    bag.entries.forEach(function(entry) {
        count = getClusterCount(params.cluster);
        bag.add(entry.item, count);
    });
    return bag;
};

/**
 * Create a bag with additional properties (representing a container of some kind, like a
 * lockbox or safe).
 *
 * @static
 * @method createContainer
 * @for atomic
 *
 * @param type {String} the container type
 * @return {atomic.models.Bag} a bag representing a container
 *
 */
// TODO: Take a params object. All methods should do this.
module.exports.createContainer = function(type) {
    if (!containers[type]) {
        type = ion.random(containerTypes);
    }
    var container = containers[type];
    var params = ion.extend({}, container.query);
    params.totalValue = ion.roll(params.totalValue);

    var bag = createBag(params);
    if (container.desc) {
        bag.descriptor = ion.format("{0} ({1})", ion.titleCase(type), ion.random(container.desc));
    }
    return bag;
};

/**
 * Get container types. One of these values is a valid type to pass to the
 * `atomic.createContainer(type)` method.
 *
 * @static
 * @method getContainerTypes
 * @for atomic
 *
 * @return {Array} an array of container types
 */
module.exports.getContainerTypes = function() {
    return containerTypes;
};

},{"../ion":23,"../models/bag":25,"../models/ion_set":29,"./data":14}],11:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Name = require('../models/name');
var Character = require('../models/character');
var db = require('./data').professionDatabase;
var createCharacterName = require('./character_name');
var createKit = require('./bag').createKit;
var createAppearance = require('./appearance');

var innate = db.find('innate'),
    histories = ["Before the collapse, was {0}", "Was {0} up until the war", "Was {0} before the war"];

function nameFromOpts(n, gender, race) {
    if (ion.isString(n)) {
        var parts = n.split(" ");
        return new Name({given: parts[0], family: parts[1]});
    } else if (n instanceof Name) {
        var newName = createCharacterName({ gender: gender, race: race});
        return ion.extend(newName, n);
    } else {
        return createCharacterName({ gender: gender, race: race});
    }
}

function createOpts(params) {
    var opts = ion.extend({}, params);
    // ion.defS(opts, "gender", ion.random(['male','female']));
    opts.gender = opts.gender || ion.random(['male','female']);
    opts.equip = (ion.isBoolean(opts.equip)) ? opts.equip : true;
    opts.race = opts.race ||  createRace();
    opts.name = nameFromOpts(opts.name, opts.gender, opts.race);
    opts.age = (ion.isNumber(opts.age)) ? ion.bounded(opts.age, 1, 100) : ion.roll("14+3d12");
    if (opts.traits) {
        opts.traits = ion.extend({}, opts.traits);
    }
    if (opts.profession) {
        opts.profession = ion.toTag(opts.profession);
    }
    if (opts.profession === 'soldier') {
        opts.profession = ion.random(['airforce','marine','army','navy'/*,'coast guard'*/]);
    }
    return opts;
}


function traitsForChild(character, opts) {
    delete character.profession;
    delete character.honorific; // this should only exist as a result of training, however.
    // make a child instead.
    if (character.age > 4) {
        innate.train(character, ion.roll("1d3-1"));
        // Calling children "attractive" gets creepy. Avoid.
        delete character.traits.Attractive;
    }
}

function traitsForAdult(character, prof, opts) {
    var startingTraitPoints = ion.sum(ion.values(opts.traits)),
        traitPoints = 8 + (~~(opts.age/10)) - startingTraitPoints;

    innate.train(character, ion.roll("2d2-1"));

    // 27 is arbitrary, it gives the character a couple of years to have had a profession.
    // For higher-status professions like doctor, cutoff is 30.
    var pre = db.find('pre -innate'),
        prestige = ion.intersection(pre.tags, ["low", "normal", "high"]),
        post = (prof) ? prof : db.find(prestige + ' post -pre -innate'),
        cutoffAge = (pre.is('high')) ? 30 : 27;

    if (post.not('pre') && character.age > cutoffAge) {

        var weight = (character.age - 10)/character.age,
            prePoints = Math.floor(traitPoints * weight),
            postPoints = traitPoints-prePoints;

        // two profession, pre/post war
        pre.train(character, prePoints);
        if (pre.names[0] !== post.names[0]) {
            var title = (character.honorific) ? character.honorific : ion.random(pre.names),
                hsy = ion.random(histories);
            character.history.push( ion.format(hsy, ion.article(title.toLowerCase())) );
        }
        delete character.honorific;
        post.train(character, postPoints);
    } else {
        // just use the post profession
        post.train(character, traitPoints);
    }
    character.profession = ion.random(post.names);
    if (opts.equip) {
        character.inventory = createKit({profession: post, gender: character.gender});
    }
}

/**
 * Get all (post-collapse) professions. These are valid values for the `atomic.createCharacter()`
 * call's {profession: [name]}.
 *
 * @static
 * @method getProfessions
 * @for atomic
 * @return {Array} array of profession names that can be used by generators
 */
module.exports.getProfessions = function() {
    return ion.profDb.findAll('post').rows.map(function(row) {
        return row.names[0];
    }, []).sort();
};

/**
 * Create a character.
 * @example
 *     atomic.createCharacter({profession: 'thief', equip: false})
 *     => character
 *
 * @static
 * @method createCharacter
 * @for atomic
 *
 * @param [params] {Object}
 *     @param [params.gender] {String} "male" or "female"
 *     @param [params.name] {String} full name (e.g. "Loren Greene")
 *     @param [params.age] {Number}
 *     @param [params.race] {String} "anglo" or "hispanic" (20% hispanic by default)
 *     @param [params.profession] {String} Name of a profession this character should have in their experience.
 *          Value can be "soldier" for any of the armed services
 *     @param [params.equip=true] {Boolean} Should an inventory be created for this character?
 *     @param [params.traits] {Object} a map of trait names to trait values. These are deducted from the traits
 *          added to the character during generation.
 * @return {atomic.models.Character} character
 */
module.exports.createCharacter = function(params) {
    var prof = null, opts = createOpts(params);

    if (opts.profession) {
        prof = db.find(opts.profession);
        if (prof === null || prof.not('post')) {
            throw new Error("Invalid profession: " +opts.profession+ " (must be post-war profession)");
        }
    }
    var character = new Character(opts);
    if (character.age < 17) {
        traitsForChild(character, opts);
    } else {
        traitsForAdult(character, prof, opts);

        // Not tailored towards children... may eventually be fixed
        character.appearance = createAppearance( character );

        // These are normally hidden for NPCs, but are available for combatant string.
        character.initiative = ion.roll("2d6") + character.trait('Agile');
        character.hp = 10 + character.trait('Tough');
    }

    // Hispanic people are likely to speak some Spanish.
    if (character.race === "hispanic") {
        character.changeTrait("Spanish", ion.nonNegativeGaussian(1.5));
    }

    return character;
};

/**
 * Select one of the available races (Anglo 80% of the time, Hispanic 20% of the time).
 * @example
 *     atomic.createRace()
 *     => "hispanic"
 *
 * @static
 * @method createRace
 * @for atomic
 *
 * @return {String} a race
 */
function createRace() {
    return (ion.test(20) ? "hispanic" : "anglo");
}
module.exports.createRace = createRace;

},{"../ion":23,"../models/character":26,"../models/name":33,"./appearance":9,"./bag":10,"./character_name":12,"./data":14}],12:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Name = require('../models/name');

// TODO? Other peoples, Asian, American Indian, that would be in the southwest.

var names = {
    "anglo male" : [ "Al", "Andy", "Arnie", "Art", "Austin", "Bart", "Beau", "Ben", "Bert", "Bob", "Brad",
        "Bradley", "Brock", "Bruce", "Bud", "Burt", "Caleb", "Calvin", "Carl", "Cecil", "Chuck", "Clayton",
        "Cliff", "Conrad", "Cooper", "Cyril", "Dakota", "Dallas", "Dalton", "Dan", "Dawson", "Dean", "Destry",
        "Don", "Doug", "Dwain", "Earl", "Ed", "Errol", "Floyd", "Frank", "Fred", "Gage", "Garth", "Gavin",
        "Gene", "Glen", "Grady", "Greg", "Gus", "Guy", "Hal", "Hank", "Harlan", "Holden", "Hoyt", "Hudson",
        "Hugh", "Huxley", "Ian", "Isaac", "Jack", "Jake", "Jason", "Jeremy", "Jerry", "Jethro", "Joe", "John",
        "Johnny", "Ken", "Kirk", "Kurt", "Kyle", "Larson", "Levi", "Lloyd", "Luke", "Lyle", "Mack", "Mark",
        "Marty", "Mason", "Matt", "Max", "Merle", "Nate", "Ned", "Neil", "Nick", "Norm", "Otis", "Pat", "Phil",
        "Ray", "Reed", "Rex", "Rick", "Rod", "Rodger", "Roy", "Russell", "Sam", "Scott", "Slim", "Stan",
        "Stratton", "Ted", "Tim", "Todd", "Tony", "Travis", "Tyler", "Vern", "Wade", "Wally", "Ward", "Wesley",
        "Will", "Wyatt" ],
    "anglo female" : [ "Ada", "Agnes", "Alice", "Amy", "Ann", "Au{b|d}rey", "Barb", "Becky", "Betty", "Bev", "Carol",
        "Cindy", "Clara", "Darla", "Diane", "Dona", "Doris", "Edith", "Edna", "Eileen", "Ella", "Ellen",
        "Emma", "Emily", "Erma", "Esther", "Ethel", "Eva", "Fay", "Flo", "Flora", "Gail", "Grace", "Gwen",
        "Hazel", "Helen", "Holly", "Ida", "Ilene", "Irene", "Iris", "Irma", "Jan", "Jane", "Janet", "Janis",
        "Jean", "Joan", "Judy", "June", "Kathy", "Kay", "Lena", "Linda", "Lois", "Lorna", "Lucy", "Mabel",
        "Mae", "Mary", "Mavis", "Nina", "Nora", "Norma", "Olga", "Pam", "Patty", "Paula", "Pearl", "Rita",
        "Rose", "Ruth", "Sally", "Sara", "Stella", "Sue", "Sybil", "Tina", "Trudy", "Velma", "Vera", "Viola",
        "Wanda", "Wilma" ],
    "hispanic male" : [ "Alonso", "Bruno", "Camilo", "Carlos", "Dante", "Diego", "Emilio", "Felipe", "Franco",
        "Iker", "Jacobo", "Javier", "Jorge", "Jose", "Juan", "Julian", "Lucas", "Luis", "Manny", "Manuel",
        "Mario", "Mateo", "Matias", "Miguel", "Pablo", "Pedro", "Rafael", "Samuel", "Sergio", "Tomas", "Elias" ],
    "hispanic female" : [ "Abril", "Alexa", "Alma", "Ana", "Ariana", "Ashley", "Bianca", "Camila", "Carla",
        "Elena", "Emilia", "Isabel", "Jimena", "Julia", "Luana", "Lucia", "Maite", "Malena", "Maria", "Mia",
        "Regina", "Renata", "Sofia", "Sophie", "Valery" ],
    "anglo" : [ "Adams", "Alexander", "Anderson", "Bailey", "Baker", "Barnes", "Barton", "Bell", "Bennett",
        "Brooks", "Brown", "Bryant", "Butler", "Campbell", "Carter", "Clark", "Cleaver", "Coleman", "Collins",
        "Cook", "Cooper", "Cox", "Davis", "Edwards", "Evans", "Flores", "Foster", "Gray", "Green", "Griffin",
        "Hall", "Harris", "Haskell", "Henderson", "Hill", "Howard", "Hughes", "Jackson", "James", "Jenkins",
        "Reed", "Richardson", "Roberts", "Robinson", "Rogers", "Ross", "Russell", "Sanders", "Scott", "Simmons",
        "Smith", "Stewart", "Taylor", "Thomas", "Thompson", "Turner", "Walker", "Ward", "Washington", "Watson",
        "White", "Williams", "Wilson", "Wood", "Wright", "Hayes" ],
    "hispanic" : [ "Aguilar", "Aguirre", "Alvarado", "Alvarez", "Avila", "Barrera", "Cabrera", "Calaveras",
        "Calderon", "Camacho", "Campos", "Cardenas", "Carrillo", "Castaneda", "Castillo", "Castro",
        "Cervantes", "Chavez", "Contreras", "Cortez", "Delacruz", "Deleon", "Diaz", "Dominguez", "Escobar",
        "Espinoza", "Estrada", "Fernandez", "Flores", "Fuentes", "Gallegos", "Garcia", "Garza", "Gomez",
        "Gonzales", "Guerra", "Guerrero", "Gutierrez", "Guzman", "Hernandez", "Herrera", "Ibarra", "Jimenez",
        "Juarez", "Lopez", "Lozano", "Macias", "Marquez", "Martinez", "Medina", "Mejia", "Melendez", "Mendez",
        "Mendoza", "Mercado", "Miranda", "Molina", "Montoya", "Morales", "Moreno", "Navarro", "Ochoa",
        "Orozco", "Ortega", "Ortiz", "Pacheco", "Padilla", "Perez", "Ramirez", "Ramos", "Reyes", "Rivera",
        "Rodriguez", "Romero", "Rosales", "Ruiz", "Salas", "Salazar", "Salinas", "Sanchez", "Sandoval",
        "Santiago", "Serrano", "Silva", "Suarez", "Torres", "Trevino", "Trujillo", "Valdez", "Valencia",
        "Vargas", "Vasquez", "Velasquez", "Velez", "Villarreal", "Zamora" ]
};
function getGivenName(gender, race) {
    // 35% of hispanic folks have an anglo given name.

    // var baseKey = ion.test(35, race === "hispanic") ? "anglo {0}" : "{1} {0}";
    // var key = ion.format(baseKey, gender, race);
    // return ion.random(ion.names[key]);
    return ion.random(names[ion.format((race === "hispanic" && ion.test(35)) ? "anglo {0}" : "{1} {0}", gender, race)]);
}
function getFamilyName(race) {
    return ion.random(names[race]);
}

/**
 * Generate a random name for a mid-century American, of the kind that would be
 * wandering around an atomic era apocalypse.
 * @example
 *     var girl = atomic.createCharacterName({gender: "female"})
 *     girl.toString()
 *     => "Ada King"
 *     girl = atomic.createCharacterName({gender: "female", race: "hispanic"})
 *     girl.toString()
 *     => "Elena Silva"
 *
 * @static
 * @method createCharacterName
 * @for atomic
 *
 * @param [params] {Object}
 *     @param [params.gender] {String} "male" or "female" name. Optional. If not specified, gender is 50/50.
 *     @param [params.race] {String} "anglo" or "hispanic" (Optional. If not specified, 20% of names are Hispanic).
 *     @param [params.given] {String} set the given name to this name
 *     @param [params.family] {String} set the family name to this name
 * @return {atomic.models.Name}
 */
module.exports = function(opts) {
    opts = opts || {};
    // Both of these are already specified in the character constructor and can be overwritten
    // by the caller, but happen here again for convenience.
    var gender = opts.gender || (ion.test(50) ? "male" : "female");
    var race = opts.race || (ion.test(20) ? "hispanic" : "anglo");

    return new Name({
        given: opts.given || getGivenName(gender, race),
        family: opts.family || getFamilyName(race)
    });
};

},{"../ion":23,"../models/name":33}],13:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Table = require('../tables/table');
var createCharacterName = require('./character_name');

var e1 = "{Alpha|American|North American|National|General|Universal|International|Consolidated|Central|Western|Eastern|Union}",
    e2 = "{Argon|Iridium|Micro|Radiation|Nuclear|Atomic|Radium|Uranium|Plutonium|Development|X-Ray|Gamma Ray}",
    e3 = "{Engineering|Research|Scientific|Electronics|Instruments|Devices}",
    e4 = "{Laboratory|Laboratories|Corporation|Supply Company|Company|Foundation|Inc.}";

// Specific historical names and combos not created by the generator, that add to the veracity of results.
var e5 = [ "Raytomic", "Detectron", "Gamma-O-Meter", "Librascope", "Micromatic", "Micro Devices",
        "Micro Specialties", "Radiaphone", "Radiometric", "Ra-Tektor", "Nucleonics", "Scintillonics", "Tracerlab" ];

var table1 = new Table(ion.transform);
table1.add(60, function() {
    return ion.random(e1) + " " + ion.random(e2);
});
table1.add(10, function() {
    return ion.random(e2);
});
table1.add(15, function() {
    return createCharacterName({race: "anglo"}).family + " " + ion.random(e2);
});
table1.add(15, function() {
    return createCharacterName({race: "anglo"}).family;
});

var table2 = new Table(ion.transform);
table2.add(25, function() {
    return " " + ion.random(e3);
});
table2.add(25, function() {
    return " " + ion.random(e4);
});
table2.add(50, function() {
    return " " + ion.random(e3) + " " + ion.random(e4);
});

function createName() {
    if (ion.test(90)) {
        return table1.get() + table2.get();
    } else {
        return ion.random(e5) + " " + ion.random(e4);
    }
}

/**
 * Creates your typical cold-war sinister mega-corporation name.
 *
 * @static
 * @for atomic
 * @method createCorporateName
 *
 * @return {String} company name
 */
module.exports = function() {
    var name = createName();
    while(name.split(" ").length > 4) {
        name = createName();
    }
    return name;
};

},{"../ion":23,"../tables/table":40,"./character_name":12}],14:[function(require,module,exports){
var ItemDatabase = require('../db/item_database');
var ProfessionDatabase = require('../db/profession_database');
var StoreDatabase = require('../db/store_database');
var AtomicProfession = require('../models/atomic_profession');

var idb = new ItemDatabase(['ammo','ammo:22','ammo:30','ammo:308','ammo:357','ammo:38','ammo:44','ammo:45','ammo:fusion','ammo:laser','ammo:pulse','ammo:shell','armor','agricultural','automotive','civic','criminal','garage','hospital','house','industrial','institution','lodging','military','office','public','research','restaurant','school','tourism','travel','br','bundled','heavy','nobr','unique','accessories','body','coat','feet','head','con','con:35mm','con:battery','con:polaroid','food','fresh','meat','prepared','preserved','ration','common','rare','uncommon','female','male','alcohol','camping','cash','clothing','communications','container','currency','drug','electronics','explosive','jewelry','medical','pottery','publication','sport','tool','toy','kit:courier','kit:craftsperson','kit:doctor','kit:electrician','kit:gunslinger','kit:homesteader','kit:leader','kit:mechanic','kit:miner','kit:personal','kit:police','kit:raider','kit:rancher','kit:scavenger','kit:scientist','kit:settler','kit:soldier','kit:thief','kit:trader','kit:vagrant','hand','huge','large','medium','miniscule','small','tiny','luxury','scifi','secured','useful','firearm','melee','pistol','rifle','shotgun','smg']);
idb.register(
    "$1 bill!.01!0!51 58 62",
    "$1 casino chip!1!0!53 62",
    "$10 bill!.1!0!53 58 62",
    "$10 casino chip!10!0!53 62",
    "$100 bill!1!0!52 58 62",
    "$20 bill!.2!0!53 58 62",
    "$25 casino chip!25!0!52 62",
    "$5 bill!.05!0!51 58 62",
    "$5 casino chip!5!0!52 62",
    ".22 caliber bullet!1!.5!53 0 1",
    ".30 caliber bullet!1!.5!53 0 2",
    ".357 caliber bullet!1!.5!53 0 4",
    ".38 caliber bullet!1!.5!53 0 5",
    ".44 caliber bullet!1!.5!53 0 6",
    ".45 caliber bullet!1!.5!53 0 7",
    "American flag!1!3!51 15 21 23 25 28 35",
    "Boss of the Plains hat!2!.5!52 59 40 79 88 55 25",
    "Dutch Lad snack cake!6!1!52 45 19 100 49",
    "Kit-Cat klock; Tiki statue!1!3!53 19 ",
    "Kooba Kid comic book; Bubbles and Yanks comic book; Volto from Mars comic book; Clutch Cargo comic book!6!.5!52 17 19 82 69",
    "M1 Rifle; M1 Carbine!12!10!52 2 31 104 89 107",
    "M14 Rifle!12!10!52 3 31 104 89 107",
    "M1911 Pistol!9!3!52 7 31 104 79 89 106",
    "Remington .44 Magnum Pistol; Smith & Wesson .44 Magnum Pistol; Colt .44 Magnum Pistol!9!3!52 6 31 104 73 77 79 81 83 84 86 88 91 106",
    "Remington 870 Shotgun; Winchester 1897 Shotgun; Winchester Model 12 Shotgun!9!10!52 11 31 104 17 19 73 81 83 84 86 88 91 108",
    "Remington Rifle!12!10!52 13 1 31 104 17 19 73 77 78 81 84 85 86 88 91 107",
    "Ruger .22 Pistol!9!3!52 1 31 104 75 81 87 88 90 91 106",
    "Ruger Single Six Revolver!9!3!52 1 31 104 73 81 85 86 88 91 92 106",
    "Smith & Wesson .357 Magnum Pistol; Colt .357 Magnum Pistol!9!3!52 4 31 104 77 79 81 83 84 86 88 90 91 106",
    "Smith & Wesson .38 Special Revolver; Colt Detective Special Revolver!9!3!52 5 31 104 73 74 75 76 79 80 81 83 86 88 90 91 106",
    "Smith & Wesson Service Revolver; Colt Service Pistol!9!3!52 7 31 104 73 74 75 76 80 81 83 86 87 88 91 92 106",
    "Springfield Rifle!12!10!52 2 31 104 73 77 86 89 107",
    "Thompson Submachine Gun; M3 Submachine Gun; Browning Automatic Rifle!12!10!52 7 31 104 89 109",
    "Twinkle Cake!3!1!53 45 19 49 28 29 30",
    "Winchester Rifle!12!10!52 13 3 31 104 17 19 73 77 78 81 85 86 88 91 107",
    "apple pie; cherry pie; peach pie!3!3!53 13 45 46 48 ",
    "apple; pear; nectarine; orange; peach{es}; plum!1!.5!51 45 46 88",
    "ashtray!1!1!51 19",
    "axe; pickaxe!3!20!53 13 57 17 33 81 105 71",
    "backpack!11!10!51 61 19 73 86 92 22 23  30 103",
    "bag{s} of sugar!11!3!52 45 19 49 103",
    "bandana; baseball cap!2!.5!51 59 54 40 19 73 74 76 78 80 81 84 85 86 88 90 92 55",
    "baseball bat!3!3!51 17 73 78 84 86 90 92 105 70",
    "baseball; softball; tennis ball!1!1!51 19 25 28  70",
    "batter{y|ies}!3!.5!53 41 43",
    "bayonet!3!1!51 89 105",
    "belt{s} with large silver buckle{s}!2!.5!53 36 59 77 85 55",
    "beret; boonie hat; garrison cap; patrol cap!2!.5!51 59 54 40 89 55 23",
    "boater's straw hat; Panama straw hat!2!.5!53 15 59 40 19 75 78 79 87 88 91 92 22 55 25",
    "bolo tie!2!.5!51 36 59 19 77 85 91 22 55 ",
    "book!1!3!51 69 28",
    "book{s} of cattle brands!1!1!51 85 35",
    "boomerang; bubble gum cigar; frisbee; hula hoop; Hopalong Cassidy cap gun; coonskin cap; slinky!1!3!53 19  72",
    "bottle{s} of milk!1!3!51 45 46 19 88",
    "bottle{s} of scotch; bottle{s} of whiskey; bottle{s} of vodka; bottle{s} of wine!13!10!53 56 63 19 82 100",
    "bowling ball!6!20!52 33 19 25 70",
    "box{es} of .22 ammo (20 rounds)!30!3!52 0 1 32",
    "box{es} of .30 ammo (20 rounds)!30!3!52 0 2 32",
    "box{es} of .308 ammo (20 rounds)!30!3!52 0 3 32",
    "box{es} of .357 ammo (20 rounds)!30!3!52 0 4 32",
    "box{es} of .38 ammo (20 rounds)!30!3!52 0 5 32",
    "box{es} of .44 ammo (20 rounds)!30!3!52 0 6 32",
    "box{es} of .45 ammo (20 rounds)!30!3!52 0 7 32",
    "box{es} of Sugar Jets cereal!3!3!53 45 19 49",
    "box{es} of Velveteena cheese!6!3!53 45 18 19 100 49 27",
    "box{es} of candies!9!3!52 19 100",
    "box{es} of candles!9!3!51 57 17 19 81 86 103",
    "box{es} of chocolates!6!3!52 45 19 100 49",
    "box{es} of hardtack!9!3!53 45 23 50 103",
    "box{es} of matches!3!.5!51 57 16 17 19 82 84 85 86 88 90 71 103",
    "box{es} of shotgun shells (20 shells)!30!3!52 0 11 32",
    "box{|es} of toaster pastries!3!3!53 45 19 49",
    "bracelet!10!1!53 66 102",
    "briefcase!1!10!51 31 15 24 25 26",
    "bucket hat; coonskin cap!2!.5!53 59 54 40 73 78 84 86 88 91 92 55",
    "bulletproof vest!11!10!53 12 31 16 83 86 89 103",
    "business suit!2!3!51 37 59 19 79 88 22 55",
    "butcher's kni{fe|ves}!3!3!51 19 88 105 27",
    "camera!3!3!53 31 42 82",
    "canteen; water bottle!1!3!51 82 23",
    "can{s} of Brylcreem!3!1!53 19 82",
    "can{s} of Fido dog food!3!3!51 45 19 47 49",
    "can{s} of Rinso Detergent!1!3!51 19",
    "can{s} of coffee; jar{s} of instant coffee!6!3!52 45 19 100 49",
    "can{s} of milk; can{s} of pork & beans; box{es} of crackers; can{s} of wham!3!3!51 45 19 49",
    "can{|s} of mace; can{|s} of pepper spray!3!1!53 74 75 76 79 80 87 88 90 105",
    "carton{s} of cigarettes!150!3!52 63 100",
    "casualwear outfit!2!3!51 37 59 54 19 88 22 55",
    "ceramic cup; ceramic plate; ceramic bowl; large ceramic bowl; pottery cup; pottery bowl; pottery vase; clay figurine!3!6!53 13 31 33 19 68 29",
    "cigarette lighter!3!.5!51 16 19 82 88 71 103",
    "clipboard!1!3!51 24",
    "coat; overcoat; parka; windbreaker!2!3!51 13 15 59 38 54 18 19 20 21 78 82 83 22 55 24 25 27 ",
    "coffee mug!1!1!51 19 24",
    "coffee pot!1!3!51 19",
    "coil{s} of rope (50 feet)!3!10!53 13 17  71",
    "comb; handkerchief!1!.5!51 19 82",
    "combat helmet!2!.5!51 12 59 54 40 84 86 89 55 23",
    "compass!6!.5!52 57 17",
    "cowboy hat!2!.5!51 13 59 54 40 77 85 55",
    "crowbar; tire iron!3!6!51 17 33 84 86 105 71",
    "crutch{es}!3!10!53 67",
    "dagger!3!1!51 77 84 86 88 89 90 105",
    "day pack!4!10!51 15 61 19 20 73 74 76 80 81 84 86 88 90 92 22 23 28  30 103",
    "day{s} of C rations!11!6!51 45 33 23 49 50 103",
    "death ray!27!3!52 8 31 104 106 26 101",
    "deck{s} of playing cards!6!1!51 16 19 82 103",
    "denim jacket!2!.5!51 59 38 54 74 76 80 90 92 55",
    "doctor's bag!2!10!51 36 59 61 54 18 75 55",
    "duster; buckskin coat; poncho!2!.5!53 13 59 38 54 73 77 84 85 91 55",
    "egg; potato{es}!1!.5!51 45 46",
    "empty fuel can!1!10!51 14 61 17 20 73",
    "fedora; flat cap; porkpie hat!2!.5!51 59 40 19 75 79 87 88 91 92 22 55 25  30",
    "fire axe!3!10!53 14 15 16 18 20 21 74 76 80 81 86 92 105 23",
    "fire extinguisher!1!15!51 14 15 16 33 18 20 21 22 23 24 25 26 28 30",
    "first aid kit!13!10!53 67 103",
    "flashlight!6!1!51 14 31 57 15 43 17 19 20 21 82 26  71 103",
    "floral dress; jumper{s} with {a |}blouse{s}; jumper{s} with {a |}T-shirt{s}; skirt{s} and blouse{s}; prairie skirt{s} and blouse{s}; shirtwaist dress!2!.5!51 37 59 54 74 75 78 79 87 88 91 92",
    "football; tennis racket!1!10!51 19 25 28  70",
    "force field belt!15!1!52 12 31 26 101",
    "gas mask!1!3!53 12 31 83 89 23",
    "geiger counter!11!3!53 31 64 20 81 86 87 89 26 71 103",
    "gold krugerrand!10!1!53 62 33 102",
    "gravity rifle!36!20!52 8 31 104 33 23 26 107 101",
    "hand grenade!5!1!53 65 84 86 89 23",
    "hard hat{s} with lamp{s}; hard hat!2!.5!53 59 54 40 20 81 55",
    "hockey mask!1!3!53 12 84",
    "hoe; rake; shovel!3!10!53 13 17 88 105 71",
    "holster!2!1!53 36 59 54 77 82 89 55 35",
    "house deed!6!1!52 102",
    "hunting kni{fe|ves}!3!1!51 77 78 79 85 86 88 91 92 105",
    "ice pick!3!20!53 17 33 105 71",
    "jar{s} of Ersatz instant coffee!6!3!52 15 45 19 100 24 49 30",
    "jar{s} of Gusto pasta sauce; box{es} of Gusto spaghetti; jar{s} of Gusto olives; box{es} of Gusto bread sticks; can{s} of Gusto ravioli!3!3!51 45 19 49 27",
    "jar{s} of jam!1!1!51 45 46 19 48 27",
    "jug{s} of moonshine!10!10!53 13 63 82",
    "jumpsuit; {|}work coveralls!2!3!51 13 14 37 59 54 20 21 74 76 80 81 86 55",
    "knife; fork; spoon!1!1!51 19 27",
    "lab coat!2!3!51 59 38 54 18 21 75 87 55 26",
    "lamb chop; {|}lamb ribs{|}; lamb roast; {|}lamb spareribs{|}!3!10!53 45 46 47",
    "lariat!1!3!51 85 35",
    "laser pistol!27!3!52 9 31 104 87 89 106 26 101",
    "laser rifle!36!10!52 9 31 104 89 26 107 101",
    "letter sweater!2!.5!53 59 38 54 88 55",
    "loa{f|ves} of bread!1!3!51 45 46 88 48",
    "lockpick set!11!1!52 16 90 71 103",
    "lunchbox{es}!3!10!53 19",
    "magazine!1!3!51 69 30",
    "medical brace!3!10!53 67",
    "metal detector!6!10!52 31 17 86 23  71 35",
    "military helmet!9!3!53 12 86 89 103",
    "motorcycle helmet; football helmet!9!3!53 12 17 84 86 103",
    "motorcycle jacket!10!3!53 59 38 54 17 73 77 84 86 55 103",
    "mouse trap!3!1!53 17 19 71",
    "necklace!12!1!53 66 102",
    "newspaper!1!3!51 14 15 16 17 18 19 20 21 22 23 24 25 69 27 29 30",
    "notebook; journal; sketchbook!6!3!52 14 15 18 19 21 82 23 24 26 28  29 35",
    "package{s} of hot dogs!3!3!51 45 47 49",
    "pack{s} of chemical light sticks (5 sticks)!8!1!53 57 17 73 76 80 81 83 86 92  71 103",
    "pack{s} of chewing gum; pack{s} of Blackjack chewing gum!6!.5!52 45 82 100 49 29 30",
    "pack{s} of cigarettes!13!1!53 63 82 100",
    "pair{s} of safety goggles!2!1!52 59 54 40 20 87 55 26",
    "peaked cap; campaign hat!2!.5!51 15 59 54 40 83 55",
    "pencil; pen!1!1!51 24 28",
    "pipe; chain!3!3!53 17 20 84 105",
    "pitchfork!3!10!53 13 71",
    "plastic cup; glass!1!3!51 31 19 27 28 ",
    "plate!1!3!51 19 27",
    "polaroid camera!3!3!53 31 15 44 19 21 82 22 25 26  29 30",
    "police baton; nightstick!3!3!53 83 105",
    "police uniform!2!3!51 37 15 59 54 83 55",
    "pool table!24!80!52 33 19 103",
    "pork chop; {|}pork ribs{|}; pork roast; {|}pork spareribs{|}; pork loin chop{|s}; pork sausage!3!10!51 45 46 47",
    "portable stove!3!3!53 31 57 17 73 86 91 92 70",
    "portable water purification filter!14!3!52 31  71 103",
    "pressure cooker; hot plate!6!10!52 31 19",
    "pulse pistol!27!6!52 10 31 104 33 87 89 106 26 101",
    "pulse rifle!36!20!52 10 31 104 33 89 26 107 101",
    "purse; handbag!1!3!51 15 61 19 22 24 25 30",
    "rabbit's {foot|feet}; {|pairs of }Starlight Casino dice; deck{s} of Elvis Presley playing cards; poker chip{s} from the Sands Casino in Reno; Gideon's bible; pocket crucifix; St. Jude pendant; St. Christopher figurine; Star of David necklace; {|pairs of }Masonic cufflinks; Order of Odd Fellows tie clip; class ring!3!.5!53 82 35",
    "radiation suit!12!10!53 31 59 38 54 20 81 86 89 55 26 103",
    "red Gingham dress; blue Gingham dress; yellow Gingham dress; green Gingham dress; black and white Gingham dress!2!.5!51 37 59 54 74 75 78 79 87 88 91 92",
    "rifle scope!8!1!53 13 31 19 85 88 103",
    "ring!7!.5!53 66 102",
    "road map!1!1!51 14 17 73 77 86 91 92 22 30",
    "roll{s} of 35mm film (24 shots)!6!.5!52 41 42",
    "roll{s} of polaroid film (10 shots)!3!1!53 41 44",
    "safe-cracking kit!20!20!52 31 15 16 86 90 71 103",
    "scalpel!1!1!51 67 71",
    "set{s} of horse tack!1!20!51 13",
    "set{|s} of keys!1!.5!51 14 15 19 20 21 22 23 24 26 28 35",
    "shawl!2!.5!53 13 59 38 54 19 75 78 79 88 91 92",
    "shiv; switchblade!3!1!51 16 84 86 90 105",
    "shotgun shell!1!.5!53 0 11",
    "slab{s} of bacon!3!1!51 45 19 47 49",
    "sleeping bag; tent!1!10!51 57 17 73 86 92",
    "sombrero!2!.5!52 13 59 40 77 85 92 55",
    "stick{s} of beef jerky!3!1!51 45 19 47 49",
    "stick{s} of dynamite!3!1!53 65 20 81",
    "straw sun hat!2!.5!53 15 59 54 40 19 75 78 79 87 88 91 92 22 25",
    "stun baton!11!3!52 83 89 105 103",
    "suit{|s} of riot gear!15!20!53 12 31 15 16 83 86 23 103",
    "sword; machete!3!3!52 73 88 89 105",
    "tabletop radio!1!10!51 14 31 15 60 64 17 19 21 23 ",
    "teargas grenade!3!1!53 15 65 83",
    "thermos!11!3!53 57 17 19 85 86 103",
    "toaster!1!10!51 31 19",
    "toy robot!6!3!52 31 43 19 72",
    "trenchcoat; sports jacket!2!.5!53 59 38 79 55",
    "walkie-talkie!6!3!52 31 15 60 64 20 21 79 83 86 89 23 26",
    "wanted poster!3!.5!53 73 77 83",
    "whole chicken!3!10!51 45 46 47",
    "will; contract; war bond; passport!1!1!51 102",
    "wrench{es}; hammer!1!3!51 14 17 20 74 80 86  71",
    "{|pairs of }Mary Jane shoes!2!.5!51 15 59 39 54 19 21 74 75 79 87 88 90 91 92 23",
    "{|pairs of }black leather shoes!2!.5!51 15 59 39 54 19 21 73 74 75 76 79 80 83 87 88 89 90 91 92 55 23",
    "{|pairs of }blue suede loafers; {|pairs of }saddle shoes!2!.5!53 59 39 54 88 55",
    "{|pairs of }chaps!2!.5!51 36 13 59 54 85 55",
    "{|pairs of }combat boots!2!.5!51 12 59 39 54 73 77 83 84 86 89 92 55 23",
    "{|pairs of }cowboy boots!2!.5!51 59 39 54 19 73 77 78 79 80 81 84 85 86 88 90 91 92 22 55 ",
    "{|pairs of }dice!3!.5!51 16 19 82 35 103",
    "{|pairs of }dog tags!1!.5!51 89 23 35",
    "{|pairs of }forceps!3!3!53 67 71",
    "{|pairs of }military fatigues!2!3!51 37 59 54 86 89 55 23",
    "{|pairs of }night vision goggles!10!3!52 36 31 59 43 54 83 86 89 55 23 103",
    "{|pairs of }slacks {and a|with} button up shirt{s}!2!.5!51 37 59 19 74 75 87 88 91 92 55",
    "{|pairs of }work boots!2!.5!51 12 59 39 54 73 77 78 81 83 84 86 88 90 92 55 23",
    "{|sets of }football pads!11!10!53 12 17 84 86 103",
    "{|suits of }makeshift metal armor!15!20!52 12 31 16 84 86 103",
    "{|}beef brisket{|s}; beek flank steak{|s}; beef sirloin steak; beef prime rib; beef pot roast; beef rib roast; beef T-Bone steak!3!10!51 45 46 47",
    "{|}binoculars!11!3!53 31 19 73 86 89 103",
    "{|}bongos; flute!3!3!53 92 35",
    "{|}brass knuckles!3!1!52 16 84 105",
    "{|}jeans and a T-shirt; {|}jeans and a button up work shirt; {|}jeans and a flannel shirt; {|}jeans and a western shirt!2!.5!51 37 59 54 19 73 74 76 77 78 80 84 85 86 88 90 91 92 55"
);

// http://www.systemreferencedocuments.org/resources/systems/pennpaper/modern/smack/occupations.html
/*
 barber, undertaker, banker, blacksmith, bounty hunter, judge, launderer, sheriff, marshall, deputy,
 mayor, town councilmember, menial laborer, merchant, messenger, miner, outlaw, bartender, piano player,

 Worker (Construction, Crop, Highway Maintenance, Mill, Quarry, Steel, Telephone Maintenance)
 Manager (Business, Construction, Hotel, Restaurant, Retail)
 Mechanic (Aircraft, Automobile, Bus, Communications Equipment, Electrical, Heavy Equipment, Truck)
 Driver (Ambulance, Bus, Truck)
 Supervisor (Maintenance, Office)
 Scientist (Materials, Rocketry, Robotics)
 Emergency Medical Technician (EMT)

 Animal Breeder (Horse, Sheep)
 Prison Chaplain, Priest, Minister
 Commercial Fisherman
 Computer Programmer
 Detective
 Draftsman
 Newspaper Editor
 Newspaper Reporter
 Engine and Machine Assemblers, Forklift and Industrial Truck Operators, Freight and Stock Handler, Machinist
 Engineer (Chemical, Civil, Electrical, Mechanical, Mining, Nuclear, Marine)
 Farmer
 Fire Fighter
 Government Employee
 Harbor Master
 Historical Archivist, Librarian
 * Housekeeper, Janitor
 Intelligence Agent
 Lawyer
 Logger
 Painter
 Park Ranger
 Pharmacist
 Pilot
 Mail Carrier
 Postmaster
 Printer
 Radio Operator
 Railroad Engineer
 Real Estate Agent
 Sailor
 Security Guard
 Service Station Attendant
 Social Worker
 Steel Workers
 Switchboard Operator
 Veterinarian
 Waiter/Waitress
 Welder

 professions
 // Bounty Hunter, Sheriff/Lawman, Hardholder/Bartertowner
 // Beatknik, Ex-Military, Raider, Nomad/Wanderer/Wastelander, 'Remnant' (survivors), Architect, Lawyer
 // Academic, Trader/Trucker, Clergyman/woman/Religious Leader
 // Cultist (Religious Cult, Cargo Cult, other)
 */
var pdb = new ProfessionDatabase(['post','pre','glasses','injuries','military:tattoo','sailor:tattoo','tattoo','high','low','normal','common','rare','uncommon','kit:courier','kit:craftsperson','kit:doctor','kit:electrician','kit:gunslinger','kit:homesteader','kit:leader','kit:mechanic','kit:miner','kit:police','kit:raider','kit:rancher','kit:scavenger','kit:scientist','kit:settler','kit:soldier','kit:thief','kit:trader','kit:vagrant','innate','Agile','Attractive','Cunning','Persuasive','Smart','Strong','Tough','Willpower','Art','Athletics','Bargain','Business','Camouflage','Electrical Repair','Foraging','Forensics','Government','Homesteading','Horseback Riding','Humanities','Law','Maritime','Mathematics','Mechanical Repair','Medicine','Mining','Negotiate','Observation','Research','Scavenging','Spelunking','Tracking','Wayfinding','Archery','Explosives','Firearms','Melee Weapons','Military','Unarmed Combat','Blacksmith','Brewer','Cook','Glassblower','Leatherworker','Potter','Weaver','Woodworker','Chemical Engineering','Civil Engineering','Eletrical Engineering','Mechanical Engineering','Mining Engineering','Nuclear Engineering','Chinese','French','German','Italian','Russian','Spanish','Biology','Chemistry','Geology','Physics','Science','Social Science','Deceive','Forgery','Intimidate','Lockpicking','Pickpocket','Safe Cracking','Stealth','Streetwise','Communications','Computers','Cryptography','Programming','Robotics','Rocketry','Butcher','Carpenter','Clothier','Gunsmith','Machinist','Mason','Plumber','Wagonwright','Driving','Motorcycling','Pilot Aircraft','Trucking']);
pdb.register(AtomicProfession,
    "Air Force!68 70 122!59 69 71!10 28 4 9 0 1", "this.assignRank(c);",
    "Army!68 70!59 69 71 45!10 28 4 9 0 1", "this.assignRank(c);",
    "Bounty Hunter!68 100!43 45 51 64 65 69 71 104 105 121!12 3 17 8 0", "",
    "Business Executive; Manager!43 44!49 53 55 59 86 87 88 89 90 91!12 9 1", "",
    "Carnie!43 98!60 62 105 120!12 8 1 6", "",
    "Clerk; Sales Clerk; Secretary; Salesman; Hotel Clerk; Motel Clerk; Warehouse Clerk!44!43!10 8 1", "",
    "Coast Guard!54 68 70!59 69 71!11 28 4 9 0 1 5", "this.assignRank(c);",
    "Courier!51 65!66 68 120 121 122 123!12 13 9 0", "",
    "Craftsperson!43!41 44 72 73 74 75 76 77 78 79!10 14 9 0", "",
    "Doctor!57!61 92 93 96 48!11 7 15 0 1", "c.honorific = 'Doctor';",
    "Elementary school teacher; Middle school teacher; high school teacher!61!41 42 52 55 92 93 94 95 96 97!10 2 9 1", "",
    "Engineer!55 61!107 110 111 80 81 82 83 84 85!12 9 1", "",
    "Homesteader; Farmer!50!42 43 46 56 60 72 73 74 75 76 77 78 79 120 123!10 18 9 0", "",
    "Innate!!33 34 35 36 37 38 39 40!10 32", "",
    "Librarian; Archivist!61!86 87 88 89 90 91 107!12 2 9 1", "",
    "Locksmith!101!43 44 56 103 107!11 16 20 9 0 1", "",
    "Marine!68 70!59 69 71 65 45!10 28 4 9 0 1 5", "this.assignRank(c);",
    "Mayor; Council Member!43 49!44 60!11 7 19 0", "",
    "Mechanic!46 56!43 106 107 108 109 110 111!10 20 9 0 1", "",
    "Miner!58!46 56 63 67!10 21 8 0 1", "",
    "Navy!54 68 70 122!59 69 71!12 28 9 0 1 5", "this.assignRank(c);",
    "Newspaper Reporter!60 61!49 98 105 106!12 2 9 1", "",
    "Police!68!42 49 59 60 71 100 105!12 22 9 0 1", "this.assignRank(c);",
    "Professor!61!41 52 53 55 57 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 106 107 108 109 110 111!11 2 7 26 1", "c.degree = 'Ph.D.'",
    "Raider!68 69!45 51 64 66 67 71 98 100 104 121!12 3 23 8 0 6", "",
    "Rancher; Cowhand!51 68!42 43 47 50 60 64 65!10 24 9 0 1", "",
    "Scavenger!62 65!47 60 101 103 66 69 68!10 3 25 9 0", "",
    "Scientist!61!55 92 93 94 95 96 97 106 107 108 109 110 111!11 2 7 26 0 1", "",
    "Settler!50!42 43 46 56 60 72 73 74 75 76 77 78 79 120 123 105!10 27 9 0", "",
    "Thief!98 100 105!35 101 99 102 103 104 69 108 43!10 29 8 0 1", "",
    "Trader!43 44!35 46 53 56 59 62 91 98 105 106 36!12 2 30 9 0", "",
    "Tradesperson!43!44 112 113 114 115 116 117 118 119!10 14 9 0", ""
);

var sdb = new StoreDatabase(['clientele:lobrow', 'clientele:nobrow', 'cluster:low', 'cluster:medium', 'cluster:none', 'common', 'rare', 'uncommon', 'encampment', 'roadside', 'settlement', 'town', 'trade:any', 'trade:buylow', 'trade:currency', 'trade:luxuries', 'trade:necessities', 'trade:sellhigh', 'trade:stocked']);
sdb.register(
    "Bar; Tavern; Saloon!May have bottles to purchase.!trader!!alcohol -bottleofwine!50!!!5 0 1 4 5 10 14",
    "Biker Shop!!Biker Gang!!kit:raider | weapon | ammo | drug!100!!!6 0 2 6 9 12 13",
    "Blacksmith!Will forge custom work or repair items.!Craftsperson!blacksmith!!!!!7 1 9 10 11 14 16 7",
    "Bookstore!!trader!!publication!100!!!7 1 4 10 13 14 16 18 7",
    "Butcher Shop; Meat Market!Will slaughter livestock (chickens 1T; pigs/goats 3T; cattle 6T).!trader!Butcher!meat -canoffidodogfood -preserved!100!!!7 1 2 10 14 15 16 17 7",
    "Clothing Store; Outfitters; Mercantile!!trader!!clothing -military -industrial!100!!!5 1 2 5 8 10 13 14 16 18",
    "Diner; Cafe; Restaurant; Drive-Thru; Roadhouse!A hot meal for 4T.!trader!!prepared food!!!!6 1 4 6 9 14",
    "Diner; Cafe; Restaurant; Eatery; Luncheonette!A hot meal for 3T.!trader!!prepared food!!!!5 1 4 5 10 11 14",
    "Feed Store!Bags of feed for 4T.!trader!!!!!!5 1 5 9 10 12 13",
    "General Store; Mercantile; Trading Post!!trader!!-kit:personal -publication -military -food -firearm -ammo -research -br!50!3!!5 1 4 5 10 12 13",
    "Gunsmith; Gun Shop; Firearms; Shooting Range!!tradesperson!Gunsmith!firearm -br!30!!10!7 1 4 10 14 15 16 17 18 7",
    "Hardware Store!!tradesperson!Mechanical Repair!tool | toy | camping!50!1!20!7 1 3 9 10 11 14 16 18 7",
    "Icehouse!They sell ice.!trader!!!!!!6 1 6 11 14 16",
    "Liquor Store!!trader!!alcohol!100!!!6 0 1 4 8 6 9 10 14",
    "Livestock!Will have some combination of chickens (4T), pigs (10T), goats (10T), and/or cattle (18T) for sale. Will not generally buy livestock (find a slaughterhouse or butcher).!trader!!!!!!5 1 5 10 12 13",
    "Locksmith!Can open anything you bring to them, no questions asked (3T).!locksmith!!!!!!6 1 4 6 10 11 14 15 16",
    "Mart; Market; Groceries!!trader!!food -ration!100!!!5 1 2 5 8 10 13 14 16",
    "Pawn Shop; Antique Store!!trader!!-food -rare -ammo -weapon -luxury -scifi!50!3!!5 6 1 4 5 6 10 12 17",
    "Pottery Shop!!tradesperson!Potter!-br pottery!100!!!7 1 2 10 14 16 7",
    "Repair Shop; Electronics Shop!Electrical repair (2-6T).!mechanic!Electrical Repair!electronics | communications!20!!!7 1 4 10 11 12 13 18 7",
    "Repair Shop; Service Station!Mechanical repair (2-6T).!mechanic!Mechanical Repair!br -firearm -house -electronics!10!!!7 1 4 10 11 12 13 18 7",
    "Sporting Goods Store!!trader!!sport | camping!!!!6 1 3 6 9 10 12 13",
    "Tattoo Parlor; Tattoos!3-5T for a tattoo.!trader!Art!!!!!7 0 10 14 15 16 7"
);

module.exports = {
    getPlaces: function() { return ['Agricultural','Automotive','Civic','Criminal','Garage','Hospital','House','Industrial','Institution','Lodging','Military','Office','Public','Research','Restaurant','School','Tourism','Travel']; },
    getLocations: function() { return ['Encampment', 'Roadside', 'Settlement', 'Town']; },
    itemDatabase: idb,
    professionDatabase: pdb,
    storeDatabase: sdb
}

},{"../db/item_database":5,"../db/profession_database":6,"../db/store_database":7,"../models/atomic_profession":24}],15:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var db = require('./data').professionDatabase;
var Character = require('../models/character');
var Family = require('../models/family');
var Relationship = require('../models/relationship');
var RarityTable = require('../tables/rarity_table');

var createCharacter = require('./character').createCharacter;
var createRace = require('./character').createRace;
var createCharacterName = require('./character_name');
var createKit = require('./bag').createKit;

// This creates pretty normal families. As always, the generators are for on-the-spot
// filler material, and aim for believability. Make up the more unusual families in
// your world.

var innate = db.find('innate');

var relationships = {
    grandmother: {g: "female", a: 0, r: ["grandson", "granddaughter"], n: 25},
    grandfather: {g: "male", a: 0, r: ["grandson", "granddaughter"], n: 25},
    aunt: {g: "female", a: 1, r: ["niece", "nephew"], n: 50},
    uncle: {g: "male", a: 1, r: ["niece", "nephew"], n: 50},
    mother: {g: "female", a: 1, r: ["son", "daughter"], n: 80},
    father: {g: "male", a: 1, r: ["son", "daughter"], n: 100},
    brother: {g: "male", a: 2, r: ["sister","brother"], n: 100},
    sister: {g: "female", a: 2, r: ["sister", "brother"], n: 100},
    cousin: {g: null, a: 2, r: ["cousin"], n: 25},
    niece: {g: "female", a: 2, r: ["aunt", "uncle"]},
    nephew: {g: "male", a: 2, r: ["aunt", "uncle"]},
    son: {g: "male", a: 2, r: ["mother", "father"]},
    daughter: {g: "female", a: 2, r: ["mother", "father"]},
    grandson: {g: "male", a: 2, r: ["grandmother", "grandfather"]},
    granddaughter: {g: "female", a: 2, r: ["grandmother", "grandfather"]}
};
var relNames = [];
for (var prop in relationships) {
    relationships[prop].name = prop;
    relNames.push(ion.titleCase(prop));
}
// You only have to put the older terms in this table because if you're using
// it, you're randomizing, and the younger will be selected from the older
var rtable = new RarityTable()
    .add("common", relationships.mother)
    .add("common", relationships.father)
    .add("common", relationships.brother)
    .add("common", relationships.sister)
    .add("uncommon", relationships.aunt)
    .add("uncommon", relationships.uncle)
    .add("uncommon", relationships.cousin)
    .add("rare", relationships.grandmother)
    .add("rare", relationships.grandfather);

function getAdultAge() {
    return 18 + ion.nonNegativeGaussian(7);
}

function makeFamily(parent, kin) {
    var gender = (parent.male) ? "female" : "male";
    var race = createRace();
    var other = new Character({
        "name": createCharacterName({gender: gender, race: race}),
        "race": race,
        "profession": getRelatedProfession(kin[0].profession),
        "gender": gender,
        "age": ion.bounded(parent.age+ion.gaussian(3), 18)
    });
    kin.push(other);
    var family = new Family({
        "parent": parent,
        "other": other,
        "relationship": "couple"
    });
    // must be deleted later from all chars, or cannot be turned into JSON and persisted
    parent.family = other.family = family;

    if (ion.test(80)) {
        family.relationship = "married";
        if (ion.test(90)) { // if married, will share the same last name most of the time.
            family.female.name.family = family.male.name.family;
        }
    }
    return family;
}

function getChildCount() {
    return ion.nonNegativeGaussian(2.5, 1) || getChildCount();
}

function makeChildren(family, kin) {
    var childCount = getChildCount();
    if (family.female.age < 40) {
        for (var i=0; i < childCount; i++) {
            makeChild(family, kin);
        }
        // Delay *after* the last child is born.
        var years = ion.nonNegativeGaussian(4,1);
        ageKin(kin, years);
    }
}

function makeChild(family, kin) {
    var gender = ion.random(["male","female"]);
    var child = new Character({
        "name": createCharacterName({gender: gender, "race": family.female.race}),
        "race": family.female.race,
        "gender": gender,
        "age": ion.roll("1d3")
    });
    kin.push(child);
    child.name.family = family.male.name.family;
    // This is a gap in the ages of the family.
    ageKin(kin, child.age + ion.roll("1d3-1"));
    family.children.push(child);
    child.family = family;
}

function ageFamilyUntilChildIsAdult(family, kin) {
    var child = ion.random(family.children);
    if (!child) {
        throw new Error("No child in this family");
    }
    var adultAge = getAdultAge();
    if (child.age >= adultAge) {
        return child;
    }
    ageKin(kin, adultAge - child.age);
    return child;
}

function ageKin(kin, age) {
    kin.forEach(function(person) {
        person.age += age;
    });
}

function getRelatedProfession(profession) {
    if (!profession) {
        throw new Error("There should always be a related profession");
    }
    if (ion.test(40)) {
        return profession;
    }
    // TODO: This is a hack to extract the prestige tag from the prestige of the profession object
    // Can't we ask for the prestige:* tag? Should all tags be namespaced like this?
    var prestige = ion.intersection(["high","low","normal"], db.find(ion.toTag(profession)).tags);
    return db.find(prestige + " -pre -innate").names[0];
}

function postProcess(kin) {
    kin.forEach(function(person) {
        // train
        var c = createCharacter({
            "name": person.name,
            "profession": person.profession || getRelatedProfession(kin[0].profession),
            "age": person.age,
            "gender": person.gender,
            "equip": false
        });
        ion.extend(person, c);

        // deaths
        var family = person.family;
        delete person.family;

        if (family.isParent(person)) {
            if (ion.test(Math.sqrt(person.age))) {
                person.status = "absent";
                family.relationship = (family.relationship === "married") ? "divorced" : "separated";
            } else if (ion.test(Math.sqrt(person.age))) {
                person.status = "deceased";
                family.relationship = (family.male === person) ? "widow" : "widower";
            }
        } else if (ion.test(Math.sqrt(person.age))) {
            person.status = "deceased";
        }
        if (person.profession) {
            person.inventory = createKit({profession: person.profession});
        }
    });
}

function nextGeneration(family, kin, i, gen) {
    makeChildren(family, kin);

    if (i < (gen-1)) {
        var parent = ageFamilyUntilChildIsAdult(family, kin);

        // TODO:
        // This *almost* works but the aging of family members proceeds through everyone,
        // it doesn't branch for kin lines that co-exist in time. Need a different way
        // to age people.
        var parents = [parent]; // maybeFindOtherParents(family, parent);
        parents.forEach(function(p) {
            var newFamily = makeFamily(p, kin);
            family.couples.push(newFamily);
            family.children.splice(family.children.indexOf(p), 1);
            nextGeneration(newFamily, kin, i+1, gen);
        });
    }
}

/*
 function maybeFindOtherParents(family, originParent) {
 return [originParent].concat(family.children.filter(function(child) {
 return ion.test(50) && child.age > 20 && child !== originParent;
 }));
 }
 */

/**
 * Create a nuclear family, with a specified number of generations.
 *
 * @static
 * @method createFamily
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.generations=2] {Number} number of generations in the family (one
 *          generation is a couple, two generations includes their children, three
 *          their grand-children, above 3 you're going to get a history lesson).
 *      @param [params.parent] {Object} the parameters to pass to the first character
 *          created, that will set the profession, race and name of sub-generations.
 * @return {atomic.models.Family} a family
 */
module.exports.createFamily = function(opts) {
    opts = opts || {};
    opts.generations = opts.generations || 2;
    opts.parent = opts.parent || {};
    opts.parent.age = (opts.parent.age || getAdultAge());

    var parent = createCharacter(opts.parent),
        kin = [parent],
        family = makeFamily(parent, kin),
        root = family;

    if (opts.generations > 1) {
        nextGeneration(family, kin, 1, opts.generations);
    }
    postProcess(kin);
    return root;
};

/**
 * Get a list of valid relationships. These are the valid values to pass to the
 * `atomic.createRelationship()` method.
 *
 * @static
 * @method getRelationships
 * @for atomic
 *
 * @return {Array} a list of relationship names
 */
module.exports.getRelationships = function() {
    return relNames.sort();
};

/**
 *
 * Creates a pair of characters who are related to each other. Both characters will be
 * adults (you an adjust the ages and ignore the adult traits, if needed).
 *
 * @static
 * @method createRelationship
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.older] {String} name of the older or lateral relationship (e.g. "aunt" or
 *          "sister").  The younger or lateral relationship is derived from the older term.
 *      @param [params.profession] {String} the profession for the related people
 *      @param [params.familyName] {String} the last name to share between relations
 *      @param [params.equip] {Boolean} should these characters be equipped?
 */
module.exports.createRelationship = function(params) {
    params = ion.extend({}, params || {});
    params.equip = ion.isBoolean(params.equip) ? params.equip : true;
    var olderRel = (params.older) ? relationships[params.older.toLowerCase()] : rtable.get();
    var youngerRel = relationships[ ion.random(olderRel.r) ];

    // Order the terms:
    var youngerAge, olderAge,
        ageDiff = Math.abs(olderRel.a - youngerRel.a);

    do {
        youngerAge = getAdultAge();
        olderAge = getAdultAge();
        for (var i=0; i < ageDiff; i++) {
            olderAge += getAdultAge();
        }
    } while(ageDiff > 0 && olderAge-youngerAge < (18*ageDiff));

    var older = atomic.createCharacter({
            age: olderAge,
            gender: olderRel.g,
            profession: params.profession,
            equip: params.equip
        }),
        younger = atomic.createCharacter({
            age: youngerAge,
            race: ion.test(olderRel.n) ? older.race : atomic.createRace(),
            gender: youngerRel.g,
            profession: params.profession,
            equip: params.equip
        }),
        relName = (olderRel === youngerRel) ? (olderRel.name + "s") : (olderRel.name+" and "+youngerRel.name);

    if (params.familyName) {
        older.name.family = params.familyName;
    }
    if (ion.test(olderRel.n)) {
        younger.name.family = older.name.family;
    }
    return new Relationship(older, younger, relName);
};
},{"../ion":23,"../models/character":26,"../models/family":27,"../models/relationship":35,"../tables/rarity_table":39,"./bag":10,"./character":11,"./character_name":12,"./data":14}],16:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var db = require('./data').professionDatabase;
var createCharacter = require('./character').createCharacter;
var Gang = require('../models/gang');
/*
 * TODO: All girl gangs/all boy gangs mostly, with sometimes a connection between the two.

 patrols; no communications or medics in group.

 *
 * TODO: Non-criminal gangs? Like the "Eastside Motorcycle Club" or the "Southside Paladins", etc.?
 "nomadic": [
 "Raiding Parties (Banditry or Plundering)",
 "Scavenging",
 "Ambushes/Highway Robbery (Brigandry)"
 ],
 "street": [
 "Protection Rackets",
 "Burglery & Larceny",
 "Pickpocketing",
 "Scavenging",
 "Extracting tolls for passage or entry"
 ]

 Names for military patrols
 */
var types = {
    'Biker Gang': {
        prof: "raider",
        nicks: 100,
        traits: {"Motorcycling":1},
        count: "3d4-2",
        mil: false,
        names: ["Pagans", "Outlaws", "Bandidos", "Mongols", "Vagos Motorcycle Club", "Free Souls",
            "{Grim |}Reapers", "Gypsy Jokers", "Highwaymen", "Iron Horsemen", "Rebels",
            "Comanchero", "Devil's Disciples", "Diablos", "Finks", "58s", "Road Devils",
            "{Lone |}Legion", "Road {Devils|Knights}", "Skeleton Crew", "Low Riders"]
    },
    'Street Gang': {
        prof: "thief",
        nicks: 100,
        count: "1d4+1",
        mil: false,
        names: ["Magnificents", "Purple Hearts", "Coasters", "Businessmen", "Gladiators",
            "{Earls|Dukes|Counts|Barons|Lords}", "Daggers", "Big Dogs", "Young Lords",
            "Imperial Hoods", "Bulls", "Lightenings", "Crowns", "Senators", "Hawks",
            "Savages", "Lucky Seven", "Gents", "Enchanters"]
    },
    'Raiding Gang': {
        prof: "raider",
        count: "3d4-1",
        nicks: 90
    },
    'Scavenger Party': {
        prof: "scavenger",
        count: "1d4+1",
        nicks: 50
    },
    // TODO: Which isn't a group of working buckeroos. Those guys might have a chuck wagon and the like
    'Cowboy Posse': {
        prof: "rancher",
        count: "1d5+1",
        nicks: 20
    },
    'Cattle Rustler Gang': {
        prof: ['rancher','rancher','scavenger','thief'],
        count: "1d3+1",
        nicks: 50
    },
    'Army Patrol': {
        prof: 'army',
        count: "1d3*4",
        mil: 'army',
        nicks: 5
    },
    'Marine Patrol': {
        prof: 'marine',
        count: "1d3*4",
        mil: 'marine',
        nicks: 15
    }
};

var nicknames = {
    female: [
        '{given} "The {Queen|Vixen|Waitress|Witch}" {family}',
        '"{Ma|Baby Blue Eyes|Fat Girl|Gold Digger|Hot Lips|Monkey Girl|Repo Girl|Roxy|Sweet Cakes|Wild Woman}" ({given} {family})'
    ],
    male: [
        '{given} "{Wild|Repo|Hatchet|Ice} Man" {family}',
        '"{Bugsy|Pa|Bag Man|Monkey Boy|Muscles|Caveman|Maverick|Music Man|Nice Guy|Pretty Boy}" ({given} {family})',
        '{given} "The {Hitman|Sandman|Watchman|Rifleman|Gunman|Trigger Man}" {family}',
        '{given} "{Lil|Fat|Big} {Loco|Man|Boy|Daddy|Tuna} {family}"'
    ],
    both: [
        '"{Big|Fat|Little|Skinny|Greedy|Crazy|Trigger|Two-Finger|Three-Finger|Young|Old|Doc|Lowdown|Rowdy} {given}" {family}',
        '{given} "The {Agitator|Ant|Bag|Banker|Barber|Blast|Bloodhound|Boot|Brain|Brains|Bug|Bull|Burnout|Bystander|Cartridge|Cheater|Clown|Cruiser|Dasher|Dentist|Duke|Fence|Ghost|Reaper|Groundhog|Hammer|Hatchet|Joker|Kid|Killer|Knife|Lead Foot|Machine|Menace|Monster|Mouse|Rat|Prairie Dog|Mouthpiece|Mumbler|Ox|Rabbit|Razor|Rev|Roach|Saint|Show|Shotgun|Snake|Sore|Suit|Trigger|Unwanted|Viper|Waiter|Wall|Watcher|Weasel|Whisperer|Wire|Wolf|Zealot|Zero|Zookeeper|Plumber|Kleaner}" {family}',
        '"{Ammo|Angel|Animal|Baby Face|Babycakes|Baldo|Bananas|Band-Aid|Bats|Beans|Beef|Bench|Bix|Black Eye|Blackjack|Blaze|Bloody|Blue Eyes|Blue Nose|Books|Boxcars|Bugs|Bugsy|Butterfingers|Candles|Coins|Cold Finger|Crackers|Cranky|Creaky|Cue Ball|Cuts|Dasher|Devious|Dice|Digger|Droopy|Eyes|Fangs|Fast Trigger|Flames|Flowers|Foot Long|Framed|Freckles|Free Style|Frosty|Goldie|Greasy Thumb|Great White|Ha-Ha|Half Full|Happy|Hell Raiser|Holy Smoke|Hot Shot|Icepick|Itchy|Jezebel|Kid Blast|Kid Twist|King Kool|Knots|Knuckles|Ladykiller|Lefty|Long Hair|Looney|Lucky|Machine Gun|Maniac|Matches|Midnight|Moneybags|Needles|Nitro|Numbers|Old Creepy|One Arm|Patch-Eye|Payola|Peanuts|Pee Wee|Pinky|Popcorn|Pork \'n Beans|Roadkill|Roulette|Scarface|Scars|Scumbag|Seven Clip|Shades|Shady Eyes|Shaggy|Sharp Edge|Sharpie|Shiny|Shocker|Short Stack|Side Step|Silver Dollar|Skidmarks|Slingshot|Sluggo|Smiley|Smokey|Sneakers|Spanky|Sparkey|Spinner|Squeaky|Squinty|Sticks|Sticky Fingers|Stonewall|Tick Tock|Toothless|Trails|Twinkle Cakes|Two Guns|Two Holes|Wheels|Wild Child}" ({given} {family})'
    ]
};

var typeKeys = ion.keys(types);

function rankPatrol(service, gang) {
    var prof = db.find(service);
    gang.members.forEach(function(member) {
        member.traits.Military = 0.5; // member.traits.Government
        prof.assignRank(member);
        member.traits.Military = 1; // member.traits.Government
    });
    // By luck, this may still produce a private and not someone of higher military rank.
    var last = ion.last(gang.members), lowRank = gang.members[0].honorific;
    last.traits.Military = 4;
    do {
        prof.assignRank(last);
    } while (last.honorific === lowRank);

}
function isFoodOrPersonal(item, count) {
    return item.is('food') || item.is('kit:personal');
}
function getNicks(c) {
    return nicknames[(ion.test(80)) ? "both" : c.male ? "male" : "female"];
}

/**
 * Get the list of types that can be used when creating a gang.
 * @example
 *     atomic.getGangTypes()
 *     => ["Biker Gang", ... "Marine Patrol"]
 *
 * @static
 * @method getGangTypes
 * @for atomic
 *
 * @return {Array} The types of gangs. One of these values is a valid type for
 *      `atomic.createGang()`
 */
module.exports.getGangTypes = function() {
    return typeKeys.sort();
};

/**
 * @static
 * @method assignNickname
 * @for atomic
 *
 * @param character {atomic.models.Character} the character to assign a nickname
 *      to. Nickname is assigned to the character's name.
 * @return {String} the nick name
 */
function assignNickname(character) {
    var nicks = getNicks(character);
    var nick = ion.random(nicks);
    character.name.nickname = ion.format(nick, character.name);
    return nick;
};
module.exports.assignNickname = assignNickname;

/**
 * Generate a gang (a group of people who are likely to be hostile to the players, and often
 * returned as part of encounter creation).
 *
 *     atomic.createGang({type: 'Scavenger Party', count: 6});
 *     => gang
 *     gang.members.length
 *     => 6
 *
 * @static
 * @method createGang
 * @for atomic
 *
 * @param [params] {Object} params
 *     @param [params.type] {String} the type of gang. This encapsulates the number, traits,
 *      and other information about the gang.
 *     @param [params.count] {Number} the number of members in the gang. If no number is supplied,
 *      a type-specific default will be used
 * @return {atomic.models.Gang} the gang generated
 */
module.exports.createGang = function(params) {
    params = ion.extend({}, params || {});

    var gangType = params.type || ion.random(typeKeys),
        gangSpec = types[gangType];

    if (ion.isUndefined(gangSpec)) {
        throw new Error("Invalid gang type: " + gangType);
    }

    var count = ion.isNumber(params.count) ? params.count : ion.roll(gangSpec.count);
    var opts = {
        kind: gangType
    };
    if (gangSpec.names) { // TODO: Calling random twice is... odd. And you do it below, too
        opts.name = ion.random(gangSpec.names);
    }
    var gang = new Gang(opts);

    ion.times(count, function() {
        var c = createCharacter({
            "profession": ion.random(gangSpec.prof),
            "traits": gangSpec.traits || {}
        });
        c.initiative = ion.roll("2d6") + c.trait('Agile');
        c.hp = 10 + c.trait('Tough');

        if (ion.test(gangSpec.nicks)) {
            assignNickname(c);
        }
        // Remove food and personal items, because, it's dumb when gangs are carrying Twinkle Cakes.
        c.inventory.filter(isFoodOrPersonal);
        gang.add(c);
    });
    if (gangSpec.mil && gang.members.length) {
        rankPatrol(gangSpec.mil, gang);
    }
    gang.members.sort(function(a,b) {
        return a.initiative < b.initiative ? 1 : a.initiative > b.initiative ? -1 : 0;
    });
    return gang;
};
},{"../ion":23,"../models/gang":28,"./character":11,"./data":14}],17:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Item = require('../models/item');
var Bag = require('../models/bag');

var warTitles = ['am_i_proud', 'america_calling', 'are_you_playing_square', 'be_a_victory_farm_volunteer',
    'books_are_weapons_in_the_war_of_ideas', 'both_are_weapons', "carry_on_don't_be_carried_out",
    'do_the_job_he_left_behind', 'farm_scrap_builds_tanks_&_guns', 'fontana_dam', 'food_is_a_weapon',
    'food_is_fighting_strength', 'for_service_in_civilian_defense', 'forgetfulness_helps_the_enemy',
    'foxy_foreign_ideas', "free_speech_doesn't_mean_careless_talk", 'groundwork_for_victory', 'harvest_war_crops',
    'help_harvest', 'help_win_the_war', "here's_a_war_job_for_you", 'hunger_breeds_madness', 'is_your_trip_necessary',
    "it's_only_1000_minutes_from_cheyenned_to_berlin", 'join_the_schools_at_war_program', "my_tank's_in_the_war_too",
    'on_time_all_the_time', 'plan_a_victory_garden', 'plan_today_build_tomorrow', 'processed_food_is_ammunition',
    'rationing_means_a_fair_share_for_all_of_us', 'report_faulty_wiring', 'right_is_might', 'save_your_cans',
    'scrap', 'scrap_will_help_win', 'share_a_ride', 'share_your_car', 'shoot_to_kill', 'silence_means_security',
    'soldiers_without_guns', 'stamp_out_black_markets', 'sucker', 'take_your_place_in_civilian_defense',
    'the_2nd_front_depends_on_the_home_front', 'the_army_needs_more_lumber', 'the_inland_way_for_the_USA',
    'the_key_to_victory', 'the_world_cry_food', 'this_war', 'today', 'together_we_can_do_it', 'together_we_win',
    'vacation_at_home', 'victory_is_a_question_of_stamina', 'victory_patterns', 'wanted_for_victory',
    'washington_beckons_you', "we're_needed_again", 'we_are_helping_with_salvage', 'work_in_a_food_processing_plant',
    'your_country_needs_soybeans', 'your_victory_garden'];

var movieTitles = ['100_rifles', '23_paces_to_baker_street', 'aces_high', 'atomic_city', 'atomic_kid', 'atomic_man',
    'atomic_monster', 'atomic_submarine', 'atomictpistols', 'bad_mans_river', 'bandolero', 'bullet_for_a_badman',
    'canadian_mounties_vs_atomic_invaders', 'cattle_empire', 'cheaper_by_the_dozen', 'count_five_and_die',
    'crack_in_the_mirror', 'day_of_the_triffids', 'desert_hell', 'dig_that_uranium', 'east_of_eden', 'emmanuelle',
    'england_made_me', 'family_doctor', 'frankenstein_and_the_monster_from_hell', 'gang_war', 'garden_of_evil',
    'gone_with_the_wind', 'guns_for_san_sebastian', 'hombre', 'hotel_sahara', 'impulse', 'in_love_and_war',
    'intent_to_kill', 'julius_caesar', 'junior_army', 'kiss_of_the_vampire', 'lion_of_the_desert', 'lost_lives',
    'man_hunt', 'moon_zero_two', 'night_was_our_friend', 'nor_the_moon_by_night', 'operation_uranium', 'pretty_poison',
    'return_of_the_texan', 'rocket_to_the_moon', 'rogues_yarn', 'sierra_baron', 'sumuru', 'sword_of_sherwood_forest',
    'teenage_rebel', 'the_black_castle', 'the_brass_bottle', 'the_chalk_garden', 'the_curse_of_the_mummys_tomb',
    'the_deep_blue_sea', 'the_dunwich_horror', 'the_fiend_who_walked_the_west', 'the_gamma_people', 'the_gift_of_love',
    'the_hallelujah_trail', 'the_hellfire_club', 'the_hound_of_the_baskervilles', 'the_legend_of_frenchie_king',
    'the_lieutenant_wore_skirts', 'the_long_hot_summer', 'the_man_who_never_was', 'the_man_with_the_x-ray_eyes',
    'the_many_loves_of_hilda_crane', 'the_mummy', 'the_raid', 'the_reward', 'the_riddle_of_the_sands',
    'the_sheriff_of_fractured_jaw', 'the_sleeping_tiger', 'the_sun_also_rises', 'the_viking_queen', 'the_wind_cannot_read',
    'the_young_warriors', 'them', 'three_little_girls_in_blue', 'uraniumboom', 'villa', 'wolf_dog'];

function poster(collection, type, fileExt, value) {
    return collection.map(function(base, i) {
        var name = type + " poster";
        var title = ion.format("{0} #{1} of {2}", ion.titleCase(base.replace(/_/g," ")), (i+1), collection.length);

        return new Item({ name: name, title: title,
            image: "images/" + type + "/" + base + fileExt, value: value, enc: 1, tags: ['collectible'] });
    });
}

function namer(base, type, count, total) {
    var title = ion.titleCase(base.replace(/_/g," "));
    return ion.format("{|}{0} {1} poster collectible (#{2} of {3})", title, type, (count+1), total);
}

var encyclopedias = ["I","II","III","IV","V","VI","VI","VII","VIII","IX","X","XI","XII","XIII",
    "XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XIV"].map(function(numeral, i) {
    var letter = (i === 23) ? "XYZ" : String.fromCharCode(i + 65);
    var title = "Encyclopedia Britannica vol. " + numeral + ", letter "+letter+", #"+(i+1)+" of 24";
    return new Item({name: "encyclopedia", title: title, value:10, enc:5, tags: ['collectible']});
});

var bbCards = {
    'Baltimore Orioles': ['George Zuverink', 'Jim Busby', 'George Kell', 'Joe Ginsberg', 'Billy O\'Dell', 'Joe Durham', 'Billy Gardner', 'Jerry Walker', 'Eddie Miksis', 'Ken Lehman', 'Bob Nieman', 'Willy Miranda', 'Art Ceccarelli', 'Jack Harshman', 'Frank Zupo', 'Al Pilaik', 'Connie Johnson', 'Bob Boyd', 'Brooks Robinson', 'Bert Hamric', 'Billy Loes', 'Hal Brown', 'Gene Woodling', 'Foster Castleman', 'Gus Triandos', 'Jim Marshall', 'Milt Pappas', 'Arnie Portocarrero', 'Lenny Green' ],
    'Boston Red Sox': [ 'Ted Williams', 'Frank Sullivan', 'Ted Lepcio', 'Dick Gernert', 'Dave Sisler', 'Pete Daley', 'Billy Klaus', 'Jackie Jensen', 'Billy Consolo', 'Frank Baumann', 'George Susce', 'Haywood Sullivan', 'Leo Kiely', 'Tom Brewer', 'Gene Stephens', 'Frank Malzone', 'Pete Runnels', 'Jim Piersall', 'Don Buddin', 'Ike Delock', 'Bob Porterfield', 'Mike Fornieles', 'Marty Keough', 'Lou Berberet', 'Willard Nixon', 'Murray Wall', 'Sammy White', 'Bob Smith', 'Bill Renna', 'Frank Malzone', 'Ted Williams', 'Jackie Jensen' ],
    'Chicago Cubs': ['Dale Long', 'Cal Neeman', 'Dave Hillman', 'Lee Walls', 'Dick Drott', 'Chuck Tanner', 'Bobby Adams', 'Walt Moryn', 'Moe Drabowsky', 'Bobby Morgan', 'Taylor Phillips', 'Elvin Tappe', 'Jim Bolger', 'Bob Anderson', 'Jerry Kindall', 'Dick Littlefield', 'Turk Lown', 'Sammy Taylor', 'Ernie Banks', 'Jim Brosnan', 'Don Elston', 'John Goryl', 'Tony Taylor', 'Bobby Thomson', 'Gene Fodge', 'Ed Mayer', 'Glen Hobbie', 'Ernie Banks' ],
    'Chicago White Sox': ['Jim Rivera', 'Ron H. Jackson', 'Billy Piee', 'Bill Fischer', 'Luis Aparicio', 'Early Wynn', 'Jim Landis', 'Jim Derrington', 'Earl Torgeson', 'Les Moss', 'Jim Wilson', 'Al Smith', 'Bob Keegan', 'Bubba Phillips', 'Billy Goodman', 'Ray Moore', 'Sherm Lollar', 'Dick Donovan', 'Tito Francona', 'Walt Dropo', 'Don Rudolph', 'Earl Battey', 'Nellie Fox', 'Jerry Staley', 'Dixie Howell', 'Sammy Esposito', 'Tom Qualters', 'Nellie Fox', 'Luis Aparicio', 'Sherm Lollar' ],
    'Cincinnati Reds': ['George Crowe', 'Bud Freeman', 'Bob Thurman', 'Smoky Burgess', 'Joe Nuxhall', 'Gus Bell', 'Jerry Lynch', 'Harvey Haddix', 'Stan Palys', 'Bob Henrich', 'Tom Acker', 'Dee Fondy', 'Don Hoak', 'Johnny Temple', 'Willard Schmidt', 'Bill Wight', 'Johnny Klippstein', 'Alex Grammas', 'Frank Robinson', 'Hal Jeffcoat', 'Bob Purkey', 'Ed Bailey', 'Steve Bilko', 'Roy McMillan', 'Brooks Lawrence', 'Charley Rabe', 'Dutch Dotterer', 'Vada Pinson', 'Pete Whisenant', 'Johnny Temple', 'Frank Robinson', 'Ed Bailey' ],
    'Cleveland Indians': [ 'Bob Lemon', 'Hal Naragon', 'Don Mossi', 'Roger Maris', 'Chico Carrasquel', 'Dick Williams', 'George Strickland', 'Dick Tomanek', 'Russ Nixon', 'Vic Wertz', 'Joe Caffie', 'Mike Gaia', 'Cal McLish', 'Bud Daley', 'Mickey Vernon', 'Larry Raines', 'Bobby Avila', 'Minnie Minoso', 'Hoyt Wilhelm', 'Fred Hatfield', 'Herb Score', 'Rocky Colavito', 'Billy Moran', 'Mudcat Grant', 'Larry Doby', 'Ray Narleski', 'Billy Harrell', 'Carroll Hardy', 'Dick Brown', 'Gary Geiger', 'Don Ferrarese', 'Herb Score' ],
    'Detroit Tigers': ['Billy Hoeft', 'J.W. Porter', 'Lou Sleater', 'Tim Thompson', 'Al Kaline', 'Steve Boros', 'Frank Bolling', 'Gus Zernial', 'Jim Bunning', 'Harry Byrd', 'Ray Boone', 'Bob Shaw', 'Red Wilson', 'Reno Bertoia', 'Frank Lary', 'Johnny Groth', 'Billy Martin', 'Paul Foytack', 'Gail Harris', 'Lou Skizas', 'Hank Aguirre', 'Jim Hegan', 'Tom Morgan', 'Charlie Maxwell', 'Bill Taylor', 'Harvey Kuenn', 'Charley Lau', 'Vito Valentinetti' ],
    'Kansas City Athletics': [ 'Alex Kellner', 'Bill Tuttle', 'Bob Martyn', 'Joe DeMaestri', 'Wally Burnette', 'Billy Hunter', 'Harry Chiti', 'George Brunet', 'Hector Lopez', 'Ralph Terry', 'Milt Graff', 'Woodie Held', 'Duke Maas', 'Tom Gorman', 'Hal W. Smith', 'Virgil Trucks', 'Ned Garver', 'Mike Baxes', 'Frank House', 'Bob Cerv', 'Murry Dickson', 'Jack Urban', 'Ray Herbert', 'Dave Melton', 'Vic Power', 'Preston Ward' ],
    'Los Angeles Dodgers': ['Charlie Neal', 'Don Drysdale', 'John Roseboro', 'Don Zimmer', 'Duke Snider', 'Sandy Amoros', 'Johnny Podres', 'Dick Gray', 'Gil Hodges', 'Sandy Koufax', 'Roger Craig', 'Rube Walker', 'Jim Gilliam', 'Don Demeter', 'Carl Erskine', 'Gino Cimoli', 'Randy Jackson', 'Clem Labine', 'Elmer Valo', 'Don Newcombe', 'Danny McDevitt', 'Joe Pignatano', 'Pee Wee Reese', 'Don Bessent', 'Carl Furillo', 'Ed Roebuck' ],
    'Milwaukee Braves': ['Lou Burdette', 'Felix Mantilla', 'Hank Aaron', 'Del Rice', 'Ernie Johnson', 'Bob Hazle', 'Johnny Logan', 'Frank Torre', 'Wes Covington', 'Don McMahon', 'Bob Taylor', 'Bob Buhl', 'Red Schoendienst', 'Andy Pafko', 'Carl Sawatski', 'Casey Wise', 'Bob Trowbridge', 'Warrenahn', 'Ray Shearer', 'Bob Rush', 'Joe Adcock', 'Bill Bruton', 'Del Crandall', 'Carl Willey', 'Gene Conley', 'Eddie Mathews', 'Harry Hanebrink', 'Joe Jay', 'Eddie Mathews', 'Hank Aaron', 'Warrenahn' ],
    'New York Yankees': ['Hank Bauer', 'Gil McDougald', 'Sal Maglie', 'Norm Siebern', 'Darrell Johnson', 'Johnny Kucks', 'Bobby Richardson', 'Tom Sturdivant', 'Enos Slaughter', 'Mickey Mantle', 'Don Larsen', 'Marv Throneberry', 'Jerry Lumpe', 'Bob Grim', 'Bill Skowron', 'Bob Turley', 'Elston Howard', 'Ryne Duren', 'Harry Simpson', 'Whitey Ford', 'Andy Carey', 'Art Ditmar', 'Yogi Berra', 'Al Cicotte', 'Tony Kubek', 'Bobby Shantz', 'Bill Skowron', 'Mickey Mantle', 'Bob Turley' ],
    'Philadelphia Phillies': ['Rip Repulski', 'Ted Kazanski', 'Chuck Harmon', 'Joe Lonnett', 'Dick Farrell', 'Robin Roberts', 'Dave Philley', 'Harry Anderson', 'Willie Jones', 'Jack Meyer', 'Solly Hemus', 'Richiehburn', 'Warren Hacker', 'Jack Sanford', 'Granny Hamner', 'Mack Burk', 'Don Landrum', 'Jim Hearn', 'Bob Miller', 'Chico Fernandez', 'Stan Lopata', 'Don Cardwell', 'Wally Post', 'Curt Simmons', 'Bob Bowman', 'Pancho Herrera', 'Chuck Essegian', 'Ray Semproch' ],
    'Pittsburgh Pirates': [ 'Hank Foiles', 'Dick Groat', 'Robertoemente', 'Roy Face', 'Ron Kline', 'Bob Skinner', 'Jim Pendleton', 'Vern Law', 'Buddy Pritchard', 'Don Gross', 'Ted Kluszewski', 'Bill Virdon', 'Dick Rand', 'Bob Smith', 'Bill Mazeroski', 'Paul Smith', 'Gene Freese', 'Whammy Douglas', 'Bob Friend', 'Harding Peterson', 'Gene Baker', 'Bennie Daniels', 'Frank Thomas', 'Johnny O\'Brien', 'John Powers', 'Danny Kravitz', 'Roman Mejias', 'Ron Blackburn', 'R.C. Stevens', 'Bob Friend' ],
    'San Francisco Giants': ['Willie Mays', 'Curt Balay', 'Mike McCormick', 'Darylencer', 'Valmy Thomas', 'Ozzie Virgil Sr.', 'Stu Miller', 'Willie Kirkland', 'Jim Finigan', 'Johnny Antonelli', 'Danny O\'Connell', 'Dave Jolly', 'Whitey Lockman', 'Pete Burnside', 'Don Mueller', 'Eddie Bressoud', 'Ray Crone', 'Ray Katt', 'Paul Giel', 'Jim King', 'Ruben Gomez', 'Orlando Cepeda', 'Ray Jablonski', 'Hank Sa', 'Marv Grissom', 'Jim Davenport', 'Al Worthington', 'Bobeake', 'Ray Monzant', 'Bob Schmidt', 'Willie Mays' ],
    'St. Louis Cardinals': ['Eddie Kasko', 'Hobie Landrith', 'Morrie Martin', 'Del Ennis', 'Von McDaniel', 'Larry Jackson', 'Dick Schofield', 'Irv Noren', 'Alvin Dark', 'Billy Muffett', 'Joe Cunningham', 'Lindy McDaniel', 'Don Blasingame', 'Wally Moon', 'Lloyd Merritt', 'Herm Wehmeier', 'Hal R. Smith', 'Sam Jones', 'Ken Boyer', 'Gene Green', 'Wilmer Mizell', 'Bobby Gene Smith', 'Philark', 'Phil Paine', 'Joe Taylor', 'Curt Flood' ],
    'Washington Senators': ['Jim Lemon', 'Texevenger', 'Art Schult', 'Bud Byerly', 'Clint Courtney', 'Herb Plews', 'Bob Usher', 'Russ Kemmerer', 'Dick Hyde', 'Eddie Yost', 'Milt Bolling', 'Camilo Pascual', 'Ed Fitz Gerald', 'Chuck Stobbs', 'Roy Sievers', 'Rocky Bridges', 'Harmon Killebrew', 'Neil Chrisley', 'Albie Pearson', 'Pedro Ramos', 'Bobby Malkmus', 'Ralph Lumenti', 'Steve Koheck', 'Kenpromonte', 'Norm Zauchin', 'Whitey Herzog', 'Hal Griggs', 'Julio Becq' ]
};

var i=1;
var baseball = [];
Object.keys(bbCards).forEach(function(team) {
    bbCards[team].forEach(function(player) {
        var name = "Pennant brand 1958 baseball card{|s}";
        var title = player + ", " + team + ", #"+(i++)+" of 466";
        baseball.push(new Item({name: name, title: title, enc: 0, value: 3, tags: ['collectible']}));
    });
});

// Survival books... however, many of these are from after the 50s. The titles are good though.
// Need other things that are more survival oriented because this is not really relevant in the
// time period of these games.

// "Medical Planning & Response Manual for a Nuclear Detonation Incident: A Practical Guide"
// "Nuclear Dangers: Myths and Facts"
// "Nuclear Detonation Preparedness"
// "Nuclear War Survival Skills"
// "Nuclear War Survival"
// "Planning Guidance for Response to a Nuclear Detonation"
// "Protection in the Nuclear Age"
// "Recovery from Nuclear Attack"
// "U.S. Army Survival Manual"

// magazines, comics, other serials
// specific books or book collections
// specific kinds of electronic or mechanical parts

var collectibles = {
    "movie posters": poster(movieTitles, "movie", ".jpg", 10),
    "propaganda posters": poster(warTitles, "propaganda", ".gif", 10),
    "encyclopedias": encyclopedias,
    "baseball cards": baseball
};

/**
 * Create an item of memorabilia. These items are collectibles, worth a great deal of money
 * in sets or when traded with the right collector.
 *
 * @static
 * @method createMemorabilia
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.type='movie posters'] {String} the type of collectible item to
 *          return.
 * @return {atomic.models.Item} a collectible item
 */
/**
 * Create an item of memorabilia. These items are collectibles, worth a great deal of money
 * in sets or when traded with the right collector.
 *
 * @static
 * @method createMemorabilia
 * @for atomic
 *
 * @param [type='movie posters'] {String} type - the type of memorabilia to generate
 * @return {atomic.models.Item} a collectible item
 */
function createMemorabilia(params) {
    var type = (ion.isString(params)) ? params : (params && params.type || "movie posters");

    if (!collectibles[type]) {
        throw new Error(type + " is an invalid collectible, use " + Object.keys(collectibles).join(', '));
    }
    return ion.random(collectibles[type]);
}

/**
 * Return the valid types of memorabilia that can be used when calling `createMemorabilia`.
 *
 * @static
 * @method getMemorabiliaTypes
 * @for atomic
 *
 * @return {Array} an array of string types that can be used to generate a collectible.
 */
function getMemorabiliaTypes() {
    return Object.keys(collectibles);
}

/**
 * Memorabilia is generally not very valuable unless a collector can be found who values it as part of
 * a larger collection. Toward that end, this method creates a "pick list" of desirable instances of a
 * type of memorabilia (volumes of an encyclopedia, posters for specific movies, etc.). If a character has
 * one of these desirable items to trade, and knows or senses it is in demand, the value is greatly increased.
 *
 * @static
 * @method createMemorabiliaWanted
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.type] {String} the type of collectible item to return. Picks a random type if
*              none is specified.
 * @return {String} a description of what is being sought out for trade
 */
function createMemorabiliaWanted(params) {
    var type = (ion.isString(params)) ? params : (params && params.type || ion.random(Object.keys(collectibles)));
    var coll = collectibles[type];
    var count = Math.floor(ion.gaussian(coll.length/8,coll.length/4));

    // collects a team rather than individual cards.
    if (type === "baseball cards" && ion.test(20)) {
        var team = ion.random(Object.keys(bbCards));
        return "Collector is looking for any baseball card for the " + team + ".";
    }

    // Not using a bag at this point
    // http://www.2ality.com/2013/11/initializing-arrays.html
    // may move to ion.
    var titles = Array.apply(null, Array(count)).map(function() {
        return ion.random(coll).title;
    });
    return "Collector is looking for " + type + ": " + titles.join(", ") + ".";
}

module.exports = {
    createMemorabilia: createMemorabilia,
    getMemorabiliaTypes: getMemorabiliaTypes,
    createMemorabiliaWanted: createMemorabiliaWanted
};


},{"../ion":23,"../models/bag":25,"../models/item":30}],18:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var RarityTable = require('../tables/rarity_table');
var createCharacterName = require('./character_name');

// Something that makes ranch names, like 44; A Bar A; A X Ranch; Bar B/C/M/V/X, latName Ranch

function regionByLocation(location) {
    return ion.random( (location === "River" && ion.test(100)) ? water_regional : regional );
}
function getName() {
    // I think using the first name may be stupid.
    var name = createCharacterName();
    return (ion.test(10)) ? name.given : name.family;
}

// Woods, Forest, are not part of this terrain at all.
// Also wetlands, really?
// "{Ditch|Gap}"
// "{Knoll}"
// Alcohol|Moonshine

// GNIS categories: island, canal, stream, lake, channel, summit, gut

// Sad Hill Cemetary
// Austin, Babbitt
// Mine, Claim
// Some "regional" modifiers, like bare or lame, only apply to animals
// A lot of descriptives could be used in settlment names, e.g. Buckville or "Foxvale"
// The "real" options are really settlment names, not place names. See above statement as well.

// Bottom Dollar, Last Chance
var locative = {
    'Depression': ["Alley", "Arroyo", "Basin", "Canyon", "Creek", "Gap", "Gulch", "Gully", "Hollow", "Valley"],
    'Flat': ["Flat{|s}", "Prairie", "Meadow{|s}", "Field", "Range", "Plain"],
    'Elevation': ["Butte", "Bluffs", "Cliff", "Mountain{|s}", "Point", "Pass", "Spur", "Ridge", "Butte", "Mesa", "Gap", "Rock", "Hill{|s}", "Summit", "Plateau"],
    'Water': ["Spring{|s}", "Lake", "Pond", "Bar", "Basin", "Creek", "River", "Reservoir", "Rapids", "Stream", "Wetlands", "Swamp", "Falls", "Dam", "Slough"],
    'Junction': ["Bend", "Bridge", "Junction", "Crossing"],
    'Woods': ['Woods', 'Forest']
};
var descriptive = ["Adobe", "{Agate|Amethyst|Geode|Diamond}", "Alkali", "Ant{|hill}", "Antelope", "Antler", "Anvil", "{Apple|Peach}", "Arrow{|head|tail}",
    "{Arlington|American|Army|Military|Soldier}", "{Arapahoe|Navajo|Sioux}", "{Alaska|Arizona|Wyoming|Colorado|California}", "Artesian",
    "{Ash|Pine|Oak|Aspen|Cottonwood}", "Bachelor", "Badger", "Badlands", "Bald", "Bann{er|ock}", "Bastard", "Barber", "Bard", "Barrel",
    "Battle", "Bear{|paw|tooth|trap}", "{Bear|Elk} Trap", "Beaver", "Bell", "Bench", "Berry", "Big{| Hill| Horn| Chief| Cow}", "Biscuit",
    "Bison", "Bobcat", "Bone{|yard}", "Boulder", "Brush", "Buck{|skin}", "Buffalo", "Bull", "Burnt", "Buzzard's", "Calamity", "Cedar", "Chalk", "Chief", "Chimney",
    "Cinder", "Clay", "Coal", "Coffin", "{Copper|Iron|Limestone|Sulphur}", "Cornstalk", "Cotton{|wood}", "Cougar", "Coyote", "Crescent",
    "Crooked", "Crow", "Deadwood", "Deer", "Dream", "Dry", "Eagle", "{|Big |Little }Elk", "Eureka", "Fox", "Frog", "Gold Dust", "Goose",
    "Gopher", "Granite", "Green", "Grinders", "Grouse", "Gypsum", "Hawk", "Hay{|stack}", "Hells", "Honey{|comb}", "Horse{shoe| Pasture}",
    "Indian", "Juniper", "{Little |}Sheep", "Lone{| Tree}", "Long", "{Monolith|Monument}", "Mud", "{Mule|Burro}", "Phantom", "Pinnacle", "Poker", "Pole",
    "Potter", "Prairie Dog", "Railroad", "Rattlesnake", "Rock{|y}", "Round", "Sage", "Sawmill", "Shady", "Shotgun", "Skeleton", "Slaughter",
    "Soda", "Squaw", "Stone", "Tungsten", "Twin", "Wagon{|wheel|hound}", "Wild", "Willow", "Wolf", "Young", "{Bad|Black|Dead|Mad} Dog",
    "{Big |Little |}Pine{| Flat}", "{Big|Black|Broken|Red} Rock", "{Dead|Blind} Man's", "{Saddle|Dead|Lame|Happy|Wild} Horse"
];

var real = ["Alfalfa", "Big Curve", "Bottom Dollar", "Buckeye", "Buzzard's Roost", "Casa Diablo", "Deadwood", "Faraday", "Harmony", "Hidden Valley", "Irondale",
    "Jack Rabbit", "Last Chance", "Saddlestring", "Leadville", "Palo Verde", "Pea Vine", "Point Blank", "Red-Eye", "Sunshine", "Tanglefoot", "Utopia"
];

var regional = ["Bad","{Bald|Bare}","Big","Dead","Happy","New","Middle","{North|South|East|West}","Lost","Old","Little","{Brown|Silver|Gold|Black|Red|Blue|White|Yellow}"];

var water_regional = "{North|South|East|West|Middle} Fork of the";

var patterns = new RarityTable(ion.identity, false);
patterns.add('rare', function(type) {
    // East Pond
    return ion.random(regional) + " " + ion.random(locative[type]);
});
/* eh
 patterns.add('rare', function(type) {
 // The Rock Junction
 return ion.format("The {0} {1}", ion.random(descriptive), ion.random(locative[type]));
 });*/
patterns.add('uncommon', function(type) {
    // West Anderson Junction
    var location = ion.random(locative[type]);
    return regionByLocation(location) + " " + getName() + " " + ion.random(locative[type]);
});
patterns.add('uncommon', function(type) {
    // West Bison Lake
    var location = ion.random(locative[type]);
    return regionByLocation(location) + " " + ion.random(descriptive) + " " + location;
});
patterns.add('rare', function(type) {
    // Ford Trail Pond
    var name = (ion.test(50)) ? ion.random(descriptive) : getName();
    return name + " Trail " + ion.random(locative[type]);
});
patterns.add('rare', function(type) {
    // Alfalfa
    return ion.random(real);
});
patterns.add('common', function(type) {
    // Red Hollow
    return ion.random(descriptive) + " " + ion.random(locative[type]);
});
patterns.add('common', function(type) {
    // Williams Crossing
    return getName() + " " + ion.random(locative[type]);
});
var landforms = ion.keys(locative);

/**
 * Generate a random place name.
 * @example
 *     atomic.createPlaceName("Water");
 *     => "West Rock Springs"
 *
 * @static
 * @method createPlaceName
 * @for atomic
 *
 * @param type {String} landform type (see `atomic.getLandformTypes()`)
 * @return {String} name
 */
module.exports.createPlaceName = function(type) {
    type = (landforms.indexOf(type) === -1) ? ion.random(landforms) : type;
    return ion.random(patterns.get()(type));
};

/**
 * The valid types that can be used when calling the `atomic.createPlaceName()` method.
 *
 * @static
 * @method getLandformTypes
 * @for atomic
 *
 * @return {Array} an array of landform types
 */
module.exports.getLandformTypes = function() {
    return landforms;
};
},{"../ion":23,"../tables/rarity_table":39,"./character_name":12}],19:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Item = require('../models/item');
var itemDb = require('./data').itemDatabase;

// Some books are just for fun, some would be useful for gaining experience given a known
// list of skills, and it would be nice to point that out (e.g. "Bargain +3xp"). Seems okay to
// me to have canned titles as well that don't follow the rules, just to mix things up.
// "Observational Signatures of Self-Destructive Civilisations"
// http://arxiv.org/pdf/1507.08530v1.pdf

var adj = ["all", "amazing", "astonishing", "atomic", "bolshevik", "boy's", "dark", "dynamic", "exciting",
    "favorite", "gentleman's", "girl's", "incredible", "lady's", "northwest", "popular", "railroad man's",
    "ranch", "saucy", "spicy", "startling", "thrilling", "weird", "women's", "wonderful"];
var genres = ["adventure", "air", "cowboy", "detective", "fantasy", "far west", "FBI", "flying", "frontier",
    "ghost", "high seas", "horror", "indian", "jungle", "library science", "new love", "northwest", "outdoor",
    "pirate", "prison", "ranch", "romance", "sci-fi", "science", "supernatural", "sweetheart", "western"];
var base = ["almanac", "weekly", "magazine", "quarterly", "stories", "tales", "thrills"];
var cannedTitles = ["all-story", "argosy", "black mask", "cavalier", "keepsake", "ladies home almanac", "ocean",
    "scrap book"];

// split into nouns and adjectives... can make times for stories or individual pulp novels or something

var storyAdj = ["three", "white", "deep", "away", "back", "beyond", "great", "lost", "big", "like", "little", "living",
    "new", "long", "two", "small", "dead", "never", "last", "best", "dark", "old", "second", "first", "one",
    "cold", "red", "bad", "final", "broken", "just", "perfect", "green", "blue"];

var storyNouns = ["man", "summer", "witch", "time", "earth", "house", "heaven", "mind", "devil", "flight",
    "book", "mother", "star{|s}", "king", "thing{|s}", "stairs", "universe", "glass", "eye", "darkness", "lady",
    "end", "sun", "call", "woman", "water", "dance", "mars", "light", "moon", "black", "winter", "wind", "queen",
    "river", "dragon", "skin", "ghost{|s}", "alien", "", "garden", "war", "death", "monster{|s}", "dead", "never",
    "story", "bones", "soul", "blood", "mirror", "children", "beast", "men", "fire", "hell", "know", "demon",
    "planet", "snow", "dark", "ice", "god{|s}", "way", "heart", "stone", "door", "world{|s}", "human",
    "dream{|s}", "second", "family", "fall", "boy", "song", "city", "road", "place", "gift", "sky", "life",
    "shadow{|s}", "people", "flesh", "final", "memory", "tale", "wings", "day{|s}", "home", "game", "space",
    "tree", "eyes", "dust", "room", "name", "rain", "box", "thing", "sea", "night", "love", "girl", "machine",
    "child", "daughter", "future", "angel", "magic", "dream", "hand"];

// Unique base options (genreBases) add variety but conflict with some genres, so only use a unique when
// those genres (redundantWithGenres) are not in the title array
var genreBases = ["mysteries", "westerns", "thrillers","{love|ghost|true} stories"];
var redundantWithGenres = ["ghost","mystery","new love","western","high seas"];

var mag = "magazine ({0})";

function addIf(percent, array, options) {
    if (percent == 100 || ion.test(percent)) {
        array.push(ion.random(options));
    }
}

function pulpMagTitle() {
    if (ion.test(5)) {
        return 'The ' + ion.titleCase(ion.random(cannedTitles));
    }
    var array = [];
    addIf(35, array, adj);
    addIf(100, array, genres);
    addIf(15, array, genres);
    addIf(10, array, ["fiction"]);

    if (ion.test(80) || ion.intersection(array, redundantWithGenres).length) {
        array.push(ion.random(base));
    } else {
        array.push(ion.random(genreBases));
    }
    return ion.titleCase( ion.unique(array).join(' ') );
}

// NOTE: "High Seas Jungle Tales"

/**
 * Magazines will be produced as generic items in bags, loot, etc. This method returns a
 * magazine with an auto-generated title, usually pretty silly. The titles are random so
 * these magazines are not considered collectible.
 *
 * @static
 * @for atomic
 * @method createMagazine
 *
 * @return {atomic.models.Item} magazine with a title
 */
module.exports.createMagazine = function() {
    var mag = itemDb.find({tags: "magazine"});
    mag = new Item(mag);
    mag.title = pulpMagTitle();
    return mag;
};

module.exports.createBook = function() {
    throw new Error("Not implemented");
};

// These are all dreadful, and also this isn't useful. But it was an idea for some data that I
// wanted to try out.
module.exports.createTitle = function() {
    return ion.format("The {0} {1} of {2}", ion.random(storyAdj), ion.random(storyNouns), ion.random(storyNouns));
};

},{"../ion":23,"../models/item":30,"./data":14}],20:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var db = require('./data').professionDatabase;
var Character = require('../models/character');
var Family = require('../models/family');
var RarityTable = require('../tables/rarity_table');
var Relationship = require('../models/relationship');
var createCharacter = require('./character').createCharacter;
var createKit = require('./bag').createKit;
var createRace = require('./character').createRace;
var createCharacterName = require('./character_name');

// This creates pretty normal families. As always, the generators are for on-the-spot
// filler material, and aim for believability. Make up the more unusual families in
// your world.

var innate = db.find('innate');

var relationships = {
    grandmother: {g: "female", a: 0, r: ["grandson", "granddaughter"], n: 25},
    grandfather: {g: "male", a: 0, r: ["grandson", "granddaughter"], n: 25},
    aunt: {g: "female", a: 1, r: ["niece", "nephew"], n: 50},
    uncle: {g: "male", a: 1, r: ["niece", "nephew"], n: 50},
    mother: {g: "female", a: 1, r: ["son", "daughter"], n: 80},
    father: {g: "male", a: 1, r: ["son", "daughter"], n: 100},
    brother: {g: "male", a: 2, r: ["sister","brother"], n: 100},
    sister: {g: "female", a: 2, r: ["sister", "brother"], n: 100},
    cousin: {g: null, a: 2, r: ["cousin"], n: 25},
    niece: {g: "female", a: 2, r: ["aunt", "uncle"]},
    nephew: {g: "male", a: 2, r: ["aunt", "uncle"]},
    son: {g: "male", a: 2, r: ["mother", "father"]},
    daughter: {g: "female", a: 2, r: ["mother", "father"]},
    grandson: {g: "male", a: 2, r: ["grandmother", "grandfather"]},
    granddaughter: {g: "female", a: 2, r: ["grandmother", "grandfather"]}
};
var relNames = [];
for (var prop in relationships) {
    relationships[prop].name = prop;
    relNames.push(ion.titleCase(prop));
}
// You only have to put the older terms in this table because if you're using
// it, you're randomizing, and the younger will be selected from the older
var rtable = new RarityTable()
    .add("common", relationships.mother)
    .add("common", relationships.father)
    .add("common", relationships.brother)
    .add("common", relationships.sister)
    .add("uncommon", relationships.aunt)
    .add("uncommon", relationships.uncle)
    .add("uncommon", relationships.cousin)
    .add("rare", relationships.grandmother)
    .add("rare", relationships.grandfather);

function getAdultAge() {
    return 18 + ion.nonNegativeGaussian(7);
}

function makeFamily(parent, kin) {
    var gender = (parent.male) ? "female" : "male";
    var race = createRace();
    var other = new Character({
        "name": createCharacterName({gender: gender, race: race}),
        "race": race,
        "profession": getRelatedProfession(kin[0].profession),
        "gender": gender,
        "age": ion.bounded(parent.age+ion.gaussian(3), 18)
    });
    kin.push(other);
    var family = new Family({
        "parent": parent,
        "other": other,
        "relationship": "couple"
    });
    // must be deleted later from all chars, or cannot be turned into JSON and persisted
    parent.family = other.family = family;

    if (ion.test(80)) {
        family.relationship = "married";
        if (ion.test(90)) { // if married, will share the same last name most of the time.
            family.female.name.family = family.male.name.family;
        }
    }
    return family;
}

function getChildCount() {
    return ion.nonNegativeGaussian(2.5, 1) || getChildCount();
}

function makeChildren(family, kin) {
    var childCount = getChildCount();
    if (family.female.age < 40) {
        for (var i=0; i < childCount; i++) {
            makeChild(family, kin);
        }
        // Delay *after* the last child is born.
        var years = ion.nonNegativeGaussian(4,1);
        ageKin(kin, years);
    }
}

function makeChild(family, kin) {
    var gender = ion.random(["male","female"]);
    var child = new Character({
        "name": createCharacterName({gender: gender, "race": family.female.race}),
        "race": family.female.race,
        "gender": gender,
        "age": ion.roll("1d3")
    });
    kin.push(child);
    child.name.family = family.male.name.family;
    // This is a gap in the ages of the family.
    ageKin(kin, child.age + ion.roll("1d3-1"));
    family.children.push(child);
    child.family = family;
}

function ageFamilyUntilChildIsAdult(family, kin) {
    var child = ion.random(family.children);
    if (!child) {
        throw new Error("No child in this family");
    }
    var adultAge = getAdultAge();
    if (child.age >= adultAge) {
        return child;
    }
    ageKin(kin, adultAge - child.age);
    return child;
}

function ageKin(kin, age) {
    kin.forEach(function(person) {
        person.age += age;
    });
}

function getRelatedProfession(profession) {
    if (!profession) {
        throw new Error("There should always be a related profession");
    }
    if (ion.test(40)) {
        return profession;
    }
    // TODO: This is a hack to extract the prestige tag from the prestige of the profession object
    // Can't we ask for the prestige:* tag? Should all tags be namespaced like this?
    var prestige = ion.intersection(["high","low","normal"], db.find(ion.toTag(profession)).tags);
    return db.find(prestige + " -pre -innate").names[0];
}

function postProcess(kin) {
    kin.forEach(function(person) {
        // train
        var c = createCharacter({
            "name": person.name,
            "profession": person.profession || getRelatedProfession(kin[0].profession),
            "age": person.age,
            "gender": person.gender,
            "equip": false
        });
        ion.extend(person, c);

        // deaths
        var family = person.family;
        delete person.family;

        if (family.isParent(person)) {
            if (ion.test(Math.sqrt(person.age))) {
                person.status = "absent";
                family.relationship = (family.relationship === "married") ? "divorced" : "separated";
            } else if (ion.test(Math.sqrt(person.age))) {
                person.status = "deceased";
                family.relationship = (family.male === person) ? "widow" : "widower";
            }
        } else if (ion.test(Math.sqrt(person.age))) {
            person.status = "deceased";
        }
        if (person.profession) {
            person.inventory = createKit({profession: person.profession});
        }
    });
}

function nextGeneration(family, kin, i, gen) {
    makeChildren(family, kin);

    if (i < (gen-1)) {
        var parent = ageFamilyUntilChildIsAdult(family, kin);

        // TODO:
        // This *almost* works but the aging of family members proceeds through everyone,
        // it doesn't branch for kin lines that co-exist in time. Need a different way
        // to age people.
        var parents = [parent]; // maybeFindOtherParents(family, parent);
        parents.forEach(function(p) {
            var newFamily = makeFamily(p, kin);
            family.couples.push(newFamily);
            family.children.splice(family.children.indexOf(p), 1);
            nextGeneration(newFamily, kin, i+1, gen);
        });
    }
}

/*
 function maybeFindOtherParents(family, originParent) {
 return [originParent].concat(family.children.filter(function(child) {
 return ion.test(50) && child.age > 20 && child !== originParent;
 }));
 }
 */

/**
 * Create a nuclear family, with a specified number of generations.
 *
 * @static
 * @method createFamily
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.generations=2] {Number} number of generations in the family (one
 *          generation is a couple, two generations includes their children, three
 *          their grand-children, above 3 you're going to get a history lesson).
 *      @param [params.parent] {Object} the parameters to pass to the first character
 *          created, that will set the profession, race and name of sub-generations.
 * @return {atomic.models.Family} a family
 */
module.exports.createFamily = function(opts) {
    opts = opts || {};
    opts.generations = opts.generations || 2;
    opts.parent = opts.parent || {};
    opts.parent.age = (opts.parent.age || getAdultAge());

    var parent = createCharacter(opts.parent),
        kin = [parent],
        family = makeFamily(parent, kin),
        root = family;

    if (opts.generations > 1) {
        nextGeneration(family, kin, 1, opts.generations);
    }
    postProcess(kin);
    return root;
};

/**
 * Get a list of valid relationships. These are the valid values to pass to the
 * `atomic.createRelationship()` method.
 *
 * @static
 * @method getRelationships
 * @for atomic
 *
 * @return {Array} a list of relationship names
 */
module.exports.getRelationships = function() {
    return relNames.sort();
};

/**
 *
 * Creates a pair of characters who are related to each other. Both characters will be
 * adults (you an adjust the ages and ignore the adult traits, if needed).
 *
 * @static
 * @method createRelationship
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.older] {String} name of the older or lateral relationship (e.g. "aunt" or
 *          "sister").  The younger or lateral relationship is derived from the older term.
 *      @param [params.profession] {String} the profession for the related people
 *      @param [params.familyName] {String} the last name to share between relations
 *      @param [params.equip] {Boolean} should these characters be equipped?
 */
module.exports.createRelationship = function(params) {
    params = ion.extend({}, params || {});
    params.equip = ion.isBoolean(params.equip) ? params.equip : true;
    var olderRel = (params.older) ? relationships[params.older.toLowerCase()] : rtable.get();
    var youngerRel = relationships[ ion.random(olderRel.r) ];

    // Order the terms:
    var youngerAge, olderAge,
        ageDiff = Math.abs(olderRel.a - youngerRel.a);

    do {
        youngerAge = getAdultAge();
        olderAge = getAdultAge();
        for (var i=0; i < ageDiff; i++) {
            olderAge += getAdultAge();
        }
    } while(ageDiff > 0 && olderAge-youngerAge < (18*ageDiff));

    var older = createCharacter({
            age: olderAge,
            gender: olderRel.g,
            profession: params.profession,
            equip: params.equip
        }),
        younger = createCharacter({
            age: youngerAge,
            race: ion.test(olderRel.n) ? older.race : createRace(),
            gender: youngerRel.g,
            profession: params.profession,
            equip: params.equip
        }),
        relName = (olderRel === youngerRel) ? (olderRel.name + "s") : (olderRel.name+" and "+youngerRel.name);

    if (params.familyName) {
        older.name.family = params.familyName;
    }
    if (ion.test(olderRel.n)) {
        younger.name.family = older.name.family;
    }
    return new Relationship(older, younger, relName);
};

},{"../ion":23,"../models/character":26,"../models/family":27,"../models/relationship":35,"../tables/rarity_table":39,"./bag":10,"./character":11,"./character_name":12,"./data":14}],21:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Bag = require('../models/bag');
var Store = require('../models/store');
var Table = require('../tables/table');
var Name = require('../models/name');

var getGangTypes = require('./gang').getGangTypes;
var createGang = require('./gang').createGang;
var createPlaceName = require('./place_name').createPlaceName;
var db = require('./data').storeDatabase;
var assignNickname = require('./gang').assignNickname;
var createCharacter = require('./character').createCharacter;
var createCharacterName = require('./character_name');
var createRelationship = require('./relationships').createRelationship;
var createContainer = require('./bag').createContainer;
var createStockpile = require('./bag').createStockpile;
var deserializer = require('../models/lib').deserializer;
var clone = require('../models/lib').clone;

// This is not a store name:
// The Emily "The Kid" Flores Sporting Goods Store
// either use the nickname, the name, or the last name, but not multiples of same

/* Merchant types (should be merchant, not shop/store):
 *
 * http://www.tottenvillememories.net/businessess1950s.htm
 *
 * bar/tavern/saloon & grill
 * diner
 * bathhouse
 * stables
 * barbor
 * brewery/distillery/vineyard
 * baker
 * icehouse
 * leather store (leatherworker)
 * glassware
 * weaving
 * pharmacy ?
 * furniture/woodworking
 *  - sporting goods store (ammo, camping)
 * five and dime store/souvenir shop/drugstore
 *
 * Pre-Collapse (these are really ruins)
 * robot showroom
 * automobile showroom
 * office
 *
 * Location:
 * - roadside, camp, settlement, military, market (open air, e.g. fairgrounds)
 *
 * Size (allowable sizes for a type, each with a different inventory and different name):
 *
 * - vendor (single person with like a blanket on the ground)
 * - cart (cart, table, stand, stall)
 * - building (tent, cabin, building)
 * - warehouse (warehouse, depot, building)
 * - settlement: ["General Store", "Shop", "Store", "Market", "Mercantile", "Trading Post"]
 *
 * TESTS
 *  - can't submit "Cash On Hand" as a type.
 *  - can submit another type.
 */

var markup = [0.2, 0.33, 0.4],
    ownerStrategies = new Table(),
    nameStrategies = new Table(),
    policies = {
        // trade:sellhigh - sells higher than normal price - handled separately
        // trade:buylow - buys lower than normal prices - handled separately
        "trade:any": ["anything"],
        "trade:necessities": ["food", "ammo", "medicine"],
        "trade:luxuries": ["liquor", "pre-collapse junk food", "cigarettes"],
        "trade:currency": ["greenbacks", "casino chips", "gold and silver"],
        "trade:stocked": ["any item that would be stocked at this store"]
    };

var storeNames = {
    'clientele:lobrow': ["{Bull's Head|Holy Moses}", "{Red|Black|Blue} {Lightning|Cross}", "{Snake|Scorpion} Pit"],
    'clientele:nobrow': ["{Northern|Central|Southern|Western}", "{Red|Blue|Black} Star", "The {Buckaroo|Cowpoke}"],
    'clientele:hibrow': ["{The |}{Luxe|Satellite|Asteroid|Galaxy|Nebula}"]
};

nameStrategies.add(30, function(ownerName, placeName, nameString, clientele) {
    return placeName + " " + ion.random(nameString);
});
nameStrategies.add(15, function(ownerName, placeName, nameString, clientele) { // possessive
    var p = (/[sz]$/.test(ownerName)) ? "'" : "'s";
    var name = (ion.test(70)) ? ownerName.family : ownerName.toString();
    return name + p + " " + ion.random(nameString);
});
nameStrategies.add(15, function(ownerName, placeName, nameString, clientele) {
    var biz = ion.random(nameString);
    var name = (ion.test(70)) ? ownerName.family : ownerName.toString();

    return name + " " + biz;
});
nameStrategies.add(40, function(ownerName, placeName, nameString, clientele) {
    // To be selected from tags, which can be one or more of clientele:{no|lo|hi|brow"
    var names = storeNames[clientele];
    return ion.random(names) + " " + ion.random(nameString);
});

// If not a gang, may be a relationship or a person
ownerStrategies.add(20, function(config) {
    return createRelationship(config);
});
ownerStrategies.add(80, function(config) {
    var c = createCharacter(config);
    c.name = createCharacterName({family: c.name.family, gender: c.gender});
    if (ion.test(20)) {
        assignNickname(c);
    }
    return c;
});

function createPolicy(config) {
    var array = [];
    config.tags.forEach(function(tag) {
        if (policies[tag]) {
            array = array.concat(policies[tag]);
        }
    });

    var list = (config.policy) ? [config.policy] : [];
    list.push("Will trade for " + ion.toList(array, ion.identity, "or") + ".");
    if (config.tags.indexOf("trade:buylow")) {
        list.push("Unless receiving currency, this merchant buys low (half value).");
    }
    return list.join(' ');
}

/**
 * Create a merchant. Note that there are many parameter options, some mutually
 * exclusive. You would only pass in an owner's name or the owner character, not both,
 * for example. Passing in a place name does not guarantee it will be used in the store
 * name, but if you pass in the store name, it'll be used as is. And so forth.
 *
 * @static
 * @method createStore
 * @for atomic
 *
 * @param [params] {Object}
 *     @param [params.name] {String} name of the store
 *     @param [params.placeName] {String} place name where the store is located
 *     @param [params.owner] {atomic.models.Character} the store owner
 *     @param [params.value] {Number} value of the store's inventory in trade units
 *     @param [params.inventory] {Object} all the parameters that can be passed to the
 *          createStockpile method (if not provied and params.value is provided, that will
 *          be used as the minValue to the stockpile method).
 *     @param [params.tags] {String} tag query for a store type, e.g. "roadside"
 *          or "settlement" or "stall"
 *
 * @return {atomic.models.Store} the store
 */
module.exports = function(params) {
    params = ion.extend({}, params || {});
    params.tags = params.tags || "*";

    // Still don't quite have the name/size of store thing down.
    var config = db.find(ion.toTag(params.tags));
    if (ion.isNumber(params.value)) {
        config = clone(config);
        config.inventory.totalValue = params.value;
    }
    var owner = params.owner;
    if (!owner) {
        if (getGangTypes().indexOf(config.owner.profession) > -1) { // it's a gang
            owner = createGang({type: config.owner.profession});
        } else { // it's a character or relationship.
            owner = ownerStrategies.get()(config.owner);
        }
    }
    var ownerName;
    if (owner.name) {
        ownerName = owner.name;
    } else if (owner.kind) {
        ownerName = owner.kind;
    } else if (owner.older) {
        ownerName = owner.older.name;
    } else {
        throw new Error("Could not find owner name for this type", config);
    }

    var storeName = params.name;
    if (!storeName) {
        var placeName = params.placeName || createPlaceName();
        var clientele = config.typeOf('clientele');
        storeName = nameStrategies.get()(ownerName, placeName, ion.random(config.names), clientele);
    }

    var onhand = createContainer("Cash On Hand");

    var inventory = (config.inventory) ?
        createStockpile(config.inventory) : new Bag();

    // We do want this value before it is adjusted to screw the players...
    var totalValue = inventory.value();
    var maxValue = Math.max.apply(Math, inventory.entries.map(function(entry) {
        return entry.item.value;
    }));

    if (config.tags.indexOf("trade:sellhigh")) {
        inventory.entries.forEach(function(entry) {
            var value = entry.item.value;
            entry.item = deserializer(entry.item, false);
            entry.item.value = Math.round(value + (value*ion.random(markup)));
        });
    }

    var policy = createPolicy(config);

    return new Store({
        name: storeName, policy: policy, owner: owner, onhand: onhand,
        inventory: inventory, totalValue: totalValue
    });
};

},{"../ion":23,"../models/bag":25,"../models/lib":31,"../models/name":33,"../models/store":36,"../tables/table":40,"./bag":10,"./character":11,"./character_name":12,"./data":14,"./gang":16,"./place_name":18,"./relationships":20}],22:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Weather = require('../models/weather');

// From: http://biology.fullerton.edu/dsc/school/climate.html
// Which is enough to fake it, I think.

// Cloud type classifications
// http://www.crh.noaa.gov/lmk/?n=cloud_classification

// Mean monthly temperatures, high and low. r = rainfall, t = thunderstorms
// 0 - nothing
// 1 - rain
// 2 - thunderstorms

var averages = [
    {lo: 34, hi: 61,  mn: 48, rain: 1}, // Jan
    {lo: 40, hi: 69,  mn: 54, rain: 1},
    {lo: 46, hi: 74,  mn: 60, rain: 1}, // Mar
    {lo: 53, hi: 83,  mn: 68, rain: 1},
    {lo: 61, hi: 93,  mn: 77, rain: 0}, // May
    {lo: 70, hi: 103, mn: 86, rain: 0},
    {lo: 77, hi: 109, mn: 93, rain: 2}, // Jul
    {lo: 75, hi: 107, mn: 92, rain: 2},
    {lo: 68, hi: 100, mn: 84, rain: 2}, // Sep
    {lo: 55, hi: 87,  mn: 71, rain: 0},
    {lo: 43, hi: 73,  mn: 57, rain: 1}, // Nov
    {lo: 34, hi: 62,  mn: 48, rain: 1}
];
var months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

/**
 * Weather generator. The weather.js is based on the Mojave desert so it is hot, sunny and pretty
 * monotonous.
 *
 * @static
 * @method createWeather
 * @for atomic
 *
 * @param month {String} Three-letter abbreviation for the month of the year (Jan-Dec)
 * for which weather.js is being generated.
 *
 * @return {atomic.models.Weather} An object describing the weather.js forecast.
 */
module.exports = function(month) {
    var index = ion.isUndefined(month) ? new Date().getMonth() : months.indexOf(month.toLowerCase()),
        monthly = averages[index],
        weather = new Weather({
            low: (monthly.lo + ion.roll("1d10-5")),
            high: (monthly.hi + ion.roll("1d10-5")),
            rain: "clear skies"
        });

    if (monthly.rain === 0 && ion.test(8)) {
        weather.rain = ion.random(["cloudy skies", "high clouds"]);
    } else if (monthly.rain === 1 && ion.test(10)) {
        weather.rain = ion.random(["light rain", "strong winds"]);
    } else if (monthly.rain === 2 && ion.test(10)) {
        weather.rain = "thunderstorms";
    }
    return weather;
};

},{"../ion":23,"../models/weather":37}],23:[function(require,module,exports){
"use strict";

var DIE_PARSER  = /\d+d\d+/g,
    FORMAT_PARSER = /\{[^\|}]+\}/g,
    RANDOM_STRING = /\{[^\{\}]*\|[^\{\}]*\}/g,
    STARTS_WITH_VOWEL = /^[aeiouAEIOU]/,
    STARTS_WITH_THE = /^[tT]he\s/,
    SMALL_WORDS = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i,
    PARENS = /(\{[^\}]*\})/g,
    CONS_Y = /[BCDFGHIJKLMNPQRSTVWXZbcdfghijklmnpqrstvwxz]y$/;

function basicPluralize(string) {
    if (/[x|s]$/.test(string)) {
        return (string + "es");
    } else if (CONS_Y.test(string)) {
        return string.substring(0,string.length-1) + "ies";
    }
    return (string + "s");
}
function copy(target, source) {
    for (var prop in source) {
        target[prop] = source[prop];
    }
    return target;
}

// clever, then you do slice(arguments), requires the bind function though
// (which I already assume is present).
// var slice = Function.prototype.call.bind(Array.prototype.slice);

var slice = Array.prototype.slice,
    indexOf = Array.prototype.indexOf,
    filter = Array.prototype.filter,
    //map  = Array.prototype.map,
    forEach = Array.prototype.forEach;

var ion = {
    /* ======================================= */
    /* UTIL METHODS */
    /* ======================================= */
    isUndefined: function(v) {
        return (typeof v === "undefined");
    },

    extend: copy,

    identity: function(o) {
        return o;
    },
    transform: function(f) {
        return f();
    },
    contains: function(array, obj) {
        return (array) ? indexOf.call(array, obj) > -1 : false;
    },
    find: function(array, func, context) {
        var self = context || this;
        for (var i=0; i < array.length; i++) {
            if (func.call(context || self, array[i])) {
                return array[i];
            }
        }
        return null;
    },
    keys: function(obj) {
        return (ion.isObject(obj)) ? Object.keys(obj) : [];
    },
    values: function(obj) {
        return ion.keys(obj).map(function(key) {
            return obj[key];
        });
    },
    /**
     * Execute a function N times. Each iteration of the function, it receives the
     * arguments `i` for the current iteration (starting at zero), and `N` for the
     * total number of times the function will be excuted.
     * @example
     *      ion.times(4, function(i,n) {
     *          console.log(i,"of",n,"iterations");
     *      });
     *      => "0 of 4 iterations"
     *      => "1 of 4 iterations"
     *      => "2 of 4 iterations"
     *      => "3 of 4 iterations"
     *
     * @param count {Number} the number of times to execute the function.
     * @param func {Function} the function to execute. Receives two parameters, `i` (zero-based index of the
     *    iteration) and `N` (total number of iterations to be performed).
     * @param [context] {Object} object bound to the function when executed
     */
    times: function(count, func, context) {
        var self = context || this;
        for (var i=0; i < count; i++) {
            func.call(context || self, i, count);
        }
    },
    last: function(array) {
        return (array && array.length) ? array[array.length-1] : null;
    },
    unique: function(array) {
        if (arguments.length === 0 || array.length === 0) { return []; }
        var seen = [];
        forEach.call(array, function(element) {
            if (seen.indexOf(element) === -1) {
                seen.push(element);
            }
        });
        return seen;
    },
    intersection: function(a, b) {
        if (arguments.length !== 2) { return []; }
        // allows arguments objects to be passed to this method
        a = slice.call(a,0);
        b = slice.call(b,0);
        // This is critical to db.find(); optimizing
        /*
         return ion.unique(a.filter(function(element) {
         return b.indexOf(element) > -1;
         }));
         */
        var results = [];
        for (var i=0; i < a.length; i++) {
            if (b.indexOf(a[i]) > -1 && results.indexOf(a[i]) === -1) {
                results[results.length] = a[i];
            }
        }
        return results;
    },
    union: function(a, b) {
        if (arguments.length !== 2) { return []; }
        // allows arguments objects to be passed to this method
        a = slice.call(a,0);
        b = slice.call(b,0);
        return ion.unique(a.concat(b));
    },
    without: function(array) {
        var args = slice.call(arguments, 1);
        return filter.call((array || []), function(value) {
            return (args.indexOf(value) === -1);
        });
    },
    // Here's that scary use of object-orientation in JS that your parents told you about
    define: function(parent, methods) {
        if (arguments.length === 1) { // parent is optional
            methods = parent;
            parent = null;
        }
        var F = (methods.init || function() {});
        if (parent) {
            var C = function() {}; // don't call parent constructor
            C.prototype = parent.prototype;
            F.prototype = new C();
        }
        if (methods.properties) {
            for (var methName in methods.properties) {
                Object.defineProperty(F.prototype, methName, {
                    enumerable: false,
                    configurable: false,
                    get: methods.properties[methName]
                });
            }
            delete methods.properties;
        }
        delete methods.init;
        for (var prop in methods) {
            F.prototype[prop] = methods[prop];
        }
        F.prototype.constructor = F;
        return F;
    },
    /**
     * Bound the value n by the minimum and maximum values:
     * @example
     *     ion.bounded(-2, 0)
     *     => 0
     *     ion.bounded(32, 1, 100)
     *     => 32
     *     ion.bounded(120, 1, 100)
     *     => 100
     *
     * @static
     * @method bounded
     * @for atomic
     *
     * @param n {Number}
     * @param min {Number}
     * @param [max] {Number}
     * @return {Number} The number n or the min or max value if the n value falls outside of that range.
     */
    bounded: function(n, min, max) {
        max = max || Number.MAX_VALUE; // have to have a min
        return (n < min) ? min : (n > max) ? max : n;
    },
    /**
     * Sum the values of the array (must be numbers).
     *
     * @static
     * @method sum
     * @for atomic
     *
     * @param array {Array} array of number values
     * @return {Number} the sum of the values in the array
     */
    sum: function(array) {
        return (array || []).reduce(function(memo, num) {
            if (typeof num === "number") {memo += num;}
            return memo;
        }, 0);
    },

    /* ======================================= */
    /* STRING METHODS */
    /* ======================================= */

    /**
     * Put an indefinite article in front of the word based on whether or not it
     * starts with a vowel.
     * @example
     *     ion.article("walkie talkie")
     *     => "a walkie talkie"
     *     ion.article("album")
     *     => "an album"
     *
     * @static
     * @method article
     * @for atomic
     *
     * @param string {String} String to prefix with an indefinite article
     * @return {String} The string with "a" or "an" in front of it.
     */
    article: function(string) {
        return (STARTS_WITH_THE.test(string)) ? string : STARTS_WITH_VOWEL.test(string) ? ("an " + string) : ("a " + string);
    },
    /**
     * Format a string with parameters. There are many ways to supply values to this method:
     * @example
     *     ion.format("This {0} a {1}.", ["is", "test"]);
     *     => "This is a test."
     *     ion.format("This {0} a {1}.", "is", "test");
     *     => "This is a test."
     *     ion.format("This {verb} a {noun}.", {"verb": "is", "noun": "test"})
     *     => "This is a test."
     *
     * @static
     * @method format
     * @for atomic
     *
     * @param template {String} template string
     * @param values+ {Object} An array, a set of values, or an object with key/value pairs that
     * will be substituted into the template.
     * @return {String} the formatted string
     */
    format: function(string, obj) {
        if (typeof obj == "undefined") {
            return string;
        }
        if (arguments.length > 2 || typeof obj !== "object") {
            obj = slice.call(arguments);
            string = obj.shift();
        }
        // Selects {a} sequences with no pipe (these are multiple selection strings, not substitutions)
        return string.replace(FORMAT_PARSER, function(token){
            var prop = token.substring(1, token.length-1);
            return (typeof obj[prop] == "function") ? obj[prop]() : obj[prop];
        });
    },
    /**
     * Pluralizes a string (usually a noun), if the count is greater than one. If
     * it's a single item, an indefinite article will be added (see example below
     * for cases where it should not be added, "uncountables"). The string should
     * note the method of pluralizing the string in curly braces if it is not a
     * simple noun that is pluralized using "s", "es" or "aries". For example:
     * @example
     *     ion.pluralize("shoe", 3)
     *     => "3 shoes"
     *     ion.pluralize("status", 2)
     *     => "2 statuses"
     *     ion.pluralize("bag{s} of flour", 1)
     *     => "a bag of flour"
     *     ion.pluralize("bag{s} of flour", 2)
     *     => "2 bags of flour"
     *     // Note suppression of the indefinite article!
     *     ion.pluralize("{|suits of }makeshift metal armor")
     *     => "makeshift metal armor"
     *     ion.pluralize("{|suits of }makeshift metal armor", 4)
     *     => "4 suits of makeshift metal armor"
     *
     * @static
     * @method pluralize
     * @for atomic
     *
     * @param name {String} A string name following the rules described above
     * @param [count=1] {Number} The number of these items
     * @return {String} the correct singular or plural value
     */
    /**
     * Items can also be used with this method.
     * @example
     *     var item = new Item("quarry");
     *     ion.pluralize(item, 3)
     *     => "3 quarries"
     *
     * @static
     * @method pluralize
     * @for atomic
     *
     * @param item {Item} An item with a string name following the rules described above
     * @param [count=1] {Number} The number of these items
     * @return {String} the correct singular or plural value
     */
    pluralize: function(string, count) {
        string = (string.name) ? string.name : string;
        count = (count || 1);
        var obj = {singular: "", plural: ""},
            addArticle = string.substring(0,2) !== "{|";

        if (count > 1) {
            obj.plural += (count + " ");
        }
        if (string.indexOf("{") === -1) {
            obj.singular = string;
            obj.plural += basicPluralize(string);
        } else {
            string.split(PARENS).forEach(function(element, index) {
                if (element.indexOf("{") === -1) {
                    obj.singular += element;
                    obj.plural += element;
                } else if (element.indexOf("|") === -1){
                    obj.plural += element.substring(1, element.length-1);
                } else {
                    var parts = element.substring(1, element.length-1).split("|");
                    obj.singular += parts[0];
                    obj.plural += parts[1];
                }
            });
        }
        if (addArticle) {
            obj.singular = ion.article(obj.singular);
        }
        return (count === 1) ? obj.singular : obj.plural;
    },
    /**
     * Convert a string to sentence case (only the first letter capitalized).
     * @example
     *     ion.sentenceCase("antwerp benedict");
     *     => "Antwerp benedict"
     *     ion.sentenceCase("antwerp-Benedict");
     *     => "Antwerp-benedict"
     *     ion.sentenceCase("bead to a small mouth");
     *     => "Bead to a small mouth"
     *
     * @static
     * @method sentenceCase
     * @for atomic
     *
     * @param string {String}
     * @return {String} in sentence case
     */
    sentenceCase: function(string) {
        if (ion.isString(string)) {
            return string.substring(0,1).toUpperCase() + string.substring(1);
        }
        return string;
    },
    /**
     * Convert string to title case. There's a long list of rules for this
     * kind of capitalization, see: [this link][0].
     *
     * *To Title Case 2.1 - http://individed.com/code/to-title-case/<br>
     * Copyright 2008-2013 David Gouch. Licensed under the MIT License.*
     *
     * [0]: http://daringfireball.net/2008/05/title_case
     * @example
     *     ion.titleCase("antwerp benedict");
     *     => "Antwerp Benedict"
     *     ion.titleCase("antwerp-Benedict");
     *     => "Antwerp-Benedict"
     *     ion.titleCase("bead to a small mouth");
     *     => "Bead to a Small Mouth"
     *
     * @static
     * @method titleCase
     * @for atomic
     *
     * @param string {String} string to title case
     * @return {String} in title case
     */
    titleCase: function(string) {
        return string.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(SMALL_WORDS) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }
            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }
            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    },
    /**
     * Convert a string to a valid tag by removing spaces and converting
     * to lower-case letters.
     *
     * @static
     * @method toTag
     * @for atomic
     */
    toTag: function(string) {
        if (!ion.isString(string)) { return string; }
        return string.toLowerCase().replace(/\s/g,'');
    },
    /**
     * Format the elements of an array into a list phrase.
     * @example
     *     ion.toList(['Apples', 'Bananas', 'Oranges'], function(value) {
     *         return "*"+value;
     *     });
     *     => "*Apples, *Bananas, and *Oranges"
     *
     * @static
     * @method toList
     * @for atomic
     *
     * @param array {Array} The array to format
     * @param func {Function} An optional function to format the elements of the array in the returned string.
     * @param [join=and] {String} the word to join the last word in the list.
     * @return {String} the array formatted as a list.
     */
    toList: function(array, func, join) {
        join = join || "and";
        func = func || function(s) { return s.toString(); };
        var len = array.length;
        if (len === 0) {
            return "";
        } else if (len === 1) {
            return func(array[0]);
        } else if (len === 2) {
            return func(array[0]) + " " + join + " " + func(array[1]);
        } else {
            var arr = array.map(func);
            arr[arr.length-1] = join + " " + arr[arr.length-1];
            return arr.join(", ");
        }
    },

    /* ======================================= */
    /* RANDOM METHODS */
    /* ======================================= */

    /**
     * Return a random value from a "strategy" value, recursively. An element will be selected
     * from an array, a function will be executed for its return value, and a string with
     * variants will be returned with a variant selected. The value is then checked again to
     * see if it can still be randomized further, and this process continues until a primitive
     * value is returned (a number, object, string, or boolean).
     * @example
     *     atomic.random("A")
     *     => "A"
     *
     *     atomic.random(['A','B','C']);
     *     => 'A'
     *
     *     atomic.random("{Big|Bad|Black} Dog");
     *     => 'Bad Dog'
     *
     *     atomic.random(function() {
     *         return ["A","B","C"];
     *     });
     *     => "B"
     *
     * @static
     * @method random
     * @for atomic
     *
     * @param value {String|Array|Function} A string with optional variants, or an array from
     *      which to select an element, or a function that returns a value.
     * @return {Object} a single randomized instance, based on the value passed in
     */
    random: function(value) {
        if (ion.isArray(value)) {
            value = (value.length) ? value[ ~~(Math.random()*value.length) ] : null;
            return ion.random(value);
        } else if (ion.isFunction(value)) {
            return ion.random(value());
        } else if (ion.isString(value)) {
            return value.replace(RANDOM_STRING, function(token) {
                return ion.random( token.substring(1, token.length-1).split("|") );
            });
        }
        return value;
    },
    /**
     * Combines randomization with formatting. First, randomizes the first argument using the `ion.random()`
     * function. Then formats the resulting string using the rest of the arguments passed in to the method,
     * as described by the `ion.format()` function.
     * @example
     *     atomic.resolve(["Mr. {name}", "Mrs. {name}"], {name: "Smith"});
     *     => "Mrs. Smith"
     *
     * @static
     * @method resolve
     * @for atomic
     *
     * @param value {String|Array|Function} A string with optional variants, or an array from
     *      which to select an element, or a function that returns a value.
     * @param [...args] zero or more objects to use in formatting the final string
     * @return {String} the randomly selected, formatted string
     */
    resolve: function() {
        if (arguments.length === 1) {
            return ion.random(arguments[0]);
        }
        var array = slice.call(arguments,0);
        array[0] = ion.random(array[0]);
        return ion.format.apply(ion.format, array);
    },
    /**
     * Returns a random number based on a die roll string. Math operations are supported:
     * @example
     *     atomic.roll("3d6+2")
     *     => 9
     *     atomic.roll("(2d4*10)+500")
     *     => 540
     *     atomic.roll(8)
     *     => 4
     *
     * @static
     * @method roll
     * @for atomic
     *
     * @param value {String|Number} a notation for a dice roll (including mathematical expressions, if needed),
     *      or the maximum value to return.
     * @return {Number} a die roll value
     */
    roll: function(value) {
        if (typeof value === "number") {
            return (value > 0) ? ~~( Math.random()*value ) + 1 : 0;
        } else if (typeof value === "string") {
            // Finds and extracts dice notation, rolls the die, and then puts the
            // result into the full expression. Then evals that to do the math.
            value = value.replace(DIE_PARSER, function(value) {
                var split = value.split("d"),
                    rolls = parseInt(split[0],10),
                    face = parseInt(split[1],10),
                    result = 0;
                for (var i=0; i < rolls; i++) {
                    result += ~~( Math.random()*face ) + 1;
                }
                return result;
            });
            try { return eval.call(null, value); }
            catch(e) { return 0; }
        }
        throw new Error("Invalid value: " + value);
    },
    /**
     * Randomly shuffle the position of the elements in an array (uses Fisher-Yates shuffle). `ion.random()`
     * is usually more efficient, but if you need to iterate through a set of values in a random order,
     * without traversing the same element more than once, `ion.shuffle()` is a better way to randomize
     * your data.
     * @example
     *     var array = ['A','B','C']
     *     atomic.shuffle(array);
     *     =>
     *     array;
     *     => ['C','A','B']
     *
     * @static
     * @method shuffle
     * @for atomic
     *
     * @param array {Array} The array to shuffle (in place)
     */
    shuffle: function(array) {
        var j, temp;
        for (var i = array.length-1; i > 0; i--) {
            j = ~~( Math.random() * ( i + 1 ) );
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    },
    /**
     * Test against a percentage that something will occur.
     * @example
     *     if (atomic.test(80)) {
     *         // Happens 80% of the time.
     *     }
     *
     * @static
     * @method test
     * @for atomic
     *
     * @param percentage {Number} The percentage chance that the function returns true
     * @return {Boolean} true if test passes, false otherwise
     */
    test: function(percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error("Percentage must be between 0 and 100");
        }
        return ion.roll(100) <= percentage;
    },
    /**
     * Generate a whole random number, on a normal (Gaussian, "bell curve")
     * distribution. For example, you might wish to create a youth gang
     * where the members are mostly 18, but with outliers that are much
     * younger or older. This random number generator will give more useful
     * results than `ion.random()` if you do not want the numbers to be evenly
     * distributed.
     *
     * @static
     * @method gaussian
     * @for atomic
     *
     * @param stdev {Number} The amount of variance from the mean, where about
     *   68% of the numbers will be a number +/- this amount.
     * @param [mean=0] {Number} The mean around which random numbers will be
     *   generated.
     * @return a random number
     */
    gaussian: function(stdev, mean) {
        var x = 0, y = 0, rds, c, m = mean || 0;
        // Uses Box-Muller transform: http://www.protonfish.com/jslib/boxmuller.shtml
        // Two values get generated. You could cache the y value, but the time savings
        // is trivial and this causes issues when mocking randomness for the tests. So don't.
        do {
            x = Math.random()*2-1;
            y = Math.random()*2-1;
            rds = (x*x) + (y*y);
        } while (rds === 0 || rds > 1);
        c = Math.sqrt(-2*Math.log(rds)/rds);
        return Math.round((x*c)*stdev) + m;
    },
    /**
     * As the gaussian random number method, but it will not return negative
     * numbers (without disturbing the rest of the distribution).
     *
     * @static
     * @method nonNegativeGaussian
     * @for atomic
     *
     * @param stdev {Number} The amount of variance from the mean, where about
     *  68% of the numbers will be a number +/- this amount.
     * @param [mean=0] {Number} The mean around which random numbers will be
     *  generated.
     * @return a random, non-negative number (can include zero)
     */
    nonNegativeGaussian: function(stdev, mean) {
        mean = (mean < 0) ? 0 : mean;
        var value;
        do {
            value = ion.gaussian(stdev, mean);
        } while (value < 0);
        return value;
    }
};

// The utility methods are really just here to avoid having a dependency on
// any common library like underscore.js or sugar.js.
// Array.isArray. Would take more space to use that than this.
['Array','Function','String','Date','RegExp','Boolean','Number','Object'].forEach(function(type) {
    ion['is'+type] = function(obj) {
        return Object.prototype.toString.call(obj) === "[object "+type+"]";
    };
});

module.exports = ion;
},{}],24:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Profession = require('./profession');

var navyRanks = ["","Seaman", "Petty Officer", "Ensign", "Lieutenant", "Lieutenant Commander", "Commander", "Captain", "Admiral"],
    policeRanks = ["Officer",["Officer","Trooper"],"Detective","Sergeant", ["Captain","Deputy Marshal"], ["Inspector","Marshal"],["Deputy Chief","Undersheriff"],["Chief","Sheriff"]],
    milRanks = ["","Private", "Corporal", "Sergeant", "Lieutenant", "Captain", "Major", "Colonel", "General"];

module.exports = ion.define(Profession, {
    /**
     * A sub-class of profession that handles assigning rank for professions such as
     * the military and police.
     *
     * @class atomic.models.AtomicProfession
     * @extends atomic.models.Profession
     *
     * @constructor
     * @param [params] {Object}
     */
    init: function(params) {
        Profession.call(this, params || {});
    },
    /**
     * Assigns rank to the character based on traits.
     *
     * @method assignRank
     * @for atomic.models.AtomicProfession
     */
    assignRank: function(character) {
        var name = this.names[0], rank = null;

        // TODO: Could use gaussian spread here.
        var level = Math.round(Math.max(character.trait("Military"), character.trait("Government")) * 1.5);

        // TODO: Could use a table here.
        if (name === "Navy" || name === "Coast Guard") {
            rank = navyRanks[ion.roll(level)];
        } else if (name === "Police") {
            rank = policeRanks[ion.roll(level)];
            if (rank instanceof Array) {
                rank = ion.random(rank);
            }
        } else {
            rank = milRanks[ion.roll(level)];
        }
        character.honorific = (rank) ? name + ' ' + rank : name;
    }
});

},{"../ion":23,"./profession":34}],25:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Item = require('./item');
var Model = require('./model');

function sortByName(a,b) {
    return (a.item.name > b.item.name) ? 1 : (a.item.name < b.item.name) ? -1 : 0;
}
function findEntry(bag, item) {
    return bag.entries.filter(function(entry) {
        return entry.item.name === item.name;
    })[0];
}
function itemParam(item) {
    return (typeof item == "string")  ? new Item({name: item}) : item;
}
function countParam(count) {
    return (typeof count == "number") ? count : 1;
}
function sum(bag, item, field) {
    item = itemParam(item);
    return bag.entries.filter(function(entry) {
        return (!item || (item.name === entry.item.name));
    }).reduce(function(sum,entry) {
        var value = (field) ? entry.item[field] : 1;
        return sum + (value*entry.count);
    }, 0);
}

var Bag = ion.define(Model, {
    /**
     * An unordered collection of items, including multiples of the same item. Items are differentiated
     * by name and title (if it exists) alone, so don't create items with the same name that have different
     * values or encumbrance.
     *
     * @class atomic.models.Bag
     * @extends atomic.models.Model
     * @constructor
     * @param [params] {Object} The JSON data to initialize this model.
     *      @param [params.descriptor] {String} a description of the bag separate from its contents (if it
     *          is not abstract, and is something like a safe or lockbox).
     */
    /**
     * The items in the bag. Each entry has two properties: `item` with an item
     *      object, and `count` with the number of this item in the bag.
     * @property entries
     * @type Array
     */
    init: function(params) {
        Model.call(this, params);
        this.entries = this.entries || [];
        this.type = "Bag";
    },
    /*
     * Combine the contents of one bag into another. Does not change the
     * bag passed into this bag. BEWARE: you're duplicating the contents of the
     * bag into another bag when you do this. You should probably throw the other
     * bag away.
     *
     * @method addBag
     * @param {Bag} bag to combine into this bag (it will not be changed or referenced)
     */
    addBag: function(bag) {
        if (bag instanceof Bag) {
            JSON.parse(JSON.stringify(bag)).entries.forEach(function(entry) {
                this.add(entry.item, entry.count);
            }, this);
        }
    },
    /*
     * Remove the contents of this bag. Does not change the bag passed into this bag.
     *
     * @method removeBag
     * @param {Bag} bag specifying the items to remove from this bag
     */
    removeBag: function(bag) {
        if (bag instanceof Bag) {
            JSON.parse(JSON.stringify(bag)).entries.forEach(function (entry) {
                this.remove(entry.item, entry.count);
            }, this);
        }
    },
    /**
     * Add items to this bag.
     *
     * @method add
     * @param item {String|atomic.models.Item} an item to add
     * @param [count=1] {Number} of items to add
     * @return {Number} the number of items after adding
     */
    add: function(item, count) {
        if (!item) {
            throw new Error("No item passed to bag.add()");
        }
        item =  itemParam(item);
        count = countParam(count);
        var entry = findEntry(this, item);

        if (count < 0) {
            throw new Error("Can't add negative items to bag: " + count);
        }
        if (!entry) {
            entry = {item: item, count: 0, titles: {}};
            this.entries.push(entry);
        }
        if (item.title) {
            entry.titles[item.title] = true;
        }
        entry.count += count;
        return entry.count;
    },
    /**
     * Sort the entries of the bag given a sorting function
     *
     * @method sort
     * @param func {Function} a sort function
     */
    sort: function(func) {
        this.entries.sort(func || sortByName);
    },
    /**
     * Remove items from this bag. You should examine the bag before removing items,
     * because trying to remove more items than are in the bag will throw exceptions.
     *
     * @method remove
     * @param item {String|atomic.models.Item} an item to remove
     * @param [count=1] {Number} of items to remove
     * @return {Number} the number of items after removals
     */
    remove: function(item, count) {
        item = itemParam(item);
        count = countParam(count);
        var entry = findEntry(this, item);

        if (!entry) {
            throw new Error("Can't remove item that's not in the bag");
        }
        if (count <= 0) {
            throw new Error("Can't remove a negative number of items from bag: " + count);
        }
        if (count > entry.count) {
            throw new Error("Can't remove "+count+" items in bag that has only " + entry.count);
        }
        entry.count -= count;
        if (item.title) {
            delete entry.titles[item.title];
        }
        if (entry.count === 0) {
            this.entries.splice(this.entries.indexOf(entry), 1);
        }
        return entry.count;
    },
    /**
     * Return this bag, filtered using a filter function, which is passed the item and
     * the count:
     * @example
     *     bag.filter(function(item, count) {
         *         return item.is('food');
         *     }).toString();
     *     => "A stick of beef jerky, a bottle of milk, a pear, and a can of coffee."
     *
     * @method filter
     * @param func {Function} filter function
     * @return {atomic.models.Bag}
     */
    filter: function(func) {
        var other = new Bag();
        for (var i = this.entries.length-1; i >= 0; i--) {
            var entry = this.entries[i];
            if (func.call(this, entry.item, entry.count)) {
                var item = entry.item, count = entry.count;
                this.remove(item, count);
                other.add(item, count);
            }
        }
        return other;
    },
    /**
     * Sum the value of all items in this bag. Can also provide a sum for an individual
     * group of items in the bag.
     *
     * @method value
     * @param [item] {String|atomic.models.Item} an item; if supplied, only the value of these items will be returned
     * @return {Number} the total value of the items in the bag
     */
    value: function(item) {
        return sum(this, item, "value");
    },
    /**
     * Sum the encumbrance of all items in this bag. Can also provide a sum for an individual
     * group of items in the bag.
     *
     * @method enc
     * @param [item] {String|atomic.models.Item} an item; if supplied, only the encumbrance of these items will be returned
     * @return {Number} the total encumbrance of the items in the bag
     */
    enc: function(item) {
        return sum(this, item, "enc");
    },
    /**
     * The count of all items in this bag. Can also provide the count of an individual
     * group of items in the bag.
     *
     * @method count
     * @param [item] {String|atomic.models.Item} an item; if supplied, only these items will be counted in the bag
     * @return {Number} the total count of the items in the bag
     */
    count: function(item) {
        return sum(this, item);
    },
    /**
     * Given a prefix like `ammo` or `media`, will return every item that contains a tag with
     * this prefix, such as `ammo:22` or `media:35mm`.
     *
     * @method typeOf
     * @param prefix {String} the prefix to match
     * @return {Array} all items that match this prefix
     */
    typeOf: function(p) {
        return this.entries.reduce(function(array, entry) {
            if (entry.item.typeOf(p)) {
                array.push(entry.item);
            }
            return array;
        }, []);
    },
    toString: function() {
        var string = "", cash = 0;
        if (this.entries.length) {
            var items = false,
                len = this.entries.filter(function(entry) {
                    return entry.item.not('cash');
                }).length;
            this.entries.forEach(function(entry) {
                if (entry.item.is('cash')) {
                    cash += (entry.item.value*100) * entry.count;
                } else {
                    items = true;
                    string += ion.pluralize(entry.item, entry.count);
                    if (Object.keys(entry.titles).length) {
                        string += " ("+Object.keys(entry.titles).join("; ")+")";
                    }
                    if (len === 1) {
                        string += '.';
                    } else if (len === 2) {
                        string += ', and ';
                    } else {
                        string += ', ';
                    }
                    len--;
                }
            }, this);
            if (items && cash) {
                string += ' ';
            }
            if (cash) {
                string += "$"+cash.toFixed(0)+" in cash.";
            }
            string = ion.sentenceCase(string);
        }
        if (this.descriptor) {
            string = (this.descriptor + ": " + string);
        }
        return string;
    },
    toHTML: function() {
        return '<p class="bag">'+this.toString()+'</p>';
    }
});

module.exports = Bag;

},{"../ion":23,"./item":30,"./model":32}],26:[function(require,module,exports){
var ion = require('../ion');
var Model = require('./model');
var Bag = require('./bag');
var Builder = require('../builder');

function traitsToString(traits) {
    return Object.keys(traits).sort(function(a,b) {
        return (a < b) ? -1 : (a > b) ? 1 : 0 ;
    }).map(function(key) {
        return ion.format("{0} {1}", key, traits[key]);
    }).join(", ");
}
function charBasics(b) {
    b("{0} ", this.honorific);
    b(!!this.name, function(b) {
        b(this.name.toString());
    });
    b(", {0}", this.degree);
    b(!this.honorific && !!this.profession, ", " + this.profession);
    b(". ");
    b(!!this.status, function(b) {
        b("{0} (would be {1}). ", ion.sentenceCase(this.status), this.age);
    }, function(b) {
        b("Age {0}. ", this.age+"");
    });
    b("{0}. ", this.appearance);
    b("{0}. ", this.history.join(', '));
    return b;
}

var Character =  ion.define(Model, {
    /**
     * A player or NPC character.
     *
     * @class atomic.models.Character
     * @extends atomic.models.Model
     *
     * @constructor
     * @param [params] {Object} parameters
     */
    init: function(params) {
        /**
         * The gender of the character ("male" or "female").
         * @property gender
         * @type {String}
         */
        this.gender = "male";
        /**
         * The age of the character.
         * @property age
         * @type {Number}
         */
        this.age = 0;

        /**
         * Title that goes before a character's name, such as "Corporal" or "Doctor".
         * @property honorific
         * @type {String}
         */
        this.honorific = null;
        /**
         * Degree that goes after a character's name, such as "PhD".
         * @property degree
         * @type {String}
         */
        this.degree = null;
        /**
         * The items carried by this character.
         * @property inventory
         * @type {atomic.models.Bag}
         */
        this.inventory = new Bag();
        /**
         * A map of trait names to values indicating the attributes, skills,
         * experience of a character. These represent modifiers that would apply for this character in any
         * kind of test that occurs in a game. They are also a means of indicating the
         * experience and history of a character, at a more detailed level than professions.
         *
         * @property traits
         * @type {Object}
         */
        /**
         * The status of this character if not normal for some creator, such as "separated",
         * "divorced" or "deceased".
         *
         * @property status
         * @type {String} may be null
         */
        this.traits = {};
        this.history = [];
        Model.call(this, params);
        this.type = "Character";
    },
    properties: {
        /**
         * Is this character male?
         *
         * @property male
         * @return {Boolean} True if male, false if female.
         */
        male: function() {
            return (this.gender === "male");
        },
        /**
         * The total number of assigned trait points for this character is
         * referred to as the character's "points".
         *
         * @property points
         * @return {Number} The total number of trait points assigned to this character
         */
        points: function() {
            return ion.sum(ion.values(this.traits));
        },
        /**
         * Personal pronoun
         * @example
         *     character.gender
         *     => "female"
         *     character.personal
         *     => "she"
         *
         * @property personal
         * @return {String} "he" or "she"
         */
        personal: function() {
            return (this.gender === "male") ? "he" : "she";
        },
        /**
         * Objective pronoun
         * @example
         *     character.gender
         *     => "female"
         *     character.objective
         *     => "her"
         *
         * @property objective
         * @return {String} "him" or "her"
         */
        objective: function() {
            return (this.gender === "male") ? "him" : "her";
        },
        /**
         * Reflexive pronoun (arguably redundant with the personal pronoun, may remove).
         * @example
         *     character.gender
         *     => "female"
         *     character.reflexive
         *     => "herself"
         *
         * @property reflexive
         * @return {String} "himself" or "herself"
         */
        reflexive: function() {
            return (this.gender === "male") ? "himself" : "herself";
        },
        /**
         * Possessive pronoun
         * @example
         *     character.gender
         *     => "female"
         *     character.possessive
         *     => "her"
         *
         * @property possessive
         * @return {String} "his" or "her"
         */
        possessive: function() {
            return (this.gender === "male") ? "his" : "her";
        }
    },
    /**
     * Change a trait by a set number of points.
     *
     * @method changeTrait
     * @param traitName {String} The trait to change
     * @param value {Number} The amount to add or subtract. If the value is zero or less
     * after change, the trait will be removed.
     */
    changeTrait: function(traitName, value) {
        value = value || 0;
        this.traits[traitName] = this.traits[traitName] || 0;
        this.traits[traitName] += value;
        if (this.traits[traitName] <= 0) {
            delete this.traits[traitName];
        }
    },
    /**
     * Does this charcter have a trait?
     *
     * @method trait
     * @param traitName {String} The name of the trait
     * @return {Number}
     * the value of the trait, or 0 if the character does not have the trait
     */
    trait: function(traitName) {
        return this.traits[traitName] || 0;
    },
    toString: function() {
        var b = Builder(this);
        return charBasics.call(this, b)
            ("{0}. ", traitsToString(this.traits))
            ("Possessions: {0}", this.inventory.toString()).toString();
    },
    toHTML: function() {
        var b = Builder(this);
        b("p", {}, function(b) {
            charBasics.call(this, b);
        });
        b(!!this.inventory.count() || ion.keys(this.traits).length > 0, function(b) {
            b("div", {class: "more"}, function(b) {
                b("p", {}, function(b) {
                    b("{0}. ", traitsToString(this.traits));
                });
                b(!!this.inventory.count(), function(b) {
                    b("p", {}, function(b) {
                        b("Possessions: {0}", this.inventory.toString());
                    });
                });
            });
        });
        return b.toString();
    }
});

module.exports = Character;
},{"../builder":2,"../ion":23,"./bag":25,"./model":32}],27:[function(require,module,exports){
var ion = require('../ion');
var Builder = require('../builder');
var Model = require('./model');

function relatedNames(char1, char2, relationship) {
    var string = "";
    if (char1.name.family === char2.name.family) {
        string = ion.format("{0} ({1}) & {2} ({3}) {4}", char1.name.given, char1.age,
            char2.name.given, char2.age, char1.name.family);
    } else {
        string = ion.format("{0} ({1}) & {2} ({3})", char1.name.toString(), char1.age,
            char2.name.toString(), char2.age);
    }
    if (relationship) {
        string += (char1.name.family === char2.name.family) ?
            (" ("+relationship+")") :
            (". " + ion.sentenceCase(relationship));
    }
    return string + ". ";
}
function coupleNames(family, relationship) {
    var single = family.single;
    if (single !== null) {
        return ion.format("{0} ({1}), {2}. ", single.name.toString(), single.age, family.relationship);
    } else {
        return relatedNames(family.male, family.female, family.relationship);
    }
}

module.exports = ion.define({
    /**
     * A family. This means (in the context of this game), a set of parents with some kids,
     * some of whom may themselves be in family object with kids, etc. One of the building
     * blocks of some encounters, homesteads, and family businesses. A simpler concept is the
     * Relationship, which creates two people in a familial relationship (e.g. grandfather and
     * granddaugter, with appropriate ages and genders).
     *
     * @class atomic.models.Family
     * @extends atomic.models.Model
     * @constructor
     * @param [params] {Object} The JSON data to initialize this model.
     */
    init: function(params) {
        /**
         * Unmarried children
         * @property children
         * @type {Array} of {atomic.models.Character} instances
         */
        this.children = [];
        /**
         * Children in families of their own
         * @property couples
         * @type {Array} of {atomic.models.Family} instances
         */
        this.couples = []; // children with spouses, represented by a family object. Removed from children
        Model.call(this, params);
        this.type = "Family";
    },
    properties: {
        /**
         * The number of all children (including grown children who are
         * now part of a descendant couple).
         *
         * @property childCount
         * @return {Number}
         */
        childCount: function() {
            return (this.children.length + this.couples.length);
        },
        /**
         * The male parent
         *
         * @property male
         * @type {atomic.models.Character}
         */
        male: function() {
            return this.parent.male ? this.parent : this.other;
        },
        /**
         * The female parent
         *
         * @property female
         * @type{atomic.models.Character}
         */
        female: function() {
            return this.parent.male ? this.other : this.parent;
        },
        /**
         * The single parent (if one of the parents has died or the parents are separated).
         *
         * @property single
         * @type {atomic.models.Character} or null if both parents are still part of the family
         */
        single: function() {
            if (this.parent.status && !this.other.status) {
                return this.other;
            } else if (this.other.status && !this.parent.status) {
                return this.parent;
            }
            return null;
        }
    },
    /**
     * Is this person one of the parents of this family?
     *
     * @method isParent
     * @param person
     * @return {Boolean} true if character is a parent, false otherwise
     */
    isParent: function(person) {
        return (person === this.parent || person === this.other);
    },
    toString: function() {
        var builder = Builder(this);
        builder(!!this.single, function(/*single*/) {
            builder(this.single.toString());
        }, function(/*couple*/) {
            builder(relatedNames(this.male, this.female, this.relationship));
        });
        return builder(!!this.childCount, function(builder) {
            builder("{|}{1 |}child{ren}: ", this.childCount);
            builder(this.children, function(builder, child, index) {
                builder(index > 0, " ")(child.toString());
            });
            builder(this.couples, function(builder, couple, index) {
                builder(index > 0, " ")(couple.toString());
            });
        }).toString();
    },
    toHTML: function() {
        var builder = Builder(this);
        builder("div", {class: "family"}, function() {
            builder("p", {}, coupleNames(this));
            builder("div", {class:"more"}, function() {
                builder(!!this.single, function() {
                    builder(this.single.toHTML());
                }, function() {
                    builder(this.male.toHTML());
                    builder(" ");
                    builder(this.female.toHTML());
                });
            });
            builder(!!this.childCount, function(b) {
                builder("div", {class: "children_preamble"}, function() {
                    builder("{|}{1 |}child{ren}:", this.childCount);
                });
                builder("div", {class: "children"}, function() {
                    builder(this.children, function(b, child) {
                        builder("div", {class: "child"}, function() {
                            builder(child.toHTML());
                        });
                    });
                    builder(this.couples, function(builder, couple) {
                        builder(couple.toHTML());
                    });
                });
            });
        });
        return builder.toString();
    }
});
},{"../builder":2,"../ion":23,"./model":32}],28:[function(require,module,exports){
var ion = require('../ion');
var Model = require('./model');
var Builder = require('../builder');

var combatTraits = ["Agile", "Archery", "Athletics", "Cunning", "Driving", "Explosives",
    "Firearms", "Horseback Riding", "Intimidate", "Medicine", "Melee Weapons", "Military",
    "Motorcycling", "Stealth", "Strong", "Tough", "Tracking", "Trucking", "Unarmed Combat"];

function gangName(b) {
    var members = ion.toList(this.members, function(m) {
        return m.name;
    });
    b(!!this.name, function(b) {
        b("The {0} ({1}; {2}): ", this.name, this.kind, members);
    }, function(b) {
        b("{0} member {1} ({2}): ", this.members.length, this.kind, members);
    });
    return b;
}
/**
 * Remove uninteresting traists from the description.
 * @param builder
 * @param character
 */
function combatantString(builder, character) {
    var traits = {};
    combatTraits.forEach(function(traitName) {
        if (character.trait(traitName) > 0) {
            traits[traitName] = character.trait(traitName);
        }
    });
    character.traits = traits;
    builder(character.toString());
}

module.exports = ion.define(Model, {
    /**
     * A gang or other band of human characters.
     *
     * @class atomic.models.Gang
     * @extends atomic.models.Model
     *
     * @constructor
     * @param [params] {Object} parameters
     */
    init: function(params) {
        /**
         * @property members
         * @type {Array}
         */
        this.members = [];
        /**
         * @property kind
         * @type String
         */
        Model.call(this, params);
        this.type = "Gang";
    },
    add: function(character) {
        this.members.push(character);
    },
    toString: function() {
        var builder = Builder(this);
        gangName.call(this, builder);
        return builder(this.members, function(builder, member, index) {
            combatantString.call(member, builder, member);
        }).toString();
    },
    toHTML: function() {
        var builder = Builder(this);
        builder("p", {}, function(builder) {
            gangName.call(this, builder);
        });
        builder("div", {class: "more"}, function(builder) {
            builder(this.members, function(builder, member, index) {
                builder("p", {}, function(builder) {
                    combatantString.call(member, builder, member);
                });
            });
        });
        return builder.toString();
    }
});

},{"../builder":2,"../ion":23,"./model":32}],29:[function(require,module,exports){
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
},{"../ion":23}],30:[function(require,module,exports){
var ion = require('../ion');
var Model = require('./model');
var Builder = require('../builder');

module.exports = ion.define(Model, {
    /**
     * An item.
     * @class atomic.models.Item
     * @extends atomic.models.Model
     *
     * @constructor
     * @param data {String/Object} The name of the object, or the properties to set for this item.
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

},{"../builder":2,"../ion":23,"./model":32}],31:[function(require,module,exports){
var ion = require('../ion');

var lookup = {
    Bag: require('./bag'),
    Character: require('./character'),
    Family: require('./family'),
    Gang: require('./gang'),
    Item: require('./item'),
    Model: require('./model'),
    Name: require('./name'),
    Profession: require('./profession'),
    Relationship: require('./relationship'),
    Store: require('./store'),
    Weather: require('./weather')
};

/**
 * Given a JSON object, convert it back to a graph of model objects in this library. You can
 * also pass a JSON string to this method. This method is used to recreate JSON that has
 * been persisted, among other things.
 *
 * @static
 * @method deserializer
 * @for atomic.models
 * @param json {Object|String} a json object to convert to a models object. Can also be a string object.
 * @return {atomic.models.Model} model object or subclass
 */
function deserializer(object, nested) {
    // Convert from string to JSON if necessary
    if (nested !== true && ion.isString(object)) {
        object = JSON.parse(object);
    }
    if (ion.isObject(object) || ion.isArray(object)) {
        if (object.type) {
            object = new lookup[object.type](object);
        }
        for (var prop in object) {
            object[prop] = deserializer(object[prop], true);
        }
    }
    return object;
}
/**
 * Create a deep copy of this models item, maintaining the correct subclass,
 * nested objects, etc.
 *
 * @static
 * @method clone
 * @for atomic.models
 * @return {atomic.models.Model} clone
 */
function clone(object, freeze) {
    freeze = ion.isBoolean(freeze) ? freeze : Object.isFrozen(object);
    var model = deserializer(JSON.stringify(object));
    if (freeze) {
        return Object.freeze(model);
    }
    return model;
}

module.exports.clone = clone;
module.exports.deserializer = deserializer;

},{"../ion":23,"./bag":25,"./character":26,"./family":27,"./gang":28,"./item":30,"./model":32,"./name":33,"./profession":34,"./relationship":35,"./store":36,"./weather":37}],32:[function(require,module,exports){
var ion = require('../ion');

var Model = ion.define({
    /**
     * The base class of models entities in the library.
     *
     * Model objects can be converted to JSON and persisted, then reconstituted
     * back into models classes.
     *
     * @class atomic.models.Model
     * @constructor
     * @param  data {Object} The JSON used to initialize the properties of this models.
     */
    init: function(data) {
        this.tags = [];
        if (ion.isObject(data)) {
            for (var prop in data) {
                this[prop] = data[prop];
            }
        }
        this.type = "Model";
    },
    /**
     * Does this models have the tag?
     *
     * @method is
     * @param tag {String} the tag to verify
     * @return {Boolean} true if the tag exists for this item, false otherwise
     */
    is: function(tag) {
        return this.tags.indexOf(tag) !== -1;
    },
    /**
     * Does this models have the tag?
     *
     * @method has
     * @param tag {String} the tag to verify
     * @return {Boolean} true if the tag exists for this item, false otherwise
     */
    has: function(tag) {
        return this.is(tag);
    },
    /**
     * Does this models _not_ contain the tag?
     *
     * @method not
     * @param tag {String} the tag that should _not_ be present for this item
     * @return {Boolean} true if it doesn't exist, false otherwise
     */
    not: function(tag) {
        return this.tags.indexOf(tag) === -1;
    },
    /**
     * Given a prefix like `ammo` or `media`, will return the specific tag for this
     * item, such as `ammo:22` or `media:35mm`.
     *
     * @method typeOf
     * @param prefix {String} the prefix to match
     * @return {String} the first tag found that matches this prefix
     */
    typeOf: function(p) {
        var prefix = p+":";
        return this.tags.filter(function(tag) {
            return (tag.indexOf(prefix) > -1);
        })[0];
    }
});

module.exports = Model;
},{"../ion":23}],33:[function(require,module,exports){
var ion = require('../ion');
var Model = require('./model');

module.exports = ion.define(Model, {
    /**
     * A person's name (given and family name).
     *
     * @class atomic.models.Name
     * @extends atomic.models.Model
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


},{"../ion":23,"./model":32}],34:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Model = require('./model');

var MAX_TRAIT_VALUE = 4;

function addTrait(map, name, start) {
    if (!map[name]) {
        map[name] = start;
    }
}

module.exports = ion.define(Model, {
    /**
     * An occupation or profession that provides the history, social standing, and
     * traits of a character.
     *
     * @class atomic.models.Profession
     * @extends atomic.models.Model
     *
     * @constructor
     * @param [params] {Object}
     *     @param [params.name] {String|Array} the name of the profession
     *     @param [params.traits] {Array} An array of traits the character can accumulate when advancing in this profession
     *     @param [params.honorifics] {Array} An array of eight elements indicating honorifics that are earned
     *          while advancing in the profession. Each element represents what is earned for two years in the profession.
     *          Early elements in this array may be null.
     *     @param [params.degrees] {Array} An array of eight elements indicating degrees that are earned while advancing
     *          in the profession. Each element represents what is earned for two years in the profession. Early elements
     *          in this array may be null.
     *     @param [params.hints] {Array} An array of string hints to the appearance generator about the effect of the
     *          profession on the appearance of the character. See <code>atomic.createAppearance()</code> for values and
     *          further advice.
     *     @param [params.seeds] {Array} A list of traits that are "seeded" by this profession. They are set to zero,
     *          and then more likely to be selected for advancement. These are "core skills" of the profession
     *     @param [params.histories] {Array} An ordered array of descriptors for the history of the character. The first
     *          descriptor is used for a character working 1-2 years in the profession, the second for 3-4 years, and so
     *          forth. These histories may use {format} values, including the **name** of the profession (as selected
     *          when a character is joined to the profession, if an array was provided for this value); the **rank**
     *          of the character, or the **years** he or she was in the profession.
     */
    init: function(params) {
        this.names = (params.name) ? [params.name] : [];
        this.seeds = [];
        this.supplements = [];
        this.tags = [];
        this.postprocess = ion.identity;
        Model.call(this, params);
        this.type = "Profession";
    },
    train: function(character, points) {
        var map = {};
        this.seeds.forEach(function(seed) {
            if (character.trait(seed) < MAX_TRAIT_VALUE) {
                addTrait(map, seed, 1);
                points--;
            }
        });

        // Force grouping into a subset of supplemental skills, enough to
        // assign all the points (at a limit of 4)
        var limit = Math.ceil(points/4) - this.seeds.length + ion.roll("1d2");
        ion.shuffle(this.supplements);
        this.supplements.forEach(function(trait, index) {
            if (index <= limit) {
                addTrait(map, trait, 0);
            }
        });
        var names = ion.keys(map);

        // Okay, the starting points, minus the mandatory seed points, can
        // be less than zero. So test explicitly for that.
        while(points > 0 && names.length) {
            var traitName = ion.random(names);
            // prevents an infinite loop if points exceeds sum of max of all traits, and
            // also ensures that existing trait values are accounted for when honoring
            // maximum values.
            if ((map[traitName] + character.trait(traitName)) >= MAX_TRAIT_VALUE) {
                names = ion.without(names, traitName);
                continue;
            }
            map[traitName]++;
            points--;
        }
        for (var prop in map) {
            if (map[prop] > 0) {
                character.changeTrait(prop, map[prop]);
            }
        }
        // All the tags of the profession are carried forward in the character,
        // and the character can be queried rather than keeping the profession
        // around.
        this.tags.forEach(function(tag) {
            character.tags.push(tag);
        });
        this.postprocess(character);
    }
});
},{"../ion":23,"./model":32}],35:[function(require,module,exports){
var ion = require('../ion');
var Builder = require('../builder');

function relatedNames(char1, char2, relationship) {
    if (char1.name.family === char2.name.family) {
        return ion.format("{0} ({1}) & {2} ({3}) {4} ({5}). ", char1.name.given, char1.age,
            char2.name.given, char2.age, char1.name.family, relationship);
    } else {
        return ion.format("{0} ({1}) & {2} ({3}). {4}. ", char1.name.toString(), char1.age,
            char2.name.toString(), char2.age, ion.sentenceCase(relationship));
    }
}

/**
 * Two people in a familial relationship.
 *
 * @class atomic.models.Relationship
 * @constructor
 * @param older {atomic.models.Character}
 * @param younger {atomic.models.Character}
 * @param relationship {String}
 */
module.exports = function(older, younger, rel) {
    /**
     * The older person in the relationship
     * @property older
     * @type {atomic.models.Character}
     */
    this.older = older;
    /**
     * The younger person in the relationship
     * @property younger
     * @type {atomic.models.Character}
     */
    this.younger = younger;
    /**
     * The name of the relationship between the two people
     * @property relationship
     * @type {String}
     */
    this.relationship = rel;

    this.toString = function() {
        return relatedNames(this.older, this.younger, this.relationship);
    };
    this.toHTML = function() {
        var b = Builder(this);
        b("p", {}, function(b) {
            b(relatedNames(this.older, this.younger, this.relationship));
        });
        b("div", {class: "more"}, function(b) {
            b("p", {}, function(b) {
                b(this.older.toString());
            })(" ");
            b("p", {}, function(b) {
                b(this.younger.toString());
            });
        });
        return b.toString();
    };

};
},{"../builder":2,"../ion":23}],36:[function(require,module,exports){
var ion = require('../ion');
var Bag = require('./bag');
var Model = require('./model');
var Builder = require('../builder');

module.exports = ion.define(Model, {
    /**
     * A Store
     *
     * @class atomic.models.Store
     * @extends atomic.models.Model
     *
     * @constructor
     * @param [params] {Object} params
     */
    init: function(params) {
        /**
         * Name of the store
         * @property name
         * @type {String}
         */
        this.name = null;
        /**
         * Owner of the store
         * @property owner
         * @type {atomic.models.Character}
         */
        this.owner = null;
        /**
         * The cash on hand at the store. Currency (liquidity) is
         * tight in this game and trades will have to work with limited
         * currency.
         *
         * @property onhand
         * @type {atomic.models.Bag}
         */
        this.onhand = null;
        /**
         * The inventory for sale at this establishment
         * @property inventory
         * @type {atomic.models.Bag}
         */
        this.inventory = new Bag();
        /**
         * A description of what the merchant will buy from players.
         * @property buys
         * @type {String}
         */
        /**
         * A description of what the merchant sells; may be broader than what
         * is in inventory if it includes things that are considered irrelevant
         * to the game, like pottery (this may actually go away however).
         * @property sells
         * @type {Stirng}
         */
        Model.call(this, params);
        this.type = "Store";
    },
    toString: function() {
        var b = Builder(this); // Not as thorough as as the html version
        b(this.name)(". ");
        b(!!this.owner, function() {
            b("Owner(s): " + this.owner.toString()+" ");
        });
        b("For Trade: ");
        b(!!this.policy, this.policy + " ");
        b(this.inventory.toString());
        b(this.inventory.count() !== 0, " ");
        b(!!this.onhand, function(){
            b(this.onhand.toString());
        });
        b(" Total value: ")(this.totalValue)(". ");
        return b.toString();
    },
    toHTML: function() {
        var b = Builder(this);
        b("p", {class: "title"}, this.name);

        b("div", {class: "owner"}, function(b) {
            b("p", {class: "title"}, function(b) { b("Owner(s)"); });
            b(this.owner.toHTML());
        });
        b("p", {class: "title"}, "For Trade");
        b(!!this.policy, function() {
            b("p", {class: "policy"}, this.policy);
        });
        b("ul", {class: "inventory"}, function(b) {
            b(this.inventory.entries, function(b, entry) {
                var string = ion.pluralize(entry.item.name, entry.count);
                if (string.substring(string.length-1) === ")") {
                    string = string.substring(0,string.length-1) + ", ";
                } else {
                    string += " (";
                }
                if (entry.count === 1) {
                    string += entry.item.value+"T)";
                } else {
                    string += entry.item.value+"T each)";
                }
                b("li", {}, string);
            });
        });
        b("p", {}, this.onhand.toString());

        return b.toString();
    }
});
},{"../builder":2,"../ion":23,"./bag":25,"./model":32}],37:[function(require,module,exports){
var ion = require('../ion');
var Model = require('./model');

module.exports = ion.define(Model, {
    /**
     * A weather.js forecast for a day in a month.
     *
     * @class atomic.models.Weather
     * @extends atomic.models.Model
     *
     * @constructor
     * @param data {Object} A data object initializing properties of a name.
     */
    init: function(data) {
        Model.call(this, data);
        this.type = "Weather";
    }
});


},{"../ion":23,"./model":32}],38:[function(require,module,exports){
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

},{"../ion":23}],39:[function(require,module,exports){
"use strict";

var ion = require('../ion');
var Table = require('./table');

// Simple random function that doesn't execute and return functions stored in table.
function rand(coll) {
    return coll[ ~~(Math.random()*coll.length) ];
}

module.exports = ion.define(Table, {
    /**
     * A table of elements that occur based on the rarity keywords "common", "uncommon" and "rare".
     * Unless you set `useStrict` to false, you must specify at least one value for each frequency,
     * or you will raise an exception when you try and retrieve a value.
     *
     * If all three frequencies are provided, common values are returned about 65% of the time,
     * uncommon values 30% of the time, and rare values 5% of the time. If `useStrict` is set to
     * false and some categories are missing, the categories are adjusted in a logical way to
     * cover the gap. For example, rare will be returned more often if common or uncommon are missing;
     * less often when paired with uncommon than common, and 100% of the time if both common and
     * uncommon are missing.
     * @example
     *     var table = new atomic.tables.RarityTable();
     *     table.add("common", "A");
     *     table.add("uncommon", "B");
     *     table.add("rare", "B");
     *     table.get();
     *     => "A"
     *
     * @class atomic.tables.RarityTable
     * @extends atomic.tables.Table
     *
     * @constructor
     * @param [outFunction] {Function} A function to run on values supplied to the add method before
     * they are returned. If no function is supplied, the value itself is returned.
     * @param [useStrict=true] {boolean} Should this table throw an error if something is not
     * supplied for all three frequency categories?
     */
    init: function(outFunction, useStrict) {
        this.common = [];
        this.uncommon = [];
        this.rare = [];
        if (arguments.length === 1) {
            useStrict = outFunction;
        }
        outFunction = ion.isFunction(outFunction) ? outFunction : ion.identity;
        this.useStrict = ion.isBoolean(useStrict) ? useStrict : true;
        Table.call(this, outFunction);
    },
    /**
     * Add a value to the table with the frequency `common`, `uncommon` or `rare`.
     * Common occurs about 65% of the time, uncommon about 30% of the time, and
     * rare occurs 5% of the time. (Items in each bucket are equally weighted for
     * selection). These percentages are adjusted if the table is created with
     * strict mode disabled, and items are not placed in each of the three categories.
     *
     * @method add
     * @param frequency {String} `common`, `uncommon` or `rare`
     * @param object {Object} the object to put into the table
     * @return {atomic.tables.RarityTable}
     *
     */
    add: function(frequency, object) {
        switch(frequency) {
            case "common":
            case "uncommon":
            case "rare":
                this[frequency].push(object);
                this.rows.push(object); // referenced as a public property
                break;
            default:
                throw new Error(frequency + " is not valid (use rare, uncommon, common)");
        }
        return this;
    },
    /**
     * Returns a value from the table based on the rarity keywords frequency of occurrence.
     * If the table is created in strict mode, and at least one value hasn't been supplied
     * for each of the three frequencies, an exception will be thrown.
     *
     * @method get
     * @return {Object}
     */
    get: function() {
        // Unless useStrict is on, it's an error not to include items in each category.
        if (this.useStrict && (this.rare.length === 0 || this.common.length === 0 || this.uncommon.length === 0)) {
            throw new Error("RarityTable must have at least one common, uncommon, and rare element");
        }
        var common = ((this.common.length) ? 65 : 0),
            uncommon = ((this.uncommon.length) ? 30 : 0),
            rare = ((this.rare.length) ? 5 : 0),
            roll = ion.roll(common+uncommon+rare);

        if (roll <= common && common !== 0) {
            return this.outFunction(rand(this.common));
        } else if (roll <= (common+uncommon) && uncommon !== 0) {
            return this.outFunction(rand(this.uncommon));
        } else if (roll <= (common+uncommon+rare) && rare !== 0) {
            return this.outFunction(rand(this.rare));
        }
        return null;
    }
});
},{"../ion":23,"./table":40}],40:[function(require,module,exports){
"use strict";

var ion = require('../ion');

module.exports = ion.define({
    /**
     * A table of stuff you select by rolling 1d100.
     * @example
     *     var table = new atomic.tables.Table();
     *     table.add(50, "heads")
     *     table.add(50, "tails");
     *     table.get();
     *     => "heads"
     *
     * @class atomic.tables.Table
     *
     * @constructor
     * @param inFunction {Function} A function to run on values supplied to the add method. For
     *  example, you might create a function to convert item names to true Item objects, as a
     *  convenience when building the table.
     */
    init: function(outFunction) {
        this.outFunction = outFunction || ion.identity;
        this.rows = [];
        this.sum = 0;
    },
    /**
     * Add something to this table. You can either specify the specific percentage that this
     * element should be selected, or you can provide the range of die roll numbers (this
     * latter approach is easier when you're adapting an existing pen-and-paper table).
     *
     * The percentages must add up to 100% (or 100 on 1d100).
     * @example
     *     var table = new atomic.tables.Table();
     *     table.add(50, object); // will occur 50% of the time
     *     table.add(1, 70, object); // Will occur 70% of the time, on a roll of 1 to 70
     *
     * @method add
     * @param percentOrStartRoll {Number} % chance occurrence of 100%, or the start number on 1d100
     * @param [endRoll] {Number}
     * @param object  {Object} Element to add to the table, can be any type
     */
    add: function() {
        var start, end, object, chance;
        if (arguments.length === 3) {
            start = arguments[0];
            end = arguments[1];
            object = arguments[2];
            chance = (end-start)+1;
            if (start < 1 || start > 100 || end < 1 || end > 100) {
                throw new Error("Dice ranges must be from 1 to 100");
            }
        } else {
            chance = arguments[0];
            object = arguments[1];
            if (chance < 1 || chance > 100) {
                throw new Error("Dice ranges must be from 1 to 100");
            }
        }
        if (typeof object === "undefined") {
            throw new Error("Object is undefined");
        }
        this.rows.push({chance: chance, object: object});
        this.sum += chance;
        return this;
    },
    /**
     * Get an item from the table, based on percentages.
     *
     * @method get
     * @return {Object} An item from the table
     */
    get: function() {
        if (Math.round(this.sum) !== 100) {
            throw new Error("Table elements do not add up to 100%, but rather to " + Math.round(this.sum));
        }
        var result = ion.roll(100);
        for (var i=0, len = this.rows.length; i < len; i++) {
            if (result <= this.rows[i].chance) {
                return this.outFunction(this.rows[i].object);
            }
            result -= this.rows[i].chance;
        }
    },
    /**
     * @method size
     * @return {Number} the number of items in the table.
     */
    size: function() {
        return this.rows.length;
    }
});

},{"../ion":23}]},{},[1])(1)
});