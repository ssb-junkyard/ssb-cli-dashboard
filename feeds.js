#! /usr/bin/env node

var blessed = require('blessed')
var multicb = require('multicb')
var pull    = require('pull-stream')

var screen = blessed.screen({
  smartCSR: true,
  dockBorders: true
})
var windows = require('./lib/windows')(screen)
var feedList = require('./lib/widgets/feedlist')(screen)
var logList = require('./lib/widgets/loglist')(screen)
var msgView = require('./lib/widgets/msgview')(screen)

screen.key(['C-c'], function(ch, key) {
  return process.exit(0)
})

require('./sbot')(function (err, sbot) {
  if(err) throw err

  var done = multicb({ pluck: 1 })
  pull(sbot.latest(), pull.collect(done()))
  sbot.friends.all('follow', done())
  sbot.friends.all('flag', done())
  done(function (err, res) {
    if (err) throw err
    var feeds = res[0]
    feedList.setItems(feedsToListData.apply(null, res))
    windows.push(feedList)

    feedList.on('select', function (el, selected) {
      logList.setLabel(' Feed: ' + feeds[selected].id + ' ')

      pull(sbot.createUserStream({ id: feeds[selected].id }), pull.collect(function (err, entries) {
        if (err) throw err
        entries.reverse()
        logList.setItems(entries.map(function (msg) { return JSON.stringify(msg.value.content) }))
        logList.select(0)
        windows.push(logList)

        logList.removeAllListeners('select')
        logList.on('select', function (el, selected) {
          msgView.content = JSON.stringify(entries[selected], 0, 2)
          windows.push(msgView, { noFocus: true })
        })
      }))
    })
  })
})

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
