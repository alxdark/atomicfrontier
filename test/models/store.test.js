var expect = require('chai').expect;
var Store = require('../../src/models/store');
var Bag = require('../../src/models/bag');
var Character = require('../../src/models/character');
var Name = require('../../src/models/name');
var Item = require('../../src/models/item');

function createBag() {
    var gum = new Item({name: "{|packs of} Blackjack chewing gum", value: 10, enc: 2});
    var bat = new Item({name: "baseball bat", value: 2, enc: 3});
    var bag = new Bag();
    bag.add(gum, 10);
    bag.add(bat, 1);
    return bag;
}

function createStore() {
    var store = new Store();
    store.name = "Big Box Store";
    store.onhand = createBag();
    store.onhand.descriptor = "Cash On Hand";
    store.inventory = createBag();
    store.policy = "Never trades for sparrows.";
    store.owner = new Character({age: 22, name: new Name({
        given: "Dave", family: "Powers"
    })});
    store.totalValue = 100;
    return store;
}

describe("atomic.models.Store", function() {
    it("can be created", function() {
        var store = new Store();
    });
    it("can be expressed as a string", function() {
        var store = createStore();
        expect(store.toString()).to.equal('Big Box Store. Owner(s): Dave Powers. Age 22.  For Trade: Never trades for sparrows. 10 packs of Blackjack chewing gum, and a baseball bat. Cash On Hand: 10 packs of Blackjack chewing gum, and a baseball bat. Total value: 100. ');
    });
    it("can be expressed as HTML", function() {
        var store = createStore();
        expect(store.toHTML()).to.equal('<p class="title">Big Box Store</p><div class="owner"><p class="title">Owner(s)</p><p>Dave Powers. Age 22. </p></div><p class="title">For Trade</p><p class="policy">Never trades for sparrows.</p><ul class="inventory"><li>10 packs of Blackjack chewing gum (10T each)</li><li>a baseball bat (2T)</li></ul><p>Cash On Hand: 10 packs of Blackjack chewing gum, and a baseball bat.</p>');
    });
});
