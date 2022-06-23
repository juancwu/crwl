
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./crwl.cjs.production.min.js')
} else {
  module.exports = require('./crwl.cjs.development.js')
}
