var fs = require('fs')
  , Tld = require('../lib/Tld.js');

function checkPublicSuffix(input, expected) {
  var rules = JSON.parse(fs.readFileSync(__dirname + "/mock/rules.json", "utf8"));
  var d = new Tld(rules).decompose(input);

  console.log(
    (d === null && expected === null)
    || (d !== null && expected === [d.domain, d.tld].join('.'))
  );
}

module.exports.TldTest = {
  setUp: function(cb) {
    this.simpleRule = { 
      "a" : { 
        "b" : { 
          "c1" : { 
            true : true, 
            "*" : { true : true },
            "!d": { true : true } 
          }, 
          "c2" : { true : true } 
        }, 
        true : true 
      } 
    }

    cb();
  },
  testNoRules: function(test) { // great scotch
    test.deepEqual(new Tld({}).decompose(), null);
    test.deepEqual(new Tld({}).decompose('.google.com'), null);
    test.deepEqual(
      new Tld({}).decompose('google.com'), 
      { "url": "google.com", "tld" : "com", "domain": "google" }
    );
    test.done();
  },
  testSimpleRules: function(test) {
    test.deepEqual(
      new Tld(this.simpleRule).decompose(),
      null
    );
    test.deepEqual(
      new Tld({}).decompose('.foo.a'), 
      null
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('foo.a'),
      { "url" : "foo.a", "tld" : "a", "domain" : "foo" }
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('bar.foo.a'),
      { "url" : "bar.foo.a", "tld" : "a", "domain" : "foo" }
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('baz.bar.foo.a'),
      { "url" : "baz.bar.foo.a", "tld" : "a", "domain" : "foo" }
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('foo.b.a'),
      null
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('c1.b.a'),
      null
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('foo.c1.b.a'),
      null
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('d.c1.b.a'),
      { "url" : "d.c1.b.a", "tld" : "c1.b.a", "domain" : "d" }
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('foo.d.c1.b.a'),
      { "url" : "foo.d.c1.b.a", "tld" : "c1.b.a", "domain" : "d" }
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('bar.foo.c1.b.a'),
      { "url" : "bar.foo.c1.b.a", "tld" : "foo.c1.b.a", "domain" : "bar" }
    );
    test.deepEqual(
      new Tld(this.simpleRule).decompose('baz.bar.foo.c1.b.a'),
      { "url" : "baz.bar.foo.c1.b.a", "tld" : "foo.c1.b.a", "domain" : "bar" }
    );
    test.deepEqual(
      new Tld({}).decompose('google.com'), 
      { "url": "google.com", "tld" : "com", "domain": "google" }
    );
    test.done();
  },
  testPublicSuffices: function(test) {
    global.checkPublicSuffix = function(input, expected) {
      var rules = JSON.parse(fs.readFileSync(__dirname + "/mock/PublicSuffix.org/rules.json", "utf8"));
      var d = new Tld(rules).decompose(input);

      test.ok(
        (d === null && expected === null)
        || (d !== null && expected === [d.domain, d.tld].join('.'))
      );
    }

    require(__dirname + "/mock/PublicSuffix.org/checkPublicSuffix.js");

    test.done();
  }
}
