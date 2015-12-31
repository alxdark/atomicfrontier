var atomic = require('../src/atomic.js');
var expect = require('chai').expect;
require('./before');

describe('version', function() {
    it('should return version 1.0.0', function() {
        expect(atomic.version).to.equal('1.0.0');
    });
    it('should have models subpackage', function() {
        expect(atomic.models).to.not.be.null;
        expect(atomic.models.Model).to.not.be.null;
    });
    it('should have tables subpackage', function() {
        expect(atomic.tables).to.not.be.null;
        expect(atomic.tables.Table).to.not.be.null;
    });
});