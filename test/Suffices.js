var fs = require('fs')
  , Suffices = require('../lib/Suffices.js');

module.exports.SufficesTest = {
  testNewline: function(test) {
    test.deepEqual(new Suffices("").tree, {});
    test.deepEqual(new Suffices("\n\n").tree, {});
    test.done();
  },
  testComments: function(test) {
    test.deepEqual(new Suffices("// foo").tree, {});
    test.deepEqual(new Suffices("// foo\n// bar\n\n//baz").tree, {});
    test.deepEqual(new Suffices("////\/").tree, {});
    test.done();
  },
  testSimple: function(test) {
    test.deepEqual(new Suffices("a").tree, { "a" : { true : true } });
    test.deepEqual(new Suffices("a\na").tree, { "a" : { true : true } });
    test.deepEqual(new Suffices("b.a").tree, { "a" : { "b" : { true : true } } });
    test.deepEqual(new Suffices("d.c.b.a").tree, { "a" : { "b" : { "c" : { "d" : { true : true } } } } });
    test.deepEqual(new Suffices("*.c.b.a").tree, { "a" : { "b" : { "c" : { "*" : { true : true } } } } });
    test.deepEqual(new Suffices("!d.c.b.a").tree, { "a" : { "b" : { "c" : { "!d" : { true : true } } } } });
    test.done();
  },
  testComplex: function(test) {
    test.deepEqual(
      new Suffices("a\nb.a").tree, 
      { 
        "a" : { 
          "b" : { 
            true : true 
          }, 
          true : true 
        } 
      }
    );
    test.deepEqual(
      new Suffices("a\nb.a\nc1.b.a\nc2.b.a").tree, 
      { 
        "a" : { 
          "b" : { 
            true : true, 
            "c1" : { true : true }, 
            "c2" : { true : true } 
          }, 
        true : true } 
      }
    );
    test.deepEqual(
      new Suffices("a\nc1.b.a\nc2.b.a").tree, 
      { 
        "a" : { 
          "b" : { 
            "c1" : { true : true }, 
            "c2" : { true : true } 
          }, 
        true : true } 
      }
    );
    test.deepEqual(
      new Suffices("a\nc1.b.a\nc2.b.a\n*.c1.b.a").tree, 
      { 
        "a" : { 
          "b" : { 
            "c1" : { 
              true : true, 
              "*" : { true : true } 
            }, 
            "c2" : { true : true } 
          }, 
        true : true } 
      }
    );
    test.deepEqual(
      new Suffices("a\nc1.b.a\nc2.b.a\n*.c1.b.a\n!d.c1.b.a").tree, 
      { 
        "a" : { 
          "b" : { 
            "c1" : { 
              true : true, 
              "*" : { true : true },
              "!d": { true : true } 
            }, 
            "c2" : { true : true } 
          }, 
        true : true } 
      }
    );
    test.done();
  },
  testPublicSuffices: function(test) {
    test.deepEqual(
      new Suffices(fs.readFileSync(__dirname + "/mock/PublicSuffix.org/list.txt", "utf8")).tree,
      JSON.parse(fs.readFileSync(__dirname + "/mock/PublicSuffix.org/rules.json", "utf8"))
    );
    test.done();
  }
}
