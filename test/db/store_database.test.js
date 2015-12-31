var expect = require('chai').expect;
var StoreDatabase = require('../../src/db/store_database');
require('../before');

describe("atomic.db.StoreDatabase", function() {
    it("can be created", function() {
        expect(new StoreDatabase().constructor).to.equal(StoreDatabase);
    });
});