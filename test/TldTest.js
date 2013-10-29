'use strict';

var fs = require('fs'),
    Tld = require('../lib/Tld.js'),
    should = require('chai').should(),
    simpleRule;

describe('Tld', function () {
  before(function () {
    simpleRule = {
      'a' : {
        'b' : {
          'c1' : {
            true : true,
            '*' : { true : true },
            '!d': { true : true }
          },
          'c2' : { true : true }
        },
        true : true
      }
    };
  });

  describe('Empty string', function () {
    it('should return null', function (done) {
      should.equal(new Tld(null).decompose(), null);
      should.equal(new Tld({}).decompose(), null);
      should.equal(new Tld(simpleRule).decompose(), null);
      done();
    });
  });

  describe('Leading dotted string', function () {
    it('should return null', function (done) {
      should.equal(new Tld(null).decompose('.foo.google.com'), null);
      should.equal(new Tld({}).decompose('.foo.google.com'), null);
      should.equal(new Tld(simpleRule).decompose('.foo.google.com'), null);
      done();
    });
  });

  describe('No rules', function () { // great scotch
    it('should flag everything after final dot as tld', function (done) {
      new Tld({}).decompose('google.com').tld.should.eql(['com']);
      done();
    });
  });

  describe('Leaf nodes without allowed rule', function () {
    it('should return null', function (done) {
      should.equal(new Tld(simpleRule).decompose('foo.b.a'), null);
      done();
    });
  });

  describe('Urls matching the normal rule', function () {
    it('should result in tld', function (done) {
      new Tld(simpleRule).decompose('foo.a').tld.should.eql(['a']);
      new Tld(simpleRule).decompose('foo.a').domain.should.equal('foo');

      new Tld(simpleRule).decompose('bar.foo.a').tld.should.eql(['a']);
      new Tld(simpleRule).decompose('bar.foo.a').domain.should.equal('foo');
      new Tld(simpleRule).decompose('bar.foo.a').sub.should.eql(['bar']);

      new Tld(simpleRule).decompose('baz.bar.foo.a').tld.should.eql(['a']);
      new Tld(simpleRule).decompose('baz.bar.foo.a').domain.should.equal('foo');
      new Tld(simpleRule).decompose('baz.bar.foo.a').sub
        .should.eql(['baz', 'bar']);


      done();
    });
  });

  describe('Urls matching root of * rule', function () {
    it('should return null', function (done) {
      should.equal(new Tld(simpleRule).decompose('c1.b.a'), null);
      should.equal(new Tld(simpleRule).decompose('foo.c1.b.a'), null);
      done();
    });
  });

  describe('Urls matching the  * rule', function () {
    it('should result in tld', function (done) {
      new Tld(simpleRule).decompose('bar.foo.c1.b.a').tld
        .should.eql(['foo', 'c1', 'b', 'a']);
      new Tld(simpleRule).decompose('bar.foo.c1.b.a').domain
        .should.equal('bar');

      new Tld(simpleRule).decompose('baz.bar.foo.c1.b.a').tld
        .should.eql(['foo', 'c1', 'b', 'a']);
      new Tld(simpleRule).decompose('baz.bar.foo.c1.b.a').domain
        .should.equal('bar');
      new Tld(simpleRule).decompose('baz.bar.foo.c1.b.a').sub
        .should.eql(['baz']);

      done();
    });
  });

  describe('Urls matching root of * rule + match exception rule', function () {
    it('should result in tld', function (done) {
      new Tld(simpleRule).decompose('d.c1.b.a').tld
        .should.eql(['c1', 'b', 'a']);
      new Tld(simpleRule).decompose('d.c1.b.a').domain
        .should.equal('d');

      new Tld(simpleRule).decompose('foo.d.c1.b.a').tld
        .should.eql(['c1', 'b', 'a']);
      new Tld(simpleRule).decompose('foo.d.c1.b.a').domain
        .should.equal('d');
      new Tld(simpleRule).decompose('foo.d.c1.b.a').sub
        .should.eql(['foo']);

      done();
    });
  });

  describe('PublicSuffix checkPublicSuffix rules', function () {
    it('should all be true', function (done) {
      global.checkPublicSuffix = function (input, expected) {
        var rules = JSON.parse(
          fs.readFileSync(
            __dirname + '/fixtures/PublicSuffix.org/rules.json', 'utf8'
          )
        );
        var d = new Tld(rules).decompose(input);

        should.equal((d === null && expected === null) ||
          (d !== null &&
            expected === [d.domain, d.tld.join('.')].join('.')), true);
      };

      require(__dirname + '/fixtures/PublicSuffix.org/checkPublicSuffix.js');
      done();
    });
  });
});
