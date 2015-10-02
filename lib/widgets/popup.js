var blessed = require('blessed')
module.exports = function (screen, content) {
  return blessed.log({
    parent: screen,
    content: content,
    hidden: true,
    top: 1,
    right: 1,
    width: '80%',
    height: '80%',
    border: 'line',
    scrollable: true,
    keys: true,
    vi: true,
    interactive: true,
    scrollbar: {
      ch: ' ',
      track: {
        bg: 'cyan'
      },
      style: {
        inverse: true
      }
    }
  })
}