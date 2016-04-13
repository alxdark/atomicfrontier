"use strict";

var DIE_PARSER  = /\d+d\d+/g,
    FORMAT_PARSER = /\{[^\|}]+\}/g,
    RANDOM_STRING = /\{[^\{\}]*\|[^\{\}]*\}/g,
    STARTS_WITH_VOWEL = /^[aeiouAEIOU]/,
    STARTS_WITH_THE = /^[tT]he\s/,
    SMALL_WORDS = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i,
    PARENS = /(\{[^\}]*\})/g,
    CONS_Y = /[BCDFGHIJKLMNPQRSTVWXZbcdfghijklmnpqrstvwxz]y$/;

function basicPluralize(string) {
    if (/[x|s]$/.test(string)) {
        return (string + "es");
    } else if (CONS_Y.test(string)) {
        return string.substring(0,string.length-1) + "ies";
    }
    return (string + "s");
}
function copy(target, source) {
    for (var prop in source) {
        target[prop] = source[prop];
    }
    return target;
}

// clever, then you do slice(arguments), requires the bind function though
// (which I already assume is present).
// var slice = Function.prototype.call.bind(Array.prototype.slice);

var slice = Array.prototype.slice,
    indexOf = Array.prototype.indexOf,
    filter = Array.prototype.filter,
    //map  = Array.prototype.map,
    forEach = Array.prototype.forEach;

var ion = {
    /* ======================================= */
    /* UTIL METHODS */
    /* ======================================= */
    isUndefined: function(v) {
        return (typeof v === "undefined");
    },

    extend: copy,

    identity: function(o) {
        return o;
    },
    transform: function(f) {
        return f();
    },
    contains: function(array, obj) {
        return (array) ? indexOf.call(array, obj) > -1 : false;
    },
    find: function(array, func, context) {
        var self = context || this;
        for (var i=0; i < array.length; i++) {
            if (func.call(context || self, array[i])) {
                return array[i];
            }
        }
        return null;
    },
    keys: function(obj) {
        return (ion.isObject(obj)) ? Object.keys(obj) : [];
    },
    values: function(obj) {
        return ion.keys(obj).map(function(key) {
            return obj[key];
        });
    },
    /**
     * Execute a function N times. Each iteration of the function, it receives the
     * arguments `i` for the current iteration (starting at zero), and `N` for the
     * total number of times the function will be excuted.
     * @example
     *      ion.times(4, function(i,n) {
     *          console.log(i,"of",n,"iterations");
     *      });
     *      => "0 of 4 iterations"
     *      => "1 of 4 iterations"
     *      => "2 of 4 iterations"
     *      => "3 of 4 iterations"
     *
     * @param count {Number} the number of times to execute the function.
     * @param func {Function} the function to execute. Receives two parameters, `i` (zero-based index of the
     *    iteration) and `N` (total number of iterations to be performed).
     * @param [context] {Object} object bound to the function when executed
     */
    times: function(count, func, context) {
        var self = context || this;
        for (var i=0; i < count; i++) {
            func.call(context || self, i, count);
        }
    },
    last: function(array) {
        return (array && array.length) ? array[array.length-1] : null;
    },
    unique: function(array) {
        if (arguments.length === 0 || array.length === 0) { return []; }
        var seen = [];
        forEach.call(array, function(element) {
            if (seen.indexOf(element) === -1) {
                seen.push(element);
            }
        });
        return seen;
    },
    intersection: function(a, b) {
        if (arguments.length !== 2) { return []; }
        // allows arguments objects to be passed to this method
        a = slice.call(a,0);
        b = slice.call(b,0);
        // This is critical to db.find(); optimizing
        /*
         return ion.unique(a.filter(function(element) {
         return b.indexOf(element) > -1;
         }));
         */
        var results = [];
        for (var i=0; i < a.length; i++) {
            if (b.indexOf(a[i]) > -1 && results.indexOf(a[i]) === -1) {
                results[results.length] = a[i];
            }
        }
        return results;
    },
    union: function(a, b) {
        if (arguments.length !== 2) { return []; }
        // allows arguments objects to be passed to this method
        a = slice.call(a,0);
        b = slice.call(b,0);
        return ion.unique(a.concat(b));
    },
    without: function(array) {
        var args = slice.call(arguments, 1);
        return filter.call((array || []), function(value) {
            return (args.indexOf(value) === -1);
        });
    },
    /**
     * Define a class (a constructor function with many of the amenities of a class, including a 
     * constructor function that is not called to generate a prototype, and property and static 
     * definitions, in one syntactic bundle).
     * 
     * @static
     * @method define
     * @for atomic
     * 
     * @param [parent] a parent class to serve as the prototype for this class.
     * @param methods an object containing methods for this class. There are two special 
     *      properties on this object that will be treated differently. `properties` defines
     *      one or more properties on the object, while `static` defines one ore more functions 
     *      to assign to the constructor, rather than the objects returned by the constructor.
     */
    define: function(parent, methods) {
        if (arguments.length === 1) { // parent is optional
            methods = parent;
            parent = null;
        }
        var F = (methods.init || function() {});
        if (parent) {
            var C = function() {}; // don't call parent constructor
            C.prototype = parent.prototype;
            F.prototype = new C();
        }
        if (methods.properties) {
            for (var methName in methods.properties) {
                Object.defineProperty(F.prototype, methName, {
                    enumerable: false,
                    configurable: false,
                    get: methods.properties[methName]
                });
            }
            delete methods.properties;
        }
        if (methods.static) {
            for (var funcName in methods.static) {
                F[funcName] = methods.static[funcName];
            }
            delete methods.static;
        }
        delete methods.init;
        for (var prop in methods) {
            F.prototype[prop] = methods[prop];
        }
        F.prototype.constructor = F;
        return F;
    },
    /**
     * Bound the value n by the minimum and maximum values:
     * @example
     *     ion.bounded(-2, 0)
     *     => 0
     *     ion.bounded(32, 1, 100)
     *     => 32
     *     ion.bounded(120, 1, 100)
     *     => 100
     *
     * @static
     * @method bounded
     * @for atomic
     *
     * @param n {Number}
     * @param min {Number}
     * @param [max] {Number}
     * @return {Number} The number n or the min or max value if the n value falls outside of that range.
     */
    bounded: function(n, min, max) {
        max = max || Number.MAX_VALUE; // have to have a min
        return (n < min) ? min : (n > max) ? max : n;
    },
    /**
     * Sum the values of the array (must be numbers).
     *
     * @static
     * @method sum
     * @for atomic
     *
     * @param array {Array} array of number values
     * @return {Number} the sum of the values in the array
     */
    sum: function(array) {
        return (array || []).reduce(function(memo, num) {
            if (typeof num === "number") {memo += num;}
            return memo;
        }, 0);
    },

    /* ======================================= */
    /* STRING METHODS */
    /* ======================================= */

    /**
     * Put an indefinite article in front of the word based on whether or not it
     * starts with a vowel.
     * @example
     *     ion.article("walkie talkie")
     *     => "a walkie talkie"
     *     ion.article("album")
     *     => "an album"
     *
     * @static
     * @method article
     * @for atomic
     *
     * @param string {String} String to prefix with an indefinite article
     * @return {String} The string with "a" or "an" in front of it.
     */
    article: function(string) {
        return (STARTS_WITH_THE.test(string)) ? string : STARTS_WITH_VOWEL.test(string) ? ("an " + string) : ("a " + string);
    },
    /**
     * Format a string with parameters. There are many ways to supply values to this method:
     * @example
     *     ion.format("This {0} a {1}.", ["is", "test"]);
     *     => "This is a test."
     *     ion.format("This {0} a {1}.", "is", "test");
     *     => "This is a test."
     *     ion.format("This {verb} a {noun}.", {"verb": "is", "noun": "test"})
     *     => "This is a test."
     *
     * @static
     * @method format
     * @for atomic
     *
     * @param template {String} template string
     * @param values+ {Object} An array, a set of values, or an object with key/value pairs that
     * will be substituted into the template.
     * @return {String} the formatted string
     */
    format: function(string, obj) {
        if (typeof obj == "undefined") {
            return string;
        }
        if (arguments.length > 2 || typeof obj !== "object") {
            obj = slice.call(arguments);
            string = obj.shift();
        }
        // Selects {a} sequences with no pipe (these are multiple selection strings, not substitutions)
        return string.replace(FORMAT_PARSER, function(token){
            var prop = token.substring(1, token.length-1);
            return (typeof obj[prop] == "function") ? obj[prop]() : obj[prop];
        });
    },
    /**
     * Pluralizes a string (usually a noun), if the count is greater than one. If
     * it's a single item, an indefinite article will be added (see example below
     * for cases where it should not be added, "uncountables"). The string should
     * note the method of pluralizing the string in curly braces if it is not a
     * simple noun that is pluralized using "s", "es" or "aries". For example:
     * @example
     *     ion.pluralize("shoe", 3)
     *     => "3 shoes"
     *     ion.pluralize("status", 2)
     *     => "2 statuses"
     *     ion.pluralize("bag{s} of flour", 1)
     *     => "a bag of flour"
     *     ion.pluralize("bag{s} of flour", 2)
     *     => "2 bags of flour"
     *     // Note suppression of the indefinite article!
     *     ion.pluralize("{|suits of }makeshift metal armor")
     *     => "makeshift metal armor"
     *     ion.pluralize("{|suits of }makeshift metal armor", 4)
     *     => "4 suits of makeshift metal armor"
     *
     * @static
     * @method pluralize
     * @for atomic
     *
     * @param name {String} A string name following the rules described above
     * @param [count=1] {Number} The number of these items
     * @return {String} the correct singular or plural value
     */
    /**
     * Items can also be used with this method.
     * @example
     *     var item = new Item("quarry");
     *     ion.pluralize(item, 3)
     *     => "3 quarries"
     *
     * @static
     * @method pluralize
     * @for atomic
     *
     * @param item {Item} An item with a string name following the rules described above
     * @param [count=1] {Number} The number of these items
     * @return {String} the correct singular or plural value
     */
    pluralize: function(string, count) {
        string = (string.name) ? string.name : string;
        count = (count || 1);
        var obj = {singular: "", plural: ""},
            addArticle = string.substring(0,2) !== "{|";

        if (count > 1) {
            obj.plural += (count + " ");
        }
        if (string.indexOf("{") === -1) {
            obj.singular = string;
            obj.plural += basicPluralize(string);
        } else {
            string.split(PARENS).forEach(function(element, index) {
                if (element.indexOf("{") === -1) {
                    obj.singular += element;
                    obj.plural += element;
                } else if (element.indexOf("|") === -1){
                    obj.plural += element.substring(1, element.length-1);
                } else {
                    var parts = element.substring(1, element.length-1).split("|");
                    obj.singular += parts[0];
                    obj.plural += parts[1];
                }
            });
        }
        if (addArticle) {
            obj.singular = ion.article(obj.singular);
        }
        return (count === 1) ? obj.singular : obj.plural;
    },
    /**
     * Convert a string to sentence case (only the first letter capitalized).
     * @example
     *     ion.sentenceCase("antwerp benedict");
     *     => "Antwerp benedict"
     *     ion.sentenceCase("antwerp-Benedict");
     *     => "Antwerp-benedict"
     *     ion.sentenceCase("bead to a small mouth");
     *     => "Bead to a small mouth"
     *
     * @static
     * @method sentenceCase
     * @for atomic
     *
     * @param string {String}
     * @return {String} in sentence case
     */
    sentenceCase: function(string) {
        if (ion.isString(string)) {
            return string.substring(0,1).toUpperCase() + string.substring(1);
        }
        return string;
    },
    /**
     * Convert string to title case. There's a long list of rules for this
     * kind of capitalization, see: [this link][0].
     *
     * *To Title Case 2.1 - http://individed.com/code/to-title-case/<br>
     * Copyright 2008-2013 David Gouch. Licensed under the MIT License.*
     *
     * [0]: http://daringfireball.net/2008/05/title_case
     * @example
     *     ion.titleCase("antwerp benedict");
     *     => "Antwerp Benedict"
     *     ion.titleCase("antwerp-Benedict");
     *     => "Antwerp-Benedict"
     *     ion.titleCase("bead to a small mouth");
     *     => "Bead to a Small Mouth"
     *
     * @static
     * @method titleCase
     * @for atomic
     *
     * @param string {String} string to title case
     * @return {String} in title case
     */
    titleCase: function(string) {
        return string.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(SMALL_WORDS) > -1 && title.charAt(index - 2) !== ":" &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }
            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }
            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    },
    /**
     * Convert a string to a valid tag by removing spaces and converting
     * to lower-case letters.
     *
     * @static
     * @method toTag
     * @for atomic
     */
    toTag: function(string) {
        if (!ion.isString(string)) { return string; }
        return string.toLowerCase().replace(/\s/g,'');
    },
    /**
     * Format the elements of an array into a list phrase.
     * @example
     *     ion.toList(['Apples', 'Bananas', 'Oranges'], function(value) {
     *         return "*"+value;
     *     });
     *     => "*Apples, *Bananas, and *Oranges"
     *
     * @static
     * @method toList
     * @for atomic
     *
     * @param array {Array} The array to format
     * @param func {Function} An optional function to format the elements of the array in the returned string.
     * @param [join=and] {String} the word to join the last word in the list.
     * @return {String} the array formatted as a list.
     */
    toList: function(array, func, join) {
        join = join || "and";
        func = func || function(s) { return s.toString(); };
        var len = array.length;
        if (len === 0) {
            return "";
        } else if (len === 1) {
            return func(array[0]);
        } else if (len === 2) {
            return func(array[0]) + " " + join + " " + func(array[1]);
        } else {
            var arr = array.map(func);
            arr[arr.length-1] = join + " " + arr[arr.length-1];
            return arr.join(", ");
        }
    },

    /* ======================================= */
    /* RANDOM METHODS */
    /* ======================================= */

    /**
     * Return a random value from a "strategy" value, recursively. An element will be selected
     * from an array, a function will be executed for its return value, and a string with
     * variants will be returned with a variant selected. The value is then checked again to
     * see if it can still be randomized further, and this process continues until a primitive
     * value is returned (a number, object, string, or boolean).
     * @example
     *     atomic.random("A")
     *     => "A"
     *
     *     atomic.random(['A','B','C']);
     *     => 'A'
     *
     *     atomic.random("{Big|Bad|Black} Dog");
     *     => 'Bad Dog'
     *
     *     atomic.random(function() {
     *         return ["A","B","C"];
     *     });
     *     => "B"
     *
     * @static
     * @method random
     * @for atomic
     *
     * @param value {String|Array|Function} A string with optional variants, or an array from
     *      which to select an element, or a function that returns a value.
     * @return {Object} a single randomized instance, based on the value passed in
     */
    random: function(value) {
        if (ion.isArray(value)) {
            value = (value.length) ? value[ ~~(Math.random()*value.length) ] : null;
            return ion.random(value);
        } else if (ion.isFunction(value)) {
            return ion.random(value());
        } else if (ion.isString(value)) {
            return value.replace(RANDOM_STRING, function(token) {
                return ion.random( token.substring(1, token.length-1).split("|") );
            });
        }
        return value;
    },
    /**
     * Combines randomization with formatting. First, randomizes the first argument using the `ion.random()`
     * function. Then formats the resulting string using the rest of the arguments passed in to the method,
     * as described by the `ion.format()` function.
     * @example
     *     atomic.resolve(["Mr. {name}", "Mrs. {name}"], {name: "Smith"});
     *     => "Mrs. Smith"
     *
     * @static
     * @method resolve
     * @for atomic
     *
     * @param value {String|Array|Function} A string with optional variants, or an array from
     *      which to select an element, or a function that returns a value.
     * @param [...args] zero or more objects to use in formatting the final string
     * @return {String} the randomly selected, formatted string
     */
    resolve: function() {
        if (arguments.length === 1) {
            return ion.random(arguments[0]);
        }
        var array = slice.call(arguments,0);
        array[0] = ion.random(array[0]);
        return ion.format.apply(ion.format, array);
    },
    /**
     * Returns a random number based on a die roll string. Math operations are supported:
     * @example
     *     atomic.roll("3d6+2")
     *     => 9
     *     atomic.roll("(2d4*10)+500")
     *     => 540
     *     atomic.roll(8)
     *     => 4
     *
     * @static
     * @method roll
     * @for atomic
     *
     * @param value {String|Number} a notation for a dice roll (including mathematical expressions, if needed),
     *      or the maximum value to return.
     * @return {Number} a die roll value
     */
    roll: function(value) {
        if (typeof value === "number") {
            return (value > 0) ? ~~( Math.random()*value ) + 1 : 0;
        } else if (typeof value === "string") {
            // Finds and extracts dice notation, rolls the die, and then puts the
            // result into the full expression. Then evals that to do the math.
            value = value.replace(DIE_PARSER, function(value) {
                var split = value.split("d"),
                    rolls = parseInt(split[0],10),
                    face = parseInt(split[1],10),
                    result = 0;
                for (var i=0; i < rolls; i++) {
                    result += ~~( Math.random()*face ) + 1;
                }
                return result;
            });
            try { return eval.call(null, value); }
            catch(e) { return 0; }
        }
        throw new Error("Invalid value: " + value);
    },
    /**
     * Randomly shuffle the position of the elements in an array (uses Fisher-Yates shuffle). `ion.random()`
     * is usually more efficient, but if you need to iterate through a set of values in a random order,
     * without traversing the same element more than once, `ion.shuffle()` is a better way to randomize
     * your data.
     * @example
     *     var array = ['A','B','C']
     *     atomic.shuffle(array);
     *     =>
     *     array;
     *     => ['C','A','B']
     *
     * @static
     * @method shuffle
     * @for atomic
     *
     * @param array {Array} The array to shuffle (in place)
     */
    shuffle: function(array) {
        var j, temp;
        for (var i = array.length-1; i > 0; i--) {
            j = ~~( Math.random() * ( i + 1 ) );
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    },
    /**
     * Test against a percentage that something will occur.
     * @example
     *     if (atomic.test(80)) {
     *         // Happens 80% of the time.
     *     }
     *
     * @static
     * @method test
     * @for atomic
     *
     * @param percentage {Number} The percentage chance that the function returns true
     * @return {Boolean} true if test passes, false otherwise
     */
    test: function(percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error("Percentage must be between 0 and 100");
        }
        return ion.roll(100) <= percentage;
    },
    /**
     * Generate a whole random number, on a normal (Gaussian, "bell curve")
     * distribution. For example, you might wish to create a youth gang
     * where the members are mostly 18, but with outliers that are much
     * younger or older. This random number generator will give more useful
     * results than `ion.random()` if you do not want the numbers to be evenly
     * distributed.
     *
     * @static
     * @method gaussian
     * @for atomic
     *
     * @param stdev {Number} The amount of variance from the mean, where about
     *   68% of the numbers will be a number +/- this amount.
     * @param [mean=0] {Number} The mean around which random numbers will be
     *   generated.
     * @return a random number
     */
    gaussian: function(stdev, mean) {
        var x = 0, y = 0, rds, c, m = mean || 0;
        // Uses Box-Muller transform: http://www.protonfish.com/jslib/boxmuller.shtml
        // Two values get generated. You could cache the y value, but the time savings
        // is trivial and this causes issues when mocking randomness for the tests. So don't.
        do {
            x = Math.random()*2-1;
            y = Math.random()*2-1;
            rds = (x*x) + (y*y);
        } while (rds === 0 || rds > 1);
        c = Math.sqrt(-2*Math.log(rds)/rds);
        return Math.round((x*c)*stdev) + m;
    },
    /**
     * As the gaussian random number method, but it will not return negative
     * numbers (without disturbing the rest of the distribution).
     *
     * @static
     * @method nonNegativeGaussian
     * @for atomic
     *
     * @param stdev {Number} The amount of variance from the mean, where about
     *  68% of the numbers will be a number +/- this amount.
     * @param [mean=0] {Number} The mean around which random numbers will be
     *  generated.
     * @return a random, non-negative number (can include zero)
     */
    nonNegativeGaussian: function(stdev, mean) {
        mean = (mean < 0) ? 0 : mean;
        var value;
        do {
            value = ion.gaussian(stdev, mean);
        } while (value < 0);
        return value;
    },
    /**
     * Create an array with the indicated length, each member of which will be undefined. It turns
     * out that `new Array(n)` is not sufficient for this.
     *
     * See http://www.2ality.com/2013/11/initializing-arrays.html
     *
     * @static
     * @method newArray
     * @for atomic
     *
     * @param length {Number} the length of the array.
     * @returns {Array}
     */
    newArray: function(length) {
        return Array.apply(null, Array(length));
    }
};

// The utility methods are really just here to avoid having a dependency on
// any common library like underscore.js or sugar.js.
// Array.isArray. Would take more space to use that than this.
['Array','Function','String','Date','RegExp','Boolean','Number','Object'].forEach(function(type) {
    ion['is'+type] = function(obj) {
        return Object.prototype.toString.call(obj) === "[object "+type+"]";
    };
});

module.exports = ion;