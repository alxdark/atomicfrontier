"use strict";

var ion = require('../ion');
var db = require('./data').professionDatabase;
var Character = require('../models/character');
var Family = require('../models/family');
var Relationship = require('../models/relationship');
var RarityTable = require('../tables/rarity_table');

var createCharacter = require('./character').createCharacter;
var createRace = require('./character').createRace;
var createCharacterName = require('./character_name');
var createKit = require('./bag').createKit;

// This creates pretty normal families. As always, the generators are for on-the-spot
// filler material, and aim for believability. Make up the more unusual families in
// your world.

var innate = db.find('innate');

var relationships = {
    grandmother: {g: "female", a: 0, r: ["grandson", "granddaughter"], n: 25},
    grandfather: {g: "male", a: 0, r: ["grandson", "granddaughter"], n: 25},
    aunt: {g: "female", a: 1, r: ["niece", "nephew"], n: 50},
    uncle: {g: "male", a: 1, r: ["niece", "nephew"], n: 50},
    mother: {g: "female", a: 1, r: ["son", "daughter"], n: 80},
    father: {g: "male", a: 1, r: ["son", "daughter"], n: 100},
    brother: {g: "male", a: 2, r: ["sister","brother"], n: 100},
    sister: {g: "female", a: 2, r: ["sister", "brother"], n: 100},
    cousin: {g: null, a: 2, r: ["cousin"], n: 25},
    niece: {g: "female", a: 2, r: ["aunt", "uncle"]},
    nephew: {g: "male", a: 2, r: ["aunt", "uncle"]},
    son: {g: "male", a: 2, r: ["mother", "father"]},
    daughter: {g: "female", a: 2, r: ["mother", "father"]},
    grandson: {g: "male", a: 2, r: ["grandmother", "grandfather"]},
    granddaughter: {g: "female", a: 2, r: ["grandmother", "grandfather"]}
};
var relNames = [];
for (var prop in relationships) {
    relationships[prop].name = prop;
    relNames.push(ion.titleCase(prop));
}
// You only have to put the older terms in this table because if you're using
// it, you're randomizing, and the younger will be selected from the older
var rtable = new RarityTable()
    .add("common", relationships.mother)
    .add("common", relationships.father)
    .add("common", relationships.brother)
    .add("common", relationships.sister)
    .add("uncommon", relationships.aunt)
    .add("uncommon", relationships.uncle)
    .add("uncommon", relationships.cousin)
    .add("rare", relationships.grandmother)
    .add("rare", relationships.grandfather);

function getAdultAge() {
    return 18 + ion.nonNegativeGaussian(7);
}

function makeFamily(parent, kin) {
    var gender = (parent.male) ? "female" : "male";
    var race = createRace();
    var other = new Character({
        "name": createCharacterName({gender: gender, race: race}),
        "race": race,
        "profession": getRelatedProfession(kin[0].profession),
        "gender": gender,
        "age": ion.bounded(parent.age+ion.gaussian(3), 18)
    });
    kin.push(other);
    var family = new Family({
        "parent": parent,
        "other": other,
        "relationship": "couple"
    });
    // must be deleted later from all chars, or cannot be turned into JSON and persisted
    parent.family = other.family = family;

    if (ion.test(80)) {
        family.relationship = "married";
        if (ion.test(90)) { // if married, will share the same last name most of the time.
            family.female.name.family = family.male.name.family;
        }
    }
    return family;
}

function getChildCount() {
    return ion.nonNegativeGaussian(2.5, 1) || getChildCount();
}

function makeChildren(family, kin) {
    var childCount = getChildCount();
    if (family.female.age < 40) {
        for (var i=0; i < childCount; i++) {
            makeChild(family, kin);
        }
        // Delay *after* the last child is born.
        var years = ion.nonNegativeGaussian(4,1);
        ageKin(kin, years);
    }
}

function makeChild(family, kin) {
    var gender = ion.random(["male","female"]);
    var child = new Character({
        "name": createCharacterName({gender: gender, "race": family.female.race}),
        "race": family.female.race,
        "gender": gender,
        "age": ion.roll("1d3")
    });
    kin.push(child);
    child.name.family = family.male.name.family;
    // This is a gap in the ages of the family.
    ageKin(kin, child.age + ion.roll("1d3-1"));
    family.children.push(child);
    child.family = family;
}

function ageFamilyUntilChildIsAdult(family, kin) {
    var child = ion.random(family.children);
    if (!child) {
        throw new Error("No child in this family");
    }
    var adultAge = getAdultAge();
    if (child.age >= adultAge) {
        return child;
    }
    ageKin(kin, adultAge - child.age);
    return child;
}

function ageKin(kin, age) {
    kin.forEach(function(person) {
        person.age += age;
    });
}

function getRelatedProfession(profession) {
    if (!profession) {
        throw new Error("There should always be a related profession");
    }
    if (ion.test(40)) {
        return profession;
    }
    // TODO: This is a hack to extract the prestige tag from the prestige of the profession object
    // Can't we ask for the prestige:* tag? Should all tags be namespaced like this?
    var prestige = ion.intersection(["high","low","normal"], db.find(ion.toTag(profession)).tags);
    return db.find(prestige + " -pre -innate").names[0];
}

function postProcess(kin) {
    kin.forEach(function(person) {
        // train
        var c = createCharacter({
            "name": person.name,
            "profession": person.profession || getRelatedProfession(kin[0].profession),
            "age": person.age,
            "gender": person.gender,
            "equip": false
        });
        ion.extend(person, c);

        // deaths
        var family = person.family;
        delete person.family;

        if (family.isParent(person)) {
            if (ion.test(Math.sqrt(person.age))) {
                person.status = "absent";
                family.relationship = (family.relationship === "married") ? "divorced" : "separated";
            } else if (ion.test(Math.sqrt(person.age))) {
                person.status = "deceased";
                family.relationship = (family.male === person) ? "widow" : "widower";
            }
        } else if (ion.test(Math.sqrt(person.age))) {
            person.status = "deceased";
        }
        if (person.profession) {
            person.inventory = createKit({profession: person.profession});
        }
    });
}

function nextGeneration(family, kin, i, gen) {
    makeChildren(family, kin);

    if (i < (gen-1)) {
        var parent = ageFamilyUntilChildIsAdult(family, kin);

        // TODO:
        // This *almost* works but the aging of family members proceeds through everyone,
        // it doesn't branch for kin lines that co-exist in time. Need a different way
        // to age people.
        var parents = [parent]; // maybeFindOtherParents(family, parent);
        parents.forEach(function(p) {
            var newFamily = makeFamily(p, kin);
            family.couples.push(newFamily);
            family.children.splice(family.children.indexOf(p), 1);
            nextGeneration(newFamily, kin, i+1, gen);
        });
    }
}

/*
 function maybeFindOtherParents(family, originParent) {
 return [originParent].concat(family.children.filter(function(child) {
 return ion.test(50) && child.age > 20 && child !== originParent;
 }));
 }
 */

/**
 * Create a nuclear family, with a specified number of generations.
 *
 * @static
 * @method createFamily
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.generations=2] {Number} number of generations in the family (one
 *          generation is a couple, two generations includes their children, three
 *          their grand-children, above 3 you're going to get a history lesson).
 *      @param [params.parent] {Object} the parameters to pass to the first character
 *          created, that will set the profession, race and name of sub-generations.
 * @return {atomic.models.Family} a family
 */
module.exports.createFamily = function(opts) {
    opts = opts || {};
    opts.generations = opts.generations || 2;
    opts.parent = opts.parent || {};
    opts.parent.age = (opts.parent.age || getAdultAge());

    var parent = createCharacter(opts.parent),
        kin = [parent],
        family = makeFamily(parent, kin),
        root = family;

    if (opts.generations > 1) {
        nextGeneration(family, kin, 1, opts.generations);
    }
    postProcess(kin);
    return root;
};

/**
 * Get a list of valid relationships. These are the valid values to pass to the
 * `atomic.createRelationship()` method.
 *
 * @static
 * @method getRelationships
 * @for atomic
 *
 * @return {Array} a list of relationship names
 */
module.exports.getRelationships = function() {
    return relNames.sort();
};

/**
 *
 * Creates a pair of characters who are related to each other. Both characters will be
 * adults (you an adjust the ages and ignore the adult traits, if needed).
 *
 * @static
 * @method createRelationship
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.older] {String} name of the older or lateral relationship (e.g. "aunt" or
 *          "sister").  The younger or lateral relationship is derived from the older term.
 *      @param [params.profession] {String} the profession for the related people
 *      @param [params.familyName] {String} the last name to share between relations
 *      @param [params.equip] {Boolean} should these characters be equipped?
 */
module.exports.createRelationship = function(params) {
    params = ion.extend({}, params || {});
    params.equip = ion.isBoolean(params.equip) ? params.equip : true;
    var olderRel = (params.older) ? relationships[params.older.toLowerCase()] : rtable.get();
    var youngerRel = relationships[ ion.random(olderRel.r) ];

    // Order the terms:
    var youngerAge, olderAge,
        ageDiff = Math.abs(olderRel.a - youngerRel.a);

    do {
        youngerAge = getAdultAge();
        olderAge = getAdultAge();
        for (var i=0; i < ageDiff; i++) {
            olderAge += getAdultAge();
        }
    } while(ageDiff > 0 && olderAge-youngerAge < (18*ageDiff));

    var older = atomic.createCharacter({
            age: olderAge,
            gender: olderRel.g,
            profession: params.profession,
            equip: params.equip
        }),
        younger = atomic.createCharacter({
            age: youngerAge,
            race: ion.test(olderRel.n) ? older.race : atomic.createRace(),
            gender: youngerRel.g,
            profession: params.profession,
            equip: params.equip
        }),
        relName = (olderRel === youngerRel) ? (olderRel.name + "s") : (olderRel.name+" and "+youngerRel.name);

    if (params.familyName) {
        older.name.family = params.familyName;
    }
    if (ion.test(olderRel.n)) {
        younger.name.family = older.name.family;
    }
    return new Relationship(older, younger, relName);
};