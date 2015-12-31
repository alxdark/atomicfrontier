var expect = require('chai').expect;
var historicalDates = require('../../src/generators/historical_time_series');
require('../before');

describe("historical dates sequences", function() {
    it("rejects invalid period", function() {
        expect(function() {
            historicalDates({period:'foo'});
        }).to.throw("foo is not a valid period.");
    });
    it("creates sequence of weeks on a day of the week", function() {
        var dates = historicalDates({period:'weekly',dayOfWeek:'Saturday'});

        for (var i=0; i < dates.length; i++) {
            expect(dates[i].indexOf("Saturday")).to.be.above(-1);
        }
    });
    it("creates sequence of months", function() {
        var dates = historicalDates({period:'monthly'});

        expect(dates[0]).to.equal("Sunday 1 Jan 1956");
        expect(dates[1]).to.equal("Wednesday 1 Feb 1956");
        expect(dates[2]).to.equal("Thursday 1 Mar 1956");
        expect(dates[3]).to.equal("Sunday 1 Apr 1956");
    });
    it("creates sequence of months on a day of the week", function() {
        var dates = historicalDates({period: 'monthly', dayOfWeek: 'Wednesday'});

        expect(dates[0]).to.equal("Wednesday 4 Jan 1956");
        expect(dates[1]).to.equal("Wednesday 1 Feb 1956");
        expect(dates[2]).to.equal("Wednesday 7 Mar 1956");
        expect(dates[3]).to.equal("Wednesday 4 Apr 1956");
    });
    it("creates sequence of bi-weeklies", function() {
        var dates = historicalDates({period:'biweekly'});

        expect(dates[0]).to.equal("Sunday 1 Jan 1956");
        expect(dates[1]).to.equal("Sunday 15 Jan 1956");
        expect(dates[2]).to.equal("Wednesday 1 Feb 1956");
        expect(dates[3]).to.equal("Wednesday 15 Feb 1956");
    });
    it("creates sequence of bi-weeklies on a day of the week", function() {
        var dates = historicalDates({period: 'biweekly', dayOfWeek: 'Monday'}) ;

        expect(dates[0]).to.equal("Monday 2 Jan 1956");
        expect(dates[1]).to.equal("Monday 16 Jan 1956");
        expect(dates[2]).to.equal("Monday 6 Feb 1956");
        expect(dates[3]).to.equal("Monday 20 Feb 1956");
    });
    it("creates sequence of bi-monthlies", function() {
        var dates = historicalDates({period: 'bimonthly', format: 'short', startDate: '1963-01-01', endDate: '1963-12-31'});

        expect(dates.length).to.equal(6);
        expect(dates[0]).to.equal("Jan 1963");
        expect(dates[1]).to.equal("Mar 1963");
        expect(dates[2]).to.equal("May 1963");
        expect(dates[3]).to.equal("Jul 1963");
        expect(dates[4]).to.equal("Sep 1963");
        expect(dates[5]).to.equal("Nov 1963");
    });
    it("can set the years for the date range", function() {
        var dates = historicalDates({period:'monthly', startDate:'1962-01-01', endDate:'1963-01-01'});

        expect(dates.length).to.equal(12);
        expect(dates[0]).to.equal("Monday 1 Jan 1962");
        expect(dates[1]).to.equal("Thursday 1 Feb 1962");
        expect(dates[2]).to.equal("Thursday 1 Mar 1962");
        expect(dates[3]).to.equal("Sunday 1 Apr 1962");
    });
});


