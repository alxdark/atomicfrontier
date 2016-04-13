var expect = require('chai').expect;
var rewire = require("rewire");
var getLocation = rewire('../../src/generators/location').getLocation;
var ion = require('../../src/ion');
require('../before');

describe("getLocation()", function() {
    it("works", function () {
        console.log(getLocation());
    });
});
