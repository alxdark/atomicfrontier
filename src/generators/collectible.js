"use strict";

var ion = require('../ion');
var Bag = require('../models/bag');

// "Nuclear War Survival Skills" -- this one is still in print, not government
// "Nuclear Dangers: Myths and Facts"
// "Planning Guidance for Response to a Nuclear Detonation" (National Security Interagency Policy Coordination Subcommittee)
// "Nuclear Detonation Preparedness"
// "U.S. Army Survival Manual"

// FEMA Nuclear War Survival
// Nuclear Detonation Preparedness from REMM.gov

// movie posters
// war posters
// magazines, comics, other serials
// specific books or book collections
// specific kinds of electronic or mechanical parts
// baseball cards

var rarity = new ion.tables.Table();
rarity.add(75, "common");
rarity.add(22, "uncommon");
rarity.add(3, "rare");

module.exports = function(params) {
    params = params || {};
    params.number = (ion.isNumber(params.number) && params.number > 0) ? params.number : ion.roll("20d6");

    // Really?
    var bag = new Bag();
    ion.times(params.number, function() {
        var mag = new ion.models.Item(ion.itemDb.find("magazine"));
        mag.rarity = rarity.get();
        bag.add(mag, 1);
    });
    return bag;
};
