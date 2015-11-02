"use strict";

var ion = require('../ion');
var db = require('./data').professionDatabase;
var createCharacter = require('./character').createCharacter;
var Gang = require('../models/gang');
/*
 * TODO: All girl gangs/all boy gangs mostly, with sometimes a connection between the two.

 patrols; no communications or medics in group.

 *
 * TODO: Non-criminal gangs? Like the "Eastside Motorcycle Club" or the "Southside Paladins", etc.?
 "nomadic": [
 "Raiding Parties (Banditry or Plundering)",
 "Scavenging",
 "Ambushes/Highway Robbery (Brigandry)"
 ],
 "street": [
 "Protection Rackets",
 "Burglery & Larceny",
 "Pickpocketing",
 "Scavenging",
 "Extracting tolls for passage or entry"
 ]

 Names for military patrols
 */
var types = {
    'Biker Gang': {
        prof: "raider",
        nicks: 100,
        traits: {"Motorcycling":1},
        count: "3d4-2",
        mil: false,
        names: ["Pagans", "Outlaws", "Bandidos", "Mongols", "Vagos Motorcycle Club", "Free Souls",
            "{Grim |}Reapers", "Gypsy Jokers", "Highwaymen", "Iron Horsemen", "Rebels",
            "Comanchero", "Devil's Disciples", "Diablos", "Finks", "58s", "Road Devils",
            "{Lone |}Legion", "Road {Devils|Knights}", "Skeleton Crew", "Low Riders"]
    },
    'Street Gang': {
        prof: "thief",
        nicks: 100,
        count: "1d4+1",
        mil: false,
        names: ["Magnificents", "Purple Hearts", "Coasters", "Businessmen", "Gladiators",
            "{Earls|Dukes|Counts|Barons|Lords}", "Daggers", "Big Dogs", "Young Lords",
            "Imperial Hoods", "Bulls", "Lightenings", "Crowns", "Senators", "Hawks",
            "Savages", "Lucky Seven", "Gents", "Enchanters"]
    },
    'Raiding Gang': {
        prof: "raider",
        count: "3d4-1",
        nicks: 90
    },
    'Scavenger Party': {
        prof: "scavenger",
        count: "1d4+1",
        nicks: 50
    },
    // TODO: Which isn't a group of working buckeroos. Those guys might have a chuck wagon and the like
    'Cowboy Posse': {
        prof: "rancher",
        count: "1d5+1",
        nicks: 20
    },
    'Cattle Rustler Gang': {
        prof: ['rancher','rancher','scavenger','thief'],
        count: "1d3+1",
        nicks: 50
    },
    'Army Patrol': {
        prof: 'army',
        count: "1d3*4",
        mil: 'army',
        nicks: 5
    },
    'Marine Patrol': {
        prof: 'marine',
        count: "1d3*4",
        mil: 'marine',
        nicks: 15
    }
};

var nicknames = {
    female: [
        '{given} "The {Queen|Vixen|Waitress|Witch}" {family}',
        '"{Ma|Baby Blue Eyes|Fat Girl|Gold Digger|Hot Lips|Monkey Girl|Repo Girl|Roxy|Sweet Cakes|Wild Woman}" ({given} {family})'
    ],
    male: [
        '{given} "{Wild|Repo|Hatchet|Ice} Man" {family}',
        '"{Bugsy|Pa|Bag Man|Monkey Boy|Muscles|Caveman|Maverick|Music Man|Nice Guy|Pretty Boy}" ({given} {family})',
        '{given} "The {Hitman|Sandman|Watchman|Rifleman|Gunman|Trigger Man}" {family}',
        '{given} "{Lil|Fat|Big} {Loco|Man|Boy|Daddy|Tuna} {family}"'
    ],
    both: [
        '"{Big|Fat|Little|Skinny|Greedy|Crazy|Trigger|Two-Finger|Three-Finger|Young|Old|Doc|Lowdown|Rowdy} {given}" {family}',
        '{given} "The {Agitator|Ant|Bag|Banker|Barber|Blast|Bloodhound|Boot|Brain|Brains|Bug|Bull|Burnout|Bystander|Cartridge|Cheater|Clown|Cruiser|Dasher|Dentist|Duke|Fence|Ghost|Reaper|Groundhog|Hammer|Hatchet|Joker|Kid|Killer|Knife|Lead Foot|Machine|Menace|Monster|Mouse|Rat|Prairie Dog|Mouthpiece|Mumbler|Ox|Rabbit|Razor|Rev|Roach|Saint|Show|Shotgun|Snake|Sore|Suit|Trigger|Unwanted|Viper|Waiter|Wall|Watcher|Weasel|Whisperer|Wire|Wolf|Zealot|Zero|Zookeeper|Plumber|Kleaner}" {family}',
        '"{Ammo|Angel|Animal|Baby Face|Babycakes|Baldo|Bananas|Band-Aid|Bats|Beans|Beef|Bench|Bix|Black Eye|Blackjack|Blaze|Bloody|Blue Eyes|Blue Nose|Books|Boxcars|Bugs|Bugsy|Butterfingers|Candles|Coins|Cold Finger|Crackers|Cranky|Creaky|Cue Ball|Cuts|Dasher|Devious|Dice|Digger|Droopy|Eyes|Fangs|Fast Trigger|Flames|Flowers|Foot Long|Framed|Freckles|Free Style|Frosty|Goldie|Greasy Thumb|Great White|Ha-Ha|Half Full|Happy|Hell Raiser|Holy Smoke|Hot Shot|Icepick|Itchy|Jezebel|Kid Blast|Kid Twist|King Kool|Knots|Knuckles|Ladykiller|Lefty|Long Hair|Looney|Lucky|Machine Gun|Maniac|Matches|Midnight|Moneybags|Needles|Nitro|Numbers|Old Creepy|One Arm|Patch-Eye|Payola|Peanuts|Pee Wee|Pinky|Popcorn|Pork \'n Beans|Roadkill|Roulette|Scarface|Scars|Scumbag|Seven Clip|Shades|Shady Eyes|Shaggy|Sharp Edge|Sharpie|Shiny|Shocker|Short Stack|Side Step|Silver Dollar|Skidmarks|Slingshot|Sluggo|Smiley|Smokey|Sneakers|Spanky|Sparkey|Spinner|Squeaky|Squinty|Sticks|Sticky Fingers|Stonewall|Tick Tock|Toothless|Trails|Twinkle Cakes|Two Guns|Two Holes|Wheels|Wild Child}" ({given} {family})'
    ]
};

var typeKeys = ion.keys(types);

function rankPatrol(service, gang) {
    var prof = db.find(service);
    gang.members.forEach(function(member) {
        member.traits.Military = 0.5; // member.traits.Government
        prof.assignRank(member);
        member.traits.Military = 1; // member.traits.Government
    });
    // By luck, this may still produce a private and not someone of higher military rank.
    var last = ion.last(gang.members), lowRank = gang.members[0].honorific;
    last.traits.Military = 4;
    do {
        prof.assignRank(last);
    } while (last.honorific === lowRank);

}
function isFoodOrPersonal(item, count) {
    return item.is('food') || item.is('kit:personal');
}
function getNicks(c) {
    return nicknames[(ion.test(80)) ? "both" : c.male ? "male" : "female"];
}

/**
 * Get the list of types that can be used when creating a gang.
 * @example
 *     atomic.getGangTypes()
 *     => ["Biker Gang", ... "Marine Patrol"]
 *
 * @static
 * @method getGangTypes
 * @for atomic
 *
 * @return {Array} The types of gangs. One of these values is a valid type for
 *      `atomic.createGang()`
 */
module.exports.getGangTypes = function() {
    return typeKeys.sort();
};

/**
 * @static
 * @method assignNickname
 * @for atomic
 *
 * @param character {atomic.models.Character} the character to assign a nickname
 *      to. Nickname is assigned to the character's name.
 * @return {String} the nick name
 */
function assignNickname(character) {
    var nicks = getNicks(character);
    var nick = ion.random(nicks);
    character.name.nickname = ion.format(nick, character.name);
    return nick;
};
module.exports.assignNickname = assignNickname;

/**
 * Generate a gang (a group of people who are likely to be hostile to the players, and often
 * returned as part of encounter creation).
 *
 *     atomic.createGang({type: 'Scavenger Party', count: 6});
 *     => gang
 *     gang.members.length
 *     => 6
 *
 * @static
 * @method createGang
 * @for atomic
 *
 * @param [params] {Object} params
 *     @param [params.type] {String} the type of gang. This encapsulates the number, traits,
 *      and other information about the gang.
 *     @param [params.count] {Number} the number of members in the gang. If no number is supplied,
 *      a type-specific default will be used
 * @return {atomic.models.Gang} the gang generated
 */
module.exports.createGang = function(params) {
    params = ion.extend({}, params || {});

    var gangType = params.type || ion.random(typeKeys),
        gangSpec = types[gangType];

    if (ion.isUndefined(gangSpec)) {
        throw new Error("Invalid gang type: " + gangType);
    }

    var count = ion.isNumber(params.count) ? params.count : ion.roll(gangSpec.count);
    var opts = {
        kind: gangType
    };
    if (gangSpec.names) { // TODO: Calling random twice is... odd. And you do it below, too
        opts.name = ion.random(gangSpec.names);
    }
    var gang = new Gang(opts);

    ion.times(count, function() {
        var c = createCharacter({
            "profession": ion.random(gangSpec.prof),
            "traits": gangSpec.traits || {}
        });
        c.initiative = ion.roll("2d6") + c.trait('Agile');
        c.hp = 10 + c.trait('Tough');

        if (ion.test(gangSpec.nicks)) {
            assignNickname(c);
        }
        // Remove food and personal items, because, it's dumb when gangs are carrying Twinkle Cakes.
        c.inventory.filter(isFoodOrPersonal);
        gang.add(c);
    });
    if (gangSpec.mil && gang.members.length) {
        rankPatrol(gangSpec.mil, gang);
    }
    gang.members.sort(function(a,b) {
        return a.initiative < b.initiative ? 1 : a.initiative > b.initiative ? -1 : 0;
    });
    return gang;
};