var ion = require('../ion');
var Builder = require('../builder');
var Model = require('./model');

function relatedNames(char1, char2, relationship) {
    if (char1.name.family === char2.name.family) {
        return ion.format("{0} ({1}) & {2} ({3}) {4} ({5}). ", char1.name.given, char1.age,
            char2.name.given, char2.age, char1.name.family, relationship);
    } else {
        return ion.format("{0} ({1}) & {2} ({3}). {4}. ", char1.name.toString(), char1.age,
            char2.name.toString(), char2.age, ion.sentenceCase(relationship));
    }
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
     * some of whom may themselves be in family objects with kids, etc. One of the building
     * blocks of encounters and homesteads, at the least.
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
        return Builder(this)
            (relatedNames(this.male, this.female, this.relationship))
            (!!this.childCount, function(b) {
                b("{|}{1 |}child{ren}: ", this.childCount);
                b(this.children, function(b, child, index) {
                    b(index > 0, " ")(child.toString());
                });
                b(this.couples, function(b, couple, index) {
                    b(index > 0, " ")(couple.toString());
                });
            }).toString();
    },
    toHTML: function() {
        var b = Builder(this);
        b("div", {class: "family"}, function(b) {
            b("p", {}, coupleNames(this));
            b("div", {class:"more"}, function(b) {
                b(!!this.single, function() {
                    b(this.single.toHTML());
                }, function() {
                    b(this.male.toHTML());
                    b(" ");
                    b(this.female.toHTML());
                });
            });
            b(!!this.childCount, function(b) {
                b("div", {class: "children_preamble"}, function(b) {
                    b("{|}{1 |}child{ren}:", this.childCount);
                });
                b("div", {class: "children"}, function(b) {
                    b(this.children, function(b, child) {
                        b("div", {class: "child"}, function(b) {
                            b(child.toHTML());
                        });
                    });
                    b(this.couples, function(b, couple) {
                        b(couple.toHTML());
                    });
                });
            });
        });
        return b.toString();
    }
});