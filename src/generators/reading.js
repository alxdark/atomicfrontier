var ion = require('../ion');
var Item = require('../models/item');
var itemDb = require('./data').itemDatabase;

var adj = ["all", "amazing", "astonishing", "atomic", "baffling", "bolshevik", "boy's", "complete", "dark", "dynamic",
    "exciting", "favorite", "gentleman's", "girl's", "glamorous", "haunted", "incredible", "lady's", "northwest",
    "popular", "railroad man's", "ranch", "saucy", "spicy", "startling", "strange", "thrilling", "weird", "women's",
    "wonderful"];
var genres = ["adventure", "air", "combat", "cowboy", "detective", "fantasy", "far west", "FBI", "flying", "frontier",
    "wild frontier", "ghost", "high seas", "horror", "indian", "jungle", "library science", "love", "new love",
    "northwest", "outdoor", "pirate", "prison", "ranch", "romance{|s}", "sci-fi", "science", "south seas",
    "supernatural", "sweetheart", "war", "western"];
var base = ["almanac", "weekly", "magazine", "quarterly", "stories", "tales", "thrills"];
var cannedTitles = ["all-story", "argosy", "black mask", "cavalier", "keepsake", "ladies home almanac", "ocean",
    "scrap book", "apache trail"];

// Unique base options (genreBases) add variety but conflict with some genres, so only use a unique when
// those genres (redundantWithGenres) are not in the title array
var genreBases = ["mysteries", "westerns", "thrillers","{love|ghost|true} stories"];
var redundantWithGenres = ["ghost","mystery","new love","western","high seas"];

// Some bookTitles are just for fun, some would be useful for gaining experience given a known
// list of skills, and it would be nice to point that out (e.g. "Bargain +3xp"). Seems okay to
// me to have canned titles as well that don't follow the rules, just to mix things up.
// "Observational Signatures of Self-Destructive Civilisations"
// http://arxiv.org/pdf/1507.08530v1.pdf
var bookTitles = [
    "Medical Planning & Response Manual for a Nuclear Detonation Incident: A Practical Guide",
    "Nuclear Dangers: Myths and Facts",
    "Nuclear Detonation Preparedness",
    "Nuclear War Survival Skills",
    "Nuclear War Survival",
    "Planning Guidance for Response to a Nuclear Detonation",
    "Protection in the Nuclear Age",
    "Recovery from Nuclear Attack",
    "U.S. Army Survival Manual",
    "Communism, Hypnotism, and the Beatles",
    "How You Can Fight Communism"
];

function addIf(percent, array, options) {
    if (percent == 100 || ion.test(percent)) {
        array.push(ion.random(options));
    }
}

function pulpMagTitle() {
    if (ion.test(5)) {
        return 'The ' + ion.titleCase(ion.random(cannedTitles));
    }
    var array = [];
    addIf(35, array, adj);
    addIf(100, array, genres);
    addIf(15, array, genres);
    addIf(10, array, ["fiction"]);

    if (ion.test(80) || ion.intersection(array, redundantWithGenres).length) {
        array.push(ion.random(base));
    } else {
        array.push(ion.random(genreBases));
    }
    return ion.titleCase( ion.unique(array).join(' ') );
}

// NOTE: "High Seas Jungle Tales"

/**
 * Magazines will be produced as generic items in bags, loot, etc. This method returns a
 * magazine with an auto-generated title, usually pretty silly. The titles are random so
 * these magazines are not considered collectible.
 *
 * @static
 * @for atomic
 * @method createMagazine
 *
 * @return {atomic.models.Item} magazine with a title
 */
module.exports.createMagazine = function() {
    var mag = itemDb.find({tags: "magazine"});
    mag = new Item(mag);
    mag.title = pulpMagTitle();
    return mag;
};

module.exports.createBook = function() {
    var title = ion.random(bookTitles);
    return new Item({name: "book", title: title, value: 3, enc: 2, tags: ['reading']});
};
