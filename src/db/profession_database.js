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
