var expect = require('chai').expect;
var sinon = require('sinon');
var db = require('../../src/generators/data').storeDatabase;
var createStore = require('../../src/generators/store');
var Store = require('../../src/models/store');
var createCharacter = require('../../src/generators/character').createCharacter;
require('../before');

describe("atomic.createStore()", function() {
    it("can create a store", function() {
        var store = createStore();
        expect(store.constructor).to.equal(Store);
    });
    it("uses name if provided", function() {
        var store = createStore({"name":"Big Bills Sporting Goods"});
        expect(store.name).to.equal("Big Bills Sporting Goods");
    });
    it("uses place name if provided", function() {
        var successful = false, store = null;
        for (var i=0; i < 10; i++) {
            store = createStore({"placeName":"Buck's Landing"});
            if (store.name.indexOf("Buck's Landing") > -1) {
                successful = true;
                break;
            }
        }
        expect(successful).to.be.true;
    });
    it("uses character as store owner if provided", function() {
        var c = createCharacter();
        var store = createStore({"owner":c});
        expect(store.owner).to.equal(c);
    });
    it("uses the value of store's inventory if provided", function() {
        var store = createStore({value: 1000});
        expect(store.totalValue > 980).to.be.true;
    });
    it("takes a tag for the store configuration query", function() {
        try {
            sinon.spy(db, "find");
            var store = createStore({"tags": "encampment"});
            var call = db.find.getCall(0);
            expect(call.args[0]).to.equal("encampment");
        } finally {
            db.find.restore();
        }
    });
});
