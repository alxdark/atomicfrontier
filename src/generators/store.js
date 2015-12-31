"use strict";

var ion = require('../ion');
var Bag = require('../models/bag');
var Store = require('../models/store');
var Table = require('../tables/table');
var Name = require('../models/name');

var getGangTypes = require('./gang').getGangTypes;
var createGang = require('./gang').createGang;
var createPlaceName = require('./place_name').createPlaceName;
var db = require('./data').storeDatabase;
var assignNickname = require('./gang').assignNickname;
var createCharacter = require('./character').createCharacter;
var createCharacterName = require('./character_name');
var createRelationship = require('./relationships').createRelationship;
var createContainer = require('./bag').createContainer;
var createStockpile = require('./bag').createStockpile;
var deserializer = require('../models/lib').deserializer;
var clone = require('../models/lib').clone;

// This is not a store name:
// The Emily "The Kid" Flores Sporting Goods Store
// either use the nickname, the name, or the last name, but not multiples of same

/* Merchant types (should be merchant, not shop/store):
 *
 * http://www.tottenvillememories.net/businessess1950s.htm
 *
 * bar/tavern/saloon & grill
 * diner
 * bathhouse
 * stables
 * barbor
 * brewery/distillery/vineyard
 * baker
 * icehouse
 * leather store (leatherworker)
 * glassware
 * weaving
 * pharmacy ?
 * furniture/woodworking
 *  - sporting goods store (ammo, camping)
 * five and dime store/souvenir shop/drugstore
 *
 * Pre-Collapse (these are really ruins)
 * robot showroom
 * automobile showroom
 * office
 *
 * Location:
 * - roadside, camp, settlement, military, market (open air, e.g. fairgrounds)
 *
 * Size (allowable sizes for a type, each with a different inventory and different name):
 *
 * - vendor (single person with like a blanket on the ground)
 * - cart (cart, table, stand, stall)
 * - building (tent, cabin, building)
 * - warehouse (warehouse, depot, building)
 * - settlement: ["General Store", "Shop", "Store", "Market", "Mercantile", "Trading Post"]
 *
 * TESTS
 *  - can't submit "Cash On Hand" as a type.
 *  - can submit another type.
 */

var markup = [0.2, 0.33, 0.4];
var ownerStrategies = new Table();
var nameStrategies = new Table();
var policies = {
    // trade:sellhigh - sells higher than normal price - handled separately
    // trade:buylow - buys lower than normal prices - handled separately
    "trade:any": ["anything"],
    "trade:necessities": ["food", "ammo", "medicine"],
    "trade:luxuries": ["liquor", "pre-collapse junk food", "cigarettes"],
    "trade:currency": ["greenbacks", "casino chips", "gold and silver"],
    "trade:stocked": ["any item that would be stocked at this store"]
};
var storeNames = {
    'clientele:lobrow': ["{Bull's Head|Holy Moses}", "{Red|Black|Blue} {Lightning|Cross}", "{Snake|Scorpion} Pit"],
    'clientele:nobrow': ["{Northern|Central|Southern|Western}", "{Red|Blue|Black} Star", "The {Buckaroo|Cowpoke}"],
    'clientele:hibrow': ["{The |}{Luxe|Satellite|Asteroid|Galaxy|Nebula}"]
};

nameStrategies.add(30, function(ownerName, placeName, nameString, clientele) {
    return placeName + " " + ion.random(nameString);
});
nameStrategies.add(15, function(ownerName, placeName, nameString, clientele) { // possessive
    var p = (/[sz]$/.test(ownerName)) ? "'" : "'s";
    var name = (ion.test(70)) ? ownerName.family : ownerName.toString();
    return name + p + " " + ion.random(nameString);
});
nameStrategies.add(15, function(ownerName, placeName, nameString, clientele) {
    var biz = ion.random(nameString);
    var name = (ion.test(70)) ? ownerName.family : ownerName.toString();

    return name + " " + biz;
});
nameStrategies.add(40, function(ownerName, placeName, nameString, clientele) {
    // To be selected from tags, which can be one or more of clientele:{no|lo|hi|brow"
    var names = storeNames[clientele];
    return ion.random(names) + " " + ion.random(nameString);
});

// If not a gang, may be a relationship or a person
ownerStrategies.add(20, function(config) {
    return createRelationship(config);
});
ownerStrategies.add(80, function(config) {
    var c = createCharacter(config);
    c.name = createCharacterName({family: c.name.family, gender: c.gender});
    if (ion.test(20)) {
        assignNickname(c);
    }
    return c;
});

function createPolicy(config) {
    var array = [];
    config.tags.forEach(function(tag) {
        if (policies[tag]) {
            array = array.concat(policies[tag]);
        }
    });

    var list = (config.policy) ? [config.policy] : [];
    list.push("Will trade for " + ion.toList(array, ion.identity, "or") + ".");
    if (config.tags.indexOf("trade:buylow")) {
        list.push("Unless receiving currency, this merchant buys low (half value).");
    }
    return list.join(' ');
}

/**
 * Create a merchant. Note that there are many parameter options, some mutually
 * exclusive. You would only pass in an owner's name or the owner character, not both,
 * for example. Passing in a place name does not guarantee it will be used in the store
 * name, but if you pass in the store name, it'll be used as is. And so forth.
 *
 * @static
 * @method createStore
 * @for atomic
 *
 * @param [params] {Object}
 *     @param [params.name] {String} name of the store
 *     @param [params.placeName] {String} place name where the store is located
 *     @param [params.owner] {atomic.models.Character} the store owner
 *     @param [params.value] {Number} value of the store's inventory in trade units
 *     @param [params.inventory] {Object} all the parameters that can be passed to the
 *          createStockpile method (if not provied and params.value is provided, that will
 *          be used as the minValue to the stockpile method).
 *     @param [params.tags] {String} tag query for a store type, e.g. "roadside"
 *          or "settlement" or "stall"
 *
 * @return {atomic.models.Store} the store
 */
module.exports = function(params) {
    params = ion.extend({}, params || {});
    params.tags = params.tags || "*";

    // Still don't quite have the name/size of store thing down.
    var config = db.find(ion.toTag(params.tags));
    if (ion.isNumber(params.value)) {
        config = clone(config);
        config.inventory.totalValue = params.value;
    }
    var owner = params.owner;
    if (!owner) {
        if (getGangTypes().indexOf(config.owner.profession) > -1) { // it's a gang
            owner = createGang({type: config.owner.profession});
        } else { // it's a character or relationship.
            owner = ownerStrategies.get()(config.owner);
        }
    }
    var ownerName;
    if (owner.name) {
        ownerName = owner.name;
    } else if (owner.kind) {
        ownerName = owner.kind;
    } else if (owner.older) {
        ownerName = owner.older.name;
    } else {
        throw new Error("Could not find owner name for this type", config);
    }

    var storeName = params.name;
    if (!storeName) {
        var placeName = params.placeName || createPlaceName();
        var clientele = config.typeOf('clientele');
        storeName = nameStrategies.get()(ownerName, placeName, ion.random(config.names), clientele);
    }

    var onhand = createContainer("Cash On Hand");

    var inventory = (config.inventory) ?
        createStockpile(config.inventory) : new Bag();

    // We do want this value before it is adjusted to screw the players...
    var totalValue = inventory.value();
    var maxValue = Math.max.apply(Math, inventory.entries.map(function(entry) {
        return entry.item.value;
    }));

    if (config.tags.indexOf("trade:sellhigh")) {
        inventory.entries.forEach(function(entry) {
            var value = entry.item.value;
            entry.item = deserializer(entry.item, false);
            entry.item.value = Math.round(value + (value*ion.random(markup)));
        });
    }

    var policy = createPolicy(config);

    return new Store({
        name: storeName, policy: policy, owner: owner, onhand: onhand,
        inventory: inventory, totalValue: totalValue
    });
};
