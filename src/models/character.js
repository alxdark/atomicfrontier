var ion = require('../ion');
var Model = require('./model');
var Bag = require('./bag');
var Builder = require('../builder');

function traitsToString(traits) {
    return ion.keys(traits).sort(function(a,b) {
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