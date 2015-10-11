var atomic = require('../src/index.js');
var expect = require('chai').expect;

describe('version', function() {
    it('should return version 0.1.0', function() {
        expect(atomic.version).to.equal('0.1.0');
    });
});