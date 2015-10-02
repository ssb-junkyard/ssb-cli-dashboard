#! /usr/bin/env node

var pull = require('pull-stream')
var multicb = require('multicb')

module.exports = function (sbot, screen, filter) {
  var listWidget = require('./lib/widgets/list')(screen, ' Feeds ')

  // load data from sbot
  var done = multicb({ pluck: 1, spread: true })

  pull(
    sbot.latest(),                          // get the sequence number of the latest message of each known feed
    (filter) ? pull.filter(filter) : null,  // apply a filter, if given
    pull.collect(done())                    // collect into an array
  )
  sbot.friends.all('follow', done())        // fetch the computed follow-graph
  sbot.friends.all('flag', done())          // fetch the computed flag-graph

  done(function (err, feeds, follows, flags) {
    if (err) throw err
    // populate the list widget and render
    var listItems = feedsToListItems(feeds, follows, flags)
    listWidget.data.feeds = feeds
    listWidget.setItems(listItems)
    screen.render()
  })

  // listen for feed selections
  listWidget.on('select', function (el, selected) {
    var selectedFeed = listWidget.data.feeds[selected]
    if (!selectedFeed)
      return
    // open the feed view for the selected feed
    var feedView = require('./feed')(selectedFeed.id, sbot, screen)
    screen.stack.push(feedView)
  })

  return listWidget
}

// helper to count how many nodes in the graph have edges pointing to the given ID
// - graphs are given in the shape of { sourceIds: { destIds: true } }
// - eg. if bob follows alice, the follow graph would include { bobsId: { alicesId: true } }
// - if alice also followed bob, the follow graph would be { bobsId: { alicesId: true }, alicesId: { bobsId: true } }
function countInbounds (graph, id) {
  var n = 0
  for (var id2 in graph)
    if (graph[id2][id])
      n++
  return n
}

// helper to count how many nodes in the graph the given ID points to
// - see `countInbounds` comment for more info
function countOutbounds(graph, id) {
  return Object.keys(graph[id] || {}).length
}

// take the feeds and graphs, produce textual list items
function feedsToListItems (feeds, follows, flags) {
  // sort by highest sequence to lowest sequence
  feeds.sort(function (a, b) {
    return b.sequence - a.sequence
  })

  // produce a list of labels
  return feeds.map(function (f) {
    var info = [
      'seq: '     + f.sequence,
      'follows: ' + countOutbounds(follows, f.id) + '/' + countInbounds(follows, f.id),
      'flags: '   + countOutbounds(flags, f.id)   + '/' + countInbounds(flags, f.id)
    ]
    return f.id + ' [' + info.join(' ') + ']'
  })
}

if (!module.parent)
  require('./lib/app')(module.exports)