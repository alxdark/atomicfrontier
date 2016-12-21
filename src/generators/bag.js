var ion = require('../ion');
var Bag = require('../models/bag');
var IonSet = require('../models/ion_set');
var db = require('./data').itemDatabase;
var parameters = require('../parameters');

var containers = {
    "Safe": {
        desc: ["Safecracking+1", "Safecracking", "Safecracking-1", "Safecracking-2", "Safecracking-3", "Safecracking-4"],
        query: {
            totalValue: "3d8+15",
            tags: "cash | firearm -scifi | secured | luxury -food",
            maxEnc: 10,
            fillBag: false
        }
    },
    "Lockbox": {
        desc: ["Unlocked", "Lockpicking", "Lockpicking-1", "Lockpicking-2"],
        query: {
            totalValue: "2d6+2",
            tags: "cash | secured | firearm -scifi -br | asetofkeys | luxury -food",
            maxEnc: 3,
            fillBag: true
        }
    },
    "Trunk": {
        desc: ["Unlocked", "Lockpicking+2, can be broken open", "Lockpicking+3, can be broken open", "Lockpicking+4, can be broken open"],
        query: {
            totalValue: "2d6",
            tags: "clothing | armor | firearm -scifi -br | unique",
            maxEnc: 10,
            fillBag: false
        }
    },
    "Cash Register": {
        desc: ["easily opened"],
        query: {
            totalValue: "6d50/100",
            tags: "cash",
            fillBag: true
        }
    },
    "Cash On Hand": {
        desc: ["under the counter", "in a lockbox"],
        query: {
            totalValue: "20+4d6",
            tags: "currency -cash | currency",
            fillBag: true,
            maxValue: 7
        }
    },
    "Clothes Closet": {
        desc: ["no lock"],
        query: {
            totalValue: "1d8+5",
            tags: "clothing -research -industrial -military",
            fillBag: false
        }
    }
};
// A container of containers.
// "vault"

var containerTypes = ion.keys(containers).sort();

// Uses the existing API to get the right frequency of objects, but can lead to many duplicates.
// of all the fill* methods, this is the only one that respects all the createBag() options,
// the rest are specific to creating a believable kit.

function fill(bag, opts) {
    var bagValue = opts.totalValue;
    while (bagValue > 0) {
        // Take the the max value or the bag value, unless they are less than the min value,
        // then take the min value. For that reason, the item's value has to be tested below
        // to verify it is less than the remaining bag value (if it's not, just quit and return
        // the bag).
        opts.maxValue = Math.max(Math.min(opts.maxValue, bagValue), opts.minValue);

        // Because maxValue changes every query, we can't cache any of this.
        var item = db.find(opts);
        if (item === null || item.value > bagValue) {
            return bag;
        }
        bag.add(item);
        bagValue -= item.value;
    }
    return bag;
}
function getClusterSpread(value) {
    switch(value) {
        case "low":
            return ion.roll("2d3+5"); // 7-11
        case "medium":
            return ion.roll("2d3+2"); // 4-8
        case "high":
            return ion.roll("1d3+2"); // 3-5
    }
}
function getClusterCount(value) {
    switch(value) {
        case "low":
            return ion.roll("1d3*2"); // 2-6
        case "medium":
            return ion.roll("(1d3*2)+2"); // 3-8
        case "high":
            return ion.roll("(1d3*2)+4"); // 6-10
    }
}
function fillCurrency(bag, amount) {
    if (amount > 0) {
        var currencies = db.findAll({tags: 'currency', maxValue: amount});
        while(amount > 0) {
            var currency = currencies.get();
            if (currency === null) {
                return;
            }
            bag.add(currency);
            amount -= currency.value;
        }
    }
}
function kitWeapon(bag, kitTag) {
    var weaponType = (ion.test(60)) ? "firearm" : "melee";
    var weapon = db.find([weaponType, kitTag, "-br"]);
    if (weapon) {
        bag.add(weapon);
        if (weapon.is('firearm')) {
            var ammo = db.find(["ammo", weapon.typeOf('ammo'), "-bundled"]);
            if (ammo) {
                bag.add(ammo, ion.roll("4d4"));
            }
            if (ion.test(20)) {
                weapon = db.find(["melee", kitTag, "-scifi"]);
                if (weapon) {
                    bag.add(weapon);
                }
            }
        }
    }
}
function kitToCount(bag, count, tagsArray) {
    for (var i=0; i < count; i++) {
        var item = db.find(ion.random(tagsArray));
        if (item) {
            bag.add( item );
        }
    }
    return bag;
}
function kitUniques(bag, count, tags) {
    var set = new IonSet();
    for (var i=0; i < count; i++) {
        var item = db.find(tags);
        if (item) {
            set.add( item );
        }
    }
    return setToBag(bag, set);
}
function setToBag(bag, set) {
    //set.toArray().forEach(bag.add.bind(bag));
    set.toArray().forEach(function(item) {
        bag.add(item);
    });
    return bag;
}
function kitChanceOfFill(bag, gender, kitTag) {
    return function(chance, count, tags) {
        if (ion.test(chance)) {
            kitUniques(bag, count, ion.format(tags, gender, kitTag));
        }
    };
}
function createParams(params) {
    params = parameters(params, {
        totalValue: 20,
        fillBag: true,
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        minEnc: 0,
        maxEnc: Number.MAX_VALUE,
        cluster: 'medium',
        tags: ''
    });
    if (params.maxValue <= 0 || params.maxEnc <= 0 ||
        params.minValue > params.maxValue || params.minEnc > params.maxEnc) {
        throw new Error('Conditions cannot match any taggable: ' + JSON.stringify(params));
    }
    if (params.totalValue <= 0) {
        throw new Error("Bag value must be more than 0");
    }
    return params;
}

/**
 * Generate the possessions that would be on the person of an active NPC (e.g. out on patrol,
 * out for a night on the town, out on a raid or in the middle of criminal activity).
 *
 * @static
 * @method createKit
 * @for atomic
 *
 * @param params {Object}
 *     @param params.profession {String|atomic.models.Profession} profession name or instance
 *     @param [params.gender] {String} gender of character (male or female)
 *
 * @return {atomic.models.Bag} A bag of items on the person of that NPC
 */
module.exports.createKit = function(params) {
    var bag = new Bag();
    var kitTag = (ion.isString(params.profession)) ?
        "kit:"+params.profession : params.profession.typeOf('kit');

    kitWeapon(bag, kitTag);

    // Clothes: head, body, feet, and some accessories. By gender and profession.
    var kitFill = kitChanceOfFill(bag, params.gender, kitTag);
    kitFill(100, 1, 'body {0} {1}');
    kitFill(30, 1, 'head {0} {1}');
    kitFill(50, 1, 'coat {0} {1}');
    kitFill(30, 1, 'accessories {0} {1} -br');
    kitFill(100, 1, 'feet {0} {1}');
    kitFill(100, ion.roll("1d3-1"), '{1} -clothing -firearm -melee -br | kit:personal -br');

    // OK to have duplicates for this, even desirable (though rare).
    kitToCount(bag, ion.roll("2d3-2"), ['ration','ration','food -fresh']);

    if (bag.value() < 20) {
        fillCurrency(bag, ion.roll(20-bag.value()));
    }
    return bag;
};

/**
 * Generate a collection of items.
 * @example
 *     var bag = atomic.createBag({
 *         totalValue: 500,
 *         minValue: 10,
 *         tags: "firearm"
 *     });
 *     bag.toString()
 *     => "2 Browning Automatic Rifles, a M14 Rifle...and a pulse rifle."
 *
 * @static
 * @method createBag
 * @for atomic
 *
 * @param [params] {Object}
 *      @param [params.tags] {String} One or more query tags specifying the items in the bag
 *      @param [params.minValue=0] {Number}
 *      @param [params.maxValue=Number.MAX_VALUE] {Number}
 *      @param [params.minEnc=0] {Number}
 *      @param [params.maxEnc=Number.MAX_VALUE] {Number}
 *      @param [params.totalValue=20] {Number} The total value of the bag
 *      @param [params.fillBag=true] {Boolean} Should the bag's value be filled with
 *      currency if it hasn't been filled any other way? Usually currency has a value of
 *      1 or less, and can cover a gap otherwise caused by search criteria, but this
 *      isn't always desirable.
 */
function createBag(params) {
    params = createParams(params);
    var bag = fill(new Bag(), params);
    if (params.fillBag !== false) {
        fillCurrency(bag, params.totalValue - bag.value());
    }
    return bag;
}
module.exports.createBag = createBag;

/**
 * Like creating a bag but with many more repeated items (purposefully repeated, not
 * accidentally repeated), as if collected for a cache, shop, or storeroom. Honors the
 * `totalValue` limit (in fact will usually fall short of it), but `fillBag` will always be
 * treated as false.
 *
 * @static
 * @method createStockpile
 * @for atomic
 *
 * @param [params] {Object}
 *      @param [params.tags] {String} One or more query tags specifying the items in the bag
 *      @param [params.cluster="medium"] {String} "none", "low", "medium" or "high". Alters the
 *          amount of stockpiling from a little to a lot.
 *      @param [params.minValue] {Number}
 *      @param [params.maxValue] {Number}
 *      @param [params.minEnc] {Number}
 *      @param [params.maxEnc] {Number}
 *      @param [params.totalValue=20] {Number} The total value of the stockpile. In practice,
 *          the stockpile will be worth less than this. Must be at least 20.
 */
module.exports.createStockpile = function(params) {
    // A very different approach where a lot of the values wouldn't even matter.
    params = createParams(params);
    params.fillBag = false;

    if (params.cluster === "none") { // same as no stockpiling at all
        return createBag(params);
    }

    var bag = new Bag();
    var count = getClusterSpread(params.cluster);
    var tags = "-currency ".concat(params.tags);

    kitUniques(bag, count, params.tags);

    bag.entries.forEach(function(entry) {
        count = getClusterCount(params.cluster);
        bag.add(entry.item, count);
    });
    return bag;
};

/**
 * Create a bag with additional properties (representing a container of some kind, like a
 * lockbox or safe).
 *
 * @static
 * @method createContainer
 * @for atomic
 *
 * @param [type] {String} the container type (randomly selected if not provided)
 * @return {atomic.models.Bag} a bag representing a container
 */
/**
 * Create a bag with additional properties (representing a container of some kind, like a
 * lockbox or safe).
 *
 * @static
 * @method createContainer
 * @for atomic
 *
 * @param [params] {Object}
 *      @param [params.type] {String} the container type (values randomly selected if not provided).
 * @return {atomic.models.Bag} a bag representing a container
 */
module.exports.createContainer = function(type) {
    var params = parameters(type, "type", {
        type: containerTypes
    });
    var container = containers[type];
    var query = ion.extend({}, container.query);
    query.totalValue = ion.roll(query.totalValue);

    var bag = createBag(params);
    if (container.desc) {
        bag.descriptor = ion.format("{0} ({1})", ion.titleCase(type), ion.random(container.desc));
    }
    return bag;
};

/**
 * Get container types. One of these values is a valid type to pass to the
 * `atomic.createContainer(type)` method.
 *
 * @static
 * @method getContainerTypes
 * @for atomic
 *
 * @return {Array} an array of container types
 */
module.exports.getContainerTypes = function() {
    return containerTypes;
};
