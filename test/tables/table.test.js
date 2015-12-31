var expect = require('chai').expect;
var ion = require('../../src/ion');
var Table = require('../../src/tables/table');
require('../before');

// COMPLETE 2013-03-27
describe("atomic.tables.Table", function() {

    var table;
    beforeEach(function() {
        table = new Table(function(name) {
            return {name: name};
        });
        table.add(10, "Apple");
        table.add(40, "Orange");
        table.add(50, "Pineapple");
    });

    describe("add()", function() {
        it("adds items using an absolute percentage", function() {
            // Really nothing to do here. The beforeEach function tests this.
            table.get(); // shouldn't throw an exception.
        });
        it("adds items using a dice range on 1d100", function() {
            var table = new Table();
            table.add(1,20, "A");
            table.add(21,40, "A");
            table.add(41,60, "A");
            table.add(61,80, "A");
            table.add(81,100, "A");
            expect(table.get()).to.equal("A");
        });
        it("doesn't accept incomplete dice range on 1d100", function() {
            var table = new Table();
            table.add(1,20, "A");
            expect(function() {
                table.get();
            }).throw; //"Table elements do not add up to 100%, but rather to 20"
        });
        it("doesn't accept nonsense values", function() {
            var table = new Table();
            expect(function() {
                table.add(0,10,"A");
            }).throw; //"Dice ranges must be from 1 to 100"
            expect(function() {
                table.add(200,"A");
            }).throw; //"Dice ranges must be from 1 to 100"
        });
        it("throws an error when an object is not provided", function() {
            var table = new Table();
            expect(function() {
                table.add(50);
            }).throw;
        });
    });
    describe("get()", function() {
        it("processes items before returning them with the outFunction", function() {
            var table = new Table(function(value) {
                return value * 2;
            });
            table.add(100, 2);
            expect(table.get()).to.equal(4);
        });
        it("returns items unprocessed if no outFunction is supplied", function() {
            var table = new Table().add(100, 2);
            expect(table.get()).to.equal(2);
        });
        it("throws an error if elements don't add up to 100", function() {
            var badTable = new Table();
            badTable.add(10, 'Apple');

            expect(function() {
                badTable.get();
            }).throw; //"Table elements do not add up to 100%, but rather to 10"
        });
        it("returns random results with each call", function() {
            var table = new Table();
            for (var i=1; i<=100;i++) {
                table.add(i,i,i);
            }
            var one = table.get();
            var two = table.get();

            expect(one).to.not.equal(two);
        });
        it("returns one of the item's by name", function() {
            var item = table.get();
            expect(ion.contains(['Apple','Orange','Pineapple'], item.name)).to.be.true;
        });
    });
    describe("size()", function() {
        it("reports the correct number of items in a table", function() {
            expect(table.size()).to.equal(3);
        });
    });
});
