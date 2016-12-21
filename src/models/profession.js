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