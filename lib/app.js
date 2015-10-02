var blessed = require('blessed')

module.exports = function (main) {
  var screen = blessed.screen({
    smartCSR: true,
    dockBorders: true
  })
  screen.stack = require('./widget-stack')(screen)

  screen.key(['C-c'], function(ch, key) {
    return process.exit(0)
  })

  require('ssb-client')(function (err, sbot) {
    if(err) throw err
    screen.stack.push(main(sbot, screen))
  })
}