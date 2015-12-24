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