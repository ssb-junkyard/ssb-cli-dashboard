var blessed = require('blessed')

module.exports = function (screen, windows, sbot, id) {
  var views = {
    'Log': require('./loglist'),
    'Followeds': feeds('follow', false, 'Followeds'),
    'Followers': feeds('follow', true, 'Followers'),
    'Flaggeds': feeds('flag', false, 'Flaggeds'),
    'Flaggers': feeds('flag', true, 'Flaggers'),
    'Blobs': require('./bloblist')
  }

  function feeds (graph, inbound, label) {
    // construct allow list
    var allowed = {}
    sbot.friends.all(graph, function (err, g) {
      if (inbound) {
        for (var id2 in g)
          if (g[id2][id])
            allowed[id2] = true
      } else
        allowed = g[id] || {}
    })

    // return function that'll construct the right view when called
    return function () {
      var el = require('./feedslist')(screen, windows, sbot, function (entry) {
        return allowed[entry.id]
      })
      el.setLabel(label+': '+id)
      return el
    }
  }

  var feedViewsList = blessed.list({    
    parent: screen,
    label: ' Feed: ' + id + ' ',
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
    },
    items: Object.keys(views)
  })

  // listen for view selections
  feedViewsList.on('select', function (el, selected) {
    var k = Object.keys(views)[selected]
    windows.push(views[k](screen, windows, sbot, id))
  })

  return feedViewsList
}