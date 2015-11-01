var expect = require('chai').expect;
var ion = require('../../src/ion');
var Character = require('../../src/models/character');
var createCharacterName = require('../../src/generators/character_name');
var createGang = require('../../src/generators/gang').createGang
var getGangTypes = require('../../src/generators/gang').getGangTypes;
var assignNickname = require('../../src/generators/gang').assignNickname;
var Gang = require('../../src/models/gang');
require('../seedrandom');

function clear() {
    Math.seedrandom('belgium');
}

describe("getGangTypes()", function() {
    beforeEach(clear);
    it("returns valid values", function() {
        var types = getGangTypes();
        expect(types[0]).to.equal("Army Patrol");
    });
});
describe("createGang()", function() {
    beforeEach(clear);
    it("returns a gang instance", function() {
        var g = createGang();
        expect(g.constructor).to.equal(Gang);
    });
    it("creates the right number of members", function() {
        var g = createGang({count:6});
        expect(g.members.length).to.equal(6);

        g = createGang({count:0});
        expect(g.members.length).to.equal(0);
    });
    it("creates a gang of the right type", function() {
        expect(function() {
            createGang({type: "fooboo"});
        }).to.throw;

        var g = createGang({type: "Biker Gang"});
        expect(g.kind).to.equal("Biker Gang");
    });
    it("creates a gang with no args", function() {
        var g = createGang();
        expect(g.members.length).to.equal(2);
        expect(g.kind).to.equal("Cowboy Posse");
    });
    it("creates a gang-specific gang names", function() {
        var g = createGang({type: "Street Gang"});
        expect(g.name).not.to.be.undefined;
    });
    it("creates a marine patrol of privates with one leader", function() {
        var g = createGang({type: "Marine Patrol"});
        var privates = g.members.filter(function(member) {
            return (member.honorific.indexOf("Private") > -1);
        }).length;
        expect(privates).to.equal(g.members.length-1);
    });
    it("creates gang members with nicknames", function() {
        var g = createGang({type: "Street Gang"});
        var nicks = g.members.filter(function(member) {
            return (member.name.nickname);
        }).length;
        expect(nicks).to.equal(g.members.length);
    });
    it("assigns initiative and hp", function() {
        var g = createGang({type: "Street Gang"});
        g.members.forEach(function(member) {
            if (!member.initiative || !member.hp) {
                throw new Error("Gang member did not have initiative or hp");
            }
        });
    });
    it("assigns gang-specific traits", function() {
        var g = createGang({type: "Biker Gang"});
        g.members.forEach(function(member) {
            if (member.trait("Motorcycling") === 0) {
                throw new Error("Biker gang member did not have motorcycling trait");
            }
        });
    });
});
describe("assignNickname()", function() {
    beforeEach(clear);
    it("assigns nickname to character", function() {
        var c = new Character({
            name: createCharacterName()
        });
        assignNickname(c);
        expect(c.name.nickname).to.not.be.undefined;
        expect(c.name.nickname).to.not.be.null;
    });
});