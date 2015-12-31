var expect = require('chai').expect;
var Name = require('../../src/models/name');
require('../before');

describe("atomic.models.Name", function() {
    var name;
    beforeEach(function() {
        name = new Name({given: "Mary", family: "Johnson"});
    });

    it("is the right type", function() {
        expect(name instanceof Name).to.be.true;
    });
    it("has the correct first name", function() {
        expect(name.given).to.equal("Mary");
        expect(name.first).to.equal("Mary");
    });
    it("has the correct last name", function() {
        expect(name.family).to.equal("Johnson");
        expect(name.last).to.equal("Johnson");
    });
    it("shows the correct full name", function() {
        expect(name.toString()).to.equal("Mary Johnson");
    });
    it("uses a nickname when present", function() {
        name.nickname = "Le Comedianne";
        expect(name.toString()).to.equal("Le Comedianne");
    });
});
