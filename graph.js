#! /usr/bin/env node

var pull = require('pull-stream')
var multicb = require('multicb')

module.exports = function (graph, userId, sbot, screen) {

  var graphs = {
    'follows':   filteredFeeds('follow', false, 'Follows'),
    'followers': filteredFeeds('follow', true, 'Followers'),
    'flags':     filteredFeeds('flag', false, 'Flags'),
    'flaggers':  filteredFeeds('flag', true, 'Flaggers'),
  }

  function filteredFeeds (graph, inbound, label) {
    // construct list to render
    var included = {}
    sbot.friends.all(graph, function (err, g) {
      if (inbound) {
        // collect feeds with an edge to `userId`
        for (var id2 in g)
          if (g[id2][userId])
            included[id2] = true
      } else {
        // use the already-computed `userId` edges
        included = g[userId] || {}
      }
    })
    function filter (entry) {
      return included[entry.id]
    }

    // return function that'll construct the right view when called
    return function () {
      var el = require('./feeds')(sbot, screen, filter)
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