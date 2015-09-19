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
var logList = require('./lib/widgets/loglist')(screen)
var msgView = require('./lib/widgets/msgview')(screen)

screen.key(['C-c'], function(ch, key) {
  return process.exit(0)
})

require('./sbot')(function (err, sbot) {
  if(err) throw err

  feedsList.data.load(sbot, function () {
    windows.push(feedsList)
  })

  feedsList.on('select', function (el, selected) {
    logList.data.load(sbot, feedsList.data.feeds[selected].id, function () {
      windows.push(logList)

      logList.removeAllListeners('select')
      logList.on('select', function (el, selected) {
        msgView.content = JSON.stringify(logList.data.log[selected], 0, 2)
        windows.push(msgView, { noFocus: true })
      })
    })
  })
})
