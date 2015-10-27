var atomic = require('../src/atomic.js');
var expect = require('chai').expect;

describe("Builder", function() {

    var b;

    beforeEach(function() {
        b = atomic.Builder({}); // or new Builder(), doesn't matter
    });

    it("expects a context object", function() {
        expect(function() {
            atomic.Builder();
        }).to.throw;
    });
    it("append (string)", function() {
        b("This is a simple append");
        expect(b.toString()).to.equal("This is a simple append");
    });
    it("append (boolean, string)", function() {
        b(true, "truely");
        expect(b.toString()).to.equal("truely");

        b = atomic.Builder({});
        b(false, "falsely");
        expect(b.toString()).to.equal("");
    });
    it("format (string+)", function() {
        var absent;
        b("This is a {0} append", absent);
        expect(b.toString()).to.equal("");

        b("This is a {0} append", null);
        expect(b.toString()).to.equal("");

        b("This is a {0} append", "simple");
        expect(b.toString()).to.equal("This is a simple append");
    });
    it("each (array, function)", function() {
        var array = ['a','b','c'];

        var result = b(['a','b','c'], function(b, e) {
            b("{0}*", e);
        }).toString();
        expect(result).to.equal("a*b*c*");

        b = atomic.Builder({});
        result = b([], function(b, e) {
            b("{0}*", e);
        }).toString();
        expect(result).to.equal("");
    });
    it("when (boolean, function)", function() {
        b(!!{}, function(b) {
            b("this passes");
        });
        expect(b.toString()).to.equal("this passes");

        b = atomic.Builder({});
        b(!!!{}, function(b) {
            b("this doesn't pass");
        });
        expect(b.toString()).to.equal("");
    });
    it("either (boolean, function, function", function() {
        function trueFunc(b) {
            b("true");
        }
        function falseFunc(b) {
            b("false");
        }
        b(true, trueFunc, falseFunc);
        expect(b.toString()).to.equal("true");

        b = atomic.Builder({});
        b(false, trueFunc, falseFunc);
        expect(b.toString()).to.equal("false");
    });
    it("tag (string, object, function", function() {
        b("p", {class: 'foo'}, function(b) {
            b("content");
        });
        expect(b.toString()).to.equal('<p class="foo">content</p>');
    });
    it("simpletag (string, object, string", function() {
        b("p", {class: 'foo'}, "content");
        expect(b.toString()).to.equal('<p class="foo">content</p>');

        b = atomic.Builder({});
        b("p", {class: 'foo'}, "");
        expect(b.toString()).to.equal('<p class="foo"></p>');
    });
    it("plural (string, number", function() {
        b("apricot", 2);
        expect(b.toString()).to.equal("2 apricots");

        b = atomic.Builder({});
        b("apricot", 1);
        expect(b.toString()).to.equal("an apricot");

        b = atomic.Builder({});
        b("apricot", 0); // plural just returns singular here
        expect(b.toString()).to.equal("an apricot");
    });
    it("Uses context object", function() {
        var obj = {name: "Belgian", cost: 3};

        b = new atomic.Builder(obj); // new shouldn't break this

        b(true, function(b) {
            b("{name} chocolate cost ${cost}", this);
        });
        expect(b.toString()).to.equal("Belgian chocolate cost $3");
    });
});
