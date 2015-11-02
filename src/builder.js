var ion = require('./ion');

// throws lots of errors in strict mode jshint, doesn't like this style of (legal) code

var map = Array.prototype.map;

/**
 * Passes each element of the array to the function, which is passed three parameters:
 * the builder, the item in the list, and the item's index in the list.
 * @example
 *     builder(list, function(b, item, index) {
 *         b("#"+index + " " +item.name);
 *     });
 *
 * @method builder
 * @param array {Array}
 * @param func {Function}
 * @chainable
 */
function each(array, func) {
    var oldContext = this.context;
    (array || []).forEach(function(item, index) {
        this.context = item;
        func.call(this.context, this, item, index);
    }, this);
    this.context = oldContext;
}
/**
 * Appends the string. If there are additional values appended afterwards, they
 * are interpolated as if the string was a format string (see `ion.format()`).
 *
 * @method builder
 * @param string {String}
 * @chainable
 */
function format() {
    if (arguments.length === 1) {
        this.str += arguments[0];
    } else if (arguments[1]) {
        this.str += ion.format.apply(this.context, arguments);
    }
}
/**
 * If the expression is true, execute the true function, otherwise execute the
 * false function, in either case, the function will be passed one parameter:
 * the builder.
 * @example
 *     builder(!!this.parent, function(b) {
 *         b("Only added if this.parent was present");
 *     }, function(b) {
 *         b("Only added if this.parent was NOT present");
 *     });
 *
 * @method builder
 * @param expr {Boolean}
 * @param trueFn {Function}
 * @param falseFn {Function}
 * @chainable
 */
function either(expr, trueFn, falseFn) {
    if (expr) {
        trueFn.call(this.context, this);
    } else {
        falseFn.call(this.context, this);
    }
}
/**
 * If the expression is true, execute the function. The function is passed one
 * parameter: the builder.
 * @example
 *     builder(!!this.parent, function(b) {
 *         b("Only added if this.parent was present");
 *     });
 *
 * @method builder
 * @param expr {Boolean}
 * @param func {Function}
 * @chainable
 */
function when(expr, func) {
    if (expr) {
        func.call(this.context, this);
    }
}
/**
 * Adds an HTML tag, and then calls the supplied function to create
 * content nested in the tag. The function is passed one argument:
 * the builder.
 * @example
 *     builder("p", {class: "person"}, function(b) {
 *         b(character.toString();
 *     });
 *
 * @method builder
 * @param name {String} the tag name
 * @param attrs {Object} name/value attribute pairs
 * @param func {Function} a callback function
 * @chainable
 */
function tag(name, attrs, func) {
    this.str += "<"+name;
    for (var attr in attrs) {
        this.str += ' '+attr+'="'+attrs[attr]+'"';
    }
    this.str += ">";
    func.call(this.context, this);
    this.str += "</"+name+">";
}
/**
 * Adds an HTML tag, and then calls the supplied function to create
 * content nested in the tag. The function is passed one argument:
 * the builder.
 * @example
 *     builder("p", {class: "person"}, character.toString());
 *
 * @method builder
 * @param name {String} the tag name
 * @param attrs {Object} name/value attribute pairs
 * @param string {String} a string to add as the content of the tag
 * @chainable
 */
function simpletag(name, attrs, string) {
    this.str += "<"+name;
    for (var attr in attrs) {
        this.str += ' '+attr+'="'+attrs[attr]+'"';
    }
    this.str += ">"+string+"</"+name+">";
}
/**
 * If the expression evaluates as true, appends the string.
 * @example
 *     builder(!!this.parent, "Only added if this.parent was present");
 *
 * @method builder
 * @param expr {Boolean}
 * @param string {String}
 * @chainable
 */
function append(expr, string) {
    if (expr) {
        this.str += string;
    }
}
/**
 * Add the string, pluralized.
 * @example
 *     builder("plum", 3).toString()
 *     => "3 plums"
 *
 * @method builder
 * @param string {String}
 * @param count {Number}
 * @chainable
 */
function plural(string, count) {
    this.str += ion.pluralize(string, count);
}
function toString() {
    return this.str;
}

/**
 * This constructor returns a function that can be called with many different parameter
 * signatures to create toString() and toHTML() output (these different parameters are
 * documented as different "methods").
 * @example
 *     var b = ion.Builder();
 *     b("p", {class: 'foo'}, "Some text in the paragraph tag.");
 *     b.toString();
 *     => "<p class='foo'>Some text in the paragraph tag.</p>");
 *
 * @class atomic.Builder
 */
module.exports = function(ctx) {
    if (!ctx) {
        throw new Error("No context obj to Builder");
    }
    var bldr = function() {
        var arglist = map.call(arguments, function(arg) {
            if (arg instanceof Array) return 'a';
            return (typeof arg).substring(0,1);
        }).join('');
        switch(arglist) {
            case 'af': each.apply(bldr, arguments); break;
            case 'bf': when.apply(bldr, arguments); break;
            case 'bff': either.apply(bldr, arguments); break;
            case 'bs': append.apply(bldr, arguments); break;
            case 'sof': tag.apply(bldr, arguments); break;
            case 'sos': simpletag.apply(bldr, arguments); break;
            case 'sn': plural.apply(bldr, arguments); break;
            default: format.apply(bldr, arguments);
        }
        return bldr;
    };
    bldr.context = ctx;
    bldr.str = "";
    bldr.toString = toString;
    return bldr;
};
