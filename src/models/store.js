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