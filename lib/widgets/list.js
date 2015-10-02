var blessed = require('blessed')
var pull    = require('pull-stream')

module.exports = function (screen, label) {
  return blessed.list({    
    parent: screen,
    label: label,
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
}