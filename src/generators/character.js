"use strict";

var ion = require('../ion');
var Name = require('../models/name');
var Character = require('../models/character');
var db = require('./data').professionDatabase;
var createCharacterName = require('./character_name');
var createKit = require('./bag').createKit;
var createAppearance = require('./appearance');

var innate = db.find('innate');
var histories = ["Before the collapse, was {0}", "Was {0} up until the war", "Was {0} before the war"];

function nameFromOpts(n, gender, race) {
    if (ion.isString(n)) {
        var parts = n.split(" ");
        return new Name({given: parts[0], family: parts[1]});
    } else if (n instanceof Name) {
        var newName = createCharacterName({ gender: gender, race: race});
        return ion.extend(newName, n);
    } else {
        return createCharacterName({ gender: gender, race: race});
    }
}

function createOpts(params) {
    var opts = ion.extend({}, params);
    opts.gender = opts.gender || ion.random(['male','female']);
    opts.equip = (ion.isBoolean(opts.equip)) ? opts.equip : true;
    opts.race = opts.race ||  createRace();
    opts.name = nameFromOpts(opts.name, opts.gender, opts.race);
    opts.age = (ion.isNumber(opts.age)) ? ion.bounded(opts.age, 1, 100) : ion.roll("14+3d12");
    if (opts.traits) {
        opts.traits = ion.extend({}, opts.traits);
    }
    if (opts.profession) {
        opts.profession = ion.toTag(opts.profession);
    }
    if (opts.profession === 'soldier') {
        opts.profession = ion.random(['airforce','marine','army','navy'/*,'coast guard'*/]);
    }
    return opts;
}


function traitsForChild(character, opts) {
    delete character.profession;
    delete character.honorific; // this should only exist as a result of training, however.
    // make a child instead.
    if (character.age > 4) {
        innate.train(character, ion.roll("1d3-1"));
        // Calling children "attractive" gets creepy. Avoid.
        delete character.traits.Attractive;
    }
}

function traitsForAdult(character, prof, opts) {
    var startingTraitPoints = ion.sum(ion.values(opts.traits));
    var traitPoints = 8 + (~~(opts.age/10)) - startingTraitPoints;

    innate.train(character, ion.roll("2d2-1"));

    // 27 is arbitrary, it gives the character a couple of years to have had a profession.
    // For higher-status professions like doctor, cutoff is 30.
    var pre = db.find('pre -innate');
    var prestige = ion.intersection(pre.tags, ["low", "normal", "high"]);
    var post = (prof) ? prof : db.find(prestige + ' post -pre -innate');
    var cutoffAge = (pre.is('high')) ? 30 : 27;

    if (post.not('pre') && character.age > cutoffAge) {
        var weight = (character.age - 10)/character.age;
        var prePoints = Math.floor(traitPoints * weight);
        var postPoints = traitPoints-prePoints;

        // two profession, pre/post war
        pre.train(character, prePoints);
        if (pre.names[0] !== post.names[0]) {
            var title = (character.honorific) ? character.honorific : ion.random(pre.names),
                hsy = ion.random(histories);
            character.history.push( ion.format(hsy, ion.article(title.toLowerCase())) );
        }
        delete character.honorific;
        post.train(character, postPoints);
    } else {
        // just use the post profession
        post.train(character, traitPoints);
    }
    character.profession = ion.random(post.names);
    if (opts.equip) {
        character.inventory = createKit({profession: post, gender: character.gender});
    }
}

/**
 * Get all (post-collapse) professions. These are valid values for the `atomic.createCharacter()`
 * call's {profession: [name]}.
 *
 * @static
 * @method getProfessions
 * @for atomic
 * @return {Array} array of profession names that can be used by generators
 */
module.exports.getProfessions = function() {
    return ion.profDb.findAll('post').rows.map(function(row) {
        return row.names[0];
    }, []).sort();
};

/**
 * Create a character.
 * @example
 *     atomic.createCharacter({profession: 'thief', equip: false})
 *     => character
 *
 * @static
 * @method createCharacter
 * @for atomic
 *
 * @param [params] {Object}
 *     @param [params.gender] {String} "male" or "female"
 *     @param [params.name] {String} full name (e.g. "Loren Greene")
 *     @param [params.age] {Number}
 *     @param [params.race] {String} "anglo" or "hispanic" (20% hispanic by default)
 *     @param [params.profession] {String} Name of a profession this character should have in their experience.
 *          Value can be "soldier" for any of the armed services
 *     @param [params.equip=true] {Boolean} Should an inventory be created for this character?
 *     @param [params.traits] {Object} a map of trait names to trait values. These are deducted from the traits
 *          added to the character during generation.
 * @return {atomic.models.Character} character
 */
module.exports.createCharacter = function(params) {
    var prof = null;
    var opts = createOpts(params);

    if (opts.profession) {
        prof = db.find(opts.profession);
        if (prof === null || prof.not('post')) {
            throw new Error("Invalid profession: " +opts.profession+ " (must be post-war profession)");
        }
    }
    var character = new Character(opts);
    if (character.age < 17) {
        traitsForChild(character, opts);
    } else {
        traitsForAdult(character, prof, opts);

        // Not tailored towards children... may eventually be fixed
        character.appearance = createAppearance( character );

        // These are normally hidden for NPCs, but are available for combatant string.
        character.initiative = ion.roll("2d6") + character.trait('Agile');
        character.hp = 10 + character.trait('Tough');
    }

    // Hispanic people are likely to speak some Spanish.
    if (character.race === "hispanic") {
        character.changeTrait("Spanish", ion.nonNegativeGaussian(1.5));
    }

    return character;
};

/**
 * Select one of the available races (Anglo 80% of the time, Hispanic 20% of the time).
 * @example
 *     atomic.createRace()
 *     => "hispanic"
 *
 * @static
 * @method createRace
 * @for atomic
 *
 * @return {String} a race
 */
function createRace() {
    return (ion.test(20) ? "hispanic" : "anglo");
}
module.exports.createRace = createRace;
