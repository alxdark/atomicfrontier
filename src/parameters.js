var ion = require('./ion');

// This massively ugly thing does a lot of work so elsewhere, we don't have to see so much parameter
// intialization junk.
function parameters(params, defaultField, defaults) {
    if (!ion.isObject(params) && ion.isString(defaultField)) {
        var object = {};
        object[defaultField] = params;
        params = object;
    }
    if (ion.isObject(defaultField)) {
        defaults = defaultField;
    }
    var object = ion.extend({}, params);

    ion.keys(defaults).forEach(function(field) {
        var defaultValue = defaults[field];
        if (ion.isUndefined(object[field])) {
            object[field] = ion.random(defaultValue);
        } else if (ion.isArray(defaultValue)) {
            if (!ion.contains(defaultValue, object[field])) {
                throw new Error(object[field] + " is an invalid " + field + ", use " + defaultValue.join(', '));
            }
        }
    });
    return object;
}

module.exports = parameters;