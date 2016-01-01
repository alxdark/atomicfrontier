var expect = require('chai').expect;
var ion = require('../../src/ion');
var Table = require('../../src/tables/table');
var rewire = require('rewire');
var createCorporateName = rewire('../../src/generators/corporate_name');
require('../before');

function stub(testResult, index1, index2) {
    var ionStub = ion.extend({}, ion);
    ionStub.test = function() {return testResult;}
    var restore1 = createCorporateName.__set__("ion", ionStub);

    var table1 = new Table(ion.transform);
    table1.add(100, createCorporateName.__get__("table1").rows[index1].object);
    var restore2 = createCorporateName.__set__("table1", table1);

    var table2 = new Table(ion.transform);
    table2.add(100, createCorporateName.__get__("table2").rows[index2].object);
    var restore3 = createCorporateName.__set__("table2", table2);

    return [restore1, restore2, restore3];
}

function restore(array) {
    array.forEach(function(restore) {restore();});
}

describe("createCorporateName()", function() {
    it("creates a name", function() {
        var name = createCorporateName();
        expect(name).to.equal("National Argon Research");
        name = createCorporateName();
        expect(name).to.equals("Griffin Development Instruments Foundation");
    });
    it("adjective adjective noun1 form", function() {
        var restores = stub(true, 0, 0);

        expect(createCorporateName()).to.equal("Alpha Radiation Research");

        restore(restores);
    });
    it("adjective noun1 form", function() {
        var restores = stub(true, 1, 0);

        expect(createCorporateName()).to.equal("Argon Engineering");

        restore(restores);
    });
    it("name adjective noun1 form", function() {
        var restores = stub(true, 2, 0);

        expect(createCorporateName()).to.equal("Baker Micro Electronics");

        restore(restores);
    });
    it("name noun1 form", function() {
        var restores = stub(true, 3, 0);

        expect(createCorporateName()).to.equal("Baker Research");

        restore(restores);
    });
    it("name noun2 form", function() {
        var restores = stub(true, 3, 1);

        expect(createCorporateName()).to.equal("Baker Corporation");

        restore(restores);
    });
    it("name noun1 noun2 form", function() {
        var restores = stub(true, 3, 2);

        expect(createCorporateName()).to.equal("Baker Research Supply Company");

        restore(restores);
    });
    it("adjective exception form", function() {
        var restores = stub(false, 0, 0);

        expect(createCorporateName()).to.equal("Micro Specialties Laboratory");

        restore(restores);
    });
});