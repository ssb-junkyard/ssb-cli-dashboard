var blessed = require('blessed')
var pull    = require('pull-stream')

module.exports = function (screen, windows, sbot, id) {
  var logList = blessed.list({    
    parent: screen,
    label: ' Log: ' + id + ' ',
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
  pull(sbot.createUserStream({ id: id }), pull.collect(function (err, log) {
    if (err) throw err
    logList.data.log = log
    log.reverse()
    logList.setItems(log.map(function (msg) { return JSON.stringify(msg.value.content) }))
    logList.select(0)
    screen.render()
  }))
 
  // listen for log-entry selections
  logList.on('select', function (el, selected) {
    // load up a message view with the selected message
    var mview = require('./msgview')(screen, windows, sbot, logList.data.log[selected])
    windows.replace(logList, mview, { noFocus: true })
  })

  return logList
}