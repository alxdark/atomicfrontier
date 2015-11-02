"use strict";

var ion = require('../ion');
var Name = require('../models/name');

// TODO? Other peoples, Asian, American Indian, that would be in the southwest.

var names = {
    "anglo male" : [ "Al", "Andy", "Arnie", "Art", "Austin", "Bart", "Beau", "Ben", "Bert", "Bob", "Brad",
        "Bradley", "Brock", "Bruce", "Bud", "Burt", "Caleb", "Calvin", "Carl", "Cecil", "Chuck", "Clayton",
        "Cliff", "Conrad", "Cooper", "Cyril", "Dakota", "Dallas", "Dalton", "Dan", "Dawson", "Dean", "Destry",
        "Don", "Doug", "Dwain", "Earl", "Ed", "Errol", "Floyd", "Frank", "Fred", "Gage", "Garth", "Gavin",
        "Gene", "Glen", "Grady", "Greg", "Gus", "Guy", "Hal", "Hank", "Harlan", "Holden", "Hoyt", "Hudson",
        "Hugh", "Huxley", "Ian", "Isaac", "Jack", "Jake", "Jason", "Jeremy", "Jerry", "Jethro", "Joe", "John",
        "Johnny", "Ken", "Kirk", "Kurt", "Kyle", "Larson", "Levi", "Lloyd", "Luke", "Lyle", "Mack", "Mark",
        "Marty", "Mason", "Matt", "Max", "Merle", "Nate", "Ned", "Neil", "Nick", "Norm", "Otis", "Pat", "Phil",
        "Ray", "Reed", "Rex", "Rick", "Rod", "Rodger", "Roy", "Russell", "Sam", "Scott", "Slim", "Stan",
        "Stratton", "Ted", "Tim", "Todd", "Tony", "Travis", "Tyler", "Vern", "Wade", "Wally", "Ward", "Wesley",
        "Will", "Wyatt" ],
    "anglo female" : [ "Ada", "Agnes", "Alice", "Amy", "Ann", "Au{b|d}rey", "Barb", "Becky", "Betty", "Bev", "Carol",
        "Cindy", "Clara", "Darla", "Diane", "Dona", "Doris", "Edith", "Edna", "Eileen", "Ella", "Ellen",
        "Emma", "Emily", "Erma", "Esther", "Ethel", "Eva", "Fay", "Flo", "Flora", "Gail", "Grace", "Gwen",
        "Hazel", "Helen", "Holly", "Ida", "Ilene", "Irene", "Iris", "Irma", "Jan", "Jane", "Janet", "Janis",
        "Jean", "Joan", "Judy", "June", "Kathy", "Kay", "Lena", "Linda", "Lois", "Lorna", "Lucy", "Mabel",
        "Mae", "Mary", "Mavis", "Nina", "Nora", "Norma", "Olga", "Pam", "Patty", "Paula", "Pearl", "Rita",
        "Rose", "Ruth", "Sally", "Sara", "Stella", "Sue", "Sybil", "Tina", "Trudy", "Velma", "Vera", "Viola",
        "Wanda", "Wilma" ],
    "hispanic male" : [ "Alonso", "Bruno", "Camilo", "Carlos", "Dante", "Diego", "Emilio", "Felipe", "Franco",
        "Iker", "Jacobo", "Javier", "Jorge", "Jose", "Juan", "Julian", "Lucas", "Luis", "Manny", "Manuel",
        "Mario", "Mateo", "Matias", "Miguel", "Pablo", "Pedro", "Rafael", "Samuel", "Sergio", "Tomas", "Elias" ],
    "hispanic female" : [ "Abril", "Alexa", "Alma", "Ana", "Ariana", "Ashley", "Bianca", "Camila", "Carla",
        "Elena", "Emilia", "Isabel", "Jimena", "Julia", "Luana", "Lucia", "Maite", "Malena", "Maria", "Mia",
        "Regina", "Renata", "Sofia", "Sophie", "Valery" ],
    "anglo" : [ "Adams", "Alexander", "Anderson", "Bailey", "Baker", "Barnes", "Barton", "Bell", "Bennett",
        "Brooks", "Brown", "Bryant", "Butler", "Campbell", "Carter", "Clark", "Cleaver", "Coleman", "Collins",
        "Cook", "Cooper", "Cox", "Davis", "Edwards", "Evans", "Flores", "Foster", "Gray", "Green", "Griffin",
        "Hall", "Harris", "Haskell", "Henderson", "Hill", "Howard", "Hughes", "Jackson", "James", "Jenkins",
        "Reed", "Richardson", "Roberts", "Robinson", "Rogers", "Ross", "Russell", "Sanders", "Scott", "Simmons",
        "Smith", "Stewart", "Taylor", "Thomas", "Thompson", "Turner", "Walker", "Ward", "Washington", "Watson",
        "White", "Williams", "Wilson", "Wood", "Wright", "Hayes" ],
    "hispanic" : [ "Aguilar", "Aguirre", "Alvarado", "Alvarez", "Avila", "Barrera", "Cabrera", "Calaveras",
        "Calderon", "Camacho", "Campos", "Cardenas", "Carrillo", "Castaneda", "Castillo", "Castro",
        "Cervantes", "Chavez", "Contreras", "Cortez", "Delacruz", "Deleon", "Diaz", "Dominguez", "Escobar",
        "Espinoza", "Estrada", "Fernandez", "Flores", "Fuentes", "Gallegos", "Garcia", "Garza", "Gomez",
        "Gonzales", "Guerra", "Guerrero", "Gutierrez", "Guzman", "Hernandez", "Herrera", "Ibarra", "Jimenez",
        "Juarez", "Lopez", "Lozano", "Macias", "Marquez", "Martinez", "Medina", "Mejia", "Melendez", "Mendez",
        "Mendoza", "Mercado", "Miranda", "Molina", "Montoya", "Morales", "Moreno", "Navarro", "Ochoa",
        "Orozco", "Ortega", "Ortiz", "Pacheco", "Padilla", "Perez", "Ramirez", "Ramos", "Reyes", "Rivera",
        "Rodriguez", "Romero", "Rosales", "Ruiz", "Salas", "Salazar", "Salinas", "Sanchez", "Sandoval",
        "Santiago", "Serrano", "Silva", "Suarez", "Torres", "Trevino", "Trujillo", "Valdez", "Valencia",
        "Vargas", "Vasquez", "Velasquez", "Velez", "Villarreal", "Zamora" ]
};
function getGivenName(gender, race) {
    // 35% of hispanic folks have an anglo given name.

    // var baseKey = ion.test(35, race === "hispanic") ? "anglo {0}" : "{1} {0}";
    // var key = ion.format(baseKey, gender, race);
    // return ion.random(ion.names[key]);
    return ion.random(names[ion.format((race === "hispanic" && ion.test(35)) ? "anglo {0}" : "{1} {0}", gender, race)]);
}
function getFamilyName(race) {
    return ion.random(names[race]);
}

/**
 * Generate a random name for a mid-century American, of the kind that would be
 * wandering around an atomic era apocalypse.
 * @example
 *     var girl = atomic.createCharacterName({gender: "female"})
 *     girl.toString()
 *     => "Ada King"
 *     girl = atomic.createCharacterName({gender: "female", race: "hispanic"})
 *     girl.toString()
 *     => "Elena Silva"
 *
 * @static
 * @method createCharacterName
 * @for atomic
 *
 * @param [params] {Object}
 *     @param [params.gender] {String} "male" or "female" name. Optional. If not specified, gender is 50/50.
 *     @param [params.race] {String} "anglo" or "hispanic" (Optional. If not specified, 20% of names are Hispanic).
 *     @param [params.given] {String} set the given name to this name
 *     @param [params.family] {String} set the family name to this name
 * @return {atomic.models.Name}
 */
module.exports = function(opts) {
    opts = opts || {};
    // Both of these are already specified in the character constructor and can be overwritten
    // by the caller, but happen here again for convenience.
    var gender = opts.gender || (ion.test(50) ? "male" : "female");
    var race = opts.race || (ion.test(20) ? "hispanic" : "anglo");

    return new Name({
        given: opts.given || getGivenName(gender, race),
        family: opts.family || getFamilyName(race)
    });
};
