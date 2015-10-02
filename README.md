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