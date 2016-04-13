var ion = require('../src/ion.js');
var expect = require('chai').expect;
require('./before');

describe("ion", function() {
    var array;
    beforeEach(function() {
        Math.seedrandom('belgium');
        array = ['A','B','C'];
    });
    describe("is*() methods", function() {
        it("identifies isUndefined values", function() {
            expect(ion.isUndefined(undefined)).to.be.true;
            expect(ion.isUndefined(false)).to.be.false;
        });
        it("identifies arrays", function() {
            expect(ion.isArray([])).to.be.true;
            expect(ion.isArray(new Array())).to.be.true;
            expect(ion.isArray(1)).to.be.false;
        });
        it("identifies strings", function() {
            expect(ion.isString('A')).to.be.true;
            expect(ion.isString(new String('A'))).to.be.true;
            expect(ion.isString(1)).to.be.false;
        });
        it("identifies functions", function() {
            expect(ion.isFunction(function() {})).to.be.true;
            expect(ion.isFunction(new Function(""))).to.be.true;
            expect(ion.isFunction(0)).to.be.false;
        });
        it("identifies dates", function() {
            expect(ion.isDate(new Date())).to.be.true;
            expect(ion.isFunction("")).to.be.false;
        });
        it("identifies regular expressions", function() {
            expect(ion.isRegExp(/abc/)).to.be.true;
            expect(ion.isRegExp("")).to.be.false;
        });
        it("identifies booleans", function() {
            expect(ion.isBoolean(true)).to.be.true;
            expect(ion.isBoolean(false)).to.be.true;
            expect(ion.isBoolean(1)).to.be.false;
        });
        it("identifies numbers", function() {
            expect(ion.isNumber(0)).to.be.true;
            expect(ion.isNumber(new Number(3))).to.be.true;
            expect(ion.isNumber("")).to.be.false;
        });
        it("identifies objects", function() {
            expect(ion.isObject({})).to.be.true;
            expect(ion.isObject(new Object())).to.be.true;
            expect(ion.isObject("")).to.be.false;
            expect(ion.isObject(3)).to.be.false;
        });
    });
    describe("ion.identity()", function() {
        it("returns what it was passed", function() {
            expect(ion.identity("A")).to.equal("A");
        });
    });
    describe("ion.contains()", function() {
        it("finds item in array", function() {
            expect(ion.contains(["A","B","C"], "C")).to.be.true;
        });
        it("does not find item not in array", function() {
            expect(ion.contains(["A","B","C"], "D")).to.be.false;
        });
        it("operates on argument methods", function() {
            function test() {
                return ion.contains(arguments, "C");
            }
            expect(test("A","B","C")).to.be.true;
        });
    });
    describe("ion.find()", function() {
        it("finds item in an array", function() {
            var array = ["A","A","B","C"];
            expect(ion.find(array, function(v) { return v === "B"; })).to.equal("B");
        });
        it("does not find and item in an array", function() {
            var array = ["A","A","B","C"];
            expect(ion.find(array, function(v) { return v === "D"; })).to.equal(null);
        });
        it("operates on argument methods", function() {
            function test() {
                return ion.find(arguments, function(v) { return v === "C"; });
            }
            expect(test("A","B","C")).to.equal("C");
        });
    });
    describe("ion.keys()/ion.values()", function() {
        it("finds the keys on an object", function() {
            expect(ion.keys({A: 1, B: 2}).sort()).to.eql(["A","B"]);
        });
        it("finds the values on an object", function() {
            expect(ion.values({A: 1, B: 2}).sort()).to.eql([1,2]);
        });
        it("returns empty arrays when object is empty", function() {
            expect(ion.keys({}).sort()).to.eql([]);
            expect(ion.values({}).sort()).to.eql([]);
        });
        it("returns empty arrays when object is not present", function() {
            expect(ion.keys().sort()).to.eql([]);
            expect(ion.values().sort()).to.eql([]);
        });
    });
    describe("ion.times()", function() {
        var sum = 0;
        function clear() {
            sum = 0;
        }
        function add() {
            sum++;
        }

        it("executes a function N times", function() {
            clear();
            ion.times(0, add);
            expect(sum).to.equal(0);
            clear();
            ion.times(3, add);
            expect(sum).to.equal(3);
            clear();
            ion.times(-5, add);
            expect(sum).to.equal(0);
        });
    });
    describe("ion.last()", function() {
        it("returns null for empty array", function() {
            expect(ion.last([])).to.equal(null);
            expect(ion.last()).to.equal(null);
        });
        it("returns last item in an array", function() {
            expect(ion.last(["A","B","C"])).to.eql("C");
        });
        it("operates on arguments objects", function() {
            function test() {
                return ion.last(arguments);
            }
            expect(test(1,2,3)).to.equal(3);
            expect(test()).to.equal(null);
        });
    });
    describe("ion.unique()", function() {
        it("eliminates duplicate elements from an array", function() {
            var array = ion.unique([1,2,3,3,3,4]);
            expect(array.length).to.equal(4);
            expect(array.join(' ')).to.equal('1 2 3 4');
        });
        it("returns an empty array when none is provided", function() {
            expect(ion.unique().length).to.equal(0);
        });
        it("operates on arguments object", function() {
            function test() {
                return ion.unique(arguments);
            }
            expect(test(1,2,2,3,3)).to.eql([1,2,3]);
        });
    });
    describe("ion.intersection()", function() {
        beforeEach(function() {
            a = [1,3,3];
            b = [3,4,5];
            i = ion.intersection(a,b);
        });
        it("finds the intersection between two arrays", function() {
            expect(i.length).to.equal(1);
            expect(i[0]).to.equal(3);
        });
        it("handles an incorrect number of arrays", function() {
            expect(ion.union().length).to.equal(0);
            expect(ion.union([]).length).to.equal(0);
            expect(ion.union([], []).length).to.equal(0);
        });
        it("doesn't include any duplicates", function() {
            expect(i.length).to.equal(ion.unique(i).length);
        });
        it("doesn't change the original arrays", function() {
            expect(a.length).to.equal(3);
            expect(b.length).to.equal(3);
        });
    });
    describe("ion.union()", function() {
        beforeEach(function() {
            a = [1,3,3];
            b = [3,4,5];
            i = ion.union(a,b);
        });
        it("handles an incorrect number of arrays", function() {
            expect(ion.union().length).to.equal(0);
            expect(ion.union([]).length).to.equal(0);
            expect(ion.union([], []).length).to.equal(0);
        });
        it("finds the union between two arrays", function() {
            expect(i.length).to.equal(4);
            expect(i[0]).to.equal(1);
        });
        it("doesn't include any duplicates", function() {
            expect(i.length).to.equal(ion.unique(i).length);
        });
        it("doesn't change the original arrays", function() {
            expect(a.length).to.equal(3);
            expect(b.length).to.equal(3);
        });
    });
    describe("ion.without()", function() {
        it("removes elements from an array", function() {
            var array = ion.without([1,2,3,4], 2, 4);
            expect(array.length).to.equal(2);
            expect(array.join(' ')).to.equal('1 3');
        });
        it("returns an empty array when passed incorrect arguments", function() {
            expect(ion.without().length).to.equal(0);
            expect(ion.without([]).length).to.equal(0);
            expect(ion.without(['A']).length).to.equal(1);
        });
        it("operates on the arguments object", function() {
            function test() {
                return ion.without(arguments, 'A');
            }
            expect(test('A','B','C')).to.eql(['B','C']);
        });
    });
    describe("ion.isUndefined()", function() {
        it("correctly identifies undefined variables", function() {
            (function(foo) {
                expect(ion.isUndefined(foo)).to.be.true
            })();
            var bar = 0;
            expect(ion.isUndefined(bar)).to.be.false;
        });
    });
    describe("ion.article()", function() {
        it("returns article 'a' if word starts with a consonant", function() {
            expect(ion.article("bowl")).to.equal("a bowl");
        });
        it("returns article 'an' if word starts with a vowel", function() {
            expect(ion.article("howitzer")).to.equal("a howitzer");
            expect(ion.article("apple")).to.equal("an apple");
        });
        it("does not add an indefinite article if string starts with a definite article", function() {
            expect(ion.article("the spoon")).to.equal("the spoon");
        });
    });
    describe("ion.titleCase()", function() {
        it("title cases a string", function() {
            expect(ion.titleCase("all they Could do is wrangle with pigs")).to.equal("All They Could Do Is Wrangle With Pigs");
        });
        it("capitalizes hyphenated words", function() {
            expect(ion.titleCase("antwerp-benedict")).to.equal("Antwerp-Benedict");
        });
        it("ignores 'small' words", function() {
            expect(ion.titleCase("hammer on the range")).to.equal("Hammer on the Range");
        });
        // There's one more branch in the code but I'm not sure what it's correcting for.
    });
    describe("ion.sentenceCase()", function() {
        it("sentence cases a string", function() {
            expect(ion.sentenceCase("all they Could do is wrangle with pigs")).to.equal("All they Could do is wrangle with pigs");
            expect(ion.sentenceCase("")).to.equal("");
        });
        it("passes non-string values back to caller", function() {
            var d = new Date();
            expect(ion.sentenceCase(d)).to.equal(d);
            expect(ion.sentenceCase(null)).to.equal(null);
        });
    });
    describe("ion.pluralize()", function() {
        it("pluralizes three common plural forms without help", function() {
            expect(ion.pluralize("Book", 2)).to.equal("2 Books");
            expect(ion.pluralize("boundary", 2)).to.equal("2 boundaries");
            expect(ion.pluralize("status", 2)).to.equal("2 statuses");
            expect(ion.pluralize("crucifix", 2)).to.equal("2 crucifixes");
        });
        it("pluralizes correctly and returns an object without a count", function() {
            expect(ion.pluralize("octop{us|i} of the environ{s}")).to.equal("an octopus of the environ");
            expect(ion.pluralize("octop{us|i} of the environ{s}", 2)).to.equal("2 octopi of the environs");
            expect(ion.pluralize("bag{s} of flour", 1)).to.equal("a bag of flour");
            expect(ion.pluralize("bag{s} of flour", 2)).to.equal("2 bags of flour");
        });
        it("pluralizes multiple sections in a string", function() {
            expect(ion.pluralize("{the |}hammer{s} of thor", 1)).to.equal("the hammer of thor");
            expect(ion.pluralize("{the |}hammer{s} of thor", 2)).to.equal("2 hammers of thor");
        });
        it("allows suppression of an indefinite article", function() {
            expect(ion.pluralize("{|suits of }makeshift metal armor",1)).to.equal("makeshift metal armor");
            expect(ion.pluralize("{|suits of }makeshift metal armor",2)).to.equal("2 suits of makeshift metal armor");
        });
        it("pluralizes item strings correctly", function() {
            expect(ion.pluralize("box{es} of .45 ammo (20 rounds) [0/0]: rare ammo ammo-45")).to.equal("a box of .45 ammo (20 rounds) [0/0]: rare ammo ammo-45");
            expect(ion.pluralize("box{es} of .45 ammo (20 rounds) [0/0]: rare ammo ammo-45", 2)).to.equal("2 boxes of .45 ammo (20 rounds) [0/0]: rare ammo ammo-45");
        });
    });
    describe("ion.roll()", function() {
        it("rolls between 2 and 6 for '2d3'", function() {
            expect(ion.roll("2d3")).to.be.above(1).and.below(8);
        });
        it("always rolls 2 when passed '1d1+1' or similar", function() {
            expect(ion.roll("1d1+1")).to.equal(2);
            expect(ion.roll("3d1-1")).to.equal(2);
        });
        it("fails and return 0 if string is unparseable", function() {
            expect(ion.roll("2de5+2")).to.equal(0);
        });
        it("returns a random number within the range of 1..N", function() {
            var value = ion.roll(3);
            expect(value).to.be.above(0).and.below(4);

            value = ion.roll(0);
            expect(value).to.equal(0);

            value = ion.roll(-5);
            expect(value).to.equal(0);
        });
        it("throws an error for an invalid value", function() {
            expect(function(){ ion.roll(new Date()); }).to.throw();
        });
    });
    describe("ion.test()", function() {
        it("returns true/false depending on the percentage", function() {
            expect(ion.test(0)).to.be.false;
            expect(ion.test(100)).to.be.true;
        });
        it("only allows valid values", function() {
            expect(function() {
                ion.test(-10);
            }).to.throw(/*"Percentage must be between 0 and 100"*/);
        });
    });
    describe("ion.random()", function() {
        it("returns string with selected alternative", function() {
            var string = "This is {a|the} test";
            var result = ion.random(string);
            expect(result).to.equal("This is a test");
        }) ;
        it("returns string in an array with selected alternative", function() {
            var string = "This is {the|a} test of {0}";
            var array = [string, string, string];
            var result = ion.random(array);
            expect(result).to.equal("This is the test of {0}");
        });
        it("returns random element of nested array", function() {
            var array = [[1,2,3], ["A {1|2}","B","C"], "D"];
            var result = ion.random(array);
            expect(result).to.equal("A 1");
        });
        it("does not 'roll' numbers, but returns them as is", function() {
            var array = [[2,3,4], [5,6,7]];
            var result = ion.random(array);
            expect(result).to.equal(2);
        });
        it("returns one random item", function() {
            var numbers = [1,2,3];
            expect(ion.random(numbers)).to.be.above(0).and.below(4);
            expect(ion.random([])).to.equal(null);
        });
        it("return one possible variation on the string", function() {
            var result = ion.random("{Dead Man's|Blind Man's} Bluff {East|West}");
            expect(result).to.equal("Dead Man's Bluff East");
        });
        it("return plain strings uncorrupted", function() {
            var result = ion.random("a plain string");
            expect(result).to.equal("a plain string");
        });
        it("allows for nested braces for tricky selection sequences", function() {
            var result = ion.random("{{trick|trick taking}}");
            expect(result).to.equal("{trick}");
        });
        it("returns a string if passed a string", function() {
            expect(ion.random("A")).to.equal("A");
        });
        it("returns an element of an array if passed an array", function() {
            expect(ion.random(["B"])).to.equal("B");
        });
        it("returns the result of a function if passed a function", function() {
            expect(ion.random(function() {
                return "C";
            })).to.equal("C");
        });
        it("unwraps values to any depth", function() {
            var value = function() {
                return function() {
                    return "A";
                };
            };
            expect(ion.random(value)).to.equal("A");
        });
        it("passes plain strings through unaltered", function() {
            var result = ion.random("a plain string");
            expect(result).to.equal("a plain string");
        });
    });
    describe("ion.resolve()", function() {
        it("randomizes one argument", function() {
            var array = ["one", "two"];
            var result = ion.resolve(array);
            expect(result).to.equal("one");
        });
        it("randomizes and formats using rest of arguments", function() {
            var array = ["one {name}", "two {name}"];
            var result = ion.resolve(array, {name: "Alx"});
            expect(result).to.equal("one Alx");
        });
    });
    describe("ion.shuffle()", function() {
        it("shuffles an array", function() {
            var array = ['A','B','C','D','E','F','G','H','I','J','K'];
            ion.shuffle(array);
            expect(array[0]).to.not.equal('A');
        });
    });
    describe("ion.gaussian()", function() {
        it("returns normally distributed random number", function() {
            var value = ion.gaussian(8);
            expect(value).to.equal(0);

            value = ion.gaussian(0,100);
            expect(value).to.equal(100);
        });
    });
    describe("ion.nonNegativeGaussian()", function() {
        it("creates a value near the median", function() {
            ion.nonNegativeGaussian(10);
            var value = ion.nonNegativeGaussian(10);
            expect(value).to.equal(2);
        });
        it("will not loop forever on a negative mean", function() {
            var value = ion.nonNegativeGaussian(2, -100);
            expect(value).to.be.above(-1);
        });
    });
    describe("ion.define()", function() {
        it("defines a correct subclass", function() {
            function Parent() {};
            var Child = ion.define(Parent, {
                init: function() {}
            });
            var child = new Child();
            expect(child.constructor === Child).to.be.true;
            expect(child instanceof Child).to.be.true;
            expect(child instanceof Parent).to.be.true;
        });
        it("supports properties", function() {
            var Child = ion.define({
                properties: {
                    two: function() {
                        return "two"
                    }
                } 
            });
            var child = new Child();
            expect(child.two).to.equal("two");
        });
        it("supports static functions", function() {
            var Child = ion.define({
                one: function() {return "one";},
                static: {
                    two: function() {return "two";}
                }
            });
            expect(Child.two()).to.equal("two");    
        });
    });
    describe("ion.contains()", function() {
        it("contains the correct items", function() {
            expect(ion.contains(array, 'B')).to.be.true;
            expect(ion.contains(array, 'D')).to.not.be.true;
        });
    });
    describe("ion.toList()", function() {
        it("creates a list of one item", function() {
            expect(ion.toList(["dogs"])).to.equal("dogs");
        });
        it("creates a list of two items", function() {
            expect(ion.toList(["cats", "dogs"])).to.equal("cats and dogs");
        });
        it("concatenate a list to a string", function() {
            expect(ion.toList(array)).to.equal('A, B, and C');
            expect(ion.toList([])).to.equal('');
        });
        it("concatenates a list with function", function() {
            expect(ion.toList(array, function(s) {
                return s.toLowerCase();
            })).to.equal('a, b, and c');
        });
    });
    describe("ion.sum()", function() {
        it("sums an array of mixed values (ignoring non-numbers)", function() {
            expect(ion.sum([null, 2, 4, ""])).to.equal(6);
        });
    });
    describe("ion.times()", function() {
        it("runs N times", function() {
            var count = 0;
            ion.times(4, function() { count++; });
            expect(count).to.equal(4);
        });
    });
    describe("ion.bounded()", function() {
        it("constrains numbers to the range", function() {
            expect(ion.bounded(43,50,100)).to.equal(50);
            expect(ion.bounded(102,1,10)).to.equal(10);
            expect(ion.bounded(0,-10,10)).to.equal(0);
        });
    });
});
