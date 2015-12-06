"use strict";

var ion = require('../ion');
var Profession = require('./profession');

var navyRanks = ["","Seaman", "Petty Officer", "Ensign", "Lieutenant", "Lieutenant Commander", "Commander", "Captain", "Admiral"],
    policeRanks = ["Officer",["Officer","Trooper"],"Detective","Sergeant", ["Captain","Deputy Marshal"], ["Inspector","Marshal"],["Deputy Chief","Undersheriff"],["Chief","Sheriff"]],
    milRanks = ["","Private", "Corporal", "Sergeant", "Lieutenant", "Captain", "Major", "Colonel", "General"];

module.exports = ion.define(Profession, {
    /**
     * A sub-class of profession that handles assigning rank for professions such as
     * the military and police.
     *
     * @class atomic.models.AtomicProfession
     * @extends atomic.models.Profession
     *
     * @constructor
     * @param [params] {Object}
     */
    init: function(params) {
        Profession.call(this, params || {});
    },
    /**
     * Assigns rank to the character based on traits.
     *
     * @method assignRank
     * @for atomic.models.AtomicProfession
     */
    assignRank: function(character) {
        var name = this.names[0], rank = null;

        // TODO: Could use gaussian spread here.
        var level = Math.round(Math.max(character.trait("Military"), character.trait("Government")) * 1.5);

        // TODO: Could use a table here.
        if (name === "Navy" || name === "Coast Guard") {
            rank = navyRanks[ion.roll(level)];
        } else if (name === "Police") {
            rank = policeRanks[ion.roll(level)];
            if (rank instanceof Array) {
                rank = ion.random(rank);
            }
        } else {
            rank = milRanks[ion.roll(level)];
        }
        character.honorific = (rank) ? name + ' ' + rank : name;
    }
});
