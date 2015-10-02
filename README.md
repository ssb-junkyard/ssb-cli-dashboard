# SSB Blessed Dashboard

```
git clone https://github.com/pfraze/ssb-blessed-dashboard.git
cd ssb-blessed-dashboard
npm install
```

Then:

```
# list all feeds
$ ./feeds.js

# view the given feed
$ ./feed.js {feedid}   

# view blobs linked-to by the given feed
$ ./blobs.js {feedid}

# view feeds related to the given feed
$ ./graph.js [follows|followers|flags|flaggers] {feedid}

# network status
$ ./gossip.js
```

![./demo.gif](./demo.gif)

## How it works

The `feeds.js` view pulls some metadata from Scuttlebot, and uses that to produce a master list of known feeds.

```js
// load data from sbot
var done = multicb({ pluck: 1, spread: true })

pull(
  sbot.latest(),                          // get the sequence number of the latest message of each known feed
  (filter) ? pull.filter(filter) : null,  // apply a filter, if given
  pull.collect(done())                    // collect into an array
)
sbot.friends.all('follow', done())        // fetch the computed follow-graph
sbot.friends.all('flag', done())          // fetch the computed flag-graph

done(function (err, feeds, follows, flags) {
  // ...
})
```

Each entry shows:

```
feedid [seq: N follows: N/N flags: N/N]
```

Where, in the case of follows and flags, it's showing the outbound then inbound.
It computes this info by counting directed-edges:

```js
// helper to count how many nodes in the graph have edges pointing to the given ID
// - graphs are given in the shape of { sourceIds: { destIds: true } }
// - eg. if bob follows alice, the follow graph would include { bobsId: { alicesId: true } }
// - if alice also followed bob, the follow graph would be { bobsId: { alicesId: true }, alicesId: { bobsId: true } }
function countInbounds (graph, id) {
  var n = 0
  for (var id2 in graph)
    if (graph[id2][id])
      n++
  return n
}

// helper to count how many nodes in the graph the given ID points to
// - see `countInbounds` comment for more info
function countOutbounds(graph, id) {
  return Object.keys(graph[id] || {}).length
}

// take the feeds and graphs, produce textual list items
function feedsToListItems (feeds, follows, flags) {
  // sort by highest sequence to lowest sequence
  feeds.sort(function (a, b) {
    return b.sequence - a.sequence
  })

  // produce a list of labels
  return feeds.map(function (f) {
    var info = [
      'seq: '     + f.sequence,
      'follows: ' + countOutbounds(follows, f.id) + '/' + countInbounds(follows, f.id),
      'flags: '   + countOutbounds(flags, f.id)   + '/' + countInbounds(flags, f.id)
    ]
    return f.id + '[' + info.join(' ') + ']'
  })
}
```