"use strict";

/**
 * Recursively parse an array of domain segments into a tree structure.
 * 
 * @param  {Array}  segments List of domain segments ordered sub to top.
 * @param  {Object} parent   Resulting tree object.
 */
function process(segments, parent) {
  var last = segments.pop();
  if (last) {
    parent[last] = parent[last] || {};
    process(segments, parent[last]);
  } else {
    parent[true] = true;
  }
}

/**
 * Parse domainname input file.
 * http://mxr.mozilla.org/mozilla-central
 *   /source/netwerk/test/unit/data/test_psl.txt?raw=1
 * 
 * @param  {String} file File content as string.
 * @return {Object}      Parsed tree object.
 */
function parse(file) {
  var rules = {};

  file
    .split(/\n/m)
    .filter(function (line) {
      return (/^\/\//).test(line) ? null : line;
    })
    .map(function (line) {
      return process(line.split("."), rules);
    });

  return rules;
}

/**
 * Prototype to map http://publicsuffix.org/ TLD rules into a tree structure.
 * 
 * @param {String} input Rule file as a string.
 */
function Suffices(input) {
  if (input === undefined) {
    throw new Error("No suffix input provided");
  }

  this.tree = parse(input);
}

module.exports = Suffices;
