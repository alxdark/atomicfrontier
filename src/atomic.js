'use strict';

var lib = {};

var ion = require('./ion');
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
    Character: require('./models/character'),
    Family: require('./models/family'),
    Gang: require('./models/gang'),
    IonSet: require('./models/ion_set'),
    Item: require('./models/item'),
    Model: require('./models/model'),
    Name: require('./models/name'),
    Profession: require('./models/profession'),
    Relationship: require('./models/relationship'),
    Store: require('./models/store'),
    Weather: require('./models/weather')
};
lib.dice = require('./dice/dice');

lib.createAppearance = require('./generators/appearance');
lib.createCharacterName = require('./generators/character_name');
lib.createCollectible = require('./generators/memorabilia');
lib.createCorporateName = require('./generators/corporate_name');
lib.createStore = require('./generators/store');
lib.createWeather = require('./generators/weather');
lib.createTimeSeries = require('./generators/historical_time_series');

ion.extend(lib, require('./generators/bag'));
ion.extend(lib, require('./generators/character'));
ion.extend(lib, require('./generators/data'));
ion.extend(lib, require('./generators/gang'));
ion.extend(lib, require('./generators/memorabilia'));
ion.extend(lib, require('./generators/place_name'));
ion.extend(lib, require('./generators/reading'));
ion.extend(lib, require('./generators/relationships'));
ion.extend(lib.models, require('./models/lib'));

// exports in Browserify as window.atomic
module.exports = lib;