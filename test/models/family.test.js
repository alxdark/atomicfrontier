var expect = require('chai').expect;
var Character = require('../../src/models/character');
var Family = require('../../src/models/family');
var Name = require('../../src/models/name');

function suePowers() {
    return new Character({gender: "female", name: new Name({given:"Sue","family":"Powers"}), age: 22});
}
function davePowers() {
    return new Character({gender: "male", name: new Name({given:"Dave",family:"Powers"}), age: 23});
}
function craigPowers() {
    return new Character({gender: "male", name: new Name({given:"Craig",family:"Powers"}), age: 13});
}
function powersChildren() {
    var children = [];
    children.push(new Character({gender: "female", name: new Name({given:"Beverly",family:"Powers"}), age: 7}));
    children.push(new Character({gender: "male", name: new Name({given:"Dale",family:"Powers"}), age: 9}));
    return children;
}

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
    it("can express couple with no children, no relationship as a string", function() {
        var family = new Family({parent: suePowers(), other: davePowers()});
        expect(family.toString()).to.equal("Dave (23) & Sue (22) Powers. ");
    });
    it("can express couple with no children, and a relationship as a string", function() {
        var family = new Family({parent: suePowers(), other: davePowers(), relationship: "husband and wife"});
        expect(family.toString()).to.equal("Dave (23) & Sue (22) Powers (husband and wife). ");
    });
    it("can express couple with no children as HTML", function() {
        var family = new Family({parent: suePowers(), other: davePowers()});
        expect(family.toHTML()).to.equal('<div class="family"><p>Dave (23) & Sue (22) Powers. </p><div class="more"><p>Dave Powers. Age 23. </p> <p>Sue Powers. Age 22. </p></div></div>');
    });
    it("can express couple with no children, and a relationship as HTML", function() {
        var family = new Family({parent: davePowers(), other: suePowers(), relationship: "husband and wife"});
        expect(family.toHTML()).to.equal('<div class="family"><p>Dave (23) & Sue (22) Powers (husband and wife). </p><div class="more"><p>Dave Powers. Age 23. </p> <p>Sue Powers. Age 22. </p></div></div>');
    });
    it("can express a couple with children as text", function() {
        var family = new Family({parent: suePowers(), other: davePowers(), children: powersChildren()});
        expect(family.toString()).to.equal("Dave (23) & Sue (22) Powers. 2 children: Beverly Powers. Age 7.  Dale Powers. Age 9. ");
    });
    it("can express a couple with children as HTML", function() {
        var family = new Family({parent: suePowers(), other: davePowers(), children: powersChildren()});
        expect(family.toHTML()).to.equal('<div class="family"><p>Dave (23) & Sue (22) Powers. </p><div class="more"><p>Dave Powers. Age 23. </p> <p>Sue Powers. Age 22. </p></div><div class="children_preamble">2 children:</div><div class="children"><div class="child"><p>Beverly Powers. Age 7. </p></div><div class="child"><p>Dale Powers. Age 9. </p></div></div></div>');
    });
    it("can express a couple with different last names as test", function() {
        var sue = suePowers();
        sue.name.family = 'Smith';

        var family = new Family({parent: sue, other: davePowers(), children: powersChildren()});
        expect(family.toString()).to.equal('Dave Powers (23) & Sue Smith (22). 2 children: Beverly Powers. Age 7.  Dale Powers. Age 9. ');
    });
    it("can express a couple with different last and relationship names as test", function() {
        var sue = suePowers();
        sue.name.family = 'Smith';

        var family = new Family({parent: sue, other: davePowers(), relationship: "brother and sister"});
        expect(family.toString()).to.equal('Dave Powers (23) & Sue Smith (22). Brother and sister. ');
    });
    it("can express multi-generational families as test", function() {
        var family = new Family({parent: suePowers(), other: davePowers(), relationship: "husband and wife"});

        var subFamily = new Family({parent: suePowers(), other: craigPowers(), relationship: "husband and wife"})
        family.children = powersChildren();
        family.couples.push(subFamily);

        expect(family.toString()).to.equal('Dave (23) & Sue (22) Powers (husband and wife). 3 children: Beverly Powers. Age 7.  Dale Powers. Age 9. Craig (13) & Sue (22) Powers (husband and wife). ');
    });
    it("can express multi-generational families as html", function() {
        var family = new Family({parent: suePowers(), other: davePowers(), relationship: "husband and wife"});

        var subFamily = new Family({parent: suePowers(), other: craigPowers(), relationship: "husband and wife"})
        family.children = powersChildren();
        family.couples.push(subFamily);

        expect(family.toHTML()).to.equal('<div class="family"><p>Dave (23) & Sue (22) Powers (husband and wife). </p><div class="more"><p>Dave Powers. Age 23. </p> <p>Sue Powers. Age 22. </p></div><div class="children_preamble">3 children:</div><div class="children"><div class="child"><p>Beverly Powers. Age 7. </p></div><div class="child"><p>Dale Powers. Age 9. </p></div><div class="family"><p>Craig (13) & Sue (22) Powers (husband and wife). </p><div class="more"><p>Craig Powers. Age 13. </p> <p>Sue Powers. Age 22. </p></div></div></div></div>');
    });
    it("can express single parent families as text", function() {
        var family = new Family({parent: suePowers(), other: davePowers()});
        family.female.status = "deceased";

        // This doesn't say anything about the deceased partner.
        expect(family.toString()).to.equal('Dave Powers. Age 23. ');
    });
    it("can express single parent families as html", function() {
        var family = new Family({parent: suePowers(), other: davePowers()});
        family.female.status = "deceased";

        // This doesn't say anything about the deceased partner.
        expect(family.toHTML()).to.equal('<div class="family"><p>Dave Powers (23), undefined. </p><div class="more"><p>Dave Powers. Age 23. </p></div></div>');
    });
});