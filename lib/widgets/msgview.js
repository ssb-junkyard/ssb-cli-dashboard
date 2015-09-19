var blessed = require('blessed')
module.exports = function (screen) {
  return blessed.log({
    parent: screen,
    hidden: true,
    top: 1,
    right: 1,
    width: '80%',
    height: '80%',
    border: 'line'
  })
}