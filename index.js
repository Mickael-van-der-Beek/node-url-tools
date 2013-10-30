'use strict';

var url = require('url'),
    request = require('request'),
    fs = require('fs'),
    Tld = require('./lib/Tld.js');

function urlext() {
  this.tld = new Tld(JSON.parse(fs.readFileSync(
    __dirname + '/data/effective_tld_names.json', 'utf8'
  )));
}

function fireRequest(urlStr, callback) {
  var start = Date.now();

  request({
    url: urlStr,
    method: 'GET',
    maxRedirects: 8,
    timeout: 10 * 1000,
    headers: { 'User-Agent': 'woobot/2.0' }
  }, function (error, response) {
    callback(error, response, Date.now() - start);
  });
}

urlext.prototype.extract = function (urlStr, callback) {
  var result = {
    'href': /^https?:\/\//.test(urlStr) ? urlStr : 'http://' + urlStr
  };

  // Parse URL
  var parsed = url.parse(result.href);
  if (!parsed.hostname) {
    callback(new Error('Could not extract hostname'), null);
    return;
  }
  result.hostname = parsed.hostname;

  // Get TLD info
  var tld = this.tld.decompose(result.hostname);
  result.domain = tld.domain;
  result.tld = tld.tld;
  result.subdomain = tld.sub;

  // Do request
  fireRequest(result.href, function (err, response, time) {
    result.responseTime = time;
    result.response = {
      error: err ? err.toString() : null,
      code: response ? response.statusCode : null,
      redirects: response ? response.request.redirects : null
    };

    callback(null, result);
  });
};

module.exports = new urlext();
