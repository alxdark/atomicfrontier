var expect = require('chai').expect;
var IonSet = require('../../src/models/ion_set');

describe("atomic.models.IonSet", function() {
    it("initializes with an array", function() {
        var set = new IonSet([1,2,3,3]);

        expect(set.size()).to.equal(3);
        expect(set.has(2)).to.be.true;

        expect(new IonSet().size()).to.equal(0);
    });
    it("can be cleared", function() {
        var set = new IonSet([1,2,3,3]);
        set.clear();
        expect(set.size()).to.equal(0);
    });
    it("can add items to the set (if unique)", function() {
        var set = new IonSet([1,2,3,3]);
        set.add(4);

        expect(set.size()).to.equal(4);
        expect(set.has(4)).to.be.true;

        set.add(4);

        expect(set.size()).to.equal(4);
        expect(set.has(4)).to.be.true;
    });
    it("can remove an item", function() {
        var set = new IonSet([1,2,3]);
        set.remove(1);
        expect(set.size()).to.equal(2);
        expect(set.has(1)).to.be.false;
    });
    it("can be converted to an array", function() {
        var set = new IonSet([1,2,3]);
        expect(set.toArray()).to.eql([1,2,3]);
    });
});