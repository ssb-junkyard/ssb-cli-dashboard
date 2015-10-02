#! /usr/bin/env node

var pull = require('pull-stream')

module.exports = function (userId, sbot, screen) {
  var listWidget = require('./lib/widgets/list')(screen, ' Feed: ' + userId + ' ')

  // load data
  pull(sbot.createUserStream({ id: userId }), pull.collect(function (err, log) {
    if (err) throw err
    listWidget.data.log = log
    log.reverse()
    listWidget.setItems(log.map(function (msg) { return JSON.stringify(msg.value.content) }))
    listWidget.select(0)
    screen.render()
  }))
 
  // listen for log-entry selections
  listWidget.on('select', function (el, selected) {
    // load up a message view with the selected message
    var mview = require('./lib/widgets/popup')(screen, JSON.stringify(listWidget.data.log[selected], null, 2))
    screen.stack.replace(listWidget, mview, { noFocus: true })
  })

  return listWidget
}

if (!module.parent) {
  var argv = require('minimist')(process.argv.slice(2))
  var userId = argv._[0]
  if (!require('ssb-ref').isFeed(userId)) {
    console.error('Usage: feed.js {feedid}')
    process.exit(1)
  }
  require('./lib/app')(module.exports.bind(null, userId))
}