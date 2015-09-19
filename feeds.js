#! /usr/bin/env node

var blessed = require('blessed')
var multicb = require('multicb')
var pull    = require('pull-stream')

var screen = blessed.screen({
  smartCSR: true,
  dockBorders: true
})
var windows = require('./lib/windows')(screen)

screen.key(['C-c'], function(ch, key) {
  return process.exit(0)
})

require('./sbot')(function (err, sbot) {
  if(err) throw err
  windows.push(require('./lib/widgets/feedslist')(screen, windows, sbot))
})
