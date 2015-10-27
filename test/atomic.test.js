var expect = require('chai').expect;
var Item = require('../src/models/item');
var Bag = require('../src/models/bag');
var atomic = require('../src/atomic');
require('./seedrandom');

describe("atomic.models", function() {
    var bag;
    beforeEach(function() {
        Math.seedrandom('belgium');
        bag = new Bag();
    });
    describe("clone()", function() {
        it("creates a bag instance when cloned", function() {
            expect(atomic.models.clone(bag) instanceof Bag).to.be.true;
        });
        it("clones items that are of type Item", function() {
            bag.add("orange");
            var clone = atomic.models.clone(bag);
            expect(clone.entries[0].item instanceof Item).to.be.true;
        });
        it("has same items after cloning, but they are not the same instances", function() {
            bag.add("orange", 2);
            var clone = atomic.models.clone(bag);
            bag.entries[0].item.name = "banana";

            expect(clone.count("orange")).to.equal(2);
            expect(clone.entries[0].item).to.not.equal(bag.entries[0].item);
        });
    });
    describe("deserializer()", function() {
        describe("Bag", function() {
            it("leaves JSON as JSON", function() {
                var json = {tags: ['foo'], subType: {name: 'Belgium'}};

                var model = atomic.models.deserializer(json);
                expect(json.subType.name).to.equal('Belgium');
            });
            it("converts JSON back into a Model object", function() {
                var json = {type: "Model", tags: ['foo']};

                var model = atomic.models.deserializer(json);
                expect(model instanceof atomic.models.Model).to.be.true;
                expect(model.has('foo')).to.be.true;
            });
            it("converts a nested model object", function() {
                var json = {tags: ['foo'], modelProp: {type: "Model", tags: ['foo']}};

                var object = atomic.models.deserializer(json);
                expect(object.modelProp instanceof atomic.models.Model).to.be.true;
                expect(object.modelProp.has('foo')).to.be.true;
            });
        });
        describe("Name", function() {
            it("can be deserialized from JSON", function() {
                var json = "{\"type\":\"Name\",\"given\":\"Jack\",\"family\":\"Aubrey\"}";
                name = atomic.models.deserializer(json);

                expect(name.first).to.equal("Jack");
                expect(name.last).to.equal("Aubrey");
                expect(name instanceof atomic.models.Name).to.be.true;
                expect(name.constructor).to.equal(atomic.models.Name);
                expect(name.toString()).to.equal("Jack Aubrey");
            });
        });
    });
});
