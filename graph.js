#! /usr/bin/env node

var pull = require('pull-stream')
var multicb = require('multicb')

module.exports = function (graph, userId, sbot, screen) {

  var graphs = {
    'follows':   feeds('follow', false, 'Follows'),
    'followers': feeds('follow', true, 'Followers'),
    'flags':     feeds('flag', false, 'Flags'),
    'flaggers':  feeds('flag', true, 'Flaggers'),
  }

  function feeds (graph, inbound, label) {
    // construct allow list
    var allowed = {}
    sbot.friends.all(graph, function (err, g) {
      if (inbound) {
        for (var id2 in g)
          if (g[id2][userId])
            allowed[id2] = true
      } else
        allowed = g[userId] || {}
    })

    // return function that'll construct the right view when called
    return function () {
      var el = require('./feeds')(sbot, screen, function (entry) {
        return allowed[entry.id]
      })
      el.setLabel(label+': '+userId)
      return el
    }
  }

  return graphs[graph]()
}

if (!module.parent) {
  var argv = require('minimist')(process.argv.slice(2))
  var graph  = argv._[0]
  var userId = argv._[1]
  if (['follows', 'followers', 'flags', 'flaggers'].indexOf(graph) === -1 || !require('ssb-ref').isFeed(userId)) {
    console.error('Usage: graph.js [follows|followers|flags|flaggers] {feedid}')
    process.exit(1)
  }
  require('./lib/app')(module.exports.bind(null, graph, userId))
}