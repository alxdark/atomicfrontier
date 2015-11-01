var expect = require('chai').expect;
var Character = require('../../src/models/character');
var Family = require('../../src/models/family');

describe("atomic.models.Family", function() {
    var f;
    beforeEach(function() {
        f = new Family();
    });

    it("has children and couple collections", function() {
        expect(f.children).to.be.array;
        expect(f.couples).to.be.array;
    });
    it("has a child count for both children and children in couples", function() {
        var c = new Character();
        expect(f.childCount).to.equal(0);
        f.children.push(c);
        f.children.push(c);
        f.couples.push(c);
        expect(f.childCount).to.equal(3);
    });
    it("selects the male/female parent via the male/female property", function() {
        var f = new Character({gender: "female"});
        var m = new Character({gender: "male"});

        var family = new Family({parent: f, other: m});
        expect(family.male).to.equal(m);
        expect(family.female).to.equal(f);
    });
    it("selects the single parent if the other is deceased or absent", function() {
        var f = new Character({gender: "female"});
        var m = new Character({gender: "male"});
        f.status = "deceased";

        var family = new Family({parent: f, other: m});
        expect(family.single).to.equal(m);

        delete f.status;
        m.status = "absent";
        expect(family.single).to.equal(f);

        f.status = "deceased";
        expect(family.single).to.equal(null);
    });
    it("identifies a person as a parent", function() {
        var f = new Character({gender: "female"});
        var m = new Character({gender: "male"});
        var o = new Character();

        var family = new Family({parent: f, other: m});
        expect(family.isParent(f)).to.be.true;
        expect(family.isParent(m)).to.be.true;
        expect(family.isParent(o)).to.be.false;
    });
});