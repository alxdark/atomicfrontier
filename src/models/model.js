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