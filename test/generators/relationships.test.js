var expect = require('chai').expect;
var sinon = require('sinon');
var db = require('../../src/generators/data').professionDatabase;
var ion = require('../../src/ion');
var Family = require('../../src/models/family');
var createFamily = require('../../src/generators/relationships').createFamily;
require('../before');

describe("createFamily()", function() {
    function collectKin(array, family) {
        array.push(family.male);
        array.push(family.female);
        family.children.forEach(function(child) {
            array.push(child);
        });
        family.couples.forEach(function(f) {
            collectKin(array, f);
        });
    }

    function getPrestige(c) {
        if (c.is('normal')) return "normal";
        else if (c.is('low')) return "low";
        else if (c.is('high')) return "high";
        else throw new Error("Profession does not have set prestige: " + c.profession);
    }
    it("creates a family with no args", function() {
        var f = createFamily();

        expect(f.constructor).to.equal(Family);
        expect(f.children.length).to.not.be.null;
        expect(f.relationship).to.not.be.null;
    });
    it("creates a family with N generations", function() {
        try {
            sinon.stub(ion, "nonNegativeGaussian").returns(5);

            var f = createFamily({generations:3});
            expect(f.couples.length).to.equal(1);
            expect(f.couples[0].couples.length).to.equal(0);

            f = createFamily({generations:4});
            expect(f.couples[0].couples.length).to.equal(1);
            expect(f.couples[0].children.length).to.equal(4);
        } finally {
            ion.nonNegativeGaussian.restore();
        }
    });
    it("passes parent information to woman who takes husband's name", function() {
        var params = {
            name: "Eva Gruntlig",
            gender: "female",
            age: 58,
            profession: "trader"
        };

        var f = createFamily({parent: params});

        expect(f.male.name.family).to.equal(f.female.name.family);
        var female = f.female;
        expect(female.name.given).to.equal("Eva");
        expect(female.gender).to.equal("female");
        expect(female.age).to.equal(58);
        expect(female.profession).to.equal("Trader");
    });
    it("passes parent information creation of parent (male)", function() {
        var params = {
            name: "Dave Pringle",
            gender: "male",
            age: 32,
            profession: "raider"
        };
        // Got to keep it one generation, or Dave Pringle is aged.
        var f = createFamily({generations: 1, parent: params});
        var male = f.male;
        expect(male.name.toString()).to.equal("Dave Pringle");
        expect(male.gender).to.equal("male");
        expect(male.age).to.equal(32);
        expect(male.profession).to.equal("Raider");
    });
    it("ages family members as generations are created", function() {
        var f = createFamily({generations: 3});
        var grandparent = f.male;
        var parent = f.couples[0].male;
        var grandchild = f.couples[0].children[0];
        expect(grandparent.age).to.be.above(parent.age);
        expect(parent.age).to.be.above(grandchild.age);
    });
    it("assigns all members of family to different professions, at same level of prestige", function() {
        var f = createFamily({generations: 5, parent: {profession: 'doctor'}});
        var p = db.find(f.male.profession);

        var prestige = getPrestige(p), kin = [];
        collectKin(kin, f);

        kin.filter(function(person) {
            if (person.profession) {
                var p = db.find( ion.toTag(person.profession) );
                expect(getPrestige(p)).to.equal('high');
            }
        });
    });
});