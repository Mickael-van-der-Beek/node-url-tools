'use strict';

var fs = require('fs'),
    Suffices = require('../lib/Suffices.js'),
    should = require('chai').should();

describe('Suffices', function () {
  describe('Empty rules', function () {
    it('should result in an empty tree', function (done) {
      should.equal(null, null);
      new Suffices('').tree
        .should.deep.equal({});
      new Suffices('\n\n').tree
        .should.deep.equal({});
      done();
    });
  });

  describe('Comment lines', function () {
    it('should be ignored', function (done) {
      new Suffices('// foo').tree
        .should.deep.equal({});
      new Suffices('// foo\n// bar\n\n//baz').tree
        .should.deep.equal({});
      new Suffices('////\////').tree
        .should.deep.equal({});
      new Suffices('// foo\na\n// bar baz').tree
        .should.deep.equal({ 'a' : { true : true } });
      done();
    });
  });

  describe('Simple rules', function () {
    it('should result in tree', function (done) {
      new Suffices('a').tree
        .should.deep.equal({ 'a' : { true : true } });
      new Suffices('a\na').tree
        .should.deep.equal({ 'a' : { true : true } });
      new Suffices('b.a').tree
        .should.deep.equal({ 'a' : { 'b' : { true : true } } });
      new Suffices('d.c.b.a').tree
        .should.deep.equal(
          { 'a' : { 'b' : { 'c' : { 'd' : { true : true } } } } }
        );
      new Suffices('*.c.b.a').tree
        .should.deep.equal(
          { 'a' : { 'b' : { 'c' : { '*' : { true : true } } } } }
        );
      new Suffices('!d.c.b.a').tree
        .should.deep.equal(
          { 'a' : { 'b' : { 'c' : { '!d' : { true : true } } } } }
        );
      done();
    });
  });

  describe('Complex rules', function () {
    it('should result in tree', function (done) {
      new Suffices('a\nb.a').tree.should.deep.equal(
        {
          'a' : {
            'b' : {
              true : true
            },
            true : true
          }
        }
      );
      new Suffices('a\nb.a\nc1.b.a\nc2.b.a').tree.should.deep.equal(
        {
          'a' : {
            'b' : {
              true : true,
              'c1' : { true : true },
              'c2' : { true : true }
            },
            true : true
          }
        }
      );
      new Suffices('a\nc1.b.a\nc2.b.a').tree.should.deep.equal(
        {
          'a' : {
            'b' : {
              'c1' : { true : true },
              'c2' : { true : true }
            },
            true : true
          }
        }
      );
      new Suffices('a\nc1.b.a\nc2.b.a\n*.c1.b.a').tree.should.deep.equal(
        {
          'a' : {
            'b' : {
              'c1' : {
                true : true,
                '*' : { true : true }
              },
              'c2' : { true : true }
            },
            true : true
          }
        }
      );
      new Suffices(
        'a\nc1.b.a\nc2.b.a\n*.c1.b.a\n!d.c1.b.a'
      ).tree.should.deep.equal(
        {
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
        }
      );
      done();
    });
  });

  describe('PublicSuffix rules', function () {
    it('should result in tree', function (done) {
      new Suffices(
        fs.readFileSync(
          __dirname + '/fixtures/PublicSuffix.org/list.txt', 'utf8'
        )
      ).tree.should.deep.equal(
        JSON.parse(
          fs.readFileSync(
            __dirname + '/fixtures/PublicSuffix.org/rules.json', 'utf8'
          )
        )
      );
      done();
    });
  });
});
