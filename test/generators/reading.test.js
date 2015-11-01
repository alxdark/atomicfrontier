var expect = require('chai').expect;
var Item = require('../../src/models/item');
var createMagazine = require('../../src/generators/reading').createMagazine;
var createBook = require('../../src/generators/reading').createBook;
var createTitle = require('../../src/generators/reading').createTitle;
require('../seedrandom');

describe("createMagazine()", function() {
    beforeEach(function() {
        Math.seedrandom('belgium');
    });
    it("creates a magazine", function() {
        var m = createMagazine();
        expect(m.constructor).to.equal(Item);
        expect(m.title).to.equal("Boy's Frontier Magazine");
    });
    xit("creates a book", function() {
        var b = createBook();
        expect(b.constructor).to.equal(Item);
        expect(b.name).to.equal("");
    });
    it("creates a title", function() {
        var title = createTitle();
        expect(title).to.equal("The dead flight of light");
    });
});
