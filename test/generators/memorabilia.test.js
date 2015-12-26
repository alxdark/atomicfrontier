var expect = require('chai').expect;
var collectibles = require('../../src/generators/memorabilia');
require('../seedrandom');

describe("collectibles", function() {
    beforeEach(function() {
        Math.seedrandom('belgium');
    });
    describe("createCollectible()", function() {
        it("generates a movie poster by default", function() {
            var poster = collectibles.createMemorabilia();
            expect(poster.name).to.equal("{|}Night Was Our Friend movie poster collectible (#42 of 85)");
            expect(poster.value).to.equal(10);
            expect(poster.image).to.equal("images/movie/night_was_our_friend.jpg");
            expect(poster.enc).to.equal(1);
        });
        it("generates another collectible when requested", function() {
            var prop = collectibles.createMemorabilia({type: "propaganda"});
            expect(prop.name).to.equal("{|}Rationing Means a Fair Share for All of Us propaganda poster collectible (#31 of 63)");
            expect(prop.image).to.equal("images/propaganda/rationing_means_a_fair_share_for_all_of_us.gif");
            expect(prop.enc).to.equal(1);
        });
        it("accepts single string argument rather than parmeter object", function() {
            var prop = collectibles.createMemorabilia("propaganda");
            expect(prop.name).to.equal("{|}Rationing Means a Fair Share for All of Us propaganda poster collectible (#31 of 63)");
            expect(prop.image).to.equal("images/propaganda/rationing_means_a_fair_share_for_all_of_us.gif");
            expect(prop.enc).to.equal(1);
        });
        it("throws error when type value is wrong", function() {
            expect(function() {
                collectibles.createMemorabilia("junk");
            }).to.throw("junk is an invalid collectible, use movies, propaganda, encyclopedia");
        });
        it("correctly creates an encyclopedia", function() {
            var book = collectibles.createMemorabilia("encyclopedia");
            expect(book.name).to.equal("{|}Encyclopedia Britannica, vol. XII (letter M, collectible #13 of 24)");
            expect(book.enc).to.equal(5);
        });
    });
    describe("getMemorabiliaTypes", function() {
        it("returns all the collectible types", function() {
            expect(collectibles.getMemorabiliaTypes()).to.eql(["movies","propaganda","encyclopedia"]);
        });
    });
});