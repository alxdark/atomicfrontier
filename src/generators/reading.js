"use strict";

var ion = require('../ion');
var Item = require('../models/item');
var itemDb = require('./data').itemDatabase;

// Some books are just for fun, some would be useful for gaining experience given a known
// list of skills, and it would be nice to point that out (e.g. "Bargain +3xp"). Seems okay to
// me to have canned titles as well that don't follow the rules, just to mix things up.
// "Observational Signatures of Self-Destructive Civilisations"
// http://arxiv.org/pdf/1507.08530v1.pdf

var adj = ["all", "amazing", "astonishing", "atomic", "bolshevik", "boy's", "dark", "dynamic", "exciting",
    "favorite", "gentleman's", "girl's", "incredible", "lady's", "northwest", "popular", "railroad man's",
    "ranch", "saucy", "spicy", "startling", "thrilling", "women's", "wonderful"];
var genres = ["adventure", "air", "cowboy", "detective", "fantasy", "far west", "FBI", "flying", "frontier",
    "ghost", "high seas", "horror", "indian", "jungle", "new love", "northwest", "outdoor", "pirate", "prison",
    "ranch", "romance", "sci-fi", "science", "supernatural", "sweetheart", "western"];
var base = ["almanac", "weekly", "magazine", "quarterly", "stories", "tales", "thrills"];
var cannedTitles = ["all-story", "argosy", "black mask", "cavalier", "keepsake", "ladies home almanac", "ocean",
    "scrap book"];

// split into nouns and adjectives... can make times for stories or individual pulp novels or something

var storyAdj = ["three", "white", "deep", "away", "back", "beyond", "great", "lost", "big", "like", "little", "living",
    "new", "long", "two", "small", "dead", "never", "last", "best", "dark", "old", "second", "first", "one",
    "cold", "red", "bad", "final", "broken", "just", "perfect", "green", "blue"];

var storyNouns = ["man", "summer", "witch", "time", "earth", "house", "heaven", "mind", "devil", "flight",
    "book", "mother", "star{|s}", "king", "thing{|s}", "stairs", "universe", "glass", "eye", "darkness", "lady",
    "end", "sun", "call", "woman", "water", "dance", "mars", "light", "moon", "black", "winter", "wind", "queen",
    "river", "dragon", "skin", "ghost{|s}", "alien", "", "garden", "war", "death", "monster{|s}", "dead", "never",
    "story", "bones", "soul", "blood", "mirror", "children", "beast", "men", "fire", "hell", "know", "demon",
    "planet", "snow", "dark", "ice", "god{|s}", "way", "heart", "stone", "door", "world{|s}", "human",
    "dream{|s}", "second", "family", "fall", "boy", "song", "city", "road", "place", "gift", "sky", "life",
    "shadow{|s}", "people", "flesh", "final", "memory", "tale", "", "wings", "day{|s}", "home", "game", "space",
    "tree", "eyes", "dust", "room", "name", "rain", "box", "thing", "sea", "night", "love", "girl", "machine",
    "child", "daughter", "future", "angel", "magic", "dream", "hand"];

// Unique base options (genreBases) add variety but conflict with some genres, so only use a unique when
// those genres (redundantWithGenres) are not in the title array
var genreBases = ["mysteries", "westerns", "thrillers","{love|ghost|true} stories"];
var redundantWithGenres = ["ghost","mystery","new love","western","high seas"];

var mag = "magazine ({0})";

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
 * @return {ion.models.Item} magazine with a title
 */
module.exports.createMagazine = function() {
    var mag = itemDb.find({tags: "magazine"});
    mag = new Item(mag);
    mag.title = pulpMagTitle();
    return mag;
};

module.exports.createBook = function() {
    throw new Error("Not implemented");
};

// These are all dreadful, and also this isn't useful. But it was an idea for some data that I
// wanted to try out.
module.exports.createTitle = function() {
    return ion.format("The {0} {1} of {2}", ion.random(storyAdj), ion.random(storyNouns), ion.random(storyNouns));
};
