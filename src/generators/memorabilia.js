"use strict";

var ion = require('../ion');
var IonSet = require('../models/ion_set');
var Item = require('../models/item');
var timeSeries = require('./historical_time_series');
var RarityTable = require('../tables/rarity_table');

var comics = new RarityTable(ion.identity, false);
var newsPubs = new RarityTable(ion.identity, false);

// Sorts the titles of two collectibles by their assigned number in the set.
function seriesSorter(a, b) {
    var aNum = parseInt(/#(\d+)/.exec(a)[1], 10);
    var bNum = parseInt(/#(\d+)/.exec(b)[1], 10);
    return aNum - bNum;
}

function addNews(name, rarity, params) {
    var value = (rarity === "rare") ? 5 : (rarity === "uncommon") ? 3 : 1;
    timeSeries(params).forEach(function(date, i, coll) {
        newsPubs.add(rarity, {name: "news magazine", title: (name + ", " + date + ", #" + i + " of " + coll.length),
            enc: 1, value: value, tags: ['collectible']});
    });
}

function addComic(name, rarity, params) {
    var value = (rarity === "rare") ? 5 : (rarity === "uncommon") ? 3 : 1;
    timeSeries(params).forEach(function(date, i, coll) {
        comics.add(rarity, {name: "comic book", title: (name + ", " + date + ", #" + i + " of " + coll.length),
            enc: 1, value: value, tags: ['collectible']});
    });
}

function poster(collection, type, fileExt, value) {
    return collection.map(function(base, i) {
        var name = type + " poster";
        var title = ion.format("{0} #{1} of {2}", ion.titleCase(base.replace(/_/g," ")), (i+1), collection.length);

        return { name: name, title: title,
            image: "images/" + type + "/" + base + fileExt, value: value, enc: 1, tags: ['collectible']};
    });
}

var warTitles = ['am_i_proud', 'america_calling', 'are_you_playing_square', 'be_a_victory_farm_volunteer',
    'books_are_weapons_in_the_war_of_ideas', 'both_are_weapons', "carry_on_don't_be_carried_out",
    'do_the_job_he_left_behind', 'farm_scrap_builds_tanks_&_guns', 'fontana_dam', 'food_is_a_weapon',
    'food_is_fighting_strength', 'for_service_in_civilian_defense', 'forgetfulness_helps_the_enemy',
    'foxy_foreign_ideas', "free_speech_doesn't_mean_careless_talk", 'groundwork_for_victory', 'harvest_war_crops',
    'help_harvest', 'help_win_the_war', "here's_a_war_job_for_you", 'hunger_breeds_madness', 'is_your_trip_necessary',
    "it's_only_1000_minutes_from_cheyenned_to_berlin", 'join_the_schools_at_war_program', "my_tank's_in_the_war_too",
    'on_time_all_the_time', 'plan_a_victory_garden', 'plan_today_build_tomorrow', 'processed_food_is_ammunition',
    'rationing_means_a_fair_share_for_all_of_us', 'report_faulty_wiring', 'right_is_might', 'save_your_cans',
    'scrap', 'scrap_will_help_win', 'share_a_ride', 'share_your_car', 'shoot_to_kill', 'silence_means_security',
    'soldiers_without_guns', 'stamp_out_black_markets', 'sucker', 'take_your_place_in_civilian_defense',
    'the_2nd_front_depends_on_the_home_front', 'the_army_needs_more_lumber', 'the_inland_way_for_the_USA',
    'the_key_to_victory', 'the_world_cry_food', 'this_war', 'today', 'together_we_can_do_it', 'together_we_win',
    'vacation_at_home', 'victory_is_a_question_of_stamina', 'victory_patterns', 'wanted_for_victory',
    'washington_beckons_you', "we're_needed_again", 'we_are_helping_with_salvage', 'work_in_a_food_processing_plant',
    'your_country_needs_soybeans', 'your_victory_garden'];

var movieTitles = ['100_rifles', '23_paces_to_baker_street', 'aces_high', 'atomic_city', 'atomic_kid', 'atomic_man',
    'atomic_monster', 'atomic_submarine', 'bad_mans_river', 'bandolero', 'bullet_for_a_badman',
    'canadian_mounties_vs_atomic_invaders', 'cattle_empire', 'cheaper_by_the_dozen', 'count_five_and_die',
    'crack_in_the_mirror', 'day_of_the_triffids', 'desert_hell', 'dig_that_uranium', 'east_of_eden', 'emmanuelle',
    'england_made_me', 'family_doctor', 'frankenstein_and_the_monster_from_hell', 'gang_war', 'garden_of_evil',
    'gone_with_the_wind', 'guns_for_san_sebastian', 'hombre', 'hotel_sahara', 'impulse', 'in_love_and_war',
    'intent_to_kill', 'julius_caesar', 'junior_army', 'kiss_of_the_vampire', 'lion_of_the_desert', 'lost_lives',
    'man_hunt', 'moon_zero_two', 'night_was_our_friend', 'nor_the_moon_by_night', 'operation_uranium', 'pretty_poison',
    'return_of_the_texan', 'rocket_to_the_moon', 'rogues_yarn', 'sierra_baron', 'sumuru', 'sword_of_sherwood_forest',
    'teenage_rebel', 'the_black_castle', 'the_brass_bottle', 'the_chalk_garden', 'the_curse_of_the_mummys_tomb',
    'the_deep_blue_sea', 'the_dunwich_horror', 'the_fiend_who_walked_the_west', 'the_gamma_people', 'the_gift_of_love',
    'the_hallelujah_trail', 'the_hellfire_club', 'the_hound_of_the_baskervilles', 'the_legend_of_frenchie_king',
    'the_lieutenant_wore_skirts', 'the_long_hot_summer', 'the_man_who_never_was', 'the_man_with_the_x-ray_eyes',
    'the_many_loves_of_hilda_crane', 'the_mummy', 'the_raid', 'the_reward', 'the_riddle_of_the_sands',
    'the_sheriff_of_fractured_jaw', 'the_sleeping_tiger', 'the_sun_also_rises', 'the_viking_queen', 'the_wind_cannot_read',
    'the_young_warriors', 'them', 'three_little_girls_in_blue', 'uraniumboom', 'villa', 'wolf_dog'];

var encyclopedias = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII",
    "XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XIV"].map(function(numeral, i) {
    var letter = (i === 23) ? "XYZ" : String.fromCharCode(i + 65);
    var title = "Encyclopedia Britannica vol. " + numeral + ", letter "+letter+", #"+(i+1)+" of 24";
    return {name: "encyclopedia", title: title, value:10, enc:5, tags: ['collectible']};
});

var bbCards = {
    'Baltimore Orioles': ['George Zuverink', 'Jim Busby', 'George Kell', 'Joe Ginsberg', 'Billy O\'Dell', 'Joe Durham', 'Billy Gardner', 'Jerry Walker', 'Eddie Miksis', 'Ken Lehman', 'Bob Nieman', 'Willy Miranda', 'Art Ceccarelli', 'Jack Harshman', 'Frank Zupo', 'Al Pilaik', 'Connie Johnson', 'Bob Boyd', 'Brooks Robinson', 'Bert Hamric', 'Billy Loes', 'Hal Brown', 'Gene Woodling', 'Foster Castleman', 'Gus Triandos', 'Jim Marshall', 'Milt Pappas', 'Arnie Portocarrero', 'Lenny Green' ],
    'Boston Red Sox': [ 'Ted Williams', 'Frank Sullivan', 'Ted Lepcio', 'Dick Gernert', 'Dave Sisler', 'Pete Daley', 'Billy Klaus', 'Jackie Jensen', 'Billy Consolo', 'Frank Baumann', 'George Susce', 'Haywood Sullivan', 'Leo Kiely', 'Tom Brewer', 'Gene Stephens', 'Frank Malzone', 'Pete Runnels', 'Jim Piersall', 'Don Buddin', 'Ike Delock', 'Bob Porterfield', 'Mike Fornieles', 'Marty Keough', 'Lou Berberet', 'Willard Nixon', 'Murray Wall', 'Sammy White', 'Bob Smith', 'Bill Renna', 'Frank Malzone', 'Ted Williams', 'Jackie Jensen' ],
    'Chicago Cubs': ['Dale Long', 'Cal Neeman', 'Dave Hillman', 'Lee Walls', 'Dick Drott', 'Chuck Tanner', 'Bobby Adams', 'Walt Moryn', 'Moe Drabowsky', 'Bobby Morgan', 'Taylor Phillips', 'Elvin Tappe', 'Jim Bolger', 'Bob Anderson', 'Jerry Kindall', 'Dick Littlefield', 'Turk Lown', 'Sammy Taylor', 'Ernie Banks', 'Jim Brosnan', 'Don Elston', 'John Goryl', 'Tony Taylor', 'Bobby Thomson', 'Gene Fodge', 'Ed Mayer', 'Glen Hobbie', 'Ernie Banks' ],
    'Chicago White Sox': ['Jim Rivera', 'Ron H. Jackson', 'Billy Piee', 'Bill Fischer', 'Luis Aparicio', 'Early Wynn', 'Jim Landis', 'Jim Derrington', 'Earl Torgeson', 'Les Moss', 'Jim Wilson', 'Al Smith', 'Bob Keegan', 'Bubba Phillips', 'Billy Goodman', 'Ray Moore', 'Sherm Lollar', 'Dick Donovan', 'Tito Francona', 'Walt Dropo', 'Don Rudolph', 'Earl Battey', 'Nellie Fox', 'Jerry Staley', 'Dixie Howell', 'Sammy Esposito', 'Tom Qualters', 'Nellie Fox', 'Luis Aparicio', 'Sherm Lollar' ],
    'Cincinnati Reds': ['George Crowe', 'Bud Freeman', 'Bob Thurman', 'Smoky Burgess', 'Joe Nuxhall', 'Gus Bell', 'Jerry Lynch', 'Harvey Haddix', 'Stan Palys', 'Bob Henrich', 'Tom Acker', 'Dee Fondy', 'Don Hoak', 'Johnny Temple', 'Willard Schmidt', 'Bill Wight', 'Johnny Klippstein', 'Alex Grammas', 'Frank Robinson', 'Hal Jeffcoat', 'Bob Purkey', 'Ed Bailey', 'Steve Bilko', 'Roy McMillan', 'Brooks Lawrence', 'Charley Rabe', 'Dutch Dotterer', 'Vada Pinson', 'Pete Whisenant', 'Johnny Temple', 'Frank Robinson', 'Ed Bailey' ],
    'Cleveland Indians': [ 'Bob Lemon', 'Hal Naragon', 'Don Mossi', 'Roger Maris', 'Chico Carrasquel', 'Dick Williams', 'George Strickland', 'Dick Tomanek', 'Russ Nixon', 'Vic Wertz', 'Joe Caffie', 'Mike Gaia', 'Cal McLish', 'Bud Daley', 'Mickey Vernon', 'Larry Raines', 'Bobby Avila', 'Minnie Minoso', 'Hoyt Wilhelm', 'Fred Hatfield', 'Herb Score', 'Rocky Colavito', 'Billy Moran', 'Mudcat Grant', 'Larry Doby', 'Ray Narleski', 'Billy Harrell', 'Carroll Hardy', 'Dick Brown', 'Gary Geiger', 'Don Ferrarese', 'Herb Score' ],
    'Detroit Tigers': ['Billy Hoeft', 'J.W. Porter', 'Lou Sleater', 'Tim Thompson', 'Al Kaline', 'Steve Boros', 'Frank Bolling', 'Gus Zernial', 'Jim Bunning', 'Harry Byrd', 'Ray Boone', 'Bob Shaw', 'Red Wilson', 'Reno Bertoia', 'Frank Lary', 'Johnny Groth', 'Billy Martin', 'Paul Foytack', 'Gail Harris', 'Lou Skizas', 'Hank Aguirre', 'Jim Hegan', 'Tom Morgan', 'Charlie Maxwell', 'Bill Taylor', 'Harvey Kuenn', 'Charley Lau', 'Vito Valentinetti' ],
    'Kansas City Athletics': [ 'Alex Kellner', 'Bill Tuttle', 'Bob Martyn', 'Joe DeMaestri', 'Wally Burnette', 'Billy Hunter', 'Harry Chiti', 'George Brunet', 'Hector Lopez', 'Ralph Terry', 'Milt Graff', 'Woodie Held', 'Duke Maas', 'Tom Gorman', 'Hal W. Smith', 'Virgil Trucks', 'Ned Garver', 'Mike Baxes', 'Frank House', 'Bob Cerv', 'Murry Dickson', 'Jack Urban', 'Ray Herbert', 'Dave Melton', 'Vic Power', 'Preston Ward' ],
    'Los Angeles Dodgers': ['Charlie Neal', 'Don Drysdale', 'John Roseboro', 'Don Zimmer', 'Duke Snider', 'Sandy Amoros', 'Johnny Podres', 'Dick Gray', 'Gil Hodges', 'Sandy Koufax', 'Roger Craig', 'Rube Walker', 'Jim Gilliam', 'Don Demeter', 'Carl Erskine', 'Gino Cimoli', 'Randy Jackson', 'Clem Labine', 'Elmer Valo', 'Don Newcombe', 'Danny McDevitt', 'Joe Pignatano', 'Pee Wee Reese', 'Don Bessent', 'Carl Furillo', 'Ed Roebuck' ],
    'Milwaukee Braves': ['Lou Burdette', 'Felix Mantilla', 'Hank Aaron', 'Del Rice', 'Ernie Johnson', 'Bob Hazle', 'Johnny Logan', 'Frank Torre', 'Wes Covington', 'Don McMahon', 'Bob Taylor', 'Bob Buhl', 'Red Schoendienst', 'Andy Pafko', 'Carl Sawatski', 'Casey Wise', 'Bob Trowbridge', 'Warrenahn', 'Ray Shearer', 'Bob Rush', 'Joe Adcock', 'Bill Bruton', 'Del Crandall', 'Carl Willey', 'Gene Conley', 'Eddie Mathews', 'Harry Hanebrink', 'Joe Jay', 'Eddie Mathews', 'Hank Aaron', 'Warrenahn' ],
    'New York Yankees': ['Hank Bauer', 'Gil McDougald', 'Sal Maglie', 'Norm Siebern', 'Darrell Johnson', 'Johnny Kucks', 'Bobby Richardson', 'Tom Sturdivant', 'Enos Slaughter', 'Mickey Mantle', 'Don Larsen', 'Marv Throneberry', 'Jerry Lumpe', 'Bob Grim', 'Bill Skowron', 'Bob Turley', 'Elston Howard', 'Ryne Duren', 'Harry Simpson', 'Whitey Ford', 'Andy Carey', 'Art Ditmar', 'Yogi Berra', 'Al Cicotte', 'Tony Kubek', 'Bobby Shantz', 'Bill Skowron', 'Mickey Mantle', 'Bob Turley' ],
    'Philadelphia Phillies': ['Rip Repulski', 'Ted Kazanski', 'Chuck Harmon', 'Joe Lonnett', 'Dick Farrell', 'Robin Roberts', 'Dave Philley', 'Harry Anderson', 'Willie Jones', 'Jack Meyer', 'Solly Hemus', 'Richiehburn', 'Warren Hacker', 'Jack Sanford', 'Granny Hamner', 'Mack Burk', 'Don Landrum', 'Jim Hearn', 'Bob Miller', 'Chico Fernandez', 'Stan Lopata', 'Don Cardwell', 'Wally Post', 'Curt Simmons', 'Bob Bowman', 'Pancho Herrera', 'Chuck Essegian', 'Ray Semproch' ],
    'Pittsburgh Pirates': [ 'Hank Foiles', 'Dick Groat', 'Robertoemente', 'Roy Face', 'Ron Kline', 'Bob Skinner', 'Jim Pendleton', 'Vern Law', 'Buddy Pritchard', 'Don Gross', 'Ted Kluszewski', 'Bill Virdon', 'Dick Rand', 'Bob Smith', 'Bill Mazeroski', 'Paul Smith', 'Gene Freese', 'Whammy Douglas', 'Bob Friend', 'Harding Peterson', 'Gene Baker', 'Bennie Daniels', 'Frank Thomas', 'Johnny O\'Brien', 'John Powers', 'Danny Kravitz', 'Roman Mejias', 'Ron Blackburn', 'R.C. Stevens', 'Bob Friend' ],
    'San Francisco Giants': ['Willie Mays', 'Curt Balay', 'Mike McCormick', 'Darylencer', 'Valmy Thomas', 'Ozzie Virgil Sr.', 'Stu Miller', 'Willie Kirkland', 'Jim Finigan', 'Johnny Antonelli', 'Danny O\'Connell', 'Dave Jolly', 'Whitey Lockman', 'Pete Burnside', 'Don Mueller', 'Eddie Bressoud', 'Ray Crone', 'Ray Katt', 'Paul Giel', 'Jim King', 'Ruben Gomez', 'Orlando Cepeda', 'Ray Jablonski', 'Hank Sa', 'Marv Grissom', 'Jim Davenport', 'Al Worthington', 'Bobeake', 'Ray Monzant', 'Bob Schmidt', 'Willie Mays' ],
    'St. Louis Cardinals': ['Eddie Kasko', 'Hobie Landrith', 'Morrie Martin', 'Del Ennis', 'Von McDaniel', 'Larry Jackson', 'Dick Schofield', 'Irv Noren', 'Alvin Dark', 'Billy Muffett', 'Joe Cunningham', 'Lindy McDaniel', 'Don Blasingame', 'Wally Moon', 'Lloyd Merritt', 'Herm Wehmeier', 'Hal R. Smith', 'Sam Jones', 'Ken Boyer', 'Gene Green', 'Wilmer Mizell', 'Bobby Gene Smith', 'Philark', 'Phil Paine', 'Joe Taylor', 'Curt Flood' ],
    'Washington Senators': ['Jim Lemon', 'Texevenger', 'Art Schult', 'Bud Byerly', 'Clint Courtney', 'Herb Plews', 'Bob Usher', 'Russ Kemmerer', 'Dick Hyde', 'Eddie Yost', 'Milt Bolling', 'Camilo Pascual', 'Ed Fitz Gerald', 'Chuck Stobbs', 'Roy Sievers', 'Rocky Bridges', 'Harmon Killebrew', 'Neil Chrisley', 'Albie Pearson', 'Pedro Ramos', 'Bobby Malkmus', 'Ralph Lumenti', 'Steve Koheck', 'Kenpromonte', 'Norm Zauchin', 'Whitey Herzog', 'Hal Griggs', 'Julio Becq' ]
};

var i=1;
var baseball = [];
Object.keys(bbCards).forEach(function(team) {
    bbCards[team].forEach(function(player) {
        var name = "Pennant brand 1958 baseball card{|s}";
        var title = player + ", " + team + ", #"+(i++)+" of 466";
        baseball.push({name: name, title: title, enc: 0, value: 3, tags: ['collectible']});
    });
});

// Survival books... however, many of these are from after the 50s. The titles are good though.
// Need other things that are more survival oriented because this is not really relevant in the
// time period of these games.

// "Medical Planning & Response Manual for a Nuclear Detonation Incident: A Practical Guide"
// "Nuclear Dangers: Myths and Facts"
// "Nuclear Detonation Preparedness"
// "Nuclear War Survival Skills"
// "Nuclear War Survival"
// "Planning Guidance for Response to a Nuclear Detonation"
// "Protection in the Nuclear Age"
// "Recovery from Nuclear Attack"
// "U.S. Army Survival Manual"

// specific books or book collections
// maps
// comics
// disney pins... renaming everything of course. total insanity [https://en.wikipedia.org/wiki/Disney_pin_trading]
// films. The actual cans of film. Usually two rolls. Any poster could also have a film, vice versa.
// records. and, record players. and, electricity.
// other mags: Popular Science, Science Digest, Mechanix Illustrated, National Geographic

// Luxury goods (not considered collectibles):
// bottles of wine, whiskey, other fine liquors
// gold. silver. platinum, semi-precious jewels, watches
// bicycles
// fountain pens. paper, writing implements
// tools
// weapons

addNews("Atlantic Dispatch Magazine", "uncommon", {period: 'weekly'});
addNews("The Weekly Nation", "uncommon", {period: 'weekly', dayOfWeek: 'Monday', startDate: '1953-12-31'});
addNews("Verve", "common", {period: 'monthly', format: 'short', dayOfWeek: 'Thursday'});
addComic("Atomic War Comics", "common", {period: 'bimonthly', startDate: '1953-11-31', format: 'short'});
addComic("Atomic Age Combat", "uncommon", {period: 'monthly', startDate: '1956-11-31', format: 'short'});
addComic("The Adventures of Captain Atom", "common", {period: 'monthly', format: 'short'});
addComic("Space Action", "common", {period: 'monthly', format: 'short'});
addComic("Giggle Comics", "common", {period: 'weekly'});
addComic("Midnight Mystery", "uncommon", {period: 'biweekly', startDate: '1955-06-06'});
addComic("The Hand of Fate", "common", {period:"monthly", format: "short"});
addComic("Black Cobra", "rare", {period:"monthly", format:"short"});
addComic("The Flame", "uncommon", {period:"monthly", format:"short"});
addComic("Forbidden Worlds", "uncommon", {period:"monthly", format:"short"});
addComic("Battlefield Action", "uncommon", {period:"monthly", format:"short"});
addComic("War Stories", "common", {period:"weekly", startDate: '1956-02-15'});
addComic("Blazing West", "common", {period:"bimonthly", startDate: '1948-10-10'});
addComic("Madhouse Comics", "rare", {period:"monthly", format:"short"});
addComic("Wonder Boy", "uncommon", {period:"monthly", format:"short"});

var collectibles = {
    "movie posters": poster(movieTitles, "movie", ".jpg", 10),
    "propaganda posters": poster(warTitles, "propaganda", ".gif", 10),
    "encyclopedias": encyclopedias,
    "baseball cards": baseball,
    "news magazines": newsPubs,
    "comics": comics
};

/**
 * Create an item of memorabilia. These items are collectibles, worth a great deal of money
 * in sets or when traded with the right collector.
 *
 * @static
 * @method createMemorabilia
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.type='movie posters'] {String} the type of collectible item to
 *          return.
 * @return {atomic.models.Item} a collectible item
 */
/**
 * Create an item of memorabilia. These items are collectibles, worth a great deal of money
 * in sets or when traded with the right collector.
 *
 * @static
 * @method createMemorabilia
 * @for atomic
 *
 * @param [type] {String} type - the type of memorabilia to generate (random if not specified)
 * @return {atomic.models.Item} a collectible item
 */
function createMemorabilia(params) {
    var type = (ion.isString(params)) ? params : (params && params.type || ion.random(getMemorabiliaTypes()));

    if (!collectibles[type]) {
        throw new Error(type + " is an invalid collectible, use " + Object.keys(collectibles).join(', '));
    }
    var source = collectibles[type];
    if (source instanceof RarityTable) {
        return new Item(source.get());
    }
    return new Item(ion.random(source));
}

/**
 * Return the valid types of memorabilia that can be used when calling `createMemorabilia`.
 *
 * @static
 * @method getMemorabiliaTypes
 * @for atomic
 *
 * @return {Array} an array of string types that can be used to generate a collectible.
 */
function getMemorabiliaTypes() {
    return Object.keys(collectibles);
}

/**
 * Memorabilia is generally not very valuable unless a collector can be found who values it as part of
 * a larger collection. Toward that end, this method creates a "pick list" of desirable instances of a
 * type of memorabilia (volumes of an encyclopedia, posters for specific movies, etc.). If a character has
 * one of these desirable items to trade, and knows or senses it is in demand, the value is greatly increased.
 *
 * @static
 * @method createMemorabiliaWanted
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.type] {String} the type of collectible item to return. Picks a random type if
*              none is specified.
 * @return {String} a description of what is being sought out for trade
 */
function createMemorabiliaWanted(params) {
    var type = (ion.isString(params)) ? params : (params && params.type || ion.random(Object.keys(collectibles)));
    var coll = collectibles[type];
    var count = Math.floor(ion.gaussian(coll.length/8,coll.length/4));

    // collects a team rather than individual cards.
    if (type === "baseball  cards" && ion.test(20)) {
        var team = ion.random(Object.keys(bbCards));
        return "Collector is looking for any team baseball card for the " + team + ".";
    }

    var set = new IonSet();
    while(set.size() < count) {
        set.add(ion.random(coll).title);
    }
    var titles = set.toArray();
    titles.sort(seriesSorter);

    return "Collector is looking for " + type + ": " + titles.join(", ") + ".";
}

module.exports = {
    createMemorabilia: createMemorabilia,
    getMemorabiliaTypes: getMemorabiliaTypes,
    createMemorabiliaWanted: createMemorabiliaWanted
};
