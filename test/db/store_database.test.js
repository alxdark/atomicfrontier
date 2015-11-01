var expect = require('chai').expect;
var StoreDatabase = require('../../src/db/store_database');

describe("atomic.db.StoreDatabase", function() {
    it("can be created", function() {
        expect(new StoreDatabase().constructor).to.equal(StoreDatabase);
    });
});