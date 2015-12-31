var expect = require('chai').expect;
var Database = require('../../src/db/database');
require('../before');

describe("atomic.db.Database", function() {
    it("can be created", function() {
        var db = new Database();
    });
});