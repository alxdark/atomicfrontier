var expect = require('chai').expect;
var createCorporateName = require('../../src/generators/corporate_name');
require('../before');

describe("createCorporateName()", function() {
    it("creates a name", function() {
        var name = createCorporateName();
        expect(name).to.equal("National Argon Research");

        name = createCorporateName();
        expect(name).to.equals("Griffin Development Instruments Foundation");
    });

});