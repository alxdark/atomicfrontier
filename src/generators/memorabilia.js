"use strict";

var ion = require('../ion');
var Item = require('../models/item');

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
    'atomic_monster', 'atomic_submarine', 'atomictpistols', 'bad_mans_river', 'bandolero', 'bullet_for_a_badman',
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

function poster(collection, type, fileExt, value) {
    return collection.map(function(title, i) {
        return new Item({ name: namer(title, type, i, collection.length),
            image: "images/" + type + "/" + title + fileExt, value: value, enc: 1 });
    });
}

function namer(base, type, count, total) {
    var title = ion.titleCase(base.replace(/_/g," "));
    return ion.format("{|}{0} {1} poster collectible (#{2} of {3})", title, type, (count+1), total);
}

var encyclopedias = ["I","II","III","IV","V","VI","VI","VII","VIII","IX","X","XI","XII","XIII",
    "XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XIV"].map(function(numeral, i) {
    var letter = (i === 23) ? "XYZ" : String.fromCharCode(i + 65);
    var name = "{|}Encyclopedia Britannica, vol. " + numeral + " (letter "+letter+", collectible #"+(i+1)+" of 24)";
    return new Item({name: name, value:10, enc:5});
});

// "Nuclear War Survival Skills" -- this one is still in print, not government
// "Nuclear Dangers: Myths and Facts"
// "Planning Guidance for Response to a Nuclear Detonation" (National Security Interagency Policy Coordination Subcommittee)
// "Nuclear Detonation Preparedness"
// "U.S. Army Survival Manual"

// FEMA Nuclear War Survival
// Nuclear Detonation Preparedness from REMM.gov

// magazines, comics, other serials
// specific books or book collections
// specific kinds of electronic or mechanical parts
// baseball cards

var collectibles = {
    movies: poster(movieTitles, "movie", ".jpg", 10),
    propaganda: poster(warTitles, "propaganda", ".gif", 10),
    encyclopedia: encyclopedias
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
 *      @param [params.type='movies'] {String} the type of collectible item to
 *          return.
 * @return {atomic.models.Item} a collectible item
 */
function createMemorabilia(params) {
    params = ion.isString(params) ? {type:params} : (params || {type:"movies"});

    if (!collectibles[params.type]) {
        throw new Error(params.type + " is an invalid collectible, use " + Object.keys(collectibles).join(', '));
    }
    return ion.random(collectibles[params.type]);
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
 * To get the full value of memorabilia that is collected, it mus be traded to someone who values
 * it and collects it. Such collectors will be looking for specific instances that they will value
 * much more than other instances they already own. This method creates such a "pick list" for a
 * trader.
 * @static
 * @method getMemorabiliaWanted
 * @for atomic
 *
 * @param [params] {Object} params
 *      @param [params.type='movies'] {String} the type of collectible item to
 *          return.
 * @return {Array} an array of item names specifically being looked for.
 */
function getMemorabiliaWanted() {

}

module.exports = {
    createMemorabilia: createMemorabilia,
    getMemorabiliaTypes: getMemorabiliaTypes
};

