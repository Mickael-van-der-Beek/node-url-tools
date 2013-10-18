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
  if(typeof iteration === "undefined") iteration = 0;
  iteration++;

  if(last = segments.pop()) {
    if(typeof tree[last] !== "undefined") {
      trail.unshift(last);
      return traverse(segments, tree[last], trail);
    } else if (typeof tree["*"] !== "undefined") {
      if(typeof tree['!'+last] !== "undefined") {
        return last;
      } else {
        trail.unshift(last);
        return traverse(segments, tree["*"], trail);
      }
    } else {
      if(tree[true]) { 
        return last;
      } else if(iteration == 1) {
        // In first iteration everything is allowed (eg. foo.bar.example)
        trail.unshift(last);
        if(last = segments.pop()) return last;
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
Tld.prototype.decompose = function(url) {
  if(!url) return null;
  
  var urlParts = url.toLowerCase().split('.');

  // Leading dots are illegal
  if(typeof urlParts[0] === "undefined" || !urlParts[0]) return null;
  
  var tree = this.tree;
  var trail = new Array();
  var domain = traverse(urlParts, tree, trail);

  if(domain === null) return null;

  return {
    'url'   : url,
    'tld'   : trail.join('.'),
    'domain': domain
  };
}

module.exports = Tld;
