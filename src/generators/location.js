var ion = require('../ion');
require('../lib/cycle');
var RarityTable = require('../tables/rarity_table');

/*
Selection criteria:
    abstract: this thing just branches, but doesn't create a location. used to group possibilities, but they are included
        according to the rules of the parent. (this may be more about description)

    rarity: select a randomized number of items according to rarity. allow duplicates, don't allow duplicates.
    
    listed: work through each item and add a number of items equal to its count value (number or string). if number, exact amount
*/

var tree = require('./location-data');
tree.parsed = false;
var nameMap = new Map();
var FREQUENCIES = new Set(['common','uncommon','rare']);
var EMPTY = Object.freeze([]);

/* ================================================================================= */
/* Utilities */
/* ================================================================================= */

function forEachChild(node, func) {
    (node.children || EMPTY).forEach(func);
}

function pushName(array, node) {
    if (!node.abstract) {
        if (ion.isArray(node.name)) {
            array.push(ion.random(node.name));
        } else {
            array.push(node.name);
        }
    }
}

function collapseToName(node, array) {
    array = array || [];
    pushName(array, node);
    var childArray = [];
    forEachChild(node, function(child) {
        collapseToName(child, childArray);
    });
    if (childArray.length) {
        if (node.abstract) {
            array.push(childArray.join(', '));
        } else {
            array.push("("+childArray.join(', ')+")");
        }
    }
    return array.join(", ").replace(/\, \(/g," (");
}

/* ================================================================================= */
/* Valdation */
/* ================================================================================= */

function rarityValidator(node) {
    forEachChild(node, function(child) {
        if (!FREQUENCIES.has(child.freq)) {
            throw new Error("Rarity node "+node.name+" has child without valid 'freq' attribute: "+child.name);
        }
    });
}
function listedValidator(node) {
    forEachChild(node, function(child) {
        if (!child.count) {
            throw new Error("Listed node "+node.name+" has child without 'count' attribute: "+child.name);
        }
    });
}
function uniqueValidator(node) {
    if (!node.count) {
        throw new Error("Unique node requires count property: " + child.name);
    }
}
function isValidNode(node) {
    if (node.name && nameMap.has(node.name)) {
        throw new Error("Node has been defined twice: " + node.name);
    }
    return (!node.ref);
}
function isValidRef(node, parent) {
    if (!node.ref) {
        return false;
    }
    if (!nameMap.has(node.ref)) {
        throw new Error("Node reference hasn't been defined: " + node.ref);
    }
    for (var p = parent; p != null; p = p.parent) {
        if (p.name === node.ref) {
            throw new Error("Cyclical reference to " + node.ref);
        }
    }
    return true;
}
function validateNode(node) {
    var validator = VALIDATORS[node.type];
    if (validator) {
        validator(node);
    } else if (typeof node.type !== 'undefined') {
        throw new Error("No validator for node type: " + node.type);
    }
}

var VALIDATORS = {
    'rarity': rarityValidator,
    'listed': listedValidator,
    'unique': uniqueValidator,
    'isValidNode': isValidNode,
    'isValidRef': isValidRef
};

/* ================================================================================= */
/* Instantiation */
/* ================================================================================= */

// these resolves could return the new child array and let caller do some of the work.
// rarity resolver reuses RarityTable objects it constructs from child locations. 
var rarityTables = {};

function oneResolver(node) {
    var child = ion.random(node.children || []);
    node.children = [child];
}

function rarityResolver(node) {
    // convert children into a table and extract from that.
    if (!rarityTables[node.name]) {
        rarityTables[node.name] = new RarityTable(ion.identity, false);
        forEachChild(node, function(child) {
            rarityTables[node.name].add(child.freq, child);
        });
    }
    node.children = [rarityTables[node.name].get()];
}
function listedResolver(node) {
    // nothing just yet
}
function uniqueResolver(node) {
    var uniques = new Set();
    var count = ion.roll(node.count);
    var children = [];
    var i = 0;
    while(children.length < count && i < 100) {
        var child = ion.random(node.children);
        if (!uniques.has(child)) {
            uniques.add(child);
            children.push(node);
        }
    }
    node.children = children;
}
function processNodes(node) {
    if (node.children && node.children.length) {
        (RESOLVERS[node.type] || oneResolver)(node);
        forEachChild(node, processNodes);
    }
}
var RESOLVERS = {
    'rarity': rarityResolver,
    'listed': listedResolver,
    'unique': uniqueResolver
};
function instantiate(node) {
    var string = JSON.stringify(JSON.decycle(node));
    var copy = JSON.retrocycle(JSON.parse(string));
    processNodes(copy);
    return copy;
}

/* ================================================================================= */
/* Configuration tree parsing (resolving references) */
/* ================================================================================= */

function deepCopy(node) { 
    var newNode = Object.assign({}, node);
    if (node.children) {
        for (var i=0; i < node.children.length; i++) {
            node.children[i] = deepCopy(node.children[i]);
        }
    }
    return newNode;
}
function copyReference(parent, node) {
    var existing = nameMap.get(node.ref);
    var newNode = deepCopy(existing);
    Object.assign(newNode, node);
    newNode.parent = parent;
    delete newNode.ref;
    return newNode;
}
function parseTree(node) {
    forEachChild(node, function(child, i) {
        if (VALIDATORS.isValidRef(child, node)) {
            node.children[i] = copyReference(node, child);
            validateNode(node.children[i]);
        } else if (VALIDATORS.isValidNode(child)) {
            nameMap.set(child.name, child);
            child.parent = node;
            validateNode(child);
            parseTree(child);
        } else {
            throw new Error("Node is not a valid reference or a new node: " + child);
        }
    });
}
function init() {
    if (!tree.parsed) {
        parseTree(tree);
        tree.parsed = true;
    }
}

module.exports = {
    createLocation: function(name) {
        init();
        if (!name) {
            name = ion.random(tree.children).name;
        } 
        var node = nameMap.get(name);
        if (node) {
            return collapseToName(instantiate(node));
        }
        return null;
    },
    getAllLocations: function() {
        init();
        return tree;
    }
};
