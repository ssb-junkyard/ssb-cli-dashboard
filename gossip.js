#! /usr/bin/env node

var blessed = require('blessed')
var contrib = require('blessed-contrib')
var path    = require('path')

require('./sbot')(function (err, sbot) {
  if(err) throw err

  var screen = blessed.screen()
  var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

  var table = contrib.table({
    fg: 'default',
    keys: true,
    interactive: false,
    columnSpacing: 2, //in chars
    columnWidth: [10, process.stdout.columns - (10+15+4), 15] /*in chars*/
  })
  screen.append(table)

  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  })

  function poll () {
    sbot.gossip.peers(function (err, peers) {
      if (err) throw err
      table.setData(peersToTableData(peers))
      screen.render()
    })
  }

  poll()
  setInterval(poll, 1000)
})

function status (peer) {
  if (peer.connected)
    return 'Connected'
  if (peer.time && peer.time.connect > peer.time.attempt)
    return 'Connecting'
  if (peer.failure)
    return peer.failure + ' Failures'
  return 'Disconnected'
}

function peersToTableData (peers) {
  peers.sort(function (a, b) {
    var an = (a.announcers) ? a.announcers.length : 0
    var bn = (b.announcers) ? b.announcers.length : 0
    return bn - an
  })

  return {
    headers: ['Announcers', 'Address', 'Status'],
    data: peers.map(function (p) {
      return [
        (p.announcers) ? p.announcers.length : 0,
        p.host + ':' + p.port + ':' + p.key,
        status(p)
      ]
    })
  }
}
