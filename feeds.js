#! /usr/bin/env node

var pull = require('pull-stream')
var multicb = require('multicb')

module.exports = function (sbot, screen, filter) {
  var listWidget = require('./lib/widgets/list')(screen, ' Feeds ')

  // load data from sbot
  var done = multicb({ pluck: 1, spread: true })
  pull(sbot.latest(), (filter) ? pull.filter(filter) : null, pull.collect(done()))
  sbot.friends.all('follow', done())
  sbot.friends.all('flag', done())
  done(function (err, feeds, follows, flags) {
    if (err) throw err
    listWidget.data.feeds = feeds
    listWidget.setItems(feedsToListData(feeds, follows, flags))
    screen.render()
  })

  // listen for feed selections
  listWidget.on('select', function (el, selected) {
    if (!listWidget.data.feeds[selected])
      return
    screen.stack.push(require('./feed')(listWidget.data.feeds[selected].id, sbot, screen))
  })

  return listWidget
}

function countInbounds (graph, id) {
  var n = 0
  for (var id2 in graph)
    if (graph[id2][id])
      n++
  return n
}

function feedsToListData (feeds, follows, flags) {
  feeds.sort(function (a, b) {
    return b.sequence - a.sequence
  })

  return feeds.map(function (f) {
    return f.id 
      + ' [seq: ' + f.sequence 
      + ' follows: ' + Object.keys(follows[f.id] || {}).length + '/' + countInbounds(follows, f.id)
      + ' flags: ' + Object.keys(flags[f.id] || {}).length + '/' + countInbounds(flags, f.id)
      + ']'
  })
}

if (!module.parent)
  require('./lib/app')(module.exports)