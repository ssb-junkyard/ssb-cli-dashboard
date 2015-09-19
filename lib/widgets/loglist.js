var blessed = require('blessed')
var pull    = require('pull-stream')

module.exports = function (screen) {
  var el = blessed.list({    
    parent: screen,
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

  el.data.load = function (sbot, id, cb) {
    el.setLabel(' Feed: ' + id + ' ')

    pull(sbot.createUserStream({ id: id }), pull.collect(function (err, log) {
      if (err) throw err
      el.data.log = log
      log.reverse()
      el.setItems(log.map(function (msg) { return JSON.stringify(msg.value.content) }))
      el.select(0)
      cb()
    }))
  }

  return el
}