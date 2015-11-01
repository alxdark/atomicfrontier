var HashTable = require('../../src/tables/hash_table');
var expect = require('chai').expect;

describe("atomic.tables.HashTable", function() {

    var table = null;
    beforeEach(function() {
        table = new HashTable();
    });

    it("hashes items under one or more keys", function() {
        table.put(1, 2, 3, "A");
        expect(table.get(1)).to.equal("A");
        expect(table.get(2)).to.equal("A");
        expect(table.get(3)).to.equal("A");
    });
    it("transforms based on outFunction", function() {
        table = new HashTable(function(value) {
            return value + value;
        });
        table.put(1, "A");
        expect(table.get(1)).to.equal("AA");
    });
    it("supplies a default value for an unknown key", function() {
        table = new HashTable(function(b) { return b; });
        expect(table.get("foo")).to.equal(null);

        table.put("default", "A");
        expect(table.get("foo")).to.equal("A");
    });

});
