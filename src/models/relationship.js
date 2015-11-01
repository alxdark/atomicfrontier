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
 * @class ion.models.Relationship
 * @constructor
 * @param older {ion.models.Character}
 * @param younger {ion.models.Character}
 * @param relationship {String}
 */
module.exports = function(older, younger, rel) {
    /**
     * The older person in the relationship
     * @property older
     * @type {ion.models.Character}
     */
    this.older = older;
    /**
     * The younger person in the relationship
     * @property younger
     * @type {ion.models.Character}
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