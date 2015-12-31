var expect = require('chai').expect;
var ItemDatabase = require('../../src/db/item_database');
require('../before');

describe("atomic.db.ItemDatabase", function() {
    it("can be created", function() {
        expect(new ItemDatabase().constructor).to.equal(ItemDatabase);
    });
    describe("item queries", function() {
        var db;
        beforeEach(function() {
            db = new ItemDatabase();
        });
        it("registers and return an item", function() {
            db.register("banana!0!0!rare");
            var item = db.find("*");
            expect(item.name).to.equal("banana");
        });
        it("creates a separate broken item when it finds a 'br' tag", function() {
            db.register("banana!0!0!rare br");
            expect(db.find("br").name).to.equal('broken banana');
            expect(db.find("-br").name).to.equal('banana');
        });
        it("matches conditions", function() {
            db.register("banana!2!2!rare", "apple!3!3!rare");
            var item = db.find({tags: "*", maxValue: 2});
            expect(item.name).to.equal('banana');

            item = db.find({tags: "*", minValue: 3});
            expect(item.name).to.equal('apple');

            item = db.find({tags: "*", maxEnc: 2});
            expect(item.name).to.equal('banana');

            item = db.find({tags: "*", minEnc: 3});
            expect(item.name).to.equal('apple');
        });
        it("matches item names (in camel case)", function() {
            db.register("key!1!.5!common");
            var item = db.find('key');
            expect(item.name).to.equal('key');
        });
        it("matches OR based searches", function() {
            db.register("banana!2!2!rare fruit", "apple!4!4!rare luxury");

            var table = db.findAll("luxury | fruit");
            expect(table.rows.length).to.equal(2);
        });
        it("respects conditions that are part of OR searches", function() {
            db.register("banana!2!2!rare fruit", "apple!4!4!rare luxury");
            item = db.find({tags: "luxury | fruit", minValue:3});
            expect(item.name).to.equal('apple');
        });
        it("removes the breakable tag from an item after registering it", function() {
            db.register("banana!2!2!rare br fruit");

            var banana = db.find("fruit -br");
            expect(banana.is('br')).to.be.false;

            banana = db.find("br fruit");
            expect(banana.is('br')).to.be.true;
        });
        it("halves the value of a broken item", function() {
            db.register("banana!5!4!rare br fruit");

            banana = db.find("br fruit");
            expect(banana.value).to.equal(2);
        });
        it("finds items by singular simple name as a tag", function() {
            db.register("roll{|s} of polaroid film (10 shots)!1!1!common film");
            var film = db.find("rollofpolaroidfilm");
            expect(film).not.to.be.null;
        });
        it("finds items by their name in lower-case", function() {
            db.register("Colt .45 Pistol!0!0!common weapon");
            var pistol = db.find("colt45pistol");
            expect(pistol).not.to.be.null;
        });
    });
});