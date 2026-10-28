const { stable, greet } = require('demo-lib');

module.exports = { value: stable(3), hi: greet('a', 'b') };
