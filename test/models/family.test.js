var expect = require('chai').expect;
var Family = require('../../src/models/family');

// TODO: This depends on characters, and on atomic.createCharacter, yikes!
xdescribe("ion.models.Family", function() {
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
        var f = atomic.createCharacter({gender: "female"});
        var m = atomic.createCharacter({gender: "male"});

        var family = new ion.models.Family({parent: f, other: m});
        expect(family.male).toEqual(m);
        expect(family.female).toEqual(f);
    });
    it("selects the single parent if the other is deceased or absent", function() {
        var f = atomic.createCharacter({gender: "female"});
        var m = atomic.createCharacter({gender: "male"});
        f.status = "deceased";

        var family = new ion.models.Family({parent: f, other: m});
        expect(family.single).toEqual(m);

        delete f.status;
        m.status = "absent";
        expect(family.single).toEqual(f);

        f.status = "deceased";
        expect(family.single).toEqual(null);
    });
    it("identifies a person as a parent", function() {
        var f = atomic.createCharacter({gender: "female"});
        var m = atomic.createCharacter({gender: "male"});
        var o = atomic.createCharacter();

        var family = new ion.models.Family({parent: f, other: m});
        expect(family.isParent(f)).toBeTruthy();
        expect(family.isParent(m)).toBeTruthy();
        expect(family.isParent(o)).toBeFalsy();
    });
});