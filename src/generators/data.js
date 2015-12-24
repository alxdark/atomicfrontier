var ItemDatabase = require('../db/item_database');
var ProfessionDatabase = require('../db/profession_database');
var StoreDatabase = require('../db/store_database');
var AtomicProfession = require('../models/atomic_profession');

var idb = new ItemDatabase(['ammo','ammo:22','ammo:30','ammo:308','ammo:357','ammo:38','ammo:44','ammo:45','ammo:fusion','ammo:laser','ammo:pulse','ammo:shell','armor','agricultural','automotive','civic','criminal','garage','hospital','house','industrial','institution','lodging','military','office','public','research','restaurant','school','tourism','travel','br','bundled','heavy','nobr','unique','accessories','body','coat','feet','head','con','con:35mm','con:battery','con:polaroid','food','fresh','meat','prepared','preserved','ration','common','rare','uncommon','female','male','alcohol','camping','cash','clothing','communications','container','currency','drug','electronics','explosive','jewelry','medical','pottery','publication','sport','tool','toy','kit:courier','kit:craftsperson','kit:doctor','kit:electrician','kit:gunslinger','kit:homesteader','kit:leader','kit:mechanic','kit:miner','kit:personal','kit:police','kit:raider','kit:rancher','kit:scavenger','kit:scientist','kit:settler','kit:soldier','kit:thief','kit:trader','kit:vagrant','hand','huge','large','medium','miniscule','small','tiny','luxury','scifi','secured','useful','firearm','melee','pistol','rifle','shotgun','smg']);
idb.register(
    "$1 bill!.01!0!51 58 62",
    "$1 casino chip!1!0!53 62",
    "$10 bill!.1!0!53 58 62",
    "$10 casino chip!10!0!53 62",
    "$100 bill!1!0!52 58 62",
    "$20 bill!.2!0!53 58 62",
    "$25 casino chip!25!0!52 62",
    "$5 bill!.05!0!51 58 62",
    "$5 casino chip!5!0!52 62",
    ".22 caliber bullet!1!.5!53 0 1",
    ".30 caliber bullet!1!.5!53 0 2",
    ".357 caliber bullet!1!.5!53 0 4",
    ".38 caliber bullet!1!.5!53 0 5",
    ".44 caliber bullet!1!.5!53 0 6",
    ".45 caliber bullet!1!.5!53 0 7",
    "American flag!1!3!51 15 21 23 25 28 35",
    "Boss of the Plains hat!2!.5!52 59 40 79 88 55 25",
    "Dutch Lad snack cake!6!1!52 45 19 100 49",
    "Kit-Cat klock; Tiki statue!1!3!53 19 ",
    "Kooba Kid comic book; Bubbles and Yanks comic book; Volto from Mars comic book; Clutch Cargo comic book!6!.5!52 17 19 82 69",
    "M1 Rifle; M1 Carbine!12!10!52 2 31 104 89 107",
    "M14 Rifle!12!10!52 3 31 104 89 107",
    "M1911 Pistol!9!3!52 7 31 104 79 89 106",
    "Remington .44 Magnum Pistol; Smith & Wesson .44 Magnum Pistol; Colt .44 Magnum Pistol!9!3!52 6 31 104 73 77 79 81 83 84 86 88 91 106",
    "Remington 870 Shotgun; Winchester 1897 Shotgun; Winchester Model 12 Shotgun!9!10!52 11 31 104 17 19 73 81 83 84 86 88 91 108",
    "Remington Rifle!12!10!52 13 1 31 104 17 19 73 77 78 81 84 85 86 88 91 107",
    "Ruger .22 Pistol!9!3!52 1 31 104 75 81 87 88 90 91 106",
    "Ruger Single Six Revolver!9!3!52 1 31 104 73 81 85 86 88 91 92 106",
    "Smith & Wesson .357 Magnum Pistol; Colt .357 Magnum Pistol!9!3!52 4 31 104 77 79 81 83 84 86 88 90 91 106",
    "Smith & Wesson .38 Special Revolver; Colt Detective Special Revolver!9!3!52 5 31 104 73 74 75 76 79 80 81 83 86 88 90 91 106",
    "Smith & Wesson Service Revolver; Colt Service Pistol!9!3!52 7 31 104 73 74 75 76 80 81 83 86 87 88 91 92 106",
    "Springfield Rifle!12!10!52 2 31 104 73 77 86 89 107",
    "Thompson Submachine Gun; M3 Submachine Gun; Browning Automatic Rifle!12!10!52 7 31 104 89 109",
    "Twinkle Cake!3!1!53 45 19 49 28 29 30",
    "Winchester Rifle!12!10!52 13 3 31 104 17 19 73 77 78 81 85 86 88 91 107",
    "apple pie; cherry pie; peach pie!3!3!53 13 45 46 48 ",
    "apple; pear; nectarine; orange; peach{es}; plum!1!.5!51 45 46 88",
    "ashtray!1!1!51 19",
    "axe; pickaxe!3!20!53 13 57 17 33 81 105 71",
    "backpack!11!10!51 61 19 73 86 92 22 23  30 103",
    "bag{s} of sugar!11!3!52 45 19 49 103",
    "bandana; baseball cap!2!.5!51 59 54 40 19 73 74 76 78 80 81 84 85 86 88 90 92 55",
    "baseball bat!3!3!51 17 73 78 84 86 90 92 105 70",
    "baseball; softball; tennis ball!1!1!51 19 25 28  70",
    "batter{y|ies}!3!.5!53 41 43",
    "bayonet!3!1!51 89 105",
    "belt{s} with large silver buckle{s}!2!.5!53 36 59 77 85 55",
    "beret; boonie hat; garrison cap; patrol cap!2!.5!51 59 54 40 89 55 23",
    "boater's straw hat; Panama straw hat!2!.5!53 15 59 40 19 75 78 79 87 88 91 92 22 55 25",
    "bolo tie!2!.5!51 36 59 19 77 85 91 22 55 ",
    "book!1!3!51 69 28",
    "book{s} of cattle brands!1!1!51 85 35",
    "boomerang; bubble gum cigar; frisbee; hula hoop; Hopalong Cassidy cap gun; coonskin cap; slinky!1!3!53 19  72",
    "bottle{s} of milk!1!3!51 45 46 19 88",
    "bottle{s} of scotch; bottle{s} of whiskey; bottle{s} of vodka; bottle{s} of wine!13!10!53 56 63 19 82 100",
    "bowling ball!6!20!52 33 19 25 70",
    "box{es} of .22 ammo (20 rounds)!30!3!52 0 1 32",
    "box{es} of .30 ammo (20 rounds)!30!3!52 0 2 32",
    "box{es} of .308 ammo (20 rounds)!30!3!52 0 3 32",
    "box{es} of .357 ammo (20 rounds)!30!3!52 0 4 32",
    "box{es} of .38 ammo (20 rounds)!30!3!52 0 5 32",
    "box{es} of .44 ammo (20 rounds)!30!3!52 0 6 32",
    "box{es} of .45 ammo (20 rounds)!30!3!52 0 7 32",
    "box{es} of Sugar Jets cereal!3!3!53 45 19 49",
    "box{es} of Velveteena cheese!6!3!53 45 18 19 100 49 27",
    "box{es} of candies!9!3!52 19 100",
    "box{es} of candles!9!3!51 57 17 19 81 86 103",
    "box{es} of chocolates!6!3!52 45 19 100 49",
    "box{es} of hardtack!9!3!53 45 23 50 103",
    "box{es} of matches!3!.5!51 57 16 17 19 82 84 85 86 88 90 71 103",
    "box{es} of shotgun shells (20 shells)!30!3!52 0 11 32",
    "box{|es} of toaster pastries!3!3!53 45 19 49",
    "bracelet!10!1!53 66 102",
    "briefcase!1!10!51 31 15 24 25 26",
    "bucket hat; coonskin cap!2!.5!53 59 54 40 73 78 84 86 88 91 92 55",
    "bulletproof vest!11!10!53 12 31 16 83 86 89 103",
    "business suit!2!3!51 37 59 19 79 88 22 55",
    "butcher's kni{fe|ves}!3!3!51 19 88 105 27",
    "camera!3!3!53 31 42 82",
    "canteen; water bottle!1!3!51 82 23",
    "can{s} of Brylcreem!3!1!53 19 82",
    "can{s} of Fido dog food!3!3!51 45 19 47 49",
    "can{s} of Rinso Detergent!1!3!51 19",
    "can{s} of coffee; jar{s} of instant coffee!6!3!52 45 19 100 49",
    "can{s} of milk; can{s} of pork & beans; box{es} of crackers; can{s} of wham!3!3!51 45 19 49",
    "can{|s} of mace; can{|s} of pepper spray!3!1!53 74 75 76 79 80 87 88 90 105",
    "carton{s} of cigarettes!150!3!52 63 100",
    "casualwear outfit!2!3!51 37 59 54 19 88 22 55",
    "ceramic cup; ceramic plate; ceramic bowl; large ceramic bowl; pottery cup; pottery bowl; pottery vase; clay figurine!3!6!53 13 31 33 19 68 29",
    "cigarette lighter!3!.5!51 16 19 82 88 71 103",
    "clipboard!1!3!51 24",
    "coat; overcoat; parka; windbreaker!2!3!51 13 15 59 38 54 18 19 20 21 78 82 83 22 55 24 25 27 ",
    "coffee mug!1!1!51 19 24",
    "coffee pot!1!3!51 19",
    "coil{s} of rope (50 feet)!3!10!53 13 17  71",
    "comb; handkerchief!1!.5!51 19 82",
    "combat helmet!2!.5!51 12 59 54 40 84 86 89 55 23",
    "compass!6!.5!52 57 17",
    "cowboy hat!2!.5!51 13 59 54 40 77 85 55",
    "crowbar; tire iron!3!6!51 17 33 84 86 105 71",
    "crutch{es}!3!10!53 67",
    "dagger!3!1!51 77 84 86 88 89 90 105",
    "day pack!4!10!51 15 61 19 20 73 74 76 80 81 84 86 88 90 92 22 23 28  30 103",
    "day{s} of C rations!11!6!51 45 33 23 49 50 103",
    "death ray!27!3!52 8 31 104 106 26 101",
    "deck{s} of playing cards!6!1!51 16 19 82 103",
    "denim jacket!2!.5!51 59 38 54 74 76 80 90 92 55",
    "doctor's bag!2!10!51 36 59 61 54 18 75 55",
    "duster; buckskin coat; poncho!2!.5!53 13 59 38 54 73 77 84 85 91 55",
    "egg; potato{es}!1!.5!51 45 46",
    "empty fuel can!1!10!51 14 61 17 20 73",
    "fedora; flat cap; porkpie hat!2!.5!51 59 40 19 75 79 87 88 91 92 22 55 25  30",
    "fire axe!3!10!53 14 15 16 18 20 21 74 76 80 81 86 92 105 23",
    "fire extinguisher!1!15!51 14 15 16 33 18 20 21 22 23 24 25 26 28 30",
    "first aid kit!13!10!53 67 103",
    "flashlight!6!1!51 14 31 57 15 43 17 19 20 21 82 26  71 103",
    "floral dress; jumper{s} with {a |}blouse{s}; jumper{s} with {a |}T-shirt{s}; skirt{s} and blouse{s}; prairie skirt{s} and blouse{s}; shirtwaist dress!2!.5!51 37 59 54 74 75 78 79 87 88 91 92",
    "football; tennis racket!1!10!51 19 25 28  70",
    "force field belt!15!1!52 12 31 26 101",
    "gas mask!1!3!53 12 31 83 89 23",
    "geiger counter!11!3!53 31 64 20 81 86 87 89 26 71 103",
    "gold krugerrand!10!1!53 62 33 102",
    "gravity rifle!36!20!52 8 31 104 33 23 26 107 101",
    "hand grenade!5!1!53 65 84 86 89 23",
    "hard hat{s} with lamp{s}; hard hat!2!.5!53 59 54 40 20 81 55",
    "hockey mask!1!3!53 12 84",
    "hoe; rake; shovel!3!10!53 13 17 88 105 71",
    "holster!2!1!53 36 59 54 77 82 89 55 35",
    "house deed!6!1!52 102",
    "hunting kni{fe|ves}!3!1!51 77 78 79 85 86 88 91 92 105",
    "ice pick!3!20!53 17 33 105 71",
    "jar{s} of Ersatz instant coffee!6!3!52 15 45 19 100 24 49 30",
    "jar{s} of Gusto pasta sauce; box{es} of Gusto spaghetti; jar{s} of Gusto olives; box{es} of Gusto bread sticks; can{s} of Gusto ravioli!3!3!51 45 19 49 27",
    "jar{s} of jam!1!1!51 45 46 19 48 27",
    "jug{s} of moonshine!10!10!53 13 63 82",
    "jumpsuit; {|}work coveralls!2!3!51 13 14 37 59 54 20 21 74 76 80 81 86 55",
    "knife; fork; spoon!1!1!51 19 27",
    "lab coat!2!3!51 59 38 54 18 21 75 87 55 26",
    "lamb chop; {|}lamb ribs{|}; lamb roast; {|}lamb spareribs{|}!3!10!53 45 46 47",
    "lariat!1!3!51 85 35",
    "laser pistol!27!3!52 9 31 104 87 89 106 26 101",
    "laser rifle!36!10!52 9 31 104 89 26 107 101",
    "letter sweater!2!.5!53 59 38 54 88 55",
    "loa{f|ves} of bread!1!3!51 45 46 88 48",
    "lockpick set!11!1!52 16 90 71 103",
    "lunchbox{es}!3!10!53 19",
    "magazine!1!3!51 69 30",
    "medical brace!3!10!53 67",
    "metal detector!6!10!52 31 17 86 23  71 35",
    "military helmet!9!3!53 12 86 89 103",
    "motorcycle helmet; football helmet!9!3!53 12 17 84 86 103",
    "motorcycle jacket!10!3!53 59 38 54 17 73 77 84 86 55 103",
    "mouse trap!3!1!53 17 19 71",
    "necklace!12!1!53 66 102",
    "newspaper!1!3!51 14 15 16 17 18 19 20 21 22 23 24 25 69 27 29 30",
    "notebook; journal; sketchbook!6!3!52 14 15 18 19 21 82 23 24 26 28  29 35",
    "package{s} of hot dogs!3!3!51 45 47 49",
    "pack{s} of chemical light sticks (5 sticks)!8!1!53 57 17 73 76 80 81 83 86 92  71 103",
    "pack{s} of chewing gum; pack{s} of Blackjack chewing gum!6!.5!52 45 82 100 49 29 30",
    "pack{s} of cigarettes!13!1!53 63 82 100",
    "pair{s} of safety goggles!2!1!52 59 54 40 20 87 55 26",
    "peaked cap; campaign hat!2!.5!51 15 59 54 40 83 55",
    "pencil; pen!1!1!51 24 28",
    "pipe; chain!3!3!53 17 20 84 105",
    "pitchfork!3!10!53 13 71",
    "plastic cup; glass!1!3!51 31 19 27 28 ",
    "plate!1!3!51 19 27",
    "polaroid camera!3!3!53 31 15 44 19 21 82 22 25 26  29 30",
    "police baton; nightstick!3!3!53 83 105",
    "police uniform!2!3!51 37 15 59 54 83 55",
    "pool table!24!80!52 33 19 103",
    "pork chop; {|}pork ribs{|}; pork roast; {|}pork spareribs{|}; pork loin chop{|s}; pork sausage!3!10!51 45 46 47",
    "portable stove!3!3!53 31 57 17 73 86 91 92 70",
    "portable water purification filter!14!3!52 31  71 103",
    "pressure cooker; hot plate!6!10!52 31 19",
    "pulse pistol!27!6!52 10 31 104 33 87 89 106 26 101",
    "pulse rifle!36!20!52 10 31 104 33 89 26 107 101",
    "purse; handbag!1!3!51 15 61 19 22 24 25 30",
    "rabbit's {foot|feet}; {|pairs of }Starlight Casino dice; deck{s} of Elvis Presley playing cards; poker chip{s} from the Sands Casino in Reno; Gideon's bible; pocket crucifix; St. Jude pendant; St. Christopher figurine; Star of David necklace; {|pairs of }Masonic cufflinks; Order of Odd Fellows tie clip; class ring!3!.5!53 82 35",
    "radiation suit!12!10!53 31 59 38 54 20 81 86 89 55 26 103",
    "red Gingham dress; blue Gingham dress; yellow Gingham dress; green Gingham dress; black and white Gingham dress!2!.5!51 37 59 54 74 75 78 79 87 88 91 92",
    "rifle scope!8!1!53 13 31 19 85 88 103",
    "ring!7!.5!53 66 102",
    "road map!1!1!51 14 17 73 77 86 91 92 22 30",
    "roll{s} of 35mm film (24 shots)!6!.5!52 41 42",
    "roll{s} of polaroid film (10 shots)!3!1!53 41 44",
    "safe-cracking kit!20!20!52 31 15 16 86 90 71 103",
    "scalpel!1!1!51 67 71",
    "set{s} of horse tack!1!20!51 13",
    "set{|s} of keys!1!.5!51 14 15 19 20 21 22 23 24 26 28 35",
    "shawl!2!.5!53 13 59 38 54 19 75 78 79 88 91 92",
    "shiv; switchblade!3!1!51 16 84 86 90 105",
    "shotgun shell!1!.5!53 0 11",
    "slab{s} of bacon!3!1!51 45 19 47 49",
    "sleeping bag; tent!1!10!51 57 17 73 86 92",
    "sombrero!2!.5!52 13 59 40 77 85 92 55",
    "stick{s} of beef jerky!3!1!51 45 19 47 49",
    "stick{s} of dynamite!3!1!53 65 20 81",
    "straw sun hat!2!.5!53 15 59 54 40 19 75 78 79 87 88 91 92 22 25",
    "stun baton!11!3!52 83 89 105 103",
    "suit{|s} of riot gear!15!20!53 12 31 15 16 83 86 23 103",
    "sword; machete!3!3!52 73 88 89 105",
    "tabletop radio!1!10!51 14 31 15 60 64 17 19 21 23 ",
    "teargas grenade!3!1!53 15 65 83",
    "thermos!11!3!53 57 17 19 85 86 103",
    "toaster!1!10!51 31 19",
    "toy robot!6!3!52 31 43 19 72",
    "trenchcoat; sports jacket!2!.5!53 59 38 79 55",
    "walkie-talkie!6!3!52 31 15 60 64 20 21 79 83 86 89 23 26",
    "wanted poster!3!.5!53 73 77 83",
    "whole chicken!3!10!51 45 46 47",
    "will; contract; war bond; passport!1!1!51 102",
    "wrench{es}; hammer!1!3!51 14 17 20 74 80 86  71",
    "{|pairs of }Mary Jane shoes!2!.5!51 15 59 39 54 19 21 74 75 79 87 88 90 91 92 23",
    "{|pairs of }black leather shoes!2!.5!51 15 59 39 54 19 21 73 74 75 76 79 80 83 87 88 89 90 91 92 55 23",
    "{|pairs of }blue suede loafers; {|pairs of }saddle shoes!2!.5!53 59 39 54 88 55",
    "{|pairs of }chaps!2!.5!51 36 13 59 54 85 55",
    "{|pairs of }combat boots!2!.5!51 12 59 39 54 73 77 83 84 86 89 92 55 23",
    "{|pairs of }cowboy boots!2!.5!51 59 39 54 19 73 77 78 79 80 81 84 85 86 88 90 91 92 22 55 ",
    "{|pairs of }dice!3!.5!51 16 19 82 35 103",
    "{|pairs of }dog tags!1!.5!51 89 23 35",
    "{|pairs of }forceps!3!3!53 67 71",
    "{|pairs of }military fatigues!2!3!51 37 59 54 86 89 55 23",
    "{|pairs of }night vision goggles!10!3!52 36 31 59 43 54 83 86 89 55 23 103",
    "{|pairs of }slacks {and a|with} button up shirt{s}!2!.5!51 37 59 19 74 75 87 88 91 92 55",
    "{|pairs of }work boots!2!.5!51 12 59 39 54 73 77 78 81 83 84 86 88 90 92 55 23",
    "{|sets of }football pads!11!10!53 12 17 84 86 103",
    "{|suits of }makeshift metal armor!15!20!52 12 31 16 84 86 103",
    "{|}beef brisket{|s}; beek flank steak{|s}; beef sirloin steak; beef prime rib; beef pot roast; beef rib roast; beef T-Bone steak!3!10!51 45 46 47",
    "{|}binoculars!11!3!53 31 19 73 86 89 103",
    "{|}bongos; flute!3!3!53 92 35",
    "{|}brass knuckles!3!1!52 16 84 105",
    "{|}jeans and a T-shirt; {|}jeans and a button up work shirt; {|}jeans and a flannel shirt; {|}jeans and a western shirt!2!.5!51 37 59 54 19 73 74 76 77 78 80 84 85 86 88 90 91 92 55"
);

// http://www.systemreferencedocuments.org/resources/systems/pennpaper/modern/smack/occupations.html
/*
 barber, undertaker, banker, blacksmith, bounty hunter, judge, launderer, sheriff, marshall, deputy,
 mayor, town councilmember, menial laborer, merchant, messenger, miner, outlaw, bartender, piano player,

 Worker (Construction, Crop, Highway Maintenance, Mill, Quarry, Steel, Telephone Maintenance)
 Manager (Business, Construction, Hotel, Restaurant, Retail)
 Mechanic (Aircraft, Automobile, Bus, Communications Equipment, Electrical, Heavy Equipment, Truck)
 Driver (Ambulance, Bus, Truck)
 Supervisor (Maintenance, Office)
 Scientist (Materials, Rocketry, Robotics)
 Emergency Medical Technician (EMT)

 Animal Breeder (Horse, Sheep)
 Prison Chaplain, Priest, Minister
 Commercial Fisherman
 Computer Programmer
 Detective
 Draftsman
 Newspaper Editor
 Newspaper Reporter
 Engine and Machine Assemblers, Forklift and Industrial Truck Operators, Freight and Stock Handler, Machinist
 Engineer (Chemical, Civil, Electrical, Mechanical, Mining, Nuclear, Marine)
 Farmer
 Fire Fighter
 Government Employee
 Harbor Master
 Historical Archivist, Librarian
 * Housekeeper, Janitor
 Intelligence Agent
 Lawyer
 Logger
 Painter
 Park Ranger
 Pharmacist
 Pilot
 Mail Carrier
 Postmaster
 Printer
 Radio Operator
 Railroad Engineer
 Real Estate Agent
 Sailor
 Security Guard
 Service Station Attendant
 Social Worker
 Steel Workers
 Switchboard Operator
 Veterinarian
 Waiter/Waitress
 Welder

 professions
 // Bounty Hunter, Sheriff/Lawman, Hardholder/Bartertowner
 // Beatknik, Ex-Military, Raider, Nomad/Wanderer/Wastelander, 'Remnant' (survivors), Architect, Lawyer
 // Academic, Trader/Trucker, Clergyman/woman/Religious Leader
 // Cultist (Religious Cult, Cargo Cult, other)
 */
var pdb = new ProfessionDatabase(['post','pre','glasses','injuries','military:tattoo','sailor:tattoo','tattoo','high','low','normal','common','rare','uncommon','kit:courier','kit:craftsperson','kit:doctor','kit:electrician','kit:gunslinger','kit:homesteader','kit:leader','kit:mechanic','kit:miner','kit:police','kit:raider','kit:rancher','kit:scavenger','kit:scientist','kit:settler','kit:soldier','kit:thief','kit:trader','kit:vagrant','innate','Agile','Attractive','Cunning','Persuasive','Smart','Strong','Tough','Willpower','Art','Athletics','Bargain','Business','Camouflage','Electrical Repair','Foraging','Forensics','Government','Homesteading','Horseback Riding','Humanities','Law','Maritime','Mathematics','Mechanical Repair','Medicine','Mining','Negotiate','Observation','Research','Scavenging','Spelunking','Tracking','Wayfinding','Archery','Explosives','Firearms','Melee Weapons','Military','Unarmed Combat','Blacksmith','Brewer','Cook','Glassblower','Leatherworker','Potter','Weaver','Woodworker','Chemical Engineering','Civil Engineering','Eletrical Engineering','Mechanical Engineering','Mining Engineering','Nuclear Engineering','Chinese','French','German','Italian','Russian','Spanish','Biology','Chemistry','Geology','Physics','Science','Social Science','Deceive','Forgery','Intimidate','Lockpicking','Pickpocket','Safe Cracking','Stealth','Streetwise','Communications','Computers','Cryptography','Programming','Robotics','Rocketry','Butcher','Carpenter','Clothier','Gunsmith','Machinist','Mason','Plumber','Wagonwright','Driving','Motorcycling','Pilot Aircraft','Trucking']);
pdb.register(AtomicProfession,
    "Air Force!68 70 122!59 69 71!10 28 4 9 0 1", "this.assignRank(c);",
    "Army!68 70!59 69 71 45!10 28 4 9 0 1", "this.assignRank(c);",
    "Bounty Hunter!68 100!43 45 51 64 65 69 71 104 105 121!12 3 17 8 0", "",
    "Business Executive; Manager!43 44!49 53 55 59 86 87 88 89 90 91!12 9 1", "",
    "Carnie!43 98!60 62 105 120!12 8 1 6", "",
    "Clerk; Sales Clerk; Secretary; Salesman; Hotel Clerk; Motel Clerk; Warehouse Clerk!44!43!10 8 1", "",
    "Coast Guard!54 68 70!59 69 71!11 28 4 9 0 1 5", "this.assignRank(c);",
    "Courier!51 65!66 68 120 121 122 123!12 13 9 0", "",
    "Craftsperson!43!41 44 72 73 74 75 76 77 78 79!10 14 9 0", "",
    "Doctor!57!61 92 93 96 48!11 7 15 0 1", "c.honorific = 'Doctor';",
    "Elementary school teacher; Middle school teacher; high school teacher!61!41 42 52 55 92 93 94 95 96 97!10 2 9 1", "",
    "Engineer!55 61!107 110 111 80 81 82 83 84 85!12 9 1", "",
    "Homesteader; Farmer!50!42 43 46 56 60 72 73 74 75 76 77 78 79 120 123!10 18 9 0", "",
    "Innate!!33 34 35 36 37 38 39 40!10 32", "",
    "Librarian; Archivist!61!86 87 88 89 90 91 107!12 2 9 1", "",
    "Locksmith!101!43 44 56 103 107!11 16 20 9 0 1", "",
    "Marine!68 70!59 69 71 65 45!10 28 4 9 0 1 5", "this.assignRank(c);",
    "Mayor; Council Member!43 49!44 60!11 7 19 0", "",
    "Mechanic!46 56!43 106 107 108 109 110 111!10 20 9 0 1", "",
    "Miner!58!46 56 63 67!10 21 8 0 1", "",
    "Navy!54 68 70 122!59 69 71!12 28 9 0 1 5", "this.assignRank(c);",
    "Newspaper Reporter!60 61!49 98 105 106!12 2 9 1", "",
    "Police!68!42 49 59 60 71 100 105!12 22 9 0 1", "this.assignRank(c);",
    "Professor!61!41 52 53 55 57 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 106 107 108 109 110 111!11 2 7 26 1", "c.degree = 'Ph.D.'",
    "Raider!68 69!45 51 64 66 67 71 98 100 104 121!12 3 23 8 0 6", "",
    "Rancher; Cowhand!51 68!42 43 47 50 60 64 65!10 24 9 0 1", "",
    "Scavenger!62 65!47 60 101 103 66 69 68!10 3 25 9 0", "",
    "Scientist!61!55 92 93 94 95 96 97 106 107 108 109 110 111!11 2 7 26 0 1", "",
    "Settler!50!42 43 46 56 60 72 73 74 75 76 77 78 79 120 123 105!10 27 9 0", "",
    "Thief!98 100 105!35 101 99 102 103 104 69 108 43!10 29 8 0 1", "",
    "Trader!43 44!35 46 53 56 59 62 91 98 105 106 36!12 2 30 9 0", "",
    "Tradesperson!43!44 112 113 114 115 116 117 118 119!10 14 9 0", ""
);

var sdb = new StoreDatabase(['clientele:lobrow', 'clientele:nobrow', 'cluster:low', 'cluster:medium', 'cluster:none', 'common', 'rare', 'uncommon', 'encampment', 'roadside', 'settlement', 'town', 'trade:any', 'trade:buylow', 'trade:currency', 'trade:luxuries', 'trade:necessities', 'trade:sellhigh', 'trade:stocked']);
sdb.register(
    "Bar; Tavern; Saloon!May have bottles to purchase.!trader!!alcohol -bottleofwine!50!!!5 0 1 4 5 10 14",
    "Biker Shop!!Biker Gang!!kit:raider | weapon | ammo | drug!100!!!6 0 2 6 9 12 13",
    "Blacksmith!Will forge custom work or repair items.!Craftsperson!blacksmith!!!!!7 1 9 10 11 14 16 7",
    "Bookstore!!trader!!publication!100!!!7 1 4 10 13 14 16 18 7",
    "Butcher Shop; Meat Market!Will slaughter livestock (chickens 1T; pigs/goats 3T; cattle 6T).!trader!Butcher!meat -canoffidodogfood -preserved!100!!!7 1 2 10 14 15 16 17 7",
    "Clothing Store; Outfitters; Mercantile!!trader!!clothing -military -industrial!100!!!5 1 2 5 8 10 13 14 16 18",
    "Diner; Cafe; Restaurant; Drive-Thru; Roadhouse!A hot meal for 4T.!trader!!prepared food!!!!6 1 4 6 9 14",
    "Diner; Cafe; Restaurant; Eatery; Luncheonette!A hot meal for 3T.!trader!!prepared food!!!!5 1 4 5 10 11 14",
    "Feed Store!Bags of feed for 4T.!trader!!!!!!5 1 5 9 10 12 13",
    "General Store; Mercantile; Trading Post!!trader!!-kit:personal -publication -military -food -firearm -ammo -research -br!50!3!!5 1 4 5 10 12 13",
    "Gunsmith; Gun Shop; Firearms; Shooting Range!!tradesperson!Gunsmith!firearm -br!30!!10!7 1 4 10 14 15 16 17 18 7",
    "Hardware Store!!tradesperson!Mechanical Repair!tool | toy | camping!50!1!20!7 1 3 9 10 11 14 16 18 7",
    "Icehouse!They sell ice.!trader!!!!!!6 1 6 11 14 16",
    "Liquor Store!!trader!!alcohol!100!!!6 0 1 4 8 6 9 10 14",
    "Livestock!Will have some combination of chickens (4T), pigs (10T), goats (10T), and/or cattle (18T) for sale. Will not generally buy livestock (find a slaughterhouse or butcher).!trader!!!!!!5 1 5 10 12 13",
    "Locksmith!Can open anything you bring to them, no questions asked (3T).!locksmith!!!!!!6 1 4 6 10 11 14 15 16",
    "Mart; Market; Groceries!!trader!!food -ration!100!!!5 1 2 5 8 10 13 14 16",
    "Pawn Shop; Antique Store!!trader!!-food -rare -ammo -weapon -luxury -scifi!50!3!!5 6 1 4 5 6 10 12 17",
    "Pottery Shop!!tradesperson!Potter!-br pottery!100!!!7 1 2 10 14 16 7",
    "Repair Shop; Electronics Shop!Electrical repair (2-6T).!mechanic!Electrical Repair!electronics | communications!20!!!7 1 4 10 11 12 13 18 7",
    "Repair Shop; Service Station!Mechanical repair (2-6T).!mechanic!Mechanical Repair!br -firearm -house -electronics!10!!!7 1 4 10 11 12 13 18 7",
    "Sporting Goods Store!!trader!!sport | camping!!!!6 1 3 6 9 10 12 13",
    "Tattoo Parlor; Tattoos!3-5T for a tattoo.!trader!Art!!!!!7 0 10 14 15 16 7"
);

module.exports = {
    getPlaces: function() { return ['Agricultural','Automotive','Civic','Criminal','Garage','Hospital','House','Industrial','Institution','Lodging','Military','Office','Public','Research','Restaurant','School','Tourism','Travel']; },
    getLocations: function() { return ['Encampment', 'Roadside', 'Settlement', 'Town']; },
    itemDatabase: idb,
    professionDatabase: pdb,
    storeDatabase: sdb
}
