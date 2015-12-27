var expect = require('chai').expect;
var collectibles = require('../../src/generators/memorabilia');
var ion = require('../../src/ion');
require('../seedrandom');

describe("collectibles", function() {
    beforeEach(function() {
        Math.seedrandom('belgium');
    });
    describe("createCollectible()", function() {
        it("generates a movie poster by default", function() {
            var poster = collectibles.createMemorabilia();
            expect(poster.name).to.equal("movie poster");
            expect(poster.title).to.equal("Night Was Our Friend #42 of 85");
            expect(poster.value).to.equal(10);
            expect(poster.image).to.equal("images/movie/night_was_our_friend.jpg");
            expect(poster.enc).to.equal(1);
            expect(poster.tags.indexOf("collectible")).to.be.above(-1);
            expect(poster.toString()).to.equal("a movie poster (Night Was Our Friend #42 of 85)");
        });
        it("correctly creates an encyclopedia", function() {
            var book = collectibles.createMemorabilia("encyclopedias");
            expect(book.name).to.equal("encyclopedia");
            expect(book.title).to.equal("Encyclopedia Britannica vol. XII, letter M, #13 of 24");
            expect(book.enc).to.equal(5);
            expect(book.tags.indexOf("collectible")).to.be.above(-1);
            expect(book.toString()).to.equal("an encyclopedia (Encyclopedia Britannica vol. XII, letter M, #13 of 24)");
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
        it("accepts single string argument rather than parmeter object", function() {
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
            }).to.throw("junk is an invalid collectible, use movie posters, propaganda posters, encyclopedias, baseball cards");
        });
        it("defaults correctly when there is an invalid parameter object", function() {
            var poster = collectibles.createMemorabilia({name: "temp"});
            expect(poster.name).to.equal("movie poster");
        });
    });
    describe("getMemorabiliaTypes()", function() {
        it("returns all the collectible types", function() {
            expect(collectibles.getMemorabiliaTypes()).to.eql(["movie posters","propaganda posters","encyclopedias","baseball cards"]);
        });
    });
    describe("createMemorabiliaWanted()", function() {
        it("selects a random type", function() {
            var description = collectibles.createMemorabiliaWanted();
            expect(description.indexOf("Collector is looking for propaganda posters: Books Are Weapons")).to.be.above(-1);
        });
        it("selects the specified type when provided", function() {
            var description =  collectibles.createMemorabiliaWanted("movie posters");
            expect(description.indexOf("Collector is looking for movie posters: Atomic Man")).to.be.above(-1);
        });
    })
});
