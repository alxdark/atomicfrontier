var ion = require('../ion');
var RarityTable = require('../tables/rarity_table');

function children() {
    return new RarityTable(ion.identity, false);
}

var natural = {name: "natural", cls: "type", contains: children()
    .add("common", {name: "canyon", cls: "area"})
    .add("common", {name: "prairie", cls: "area"})
    .add("uncommon", {name: "forest", cls: "area"})
    .add("uncommon", {name: ["dry river bed", "gulch"], cls: "area"})
    .add("uncommon", {name: "lake", cls: "area"})
    .add("rare", {name: "river", cls: "area"})
    .add("rare", {name: "cave", cls: "area"})
    .add("rare", {name: "caverns", cls: "area"})
    .add("rare", {name: "crater", cls: "area"})
};
var rural = {name: "rural", cls: "type", contains: children()
    .add("uncommon", {name: "farm", cls: "area", num: "1d5+1", contains: children()
        .add("common", {name: "barn", cls: "building"})
        .add("common", {name: "garage", cls: "building"})
        .add("common", {name: "stable", cls: "building"})
        .add("common", {name: ["storm shelter","root cellar"], cls: "building"})
        .add("common", {name: "shed", cls: "building"})
        .add("uncommon", {name: "chicken coop", cls: "building"})
        .add("uncommon", {name: "silo", cls: "building"})
        .add("uncommon", {name: "grainery", cls: "building"})
        .add("rare", {name: "greenhouse", cls: "building"})
        .add("rare", {name: "fallout shelter", cls: "building"})
        .add("rare", {name: "well house", cls: "building"})
        .add("rare", {name: "water mill", cls: "building"})
        .add("rare", {name: "windmill", cls: "building"})
        .add("rare", {name: "horse mill", cls: "building"})
        .add("rare", {name: "pigsty", cls: "building"})
    })
};

// I am presuming that this is a tree that will be associated to a map at some point,
// the structure will have to be adjusted.
var locations = {
    name: "locations",
    contains: children()
        .add("common", natural)
        .add("uncommon", rural)
}

// Does not account for multiple children. That is easy enough, but preventing duplicate
// children where appropriate will require more work.
function resolveNode(array, node) {
    var node = node.contains.get();
    array.push( ion.random(node.name) );
    return (node.contains) ? resolveNode(array, node) : array;
}

module.exports = {
    getLocation: function() {
        return resolveNode([], locations);
    }
};
