var expect = require('chai').expect;
var Item = require('../../src/models/item');
var Bag = require('../../src/models/bag');
require('./../seedrandom');

describe("atomic.models.Bag", function() {
    var bag;
    beforeEach(function() {
        Math.seedrandom('belgium');
        bag = new Bag();
    });

    it("is a Bag instance", function() {
        expect(bag.type).to.equal("Bag");
    });
    describe("addBag()", function() {
        it("adds bag without passing item references", function() {
            var object = {name: "Orange"};
            bag.add(object,3);

            var bag2 = new Bag();
            bag2.addBag(bag);
            var entry = bag2.entries[0];

            expect(entry.item === object).to.be.false;
            expect(entry.item).to.eql(object); // but otherwise, they are equal entries
        });
        it("adds bag without changing parameter bag", function() {
            var object = {name: "Orange"};
            bag.add(object,3);

            var bag2 = new Bag();
            bag2.addBag(bag);

            expect(bag.entries.length).to.equal(1);
            expect(bag).to.eql(bag2);
        });
        it("handles edge case parameters", function() {
            bag.addBag(null);
            bag.addBag();

            expect(bag.entries.length).to.equal(0);
        });
    });
    describe("removeBag()", function() {
        it("removes items from bag without changing parameter bag", function() {
            var object = {name: "Orange"};
            bag.add(object,3);

            var bag2 = new Bag();
            bag2.addBag(bag);

            bag2.removeBag(bag);

            expect(bag2.entries.length).to.equal(0);
            expect(bag).not.to.equal(bag2);
        });
    });
    describe("count()", function() {
        it("returns 0 and doesn't create an entry, when the bag is empty", function() {
            expect(bag.count("orange")).to.equal(0);
            expect(bag.entries.length).to.equal(0);
        });
        it("reports N items when there are N items in the bag", function() {
            expect(bag.add("orange", 3)).to.equal(3);
        });
        it("reports the correct count after items are removed", function() {
            bag.add("orange", 3);
            expect(bag.remove("orange", 1)).to.equal(2);
        });
        it("counts all items if no item is provided to count method", function() {
            bag.add('orange');
            bag.add('banana', 3);
            expect(bag.count()).to.equal(4);
        });
    });
    describe("add()", function() {
        it("throws error if nothing added to bag", function() {
            expect(function() {
                bag.add(null, 2);
            }).to.throw();
        });
        it("adds items of type Item", function() {
            bag.add("orange");
            expect(bag.entries[0].item instanceof Item).to.be.true;
        });
        it ("adds one item when no count specified", function() {
            expect(bag.add("orange")).to.equal(1);
        });
        it ("adds correct number of items", function() {
            expect(bag.add("orange", 2)).to.equal(2);
        });
        it ("accumulates items in one entry", function() {
            bag.add("orange", 2);
            bag.add("orange", 2);
            expect(bag.count("orange")).to.equal(4);
            expect(bag.entries.length).to.equal(1);
        });
        it ("doesn't add items when negative count is specified", function() {
            expect(function() {
                bag.add("orange", -2);
            }).to.throw; //"Can't add negative items to bag: -2"
        });
        it ("doesn't add to existing items when negative count specified", function() {
            expect(function() {
                bag.add("orange", 3);
                bag.add("orange", -2);
            }).to.throw(/*"Can't add negative items to bag: -2"*/);
            expect(bag.count("orange")).to.equal(3);
        });
    });
    describe("remove()", function() {
        it("allows removing item from bag", function() {
            bag.add("orange");
            expect(bag.remove("orange")).to.equal(0);
            expect(bag.entries.length).to.equals(0);
        });
        it("allows removing some items in a bag", function() {
            bag.add("orange", 5);
            expect(bag.remove("orange", 2)).to.equal(3);
        });
        it("doesn't allow removal of negative count of items", function() {
            expect(function() {
                bag.add("orange");
                bag.remove("orange", -2);
            }).to.throw(/*"Can't remove a negative number of items from bag: -2"*/);
            expect(bag.count("orange")).to.equal(1);
        });
        it("does not remove more items than are in bag", function(){
            expect(function() {
                bag.add("orange");
                bag.remove("orange", 5);
            }).to.throw; //"Can't remove 5 items in bag that has only 1"
        });
        it("doesn't remove items from a bag that aren't in the bag", function() {
            expect(function() {
                bag.remove("orange");
            }).to.throw; //"Can't remove item that's not in the bag"
        });
    });
    describe("value()", function() {
        it("report 0 when empty", function() {
            expect(bag.value()).to.equal(0);
        });
        it("sums value of all items", function() {
            var banana = new Item({name: "banana", value: 5});
            bag.add(new Item({name: "orange", value: 10}), 2);
            bag.add(banana, 3);
            bag.remove(banana, 2);
            expect(bag.value()).to.equal(25);
        });
        it("returns enc of one item when specified", function() {
            bag.add(new Item({name: "orange", value: 5}), 2); // 1 * 2 = 2
            bag.add(new Item({name: "banana", value: 10}), 3); // 2 * 3 = 6
            expect(bag.value('banana')).to.equal(30);
        });
    });
    describe("enc()", function() {
        it("reports 0 when empty", function() {
            expect(bag.enc()).to.equal(0);
        });
        it("sums enc of all items", function() {
            bag.add(new Item({name: "orange", enc:1}), 2); // 1 * 2 = 2
            bag.add(new Item({name: "banana", enc: 2}), 3); // 2 * 3 = 6
            expect(bag.enc()).to.equal(8);
        });
        it("returns weight of one item when specified", function() {
            bag.add(new Item({name: "orange", enc:1}), 2); // 1 * 2 = 2
            bag.add(new Item({name: "banana", enc: 2}), 3); // 2 * 3 = 6
            expect(bag.enc('banana')).to.equal(6);
        });
    });
    describe("filter()", function() {
        it("can remove and return items in a filter", function() {
            bag.add(new Item({name: "orange", enc:1}), 2); // 1 * 2 = 2
            bag.add(new Item({name: "banana", enc: 2}), 3); // 2 * 3 = 6
            var newBag = bag.filter(function(item, count) {
                return (item.name === 'orange');
            });
            expect(bag.count('orange')).to.equal(0);
            expect(newBag.count('orange')).to.equal(2);
        });
        it("can remove multiple items without getting tripped up", function() {
            bag.add(new Item({name: "orange", enc:1}), 2); // 1 * 2 = 2
            bag.add(new Item({name: "banana", enc: 2}), 3); // 2 * 3 = 6
            var newBag = bag.filter(function(item, count) {
                return (item.name === 'orange') || (item.name === 'banana');
            });
            expect(bag.count('orange')).to.equal(0);
            expect(bag.count('banana')).to.equal(0);
        });
    });
    describe("typeof()", function() {
        it("finds both items with a tag having the correct prefix", function() {
            bag.add(new Item({name: "orange", tags: ["fruit:citrus"]}));
            bag.add(new Item({name: "banana", tags: ["fruit:musa"]}));
            bag.add(new Item({name: "tangerine", tags: ["fruit"]}));
            var array = bag.typeOf('fruit');
            expect(array.length).to.equal(2);
            expect(array[0].name).to.equal("orange");
            expect(array[1].name).to.equal("banana");
        });
        it("returns an empty array if nothing matches", function() {
            bag.add(new Item({name: "tangerine", tags: ["fruit"]}));
            var array = bag.typeOf('fruit');
            expect(array.length).to.equal(0);
        });
    });
    describe("toString()", function() {
        it("describes items correctly", function() {
            var bag = new Bag();
            bag.add("orange", 5);
            bag.add("banana", 2);
            bag.add("strawberry");
            expect(bag.toString()).to.equal("5 oranges, 2 bananas, and a strawberry.");
        });
        it("sorts items by name", function() {
            var bag = new Bag();
            bag.add("orange", 5);
            bag.add("banana", 2);
            bag.add("strawberry");
            bag.sort();
            expect(bag.toString()).to.equal("2 bananas, 5 oranges, and a strawberry.");
        });
        it("capitalizes toString", function() {
            var bag = new Bag();
            bag.add("orange", 1);
            expect(bag.toString()).to.equal("An orange.");
        });
        // This behavior should be in an atomic subclass, but it's just going to
        // double the bytes used for bag.toString() because the only implementation
        // we use will be the subclass. So for now, just leave it in bag.
        it("magically collapses cash items to one description", function() {
            var bag = new Bag();
            bag.add(new Item({name:"$5 bill", value: .05, tags: ["cash"]}));
            bag.add(new Item({name:"$50 bill", value: .5, tags: ["cash"]}));
            expect(bag.toString()).to.equal("$55 in cash.");
        });
        // But this is more generally applicable, we should group titles into a list in commas
        // behind an item.
        it("correctly groups items with different titles in the description", function() {
            var bag = new Bag();
            bag.add(new Item({
                name: "Pennant brand baseball card{|s}",
                title: "Eddie Kasko, St. Louis Cardinals"
            }));
            bag.add(new Item({
                name: "Pennant brand baseball card{|s}",
                title: "Willie Mays, San Francisco Giants"
            }));
            console.log(bag.toString());
        });
    });

});
