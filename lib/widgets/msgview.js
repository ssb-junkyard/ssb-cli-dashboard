var blessed = require('blessed')
module.exports = function (screen, windows, sbot, msg) {
  return blessed.log({
    parent: screen,
    content: JSON.stringify(msg, 0, 2),
    hidden: true,
    top: 1,
    right: 1,
    width: '80%',
    height: '80%',
    border: 'line'
  })
}