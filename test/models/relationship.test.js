var expect = require('chai').expect;
var Relationship = require('../../src/models/relationship');
var Character = require('../../src/models/character');
var Name = require('../../src/models/name');

describe("atomic.models.Relationship", function() {
    var rel, char1, char2;
    beforeEach(function() {
        Math.seedrandom('belgium');
        char1 = new Character({name: new Name({given:"Jack",family:"Aubrey"}), gender:'male', age:40});
        char2 = new Character({name: new Name({given:"Jane",family:"Aubrey"}), gender:'female', age:7});
        rel = new Relationship(char1, char2, "father and daughter");
    });
    it("records the members of the relationship", function() {
        expect(rel.older).to.equal(char1);
        expect(rel.younger).to.equal(char2);
        expect(rel.relationship).to.equal('father and daughter');
    });
    it("has proper toString()", function() {
        expect(rel.toString()).to.equal('Jack (40) & Jane (7) Aubrey (father and daughter). ');
    });
    it("has proper toHTML()", function() {
        expect(rel.toHTML()).to.equal('<p>Jack (40) & Jane (7) Aubrey (father and daughter). </p><div class="more"><p>Jack Aubrey. Age 40. </p> <p>Jane Aubrey. Age 7. </p></div>');
    });
});
