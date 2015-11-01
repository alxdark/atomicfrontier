var expect = require('chai').expect;

require('../seedrandom');
var ion = require('../../src/ion');
var RarityTable = require('../../src/tables/rarity_table');

describe("atomic.tables.RarityTable", function() {

    function calculatePercentageOfResults(table) {
        var common = 0, uncommon = 0, rare = 0;
        ion.times(1000, function() {
            var result = table.get();
            if (result == null) {
                throw new Error("RarityTable did not return a result");
            }
            switch(result) {
                case "C": common++; break;
                case "R": rare++; break;
                case "U1":
                case "U2":
                case "U3":
                default: uncommon++;
            }
        });
        return {
            commonPer: Math.round((common/1000)*100),
            uncommonPer: Math.round((uncommon/1000)*100),
            rarePer: Math.round((rare/1000)*100)
        };
    }

    var table;
    beforeEach(function() {
        Math.seedrandom('belgium');
        table = new RarityTable();
        table.add("common", "C");
        table.add("uncommon", "U1");
        table.add("uncommon", "U2");
        table.add("uncommon", "U3");
        table.add("rare", "R");
    });

    it("throws an error if not passed a rarity value", function() {
        expect(function() {
            table.add("notavalue", "NAV");
        }).throw; //"notavalue is not valid (use rare, uncommon, common)"
    });
    it("support the outFunction", function() {
        var outTable = new RarityTable(function(value) {
            return "*" + value;
        });
        outTable.add("common", "C");
        outTable.add("uncommon", "U");
        outTable.add("rare", "R");
        expect(outTable.get()).to.equal("*C");
    });
    it("gracefully fails when there aren't items in all three frequencies in strict mode", function() {
        var badTable = new RarityTable();
        badTable.add("common", "C");
        expect(function() {
            badTable.get();
        }).throw; //"RarityTable must have at least one common, uncommon, and rare element"
    });
    it("produces values in proportion to the rarities that are present", function() {
        var r = calculatePercentageOfResults(table);
        expect(r.commonPer).to.equal(66);
        expect(r.uncommonPer).to.equal(30);
        expect(r.rarePer).to.equal(4);
    });
    describe("lenient mode", function() {
        it("adjusts proportionally if a category doesn't exist", function() {
            var table = new RarityTable(ion.identity, false);
            table.add("rare", "R");
            var r = calculatePercentageOfResults(table);
            expect(r.rarePer).to.equal(100);

            table = new RarityTable(ion.identity, false);
            table.add("rare", "R");
            table.add("common", "C");
            r = calculatePercentageOfResults(table);
            expect(r.rarePer).to.equal(8);
            expect(r.commonPer).to.equal(92);
            expect(r.uncommonPer).to.equal(0);

            table = new RarityTable(ion.identity, false);
            table.add("rare", "R");
            table.add("uncommon", "UC");
            r = calculatePercentageOfResults(table);
            expect(r.rarePer).to.equal(16);
            expect(r.commonPer).to.equal(0);
            expect(r.uncommonPer).to.equal(84);
        });
    });
});
