var expect = require('chai').expect;
var createBag = require('../../src/generators/bag').createBag;
var createKit = require('../../src/generators/bag').createKit;
var createContainer = require('../../src/generators/bag').createContainer;
var getContainerTypes = require('../../src/generators/bag').getContainerTypes;

var profDb = require('../../src/generators/data').professionDatabase;
var Bag = require('../../src/models/bag');

function matchedTags(actual, tags) {
    var result = true;
    for (var i=0; i < actual.entries.length; i++) {
        var item = actual.entries[i].item;
        for (var j=0; j < tags.negatives.length; j++) {
            if (item.is(tags.negatives[j])) {
                result = false;
            }
        }
        for (var j=0; j < tags.positives.length; j++) {
            if (item.not(tags.positives[j])) {
                result = false;
            }
        }
    }
    return result;
}
function matchCondition(actual, func) {
    var result = true;
    for (var j=0; j < actual.entries.length; j++) {
        var item = actual.entries[j].item;
        if (!func(item)) {
            result = false;
        }
    }
    return result;
}


describe("createBag()", function() {

    it("accepts no arguments", function() {
        var bag = createBag();
        expect(bag).not.to.be.null
        expect(bag.type).to.equal("Bag");
    });
    it("accepts total value as an argument", function() {
        var bag = createBag({totalValue: 50, fillBag: false});
        expect(bag.value() > 0).to.be.true
        expect(bag.value()).is.above(49);
    });
    it("accepts a boolean to toggle filling with currency", function() {
        var bag = createBag({totalValue: 50, fillBag: true});
        expect(Math.round(bag.value())).to.equal(50);
    });
    it("accepts tags as an argument", function() {
        var bag = createBag({tags: 'food -fresh', fillBag: false});
        expect(matchedTags(bag, {positives: ['food'], negatives: ['fresh']})).to.be.true;
    });
    it("honors the minValue conditional", function() {
        var bag = createBag({minValue: 5, fillBag: false});
        expect(matchCondition(bag, function(item) {
            return item.value >= 5;
        })).to.be.true;
    });
    it("honors the maxValue conditional", function() {
        var bag = createBag({maxValue: 5, fillBag: false});
        expect(matchCondition(bag, function(item) {
            return item.value <= 5;
        })).to.be.true;
    });
    it("honors the minEnc conditional", function() {
        var bag = createBag({minEnc: 5, fillBag: false});
        expect(matchCondition(bag, function(item) {
            return item.enc >= 5;
        })).to.be.true;
    });
    it("honors the maxEnc conditional", function() {
        var bag = createBag({maxEnc: 1, fillBag: false});
        expect(matchCondition(bag, function(item) {
            return item.enc <= 1;
        })).to.be.true;
    });
    it("fails gracefully if tags are not matchable", function() {
        var bag = createBag({tags: ['foo','-boo'], fillBag: false});
        expect(bag.count()).to.equal(0);
    });
    it("creates a bag with a correct total value", function() {
        var bag = createBag({totalValue: 50, fillBag: false});
        expect(bag.value()).is.above(48).and.below(51);
    });
    it("throws error if the conditionals are invalid", function() {
        expect(function() {
            createBag({minValue: 10, maxValue: 5});
        }).to.throw
    });
    it("rejects impossible tag conditions", function() {
        expect(function() {
            createBag({tags: "", maxValue: 10, minValue: 15});
        }).to.throw
        expect(function() {
            createBag({tags: "", maxEnc: 0});
        }).to.throw
    });
    it("throws error if the total value is invalid", function() {
        expect(function() {
            createBag({totalValue: -50});
        }).to.throw;
    });
    it("duplicates items to reach total values higher than value of all unique items", function() {
        // This test could pass just because the secured bucket contains enough stuff
        // to meet the value.
        var bag = createBag({totalValue: 200, tags: "secured", fillBag: false});
        expect(bag.value()).to.equal(200);
    });
    it("should accept a tag-like version of an item's name for searches", function() {
        var bag = createBag({tags: "bottleofwine", fillBag: false});
        expect(bag.count()).to.equal(1);
    });
});
describe("createKit()", function() {
    function isPartOfKit(item) {
        return item.is('kit:settler') || item.is('ammo') || item.is('kit:personal') || item.is('food') || item.is('currency');
    }
    it("creates a kit for the right profession object", function() {
        var settler = profDb.find('settler');
        var kit = createKit({profession: settler});
        expect(matchCondition(kit, isPartOfKit)).to.be.true;
    });
    it("creates a kit for the right profession string", function() {
        var kit = createKit({profession: 'settler'});
        expect(matchCondition(kit, isPartOfKit)).to.be.true;
    });
    it("return cleanly if the profession doesn't exist", function() {
        // Doesn't It doesn't just come back empty, because personal items
        // aren't related to profession. OK for now
        var kit = createKit({profession: 'poofoor'});
        expect(matchCondition(kit, function(item) {
            return item.is('kit:personal') || item.is('kit:personal') || item.is('food') || item.is('currency');
        })).to.be.true;
    });
});
describe("createContainer()", function() {
    it("creates a container using a valid type if no arg", function() {
        var c = createContainer(null);
        expect(c.constructor).to.equal(Bag);
        expect(c.entries.length).is.above(0);
    });
    it("creates a container using a valid type if no arg", function() {
        var c = createContainer("testvalue");
        expect(c.constructor).to.equal(Bag);
        expect(c.entries.length).is.above(0);
    });
    it("returns a type-appropriate container", function() {
        var c = createContainer("Cash Register");
        expect(c.descriptor).to.match(/Cash Register/);
        expect(c.constructor).to.equal(Bag);
        expect(c.entries.length).is.above(0);
    });
});
describe("getContainerTypes()", function() {
    it("returns display-friendly container types", function() {
        expect(getContainerTypes()[1]).to.equal("Cash Register");
    });
});