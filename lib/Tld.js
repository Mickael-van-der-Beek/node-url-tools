"use strict";

/**
 * Prototype offering TLD extraction.
 * 
 * @param {Object} tree Tree structure defining TLD rules.
 */
function Tld(tree) {
  this.tree = tree;
}

/**
 * Traverse the url segments and map to the tree leafs if it exists.
 *
 * @param  {Array}   segments  URL segments.
 * @param  {Object}  tree      Represents the TLD rules in a tree format.
 * @param  {Array}   trail     Trail of traversed leafs.
 * @param  {Int}     iteration Keep count of the recursive iterations.
 * @return {String}            The extracted domain based on the rules tree.
 */
function traverse(segments, tree, trail, iteration) {
  if (iteration === undefined) {
    iteration = 0;
  }
  iteration += 1;

  var last = segments.pop();
  if (last) {
    if (tree[last] !== undefined) {
      trail.unshift(last);
      return traverse(segments, tree[last], trail);
    }

    if (tree["*"] !== undefined) {
      if (tree["!" + last] !== undefined) {
        return last;
      }

      trail.unshift(last);
      return traverse(segments, tree["*"], trail);
    }

    if (tree[true]) {
      return last;
    }

    if (iteration === 1) {
      // In first iteration everything is allowed (eg. foo.bar.example)
      trail.unshift(last);
      last = segments.pop();
      if (last) {
        return last;
      }
    }
  }

  return null;
}

/**
 * Decompose a URL in domain and tld part.
 *
 * @param  {String} url URL to decompose.
 * @return {Object}     Decomposition.
 */
Tld.prototype.decompose = function (url) {
  if (!url) {
    return null;
  }

  var urlParts = url.toLowerCase().split(".");

  // Leading dots are illegal
  if (urlParts[0] === undefined || !urlParts[0]) {
    return null;
  }

  var tree = this.tree;
  var trail = [];
  var domain = traverse(urlParts, tree, trail);

  if (domain === null) {
    return null;
  }

  return {
    "tld"   : trail,
    "domain": domain,
    "sub"   : urlParts
  };
};

module.exports = Tld;
