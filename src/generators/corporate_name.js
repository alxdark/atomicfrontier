"use strict";

var ion = require('../ion');
var Table = require('../tables/table');
var createCharacterName = require('./character_name');

// Argon, Iridium
var e1 = "{Alpha|American|North American|National|General|Universal|International|Consolidated|Central|Western|Eastern|Union}",
    e2 = "{Argon|Iridium|Micro|Radiation|Nuclear|Atomic|Radium|Uranium|Plutonium|Development|X-Ray|Gamma Ray}",
    e3 = "{Engineering|Research|Scientific|Electronics|Instruments|Devices}",
    e4 = "{Laboratory|Laboratories|Corporation|Supply Company|Company|Foundation|Inc.}",

    e5 = [ "Raytomic", "Detectron", "Gamma-O-Meter", "Librascope", "Micromatic", "Micro Devices",
        "Micro Specialties", "Radiaphone", "Radiometric", "Ra-Tektor", "Nucleonics", "Scintillonics", "Tracerlab" ];

var table1 = new Table(ion.transform);
table1.add(60, function() {
    return ion.random(e1) + " " + ion.random(e2);
});
table1.add(10, function() {
    return ion.random(e2);
});
table1.add(15, function() {
    return createCharacterName({race: "anglo"}).family + " " + ion.random(e2);
});
table1.add(15, function() {
    return createCharacterName({race: "anglo"}).family;
});

var table2 = new Table(ion.transform);
table2.add(25, function() {
    return " " + ion.random(e3);
});
table2.add(25, function() {
    return " " + ion.random(e4);
});
table2.add(50, function() {
    return " " + ion.random(e3) + " " + ion.random(e4);
});

function createName() {
    if (ion.test(90)) {
        return table1.get() + table2.get();
    } else {
        return ion.random(e5) + " " + ion.random(e4);
    }
}

/**
 * Creates your typical cold-war sinister mega-corporation name.
 *
 * @static
 * @for atomic
 * @method createCorporateName
 *
 * @return {String} company name
 */
module.exports = function() {
    var name = createName();
    while(name.split(" ").length > 4) {
        name = createName();
    }
    return name;
};
