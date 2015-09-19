var blessed = require('blessed')
var multicb = require('multicb')
var pull    = require('pull-stream')

module.exports = function (screen) {
  var el = blessed.list({
    parent: screen,
    label: ' Feeds ',
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

  el.data.load = function (sbot, cb) {
    var done = multicb({ pluck: 1 })
    pull(sbot.latest(), pull.collect(done()))
    sbot.friends.all('follow', done())
    sbot.friends.all('flag', done())
    done(function (err, res) {
      if (err) throw err
      el.data.feeds = res[0]
      el.setItems(feedsToListData.apply(null, res))
      cb()
    })
  }

  return el
}

function countInbounds (graph, id) {
  var n = 0
  for (var id2 in graph)
    if (graph[id2][id])
      n++
  return n
}

function feedsToListData (feeds, follows, flags) {
  feeds.sort(function (a, b) {
    return b.sequence - a.sequence
  })

  return feeds.map(function (f) {
    return f.id 
      + ' [seq: ' + f.sequence 
      + ' follows: ' + Object.keys(follows[f.id] || {}).length + '/' + countInbounds(follows, f.id)
      + ' flags: ' + Object.keys(flags[f.id] || {}).length + '/' + countInbounds(flags, f.id)
      + ']'
  })
}