var blessed = require('blessed')
var pull    = require('pull-stream')

module.exports = function (screen, windows, sbot, id) {
  var logList = blessed.list({    
    parent: screen,
    label: ' Blobs: ' + id + ' ',
    hidden: true,
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    keys: true,
    vi: true,
    interactive: true,
    border: 'line',
    scrollbar: {
      ch: ' ',
      track: {
        bg: 'cyan'
      },
      style: {
        inverse: true
      }
    },
    invertSelected: false,
    style: {
      item: {
        hover: {
          bg: 'blue'
        }
      },
      selected: {
        fg: 'white',
        bg: 'blue',
        bold: true
      }
    }
  })

  // load data
  var blobs, blobMessageMap = {}
  pull(
    sbot.links({ source: id, dest: '&' }),
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

      logList.setItems(blobs.map(function (index) { 
        return index.dest + ' ('+blobMessageMap[index.dest].length+' references)'
      }))
      logList.select(0)
      screen.render()
    })
  )
 
  logList.on('select', function (el, selected) {
    // load up a message view with the selected message
    var mview = require('./msgview')(screen, windows, sbot, blobMessageMap[blobs[selected].dest])
    windows.replace(logList, mview)
  })

  return logList
}