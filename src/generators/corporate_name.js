var ion = require('../ion');
var Table = require('../tables/table');
var createCharacterName = require('./character_name');

// Naming these is very hard.

var e1 = "{Alpha|American|North American|National|General|Universal|International|Consolidated|Central|Western|Eastern|Union}",
    e2 = "{Argon|Iridium|Micro|Radiation|Nuclear|Atomic|Radium|Uranium|Plutonium|Development|X-Ray|Gamma Ray}",
    e3 = "{Engineering|Research|Scientific|Electronics|Instruments|Devices}",
    e4 = "{Laboratory|Laboratories|Corporation|Supply Company|Company|Foundation|Inc.}";

// Specific historical names and combos not created by the generator, that add to the veracity of results.
var e5 = [ "Raytomic", "Detectron", "Gamma-O-Meter", "Librascope", "Micromatic", "Micro Devices",
        "Micro Specialties", "Radiaphone", "Radiometric", "Ra-Tektor", "Nucleonics", "Scintillonics", "Tracerlab" ];

var table1 = new Table(ion.transform)
    .add(60, function() {return ion.random(e1) + " " + ion.random(e2);})
    .add(10, function() {return ion.random(e2);})
    .add(15, function() {return createCharacterName({race: "anglo"}).family + " " + ion.random(e2);})
    .add(15, function() {return createCharacterName({race: "anglo"}).family;});

var table2 = new Table(ion.transform)
    .add(25, function() {return " " + ion.random(e3);})
    .add(25, function() {return " " + ion.random(e4);})
    .add(50, function() {return " " + ion.random(e3) + " " + ion.random(e4);});

function createName() {
    return (ion.test(90)) ?
        (table1.get() + table2.get()) :
        (ion.random(e5) + " " + ion.random(e4));
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
