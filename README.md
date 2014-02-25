URL Toolbelt [![Build Status](https://travis-ci.org/Woorank/node-url-tools.png?branch=master)](https://travis-ci.org/Woorank/node-url-tools) [![Coverage Status](https://coveralls.io/repos/Woorank/node-url-tools/badge.png)](https://coveralls.io/r/Woorank/node-url-tools)
============

A set of libraries to extract specific metrics, states and data about a URL.

## Installation

```node
npm install urlext
```

## Usage

```node
var urlext = require('urlext');
```

Then get url metrics for `www.cnn.com` by calling (the port identifier `:80` is optional, but shown here for completeness):

```node
urlext.extract('www.cnn.com:80', function (err, res) {
  console.log(JSON.stringify(res));
});
```
or

```node
urlext.extract('http://www.cnn.com:80', function (err, res) {
  console.log(JSON.stringify(res));
});
```

Will provide following output:
```json
{
  "href": "http://www.cnn.com",
  "hostname": "www.cnn.com",
  "port": 80,
  "pathname": "/",
  "domain": "cnn",
  "tld": [
    "com"
  ],
  "subdomain": [
    "www"
  ],
  "responseTime": 1316,
  "response": {
    "error": null,
    "code": 200,
    "redirects": [
      {
        "statusCode": 302,
        "redirectUri": "http://edition.cnn.com/"
      }
    ]
  }
}
```

### TLDs

The `tld`, `domain` and `subdomain` fields in the result are extracted based on the tld list provided by [PublixSuffix.org](http://publicsuffix.org).

## Test

To run the test-suite execute:

```
npm test
```
