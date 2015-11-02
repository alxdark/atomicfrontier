var ion = require('../ion');
var Model = require('./model');
var Builder = require('../builder');

function gangName(b) {
    var members = ion.toList(this.members, function(m) {
        return m.name;
    });
    b(!!this.name, function(b) {
        b("The {0} ({1}): ", this.name, members);
    }, function(b) {
        b("{0} member {1} ({2}): ", this.members.length, this.kind, members);
    });
    return b;
}
function combatantString(b, c) {
    // Remove uninteresting traits from description.
    var traits = {};
    atomic.getCombatTraits().forEach(function(traitName) {
        if (c.trait(traitName) > 0) {
            traits[traitName] = c.trait(traitName);
        }
    });
    return charBasics.call(this, b)
    ("{0}. ", traitsToString(traits))
    ("Possessions: {0}", this.inventory.toString()).toString();
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
        var b = Builder(this);
        gangName.call(this, b);
        return b(this.members, function(b, m, index) {
            combatantString.call(m, b, m);
        }).toString();
    },
    toHTML: function() {
        var b = Builder(this);
        b("p", {}, function(b) {
            gangName.call(this, b);
        });
        b("div", {class: "more"}, function(b) {
            b(this.members, function(b, m, index) {
                b("p", {}, function(b) {
                    combatantString.call(m, b, m);
                });
            });
        });
        return b.toString();
    }
});
