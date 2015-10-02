#! /usr/bin/env node

var pull = require('pull-stream')

module.exports = function (userId, sbot, screen) {
  var listWidget = require('./lib/widgets/list')(screen, ' Blobs: ' + userId + ' ')

  // load data
  var blobs, blobMessageMap = {}
  pull(
    sbot.links({ source: userId, dest: '&' }),
    pull.asyncMap(function (index, cb) {
      // fetch the messages
      sbot.get(index.key, function (err, msg) {
        if (err)
          return cb(err)
        index.value = msg
        cb(null, index)
      })
    }),
    pull.filter(function (index) {
      // group together messages that publish a blob
      var blobId = index.dest
      if (!blobMessageMap[blobId]) {
        blobMessageMap[blobId] = [index]
        return true
      }
      blobMessageMap[blobId].push(index)
      return false
    }),
    pull.collect(function (err, _blobs) {
      if (err) throw err
      blobs = _blobs

      blobs.sort(function (a, b) {
        return blobMessageMap[b.dest].length - blobMessageMap[a.dest].length
      })

      listWidget.setItems(blobs.map(function (index) { 
        return index.dest + ' ('+blobMessageMap[index.dest].length+' references)'
      }))
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