var path    = require('path')
var ssbKeys = require('scuttlebot/node_modules/ssb-keys')
var config  = require('scuttlebot/node_modules/ssb-config/inject')(process.env.ssb_appname)

var keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
var createSbot   = require('scuttlebot')
  .use(require('scuttlebot/plugins/master'))
  .use(require('scuttlebot/plugins/gossip'))
  .use(require('scuttlebot/plugins/friends'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(require('scuttlebot/plugins/blobs'))
  .use(require('scuttlebot/plugins/invite'))
  .use(require('scuttlebot/plugins/block'))
  .use(require('scuttlebot/plugins/local'))
  .use(require('scuttlebot/plugins/logging'))
  .use(require('scuttlebot/plugins/private'))

module.exports = function (cb) {
  createSbot.createClient({keys: keys})({port: config.port, host: config.host||'localhost', key: keys.id}, cb)
}