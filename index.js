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

/**
 * Fire http request and callback when done.
 *
 * @param  {String}   urlStr   The url.
 * @param  {Function} callback Callback with error, response and responstime.
 */
function fireRequest(urlStr, callback) {
  var start = Date.now();

  request({
    url: urlStr,
    method: 'GET',
    maxRedirects: 8,
    timeout: 10 * 1000
    //headers: { 'User-Agent': 'woobot/2.0' }
  }, function (error, response) {
    callback(error, response, Date.now() - start);
  });
}

/**
 * Extract a url.
 *
 * @param  {String}   urlStr   Url (http/https protocol) string.
 * @param  {Function} callback Callback function with result, error otherwise.
 */
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
  result.port = parsed.port;
  result.pathname = parsed.pathname;

  // Get TLD info
  var tld = this.tld.decompose(result.hostname);
  if (tld === null) {
    callback(new Error('Malformed URL'), null);
    return;
  }
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
