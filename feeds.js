#! /usr/bin/env node

var blessed = require('blessed')
var multicb = require('multicb')
var pull    = require('pull-stream')

var screen = blessed.screen({
  smartCSR: true,
  dockBorders: true
})
var windows = require('./lib/windows')(screen)
var feedsList = require('./lib/widgets/feedslist')(screen)

screen.key(['C-c'], function(ch, key) {
  return process.exit(0)
})

require('./sbot')(function (err, sbot) {
  if(err) throw err

  // load and run toplevel view, the feeds list
  feedsList.data.load(sbot, function () {
    windows.push(feedsList)
  })

  // listen for feed selections
  feedsList.on('select', function (el, selected) {
    // load up a log list with the selected feed
    var logList = require('./lib/widgets/loglist')(screen)
    logList.data.load(sbot, feedsList.data.feeds[selected].id, function () {
      windows.push(logList)
    })

    // listen for log-entry selections
    logList.on('select', function (el, selected) {
      // load up a message view with the selected message
      var msgView = require('./lib/widgets/msgview')(screen)
      msgView.content = JSON.stringify(logList.data.log[selected], 0, 2)
      windows.replace(logList, msgView, { noFocus: true })
    })
  })
})
