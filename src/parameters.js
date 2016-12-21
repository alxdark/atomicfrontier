var ion = require('./ion');

// This massively ugly thing does a lot of work so elsewhere, we don't have to see so much parameter
// intialization junk.
function parameters(params, defaultField, defaults) {
    // params("foo", "bar), initializes {foo: "bar"};
    if (!ion.isObject(params) && ion.isString(defaultField)) {
        var obj = {};
        obj[defaultField] = params;
        params = obj;
    }
    // params({}, {defaultValue: true, "B": "C"})
    if (ion.isObject(defaultField)) {
        defaults = defaultField;
    }
    var object = ion.extend({}, params);

    ion.keys(defaults).forEach(function(field) {
        var defaultValue = defaults[field];
        // If the value is undefined in parameters, but we have a default, copy it over (processing through random)
        if (ion.isUndefined(object[field])) {
            object[field] = ion.random(defaultValue);
        } 
        // validate a value against an array of allowed values declared in the defaults... ?
        else if (ion.isArray(defaultValue)) {
            if (!ion.contains(defaultValue, object[field])) {
                throw new Error(object[field] + " is an invalid " + field + ", use " + defaultValue.join(', '));
            }
        }
    });
    return object;
}

module.exports = parameters;