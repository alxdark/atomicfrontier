var ion = require('../ion');
var Table = require('../tables/table');
var RarityTable = require('../tables/rarity_table');
var createCharacterName = require('../generators/character_name');

// Not thrilled with these, just because they're not easily role-played.
/* This came from somewhere but I've now lost the reference. Grr.
 var adjectives = [ "Addict", "Agoraphobic", "Ambitious", "Anarchist",
 "Annoying", "Apologetic", "Argumentative", "Arrogant",
 "Authoritarian", "Bad Loser", "Beatnik", "Bitter",
 "Bleeding Heart", "Blind Follower", "Blunt", "Born Again",
 "Brainiac", "Brave", "Brutally Honest", "Buffoon", "Busybody",
 "Cautious", "Charlatan", "Civilised", "Claustrophobic", "Clumsy",
 "Cold", "Competitive", "Complainer", "Confident", "Conformist",
 "Conniver", "Considerate", "Cool Under Fire", "Cowardly",
 "Creative", "Curious", "Curmudgeon", "Cynical", "Defeatist",
 "Determined", "Devil's Advocate", "Diplomatic", "Disorganised",
 "Distracted", "Drunk", "Drunkard", "Easy Going", "Efficient",
 "Egotistical", "Ends Justifies the Means",
 "Fascinated by the Exotic", "Flirt", "Forgiving ", "Freeloader",
 "Friendly", "Generous", "Gentle", "Good Samaritan", "Gossip",
 "Greedy", "Gregarious", "Grouchy", "Happy", "Happy-Go-Lucky",
 "Hard of Hearing", "Hardened", "Hates Robots", "Hedonist",
 "Honest", "Hopeless Romantic", "Hot Tempered", "Idealistic",
 "Ignorant", "Impatient", "Impulsive", "Intellectual",
 "Know-It-All", "Knucklehead", "Lazy", "Liar", "Loud Mouth",
 "Loyal", "Machiavellian", "Manic-Depressive", "Manipulator",
 "Mischievous", "Modest", "Naive", "Neatnik", "Nervous",
 "Non-Committal", "Nosy", "Optimist", "Overanalytical", "Pacifist",
 "Paranoid", "Perfectionist", "Pessimist", "Philosophical",
 "Practical", "Principled", "Progressive", "Proud", "Rationalist",
 "Rebel", "Rebel without a Clue", "Reckless", "Relaxed",
 "Reluctant", "Sarcastic", "Scatter Brain",
 "Seen a Lot of Strange Stuff", "Selfish", "Sensitive", "Serious",
 "Sheltered Upbringing", "Short Tempered", "Show Off", "Shy",
 "Skeptic", "Slapdash", "Slob", "Sour Puss", "Stubborn",
 "Stutterer", "Superstitious", "Suspicious", "Talkative",
 "Tattletale", "Technophobic", "Teetotaler", "Thespian",
 "Traditionalist", "Treacherous", "Trusting", "Uncertain",
 "Unflappable", "Unpredictable", "Unprincipled", "Vengeful",
 "Wallflower", "Weak Willed", "Wisecracker" ];
 */

// TODO: Multiple tattoos, adjectives, etc.
var sailorTats = [
    'a sailing ship with the words "Homeward Bound" below it',
    'an anchor'
];
var milTats = [
    'an American {flag|eagle}',
    'an eagle carrying an American flag'
];
var tats = [
    'a skull{| in flames| with wings| and crossbones}',
    'a chinese dragon',
    'a {black panther|tiger|lion|wolf}',
    'a mermaid',
    'a snake wrapped around a {cross|rose}',
    'a pair of dice',
    'a four leaf clover with the word "lucky" across it',
    'a heart with the name "{name}" across it',
    'the name "{name}"',
    '{a crystal|an eight} ball',
    'a {star|cross|phoenix|lion|tiger|crown|fish|scorpion|lucky clover|yin-yang symbol}',
    'an {angel|anchor|ankh}',
    'a heart and dagger',
];
var maleTats = [
    'a{| blonde| brunette| redhead} pin-up {girl|cowgirl}',
    'a pin-up girl {in a sailor\'s suit|in a WAC uniform|in a space suit}',
    'a woman on a clamshell'
];
var femaleTats = [
    'a {butterfly|swallow|dragonfly|rose|fairy|heart|lotus flower}',
    'two intertwined roses'
];
var injuries = [
    'missing a tooth',
    'missing {possessive} {left|right} {ear|foot|hand}',
    'has been burnt on {possessive} {left|right} arm',
    'walks with a limp',
    'wears an eyepatch',
    'cast on {left|right} arm',
    'scar on {possessive} {left|right} arm',
    'scar on {left|right} side of {possessive} {leg|torso|face}'
];
var prosthetics = [
    'hook for a {right|left} hand',
    'artificial {hand|leg|arm}',
    'glass eye'
];
var behaviors = [
    "will {be very loyal to|betray or abandon} the players in a crisis",
    "will trade generously with players",
    "will demand compensation for minor tasks",
    "if angered, will drag the player group into unnecessary fights",
    "will fight to the death if necessary",
    "if left alone, will {drink|gamble} away any money {personal} has",
    "will expect {a share in profits|payment} to join the group",
    "smokes when {personal} can get them",
    "values fine wines and liquors",
    "chews gum when {personal} can get it"
];

// "has a child but avoids the responsibility of being a parent"
// "will only stay with the party long enough to save money to travel {out west|east}"
// "if included as a member of the group, will sacrifice or bear any burden"
// "will start a fight with anyone not pulling their own weight"
// "hates off-road travel and will fight to avoid it"
// "always lobbies for one more scavenging trip, just to be sure"

var statureTable = new Table()
    .add(10, "tall stature")
    .add(10, "short stature")
    .add(5, "short and heavy-set")
    .add(5, "tall and heavy-set")
    .add(70, null);

// Adjusts a smidge for Hispanic hair color, below
var hairColor = new Table()
    .add(15, "black")
    .add(50, "brown")
    .add(15, "blond")
    .add(3, "red")
    .add(10, "auburn (brownish-red)")
    .add(7, "chestnut (reddish-brown)");

// Any long hair?
var maleHairStyle = new Table()
    .add(30, "{0} crew cut haircut")
    .add(25, "{0} side part haircut")
    .add(25, "{0} ivy league haircut")
    .add(20, "{0} pompadour haircut");

// Thank god for Wikipedia:
// http://en.wikipedia.org/wiki/Hairstyles_in_the_1950s
// Many of the women's hairstyles == short hair, with crazy names and slight alterations
var femaleHairStyle = new RarityTable()
    .add('common', "bobbed {0} hair")
    .add('common', "short {curly|straight} {0} hair")
    .add('uncommon', "long {curly|wavy|straight} {0} hair, usually worn {in a ponytail|under a scarf|in a bun}")
    .add('uncommon', "{0} pageboy haircut")
    .add('rare', "long {curly|wavy|straight} {0} hair")
    .add('rare', "cropped {0} hair");

function hairStyle(character, statements) {
    var color = hairColor.get();
    var string = null;
    if (character.race === "hispanic" && color === "blond") {
        color = ion.random(["brown","black"]);
    }
    if (character.age > 40 && ion.test(character.age)) {
        color = ion.random(["gray","silver","white"]);
    }
    // So, I wanted dudes with mohawks.
    if (character.is('low') && character.male && character.age < 30 && ion.test(25)) {
        string = "{0} mohawk";
    } else {
        string = (character.male) ? maleHairStyle.get() : femaleHairStyle.get();
    }
    statements.push(ion.resolve(string, color));
}

function stature(character, app) {
    var stat = statureTable.get();
    if (stat) {
        app.push(stat);
    }
}

function markings(character, app) {
    // A little over-elaborated.
    var chanceGlasses = character.has('glasses') ? 70 : 10;
    if (ion.test(chanceGlasses)) {
        if (ion.test(20)) {
            app.push(character.male ? "wears browline glasses" : "wears cat eye glasses");
        } else if (ion.test(30)) {
            app.push("wears horn-rimmed glasses");
        } else {
            app.push("wears glasses");
        }
    }

    // Totally heterosexist. Write something different and send to me.
    // Also, this is out of all proportion to the value it brings to the table...
    var chanceTattoos = (character.has('tattoos') ||
    character.has('military:tattoos') ||
    character.has('sailor:tattoos')) ? 30 : 5;

    chanceTattoos += (character.male) ? 15 : 0;
    if (ion.test(chanceTattoos)) {
        var tattoo = null,
            name = createCharacterName({gender: character.male ? "female" : "male"}).given;

        if (character.has('military:tattoo') && ion.test(80)) {
            tattoo = milTats;
        } else if (character.has('sailor:tattoo') && ion.test(80)) {
            tattoo = sailorTats;
        } else if (character.male && ion.test(20)) {
            tattoo = maleTats;
        } else if (!character.male && ion.test(20)){ // TODO ion.test(20, !character.male)
            tattoo = femaleTats;
        } else {
            tattoo = tats;
        }
        tattoo = ion.resolve(tattoo, {name: name});

        var string = ion.format("has a tattoo of {0} on {1} {2} {3}",
            tattoo,
            character.possessive,
            ion.random(['left', 'right']),
            ion.random(['shoulder','bicep','forearm','arm']));
        app.push(string);
    }

    var injuryChance = character.has('injuries') ? 15 : 3;
    if (ion.test(injuryChance)) {
        app.push(ion.resolve(injuries, character));
    }

    var prosthChance = character.has('prosthetics') ? 5 : 1;
    if (ion.test(prosthChance)) {
        app.push(ion.resolve(prosthetics, character));
    }
}
function adjective(character, statements) {
    // Do not like the adjectives. Will only use behaviors, and greatly expand them.
    // Adjectives are not enough to describe how an NPC will act in a game.
    if (ion.test(30)) {
        statements.push(ion.resolve(behaviors, character));
    } /*else {
     statements.push(ion.random(adjectives));
     }*/
}

/**
 * Describe a character's appearance and behavior. This description will be different
 * each time the character is passed to this function.
 * @example
 *     atomic.createAppearance(character)
 *     => "Long brown hair, short stature"
 *
 * @static
 * @method createAppearance
 * @for atomic
 *
 * @param character {atomic.models.Character} The character to describe.
 * @return {String} A description of the appearance and behavior of the character
 */
module.exports = function(character) {
    if (!character) {
        throw new Error("Character required");
    }
    var app = [];
    var statements = [];
    hairStyle.call(this, character, app);
    stature.call(this, character, app);
    markings.call(this, character, app);
    adjective.call(this, character, statements);

    return [app, statements].reduce(function(array, subarray) {
        if (subarray.length) {
            array.push(ion.sentenceCase(subarray.join(', ')));
        }
        return array;
    }, []).join('. ');
};
