"use strict";

var ion = require('../ion');
var RarityTable = require('../tables/rarity_table');
var createCharacterName = require('./character_name');

// Something that makes ranch names, like 44; A Bar A; A X Ranch; Bar B/C/M/V/X, latName Ranch

function regionByLocation(location) {
    return ion.random( (location === "River" && ion.test(100)) ? water_regional : regional );
}
function getName() {
    // I think using the first name may be stupid.
    var name = createCharacterName();
    return (ion.test(10)) ? name.given : name.family;
}

// Woods, Forest, are not part of this terrain at all.
// Also wetlands, really?
// "{Ditch|Gap}"
// "{Knoll}"
// Alcohol|Moonshine

// GNIS categories: island, canal, stream, lake, channel, summit, gut

// Austin, Babbitt
// Mine, Claim
// Some "regional" modifiers, like bare or lame, only apply to animals
// A lot of descriptives could be used in settlment names, e.g. Buckville or "Foxvale"
// The "real" options are really settlment names, not place names. See above statement as well.

// Bottom Dollar, Last Chance
var locative = {
    'Depression': ["Alley", "Arroyo", "Basin", "Canyon", "Creek", "Gap", "Gulch", "Gully", "Hollow", "Valley"],
    'Flat': ["Flat{|s}", "Prairie", "Meadow{|s}", "Field", "Range", "Plain"],
    'Elevation': ["Butte", "Bluffs", "Cliff", "Mountain{|s}", "Point", "Pass", "Spur", "Ridge", "Butte", "Mesa", "Gap", "Rock", "Hill{|s}", "Summit", "Plateau"],
    'Water': ["Spring{|s}", "Lake", "Pond", "Bar", "Basin", "Creek", "River", "Reservoir", "Rapids", "Stream", "Wetlands", "Swamp", "Falls", "Dam", "Slough"],
    'Junction': ["Bend", "Bridge", "Junction", "Crossing"],
    'Woods': ['Woods', 'Forest']
};
var descriptive = ["Adobe", "{Agate|Amethyst|Geode|Diamond}", "Alkali", "Ant{|hill}", "Antelope", "Antler", "Anvil", "{Apple|Peach}", "Arrow{|head|tail}",
    "{Arlington|American|Army|Military|Soldier}", "{Arapahoe|Navajo|Sioux}", "{Alaska|Arizona|Wyoming|Colorado|California}", "Artesian",
    "{Ash|Pine|Oak|Aspen|Cottonwood}", "Bachelor", "Badger", "Badlands", "Bald", "Bann{er|ock}", "Bastard", "Barber", "Bard", "Barrel",
    "Battle", "Bear{|paw|tooth|trap}", "{Bear|Elk} Trap", "Beaver", "Bell", "Bench", "Berry", "Big{| Hill| Horn| Chief| Cow}", "Biscuit",
    "Bison", "Bobcat", "Bone{|yard}", "Boulder", "Brush", "Buck{|skin}", "Buffalo", "Bull", "Burnt", "Buzzard's", "Calamity", "Cedar", "Chalk", "Chief", "Chimney",
    "Cinder", "Clay", "Coal", "Coffin", "{Copper|Iron|Limestone|Sulphur}", "Cornstalk", "Cotton{|wood}", "Cougar", "Coyote", "Crescent",
    "Crooked", "Crow", "Deadwood", "Deer", "Dream", "Dry", "Eagle", "{|Big |Little }Elk", "Eureka", "Fox", "Frog", "Gold Dust", "Goose",
    "Gopher", "Granite", "Green", "Grinders", "Grouse", "Gypsum", "Hawk", "Hay{|stack}", "Hells", "Honey{|comb}", "Horse{shoe| Pasture}",
    "Indian", "Juniper", "{Little |}Sheep", "Lone{| Tree}", "Long", "{Monolith|Monument}", "Mud", "{Mule|Burro}", "Phantom", "Pinnacle", "Poker", "Pole",
    "Potter", "Prairie Dog", "Railroad", "Rattlesnake", "Rock{|y}", "Round", "Sage", "Sawmill", "Shady", "Shotgun", "Skeleton", "Slaughter",
    "Soda", "Squaw", "Stone", "Tungsten", "Twin", "Wagon{|wheel|hound}", "Wild", "Willow", "Wolf", "Young", "{Bad|Black|Dead|Mad} Dog",
    "{Big |Little |}Pine{| Flat}", "{Big|Black|Broken|Red} Rock", "{Dead|Blind} Man's", "{Saddle|Dead|Lame|Happy|Wild} Horse"
];

var real = ["Alfalfa", "Big Curve", "Bottom Dollar", "Buckeye", "Buzzard's Roost", "Casa Diablo", "Deadwood", "Faraday", "Harmony", "Hidden Valley", "Irondale",
    "Jack Rabbit", "Last Chance", "Saddlestring", "Leadville", "Palo Verde", "Pea Vine", "Point Blank", "Red-Eye", "Sunshine", "Tanglefoot", "Utopia"
];

var regional = ["Bad","{Bald|Bare}","Big","Dead","Happy","New","Middle","{North|South|East|West}","Lost","Old","Little","{Brown|Silver|Gold|Black|Red|Blue|White|Yellow}"];

var water_regional = "{North|South|East|West|Middle} Fork of the";

var patterns = new RarityTable(ion.identity, false);
patterns.add('rare', function(type) {
    // East Pond
    return ion.random(regional) + " " + ion.random(locative[type]);
});
/* eh
 patterns.add('rare', function(type) {
 // The Rock Junction
 return ion.format("The {0} {1}", ion.random(descriptive), ion.random(locative[type]));
 });*/
patterns.add('uncommon', function(type) {
    // West Anderson Junction
    var location = ion.random(locative[type]);
    return regionByLocation(location) + " " + getName() + " " + ion.random(locative[type]);
});
patterns.add('uncommon', function(type) {
    // West Bison Lake
    var location = ion.random(locative[type]);
    return regionByLocation(location) + " " + ion.random(descriptive) + " " + location;
});
patterns.add('rare', function(type) {
    // Ford Trail Pond
    var name = (ion.test(50)) ? ion.random(descriptive) : getName();
    return name + " Trail " + ion.random(locative[type]);
});
patterns.add('rare', function(type) {
    // Alfalfa
    return ion.random(real);
});
patterns.add('common', function(type) {
    // Red Hollow
    return ion.random(descriptive) + " " + ion.random(locative[type]);
});
patterns.add('common', function(type) {
    // Williams Crossing
    return getName() + " " + ion.random(locative[type]);
});
var landforms = ion.keys(locative);

/**
 * Generate a random place name.
 * @example
 *     atomic.createPlaceName("Water");
 *     => "West Rock Springs"
 *
 * @static
 * @method createPlaceName
 * @for atomic
 *
 * @param type {String} landform type (see `atomic.getLandformTypes()`)
 * @return {String} name
 */
module.exports.createPlaceName = function(type) {
    type = (landforms.indexOf(type) === -1) ? ion.random(landforms) : type;
    return ion.random(patterns.get()(type));
};

/**
 * The valid types that can be used when calling the `atomic.createPlaceName()` method.
 *
 * @static
 * @method getLandformTypes
 * @for atomic
 *
 * @return {Array} an array of landform types
 */
module.exports.getLandformTypes = function() {
    return landforms;
};