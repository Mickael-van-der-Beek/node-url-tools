/* jslint expr: false */
'use strict';

var urlext = require('../index.js'),
    expect = require('chai').expect,
    nock = require('nock');

describe('UrlExt', function () {
  beforeEach(function () {
    nock('http://google.com')
      .get('/')
      .reply(301, '', {Location: 'http://www.google.com'});

    nock('http://www.google.com')
      .get('/')
      .reply(200);

    nock('http://cnn.com')
      .get('/')
      .reply(301, '', {Location: 'http://www.cnn.com'});

    nock('http://www.cnn.com')
      .get('/')
      .reply(302, '', {Location: 'http://edition.cnn.com'});

    nock('http://edition.cnn.com')
      .get('/')
      .reply(200);

    nock('http://error.com')
      .get('/')
      .reply(404);

    nock('http://loop.com')
      .get('/')
      .times(10)
      .reply(302, '', {Location: 'http://loop.com'});
  });

  afterEach(function () {
    nock.cleanAll();
  });

  describe('Extracting google.com', function () {
    it('should extract and resp 1 redirect, no error', function (done) {
      urlext.extract('google.com', function (err, res) {
        expect(res).to.have.property('href', 'http://google.com');
        expect(res).to.have.property('hostname', 'google.com');
        expect(res).to.have.property('domain', 'google');
        expect(res).to.have.property('tld').to.eql(['com']);
        expect(res).to.have.property('subdomain').to.eql([]);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('redirects').to.have.length(1);
        expect(res).to.have.property('response')
          .to.have.property('error').to.equal(null);
        done();
      });
    });
  });

  describe('Extracting http://google.com', function () {
    it('should extract and resp 1 redirect, no error', function (done) {
      urlext.extract('http://google.com', function (err, res) {
        expect(res).to.have.property('href', 'http://google.com');
        expect(res).to.have.property('hostname', 'google.com');
        expect(res).to.have.property('domain', 'google');
        expect(res).to.have.property('tld').to.eql(['com']);
        expect(res).to.have.property('subdomain').to.eql([]);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('redirects').to.have.length(1);
        expect(res).to.have.property('response')
          .to.have.property('error').to.equal(null);
        done();
      });
    });
  });

  describe('Extracting ftp://google.com', function () {
    it('should error', function (done) {
      urlext.extract('ftp://google.com', function (err, res) {
        expect(res).to.equal(null);
        expect(err).to.not.equal(null);
        done();
      });
    });
  });

  describe('Extracting www.google.com', function () {
    it('should extract and resp 0 redirect, no error', function (done) {
      urlext.extract('www.google.com', function (err, res) {
        expect(res).to.have.property('href', 'http://www.google.com');
        expect(res).to.have.property('hostname', 'www.google.com');
        expect(res).to.have.property('domain', 'google');
        expect(res).to.have.property('tld').to.eql(['com']);
        expect(res).to.have.property('subdomain').to.eql(['www']);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('redirects').to.eql([]);
        expect(res).to.have.property('response')
          .to.have.property('error').to.equal(null);
        done();
      });
    });
  });

  describe('Extracting cnn.com', function () {
    it('should extract and resp 2 redirect, no error', function (done) {
      urlext.extract('cnn.com', function (err, res) {
        expect(res).to.have.property('href', 'http://cnn.com');
        expect(res).to.have.property('hostname', 'cnn.com');
        expect(res).to.have.property('domain', 'cnn');
        expect(res).to.have.property('tld').to.eql(['com']);
        expect(res).to.have.property('subdomain').to.eql([]);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('redirects').to.have.length(2);
        expect(res).to.have.property('response')
          .to.have.property('error').to.equal(null);
        done();
      });
    });
  });

  describe('Extracting error.com', function () {
    it('should extract and resp 404 code, no error', function (done) {
      urlext.extract('error.com', function (err, res) {
        expect(res).to.have.property('href', 'http://error.com');
        expect(res).to.have.property('hostname', 'error.com');
        expect(res).to.have.property('domain', 'error');
        expect(res).to.have.property('tld').to.eql(['com']);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('error').to.equal(null);
        expect(res).to.have.property('response')
          .to.have.property('code').to.equal(404);
        done();
      });
    });
  });

  describe('Extracting loop.com', function () {
    it('should extract and resp error after 8 redirects', function (done) {
      urlext.extract('loop.com', function (err, res) {
        console.log(res);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('error').to.not.equal(null);
        done();
      });
    });
  });

  describe('Extracting i.do.not.exist.com', function () {
    it('should extract and resp error', function (done) {
      urlext.extract('i.do.not.exist.com', function (err, res) {
        expect(res).to.have.property('href', 'http://i.do.not.exist.com');
        expect(res).to.have.property('hostname', 'i.do.not.exist.com');
        expect(res).to.have.property('domain', 'exist');
        expect(res).to.have.property('tld').to.eql(['com']);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('error').to.not.equal(null);
        done();
      });
    });
  });

  describe('Extracting i.do.not.exist', function () {
    it('should extract and resp error', function (done) {
      urlext.extract('i.do.not.exist', function (err, res) {
        expect(res).to.have.property('href', 'http://i.do.not.exist');
        expect(res).to.have.property('hostname', 'i.do.not.exist');
        expect(res).to.have.property('domain', 'not');
        expect(res).to.have.property('tld').to.eql(['exist']);
        expect(res).to.have.property('responseTime').to.be.at.least(0);
        expect(res).to.have.property('response')
          .to.have.property('error').to.not.equal(null);
        done();
      });
    });
  });
});
