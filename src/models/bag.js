var ion = require('../ion');
var Item = require('./item');
var Model = require('./model');

function sortByName(a,b) {
    return (a.item.name > b.item.name) ? 1 : (a.item.name < b.item.name) ? -1 : 0;
}
function findEntry(bag, item) {
    return bag.entries.filter(function(entry) {
        return entry.item.name === item.name;
    })[0];
}
function itemParam(item) {
    return (typeof item == "string")  ? new Item({name: item}) : item;
}
function countParam(count) {
    return (typeof count == "number") ? count : 1;
}
function sum(bag, item, field) {
    item = itemParam(item);
    return bag.entries.filter(function(entry) {
        return (!item || (item.name === entry.item.name));
    }).reduce(function(sum,entry) {
        var value = (field) ? entry.item[field] : 1;
        return sum + (value*entry.count);
    }, 0);
}

var Bag = ion.define(Model, {
    /**
     * An unordered collection of items, including multiples of the same item. Items are differentiated
     * by name and title (if it exists) alone, so don't create items with the same name that have different
     * values or encumbrance.
     *
     * @class atomic.models.Bag
     * @extends atomic.models.Model
     * @constructor
     * @param [params] {Object} The JSON data to initialize this model.
     *      @param [params.descriptor] {String} a description of the bag separate from its contents (if it
     *          is not abstract, and is something like a safe or lockbox).
     */
    /**
     * The items in the bag. Each entry has two properties: `item` with an item
     *      object, and `count` with the number of this item in the bag.
     * @property entries
     * @type Array
     */
    init: function(params) {
        Model.call(this, params);
        this.entries = this.entries || [];
        this.type = "Bag";
    },
    /*
     * Combine the contents of one bag into another. Does not change the
     * bag passed into this bag. BEWARE: you're duplicating the contents of the
     * bag into another bag when you do this. You should probably throw the other
     * bag away.
     *
     * @method addBag
     * @param {Bag} bag to combine into this bag (it will not be changed or referenced)
     */
    addBag: function(bag) {
        if (bag instanceof Bag) {
            JSON.parse(JSON.stringify(bag)).entries.forEach(function(entry) {
                this.add(entry.item, entry.count);
            }, this);
        }
    },
    /*
     * Remove the contents of this bag. Does not change the bag passed into this bag.
     *
     * @method removeBag
     * @param {Bag} bag specifying the items to remove from this bag
     */
    removeBag: function(bag) {
        if (bag instanceof Bag) {
            JSON.parse(JSON.stringify(bag)).entries.forEach(function (entry) {
                this.remove(entry.item, entry.count);
            }, this);
        }
    },
    /**
     * Add items to this bag.
     *
     * @method add
     * @param item {String|atomic.models.Item} an item to add
     * @param [count=1] {Number} of items to add
     * @return {Number} the number of items after adding
     */
    add: function(item, count) {
        if (!item) {
            throw new Error("No item passed to bag.add()");
        }
        item =  itemParam(item);
        count = countParam(count);
        var entry = findEntry(this, item);

        if (count < 0) {
            throw new Error("Can't add negative items to bag: " + count);
        }
        if (!entry) {
            entry = {item: item, count: 0, titles: {}};
            this.entries.push(entry);
        }
        if (item.title) {
            entry.titles[item.title] = true;
        }
        entry.count += count;
        return entry.count;
    },
    /**
     * Sort the entries of the bag given a sorting function
     *
     * @method sort
     * @param func {Function} a sort function
     */
    sort: function(func) {
        this.entries.sort(func || sortByName);
    },
    /**
     * Remove items from this bag. You should examine the bag before removing items,
     * because trying to remove more items than are in the bag will throw exceptions.
     *
     * @method remove
     * @param item {String|atomic.models.Item} an item to remove
     * @param [count=1] {Number} of items to remove
     * @return {Number} the number of items after removals
     */
    remove: function(item, count) {
        item = itemParam(item);
        count = countParam(count);
        var entry = findEntry(this, item);

        if (!entry) {
            throw new Error("Can't remove item that's not in the bag");
        }
        if (count <= 0) {
            throw new Error("Can't remove a negative number of items from bag: " + count);
        }
        if (count > entry.count) {
            throw new Error("Can't remove "+count+" items in bag that has only " + entry.count);
        }
        entry.count -= count;
        if (item.title) {
            delete entry.titles[item.title];
        }
        if (entry.count === 0) {
            this.entries.splice(this.entries.indexOf(entry), 1);
        }
        return entry.count;
    },
    /**
     * Return this bag, filtered using a filter function, which is passed the item and
     * the count:
     * @example
     *     bag.filter(function(item, count) {
         *         return item.is('food');
         *     }).toString();
     *     => "A stick of beef jerky, a bottle of milk, a pear, and a can of coffee."
     *
     * @method filter
     * @param func {Function} filter function
     * @return {atomic.models.Bag}
     */
    filter: function(func) {
        var other = new Bag();
        for (var i = this.entries.length-1; i >= 0; i--) {
            var entry = this.entries[i];
            if (func.call(this, entry.item, entry.count)) {
                var item = entry.item, count = entry.count;
                this.remove(item, count);
                other.add(item, count);
            }
        }
        return other;
    },
    /**
     * Sum the value of all items in this bag. Can also provide a sum for an individual
     * group of items in the bag.
     *
     * @method value
     * @param [item] {String|atomic.models.Item} an item; if supplied, only the value of these items will be returned
     * @return {Number} the total value of the items in the bag
     */
    value: function(item) {
        return sum(this, item, "value");
    },
    /**
     * Sum the encumbrance of all items in this bag. Can also provide a sum for an individual
     * group of items in the bag.
     *
     * @method enc
     * @param [item] {String|atomic.models.Item} an item; if supplied, only the encumbrance of these items will be returned
     * @return {Number} the total encumbrance of the items in the bag
     */
    enc: function(item) {
        return sum(this, item, "enc");
    },
    /**
     * The count of all items in this bag. Can also provide the count of an individual
     * group of items in the bag.
     *
     * @method count
     * @param [item] {String|atomic.models.Item} an item; if supplied, only these items will be counted in the bag
     * @return {Number} the total count of the items in the bag
     */
    count: function(item) {
        return sum(this, item);
    },
    /**
     * Given a prefix like `ammo` or `media`, will return every item that contains a tag with
     * this prefix, such as `ammo:22` or `media:35mm`.
     *
     * @method typeOf
     * @param prefix {String} the prefix to matchAndRemove
     * @return {Array} all items that matchAndRemove this prefix
     */
    typeOf: function(p) {
        return this.entries.reduce(function(array, entry) {
            if (entry.item.typeOf(p)) {
                array.push(entry.item);
            }
            return array;
        }, []);
    },
    toString: function() {
        var string = "";
        var cash = 0;
        if (this.entries.length) {
            var items = false;
            var len = this.entries.filter(function(entry) {
                return entry.item.not('cash');
            }).length;
            this.entries.forEach(function(entry) {
                if (entry.item.is('cash')) {
                    cash += (entry.item.value*100) * entry.count;
                } else {
                    items = true;
                    string += ion.pluralize(entry.item, entry.count);
                    if (ion.keys(entry.titles).length) {
                        string += " ("+ion.keys(entry.titles).join("; ")+")";
                    }
                    if (len === 1) {
                        string += '.';
                    } else if (len === 2) {
                        string += ', and ';
                    } else {
                        string += ', ';
                    }
                    len--;
                }
            }, this);
            if (items && cash) {
                string += ' ';
            }
            if (cash) {
                string += "$"+cash.toFixed(0)+" in cash.";
            }
            string = ion.sentenceCase(string);
        }
        if (this.descriptor) {
            string = (this.descriptor + ": " + string);
        }
        return string;
    },
    toHTML: function() {
        return '<p class="bag">'+this.toString()+'</p>';
    }
});

module.exports = Bag;
