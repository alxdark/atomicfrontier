var expect = require('chai').expect;
var Model = require('../../src/models/model');
require('../before');

describe("atomic.models.Model", function() {
    var model;
    beforeEach(function() {
        model = new Model({
            tags: ["Firearm","ammo:45cal"], prop: 1, anotherProp: ['A','B']
        });
    });

    it("has type property 'Model'", function() {
        expect(model.type).to.equal("Model");
        expect(model instanceof Model).to.be.true;
        expect(model.constructor).to.equal(Model);
    });
    it("includes any properties passed in", function() {
        expect(model.prop).to.equal(1);
        expect(model.anotherProp).to.eql(['A','B']);
    });
    it("has tags semantics", function() {
        expect(model.is('con:polaroid')).to.be.false;
        expect(model.is('Firearm')).to.be.true;
        expect(model.is('ammo:45cal')).to.be.true;
        expect(model.has('con:polaroid')).to.be.false;
        expect(model.has('Firearm')).to.be.true;
        expect(model.has('ammo:45cal')).to.be.true;
        expect(model.not('con:polaroid')).to.be.true;
        expect(model.not('Firearm')).to.be.false;
        expect(model.not('ammo:45cal')).to.be.fasle;
        expect(model.typeOf('ammo')).to.equal('ammo:45cal');
        expect(model.typeOf('Firearm')).to.be.undefined;
    });

});
