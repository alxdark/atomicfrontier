var expect = require('chai').expect;
var Item = require('../../src/models/item');
require('../before');

describe("atomic.models.Item", function() {

    it('has a name only constructor', function() {
        var item = new Item('boot');

        expect(item.name).to.equal('boot');
        expect(item.enc).to.equal(0);
        expect(item.value).to.equal(0);
        expect(item.type).to.equal("Item");
    });
    it('has a name only constructor', function() {
        var item = new Item({});

        expect(item.name).to.be.undefined;
        expect(item.enc).to.equal(0);
        expect(item.value).to.equal(0);
        expect(item.type).to.equal("Item");
    });
    it('has the correct toString/toHTML', function() {
        var item = new Item({name: "orange"});

        expect(item.toString()).to.equal("an orange");
        expect(item.toHTML()).to.equal("<p>an orange</p>");
    });
});