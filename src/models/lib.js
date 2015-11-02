var ion = require('../ion');

var lookup = {
    Bag: require('./bag'),
    Character: require('./character'),
    Family: require('./family'),
    Gang: require('./gang'),
    Item: require('./item'),
    Model: require('./model'),
    Name: require('./name'),
    Profession: require('./profession'),
    Relationship: require('./relationship'),
    Store: require('./store'),
    Weather: require('./weather')
};

/**
 * Given a JSON object, convert it back to a graph of model objects in this library. You can
 * also pass a JSON string to this method. This method is used to recreate JSON that has
 * been persisted, among other things.
 *
 * @static
 * @method deserializer
 * @for atomic.models
 * @param json {Object} a json object to convert to a models object. Can also be a string object.
 * @return {atomic.models.Model} model object or subclass
 */
function deserializer(object, nested) {
    // Convert from string to JSON if necessary
    if (nested !== true && ion.isString(object)) {
        object = JSON.parse(object);
    }
    if (ion.isObject(object) || ion.isArray(object)) {
        if (object.type) {
            object = new lookup[object.type](object);
        }
        for (var prop in object) {
            object[prop] = deserializer(object[prop], true);
        }
    }
    return object;
}
/**
 * Create a deep copy of this models item, maintaining the correct subclass,
 * nested objects, etc.
 *
 * @static
 * @method clone
 * @for atomic.models
 * @return {atomic.models.Model} clone
 */
function clone(object, freeze) {
    freeze = ion.isBoolean(freeze) ? freeze : Object.isFrozen(object);
    var model = deserializer(JSON.stringify(object));
    if (freeze) {
        return Object.freeze(model);
    }
    return model;
}

module.exports.clone = clone;
module.exports.deserializer = deserializer;
