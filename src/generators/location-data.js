module.exports = {name:"Root", abstract:true, children:[
    {name:"Natural", abstract:true, type:"rarity", children: [
        {name:"Canyon", freq:"common"},
        {name:"Cave", freq:"rare"},
        {name:"Caverns", freq:"rare", descr: "cave complex"},
        {name:"Crater", abstract:true, freq:"rare", type:"rarity", children:[
            {name:"Asteroid Crater", freq:"rare"},
            {name:"Crash Site", freq:"uncommon", descr:"Plane or rocket"}
        ]},
        {name:"Forest", freq: "uncommon"},
        {name:"Prairie", freq: "common"},
        {name:"Lake", freq: "uncommon"},
        {name:"Radioactive Area", freq: "rare"},
        {name:"Rest Area", freq: "common"},
        {name:"Scenic Overlook", freq: "uncommon"},
        {name:"River", freq: "rare"},
        {name:["Dry riverbed","Gulch"], freq: "uncommon"}
    ]},
    {name:"Rural", abstract:true, type:"rarity", children:[
        {name:"Farm", freq:"uncommon", type:"rarity", children:[
            {name:"Barn", freq: "common"},
            {name:"Garage", freq: "common"},
            {name:"Stable", freq: "common"},
            {name:"Storm Cellar", freq: "common"},
            {name:"Root Cellar", freq: "common"},
            {name:"Shed", freq: "common"},
            {name:"Chicken Coop", freq: "uncommon"},
            {name:"Silo", freq: "uncommon"},
            {name:"Grainery", freq: "uncommon"},
            {name:"Greenhouse", freq: "rare"},
            {name:"Fallout Shelter", freq: "rare"},
            {name:"Well House", freq: "rare"},
            {name:"Water Mill", freq: "rare"},
            {name:"Windmill", freq: "rare"},
            {name:"Horsemill", freq: "rare"},
            {name:["Pigpen","Sty"], freq: "rare"}
        ]},
        {name:"Ranch", freq:"uncommon", children:[
            {name:"Ranch House"},
            {name:"Bunkhouse"},
            {name:"Chow Wagon"},
            {name:"Holding Pen"},
            {ref:"Farm"}
        ]},
        {name:"Dairy Farm", freq:"rare"},
        {name:"Water trough with windmill pump", freq:"common"},
        {name:"Shack", freq:"common"},
        {name:"Fairground", freq:"rare"},
        {name:"Grange Building", freq:"rare"},
        {name:"Church", freq:"uncommon", type:"listed", children: [
            {name:"Restroom", count:1, type:"listed", children: [
                {name:"Men's Restroom", count:1},
                {name:"Women's Restroom", count:1}
            ]},
            {name:"Chapel", count:1},
            {name:"Industrial Kitchen", count:"1d2-1"},
            {name:"Meeting Hall", count: "1d2-1"}
        ]},
        {name:"Stables", freq:"rare"},
        {name:"Cemetery", freq:"rare"},
        {name:["Landfill","Dump"], freq:"uncommon"},
        {name:"Race Track", freq:"rare"},
        {name:"Luxury Home", freq:"rare"},
        {name:"Mobile Home Park", freq:"common"},
        {name:"Prison", freq:"uncommon"},
        {name:"Reformatory School", freq:"rare"},
        {name:"Ranger Station", freq:"rare"},
        {name:"Power Station", freq:"uncommon"},
        {name:"Power Line", freq:"common"},
        {name:"Dam", freq:"rare"},
        {name:"Reservoir", freq:"rare"},
        {name:"Water Tower", freq:"common"},
        {name:"Cistern", freq:"common"},
        {name:"Indian Teepee", freq:"rare"}
    ]},
    {name:"Road", abstract:true, descr:"What is around roads between destinations", children:[
        {name:"Roadside Stand"},
        {name:"Highway Patrol Station"},
        {name:"Battle Wreckage"},
        {name:"Car Accident"},
        {name:"Roadside Memorial"},
        {name:"Roadside Service Building", abstract:true, children:[
            {name:"Gas Station"},
            {name:"Motel"},
            {name:"Diner", children: [
                {ref:"Restroom"}
            ]},
            {name:"Drive-In Diner"},
            {name:"Truck Stop"},
            {name:"Rest Stop"},
            {name:"Gun Shop"},
            {name:"Car Dealership"},
            {name:"Roadside Chapel"},
            {name:"Dude Ranch"},
            {name:"Gift Shop"},
            {name:"Campground", children:[
                {ref:"Restroom"}
            ]},
            {name:"Boat Shop"},
            {name:"Bait Shop"},
            {name:"Casino", type:"listed", children:[
                {ref:"Restroom", count:1},
                {name:"Cashier Pen", count:1},
                {name:"Game Floor", count:"1d3"}
            ]},
            {name:"Mini Golf"},
            {name:"Slaughterhouse"},
            {name:"Grain Silo"},
            {name:"Grain Storage Depot", children:[
                {ref:"Silo"}
            ]},
            {name:"Feed Store"},
            {name:"Radio Station", freq:"rare", type:"listed", descr: "TODO: name of station", children:[
                {name:"Broadcast Building", count:1, type:"listed", children: [
                    {name:"Break Room", count:"1d2-1"},
                    {name:"Lobby", count:1},
                    {name:"Office", count: "1d3"},
                    {ref: "Restroom", count:1},
                    {name:"Storage Room", count:"1d2-1"}
                ]},
                {name:"Radio Towers", count:1}
            ]}
        ]}
    ]},
    {name:"Rail", abstract:true, children: [
        {name:"Train Station"},
        {name:"Grain Transfer Depot", children:[
            {ref:"Silo"}
        ]},
        {name:"Trainyard", children: [
            {name:["Roundhouse","Engine House"]},
            {name:"Rail Yard"},
            {name:"Repair Building"},
            {name:"Administrative Offices"}
        ]},
        {name:"Wreckage", abstract:true, children: [
            {name:"Abandoned Train Cars"},
            {name:"Derailed Train Cars"}
        ]}
    ]},
    {name:"Rural Industrial", abstract:true, type:"rarity", children: [
        {name:"Military Installation", abstract:true, freq:"rare", type:"rarity", children: [
            {name:"ICBM Missile Silo", freq:"uncommon"},
            {name:"Underground Bunker Complex", freq:"uncommon"},
            {name:"Ammunition Factory", freq:"rare"},
            {name:"Army Base", freq:"common"},
            {name:"Air Force Base", freq:"common"}
        ]},
        {name:"Research Facility", abstract:true, freq:"rare", children: [
            {name:"Astronomical Observatory", freq:"rare"},
            {name:"University Campus", freq:"uncommon"},
            {name:"Light-Industrial Research Facility", freq:"uncommon"}
        ]},
        {name:"Mine", freq:"uncommon"},
        {name:"Quarry", freq:"uncommon"},
        {name:"Oil Field", freq:"uncommon"},
        {name:"Airport", freq:"rare"},
    ]},
    {name:"Surburb", abstract:true, children: [
        {name:"Housing tract", children: [
            {name:"House", children: [
                {name:"Bathroom"}
            ]}
        ]},
        {name:"Business District", type:"unique", count:"3d3", children: [
            {name:"Grocery Store", freq:"common"},
            {name:"Restaurant", freq:"common"},
            {name:["Barber Shop","Beauty Salon"], freq:"uncommon"},
            {name:"Drug Store", freq:"common"},
            {name:"Bookstore", freq:"rare"},
            {name:"Liquor Store", freq:"uncommon"},
            {name:"Pet Shop", freq:"rare"},
            {name:"Record Shop", freq:"rare"},
            {name:"Instrumental Music Store", freq:"rare"},
            {name:"Bank", freq:"uncommon"},
            {name:"Bakery", freq:"uncommon"},
            {name:"Library", freq:"uncommon"},
            {name:"History Museum", freq:"rare"},
            {name:"Movie Theater", freq:"uncommon"},
            {name:"Theater", freq:"rare"},
            {name:"Florist", freq:"rare"},
            {name:"Bar", freq:"common"},
            {ref:"Diner", freq:"common"},
            {name:"Hotel", freq:"uncommon"}
        ]},
        {ref:"Church"},
        {name:"Synagogue"},
        {ref:"Cemetery"},
        {name:"Drive-In Movie Theater"},
        {ref:"Mobile Home Park"},
        {name:"Elementary School"},
        {name:"High School"},
        {name:"College Campus"},
        {name:"Produce Stands"},
        {name:"Police Station"},
        {name:"Fire Station"},
        {name:"Apartment Building"},
        {name:"Retirement Home"},
        {name:"Sanitarium"},
        {name:"Nurseries"},
        {name:"Hospital"},
        {name:"City Park", children: [
            {name:"Playground"},
            {name:"Pool"},
            {name:"Sports Field"},
            {name:"Picnic Area"},
            {name:"Swimming Pool"}
        ]}
    ]},
    // but maybe not, mabye town/city
    {name:"Urban Ruins", abstract:true, children: [
        {name:"Factory", abstract:true, children: [
            {name:"Junk Yard"},
            {name:"Salvage Yard"},
            {name:"Scrap Yard"},
            {name:"Warehouse"},
            {name:"Manufacturing Plant"},
            {name:"Soda Bottling Plant"},
            {name:"Business Headquarters"},
            {name:"Industrial Bakery"},
            {name:"Trucking Facilities"},
            {name:"Foundry"},
            {name:"Power Transfer Station"},
            {name:"Bus Station"},
            {ref:"Train Station"}            
        ]},
        {ref:"Business District"}
    ]},
    {name:"Settlement", abstract:true, children: [
        {name:"Semi-Permanent Camp"},
        {name:"Hobo Encampment"},
        {name:"Bunker"},
        {ref:"Fallout Shelter"},
        {name:"Camp Site"},
        {name:"Makeshift Fortification"},
        {name:"Cabin"},
        {name:"Tent City"},
        {name:"RV Encampment"}
    ]}
]};

/*
Loot:
    Agricultural
    Automotive
    Civic
    Criminal
    Garage
    Hospital
    House
    Industrial
    Institution
    Lodging
    Military
    Office
    Public
    Research
    Restaurant
    School
    Tourism
    Travel

central: church, synagogue, academic campus, restaurant, police station,
    fire station, fraternal organization (masons, IOOF, Elk, Moose, Eagle,
    only the cool ones), bus station, train station, city park (playground, pool,
    sports fields, picnic areas), hotel, hospital, city hall, courthouse, post office,
    jailhouse/county jail
*/