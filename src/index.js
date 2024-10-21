if (typeof window === 'undefined') {
  module.exports = require('./node/gun-eth-node.js');
} else {
  module.exports = require('./browser/gun-eth-browser.js');
}