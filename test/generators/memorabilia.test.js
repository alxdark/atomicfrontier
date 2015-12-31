var expect = require('chai').expect;
var collectibles = require('../../src/generators/memorabilia');
var ion = require('../../src/ion');
require('../before');

describe("memorabilia", function() {
    describe("createMemorabilia()", function() {
        it("returns unique item instances", function() {
            Math.seedrandom('belgium');
            var poster = collectibles.createMemorabilia();
            Math.seedrandom('belgium');
            var poster2 = collectibles.createMemorabilia();
            expect(poster.title).to.equal(poster2.title);
            poster.title = "Change this one";
            expect(poster.title).to.not.equal(poster2.title);
        });
        it("generates random type by default", function() {
            var item = collectibles.createMemorabilia();
            var item2 = collectibles.createMemorabilia();
            expect(item.name).to.not.equal(item2.name);
        });
        it("correctly creates an encyclopedia", function() {
            var book = collectibles.createMemorabilia("encyclopedias");
            expect(book.name).to.equal("encyclopedia");
            expect(book.title).to.equal("Encyclopedia Britannica vol. XII, letter L, #12 of 24");
            expect(book.enc).to.equal(5);
            expect(book.tags.indexOf("collectible")).to.be.above(-1);
            expect(book.toString()).to.equal("an encyclopedia (Encyclopedia Britannica vol. XII, letter L, #12 of 24)");
        });
        it("correctly creates a baseball card", function() {
            var card = collectibles.createMemorabilia("baseball cards");
            expect(card.name).to.equal("Pennant brand 1958 baseball card{|s}");
            expect(card.title).to.equal("Ned Garver, Kansas City Athletics, #228 of 466");
            expect(card.enc).to.equal(0);
            expect(card.tags.indexOf("collectible")).to.be.above(-1);
            expect(card.toString()).to.equal("a Pennant brand 1958 baseball card (Ned Garver, Kansas City Athletics, #228 of 466)");
        });
        it("generates another collectible when requested", function() {
            var prop = collectibles.createMemorabilia({type: "propaganda posters"});
            expect(prop.name).to.equal("propaganda poster");
            expect(prop.title).to.equal("Rationing Means a Fair Share for All of Us #31 of 63");
            expect(prop.image).to.equal("images/propaganda/rationing_means_a_fair_share_for_all_of_us.gif");
            expect(prop.enc).to.equal(1);
            expect(prop.tags.indexOf("collectible")).to.be.above(-1);
            expect(prop.toString()).to.equal("a propaganda poster (Rationing Means a Fair Share for All of Us #31 of 63)");
        });
        it("accepts single string argument rather than parameter object", function() {
            var prop = collectibles.createMemorabilia("propaganda posters");
            expect(prop.name).to.equal("propaganda poster");
            expect(prop.title).to.equal("Rationing Means a Fair Share for All of Us #31 of 63");
            expect(prop.image).to.equal("images/propaganda/rationing_means_a_fair_share_for_all_of_us.gif");
            expect(prop.enc).to.equal(1);
            expect(prop.toString()).to.equal("a propaganda poster (Rationing Means a Fair Share for All of Us #31 of 63)");
        });
        it("throws error when type value is wrong", function() {
            expect(function() {
                collectibles.createMemorabilia("junk");
            }).to.throw("junk is an invalid collectible");
        });
        it("randomizes type when there is an invalid parameter object", function() {
            var item = collectibles.createMemorabilia({name: "temp"});
            var item2 = collectibles.createMemorabilia({name: "temp"});
            expect(item.name).to.equal("encyclopedia");
            expect(item.name).to.not.equal(item2.name);
        });
        it("can create a news magazine", function() {
            var mag = collectibles.createMemorabilia({type:'news magazines'});
            expect(mag.toString()).to.equal("a news magazine (Verve, Mar 1956, #2 of 31)");
        });
        it("can create a comic", function() {
            var comic = collectibles.createMemorabilia({type:'comics'});
            expect(comic.toString()).to.equal("a comic book (The Adventures of Captain Atom, Aug 1956, #7 of 31)");
        });
    });
    describe("getMemorabiliaTypes()", function() {
        it("returns all the collectible types", function() {
            expect(collectibles.getMemorabiliaTypes()).to.eql(["movie posters","propaganda posters","encyclopedias","baseball cards","news magazines","comics"]);
        });
    });
    describe("createMemorabiliaWanted()", function() {
        it("selects a random type", function() {
            var description = collectibles.createMemorabiliaWanted();
            expect(description.indexOf("Collector is looking for encyclopedias: Encyclopedia Britannica vol. II")).to.be.above(-1);
        });
        it("selects the specified type when provided", function() {
            var description =  collectibles.createMemorabiliaWanted("movie posters");
            expect(description.indexOf("Collector is looking for movie posters: Atomic Man")).to.be.above(-1);
        });
        xit("sometimes specifies that a whole team of baseball cards is collectible", function() {
            // To test this we have to override ion.test in the memorabilia.js module.
            var description =  collectibles.createMemorabiliaWanted("baseball cards");
        });
    })
});
