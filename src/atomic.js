'use strict';

var ion = require('./ion');

var lib = {};

ion.extend(lib,  ion);

ion.extend(lib, {
    version: '1.0.0',
    Builder: require('./builder')
});
lib.db = {
    Database: require('./db/database'),
    EncounterDatabase: require('./db/encounter_database'),
    ItemDatabase: require('./db/item_database'),
    ProfessionDatabase: require('./db/profession_database'),
    StoreDatabse: require('./db/store_database')
};
lib.tables = {
    Table: require('./tables/table'),
    HashTable: require('./tables/hash_table'),
    RarityTable: require('./tables/rarity_table')
};
lib.models = {
    Bag: require('./models/bag'),
    Family: require('./models/family'),
    Gang: require('./models/gang'),
    Item: require('./models/item'),
    Model: require('./models/model'),
    Name: require('./models/name')
};
lib.dice = require('./dice/dice');

// Etc... for each generator
lib.createCharacter = require('./generators/character').createCharacter;
lib.createRace = require('./generators/character').createRace;
lib.getProfessions = require('./generators/character').getProfessions;

/**
 * Create a deep copy of this models item, maintaining the correct subclass,
 * nested objects, etc.
 *
 * @method clone
 * @return {ion.models.Model} clone
 */
lib.models.clone = function(object, freeze) {
    freeze = lib.isBoolean(freeze) ? freeze : Object.isFrozen(object);
    var model = create(JSON.stringify(object));
    if (freeze) {
        return Object.freeze(model);
    }
    return model;
}
/**
 * Given a JSON object, convert it back to a graph of Ionosphere models objects. This method
 * does assume that the library is available at the known location of `window.ion`. You can
 * also pass a JSON string to this method. This method is used to recreate JSON that has
 * been persisted, among other things.
 *
 * @param json {Object} a json object to convert to a models object. Can also be a string object.
 */
function create(object, nested) {
    // Convert from string to JSON if necessary
    if (nested !== true && lib.isString(object)) {
        object = JSON.parse(object);
    }
    if (lib.isObject(object) || lib.isArray(object)) {
        if (object.type) {
            object = new lib.models[object.type](object);
        }
        for (var prop in object) {
            object[prop] = create(object[prop], true);
        }
    }
    return object;
}
lib.models.deserializer = create;

module.exports = lib;

