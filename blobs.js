#! /usr/bin/env node

var pull = require('pull-stream')

module.exports = function (userId, sbot, screen) {
  var listWidget = require('./lib/widgets/list')(screen, ' Blobs: ' + userId + ' ')

  // load data
  var blobs, blobMessageMap = {}
  pull(
    // fetch messages by `userId` which link to a blob
    sbot.links({ source: userId, dest: '&', values: true }),

    // group together messages that publish a blob
    pull.filter(function (index) {
      var blobId = index.dest
      if (!blobMessageMap[blobId]) {
        blobMessageMap[blobId] = [index]
        return true
      }
      blobMessageMap[blobId].push(index)
      return false
    }),

    // collect into an array
    pull.collect(function (err, _blobs) {
      if (err) throw err
      blobs = _blobs

      // sort by the number of references to the blob
      blobs.sort(function (a, b) {
        return blobMessageMap[b.dest].length - blobMessageMap[a.dest].length
      })

      // render in the list widget
      var listItems = blobs.map(function (index) { 
        return index.dest + ' ('+blobMessageMap[index.dest].length+' references)'
      })
      listWidget.setItems(listItems)
      listWidget.select(0)
      screen.render()
    })
  )
 
  listWidget.on('select', function (el, selected) {
    // load up a message view with the selected message
    var popup = require('./lib/widgets/popup')(screen, JSON.stringify(blobMessageMap[blobs[selected].dest], 0, 2))
    screen.stack.replace(listWidget, popup)
  })

  return listWidget
}

if (!module.parent) {
  var argv = require('minimist')(process.argv.slice(2))
  var userId = argv._[0]
  if (!require('ssb-ref').isFeed(userId)) {
    console.error('Usage: blobs.js {feedid}')
    process.exit(1)
  }
  require('./lib/app')(module.exports.bind(null, userId))
}