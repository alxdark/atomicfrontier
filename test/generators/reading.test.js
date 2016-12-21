var expect = require('chai').expect;
var Item = require('../../src/models/item');
var reading = require('../../src/generators/reading');
require('../before');

describe("createMagazine()", function() {
    it("creates a magazine", function () {
        var m = reading.createMagazine();
        expect(m.constructor).to.equal(Item);
        expect(m.name).to.equal("magazine");
        expect(m.title).to.equal("Boy's Wild Frontier Magazine");
    });
});
describe("createBook()", function() {
    it("creates a book", function () {
        var b = reading.createBook();
        expect(b.constructor).to.equal(Item);
        expect(b.name).to.equal("book");
        expect(b.title).to.equal("Planning Guidance for Response to a Nuclear Detonation");
    });
});
