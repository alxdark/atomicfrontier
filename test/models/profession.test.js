var expect = require('chai').expect;
var Profession = require('../../src/models/profession');
var Character = require('../../src/models/character');
var ion = require('../../src/ion');
var sinon = require('sinon');

describe("atomic.models.Profession", function() {

    var p;
    beforeEach(function() {
        p = new Profession({
            tags: ["FirefightingTag"],
            names: ["Firefighter"],
            seeds: ["Firefighting"],
            supplements: ["Firefighting", "Grilling"]
        });
    });

    describe("constructor", function() {
        it("supports traits", function() {
            expect(p.supplements[0]).to.equal("Firefighting");
            expect(p.supplements[1]).to.equal("Grilling");
        });
    });
    describe("train()", function() {
        it("trains exactly the right number of points", function() {
            var c = new Character();
            p.train(c, 4);
            expect(c.points).to.equal(4);
        });
        it("trains only seed/supplement traits", function() {
            var c = new Character();
            p.train(c, 8);
            expect(ion.keys(c.traits)).to.eql(["Firefighting", "Grilling"]);
        });
        it("seed traits are not zero", function() {
            var c = new Character();
            p.train(c, 4);
            expect(c.traits['Firefighting']).to.be.above(0);
        });
        it("calls postprocess", function() {
            p.postprocess = sinon.spy();
            var c = new Character();
            p.train(c, 4);
            expect(p.postprocess.called).to.be.true;

        });
        it("caps trait values at 4", function() {
            var c = new Character();
            p.train(c, 40);
            expect(c.points).to.equal(8);
        });
        it("copies over tags from profession to character", function() {
            var c = new Character();
            p.train(c, 40);
            expect(c.tags.indexOf("FirefightingTag") > -1).to.be.true;
        });
    });
});