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
