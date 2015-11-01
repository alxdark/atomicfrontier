var expect = require('chai').expect;
var Database = require('../../src/db/database');

describe("atomic.db.Database", function() {
    it("can be created", function() {
        var db = new Database();
    });
});