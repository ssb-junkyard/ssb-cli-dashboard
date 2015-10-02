
module.exports = function (screen) {
  var stack = []

  var api = {
    // add a new layer
    push: function (newTop, opts) {
      var oldTop = stack[stack.length - 1]
      if (oldTop != newTop)
        stack.push(newTop)

      newTop.setIndex(stack.length)
      if (!opts || !opts.noFocus)
        newTop.focus()
      newTop.show()

      screen.render()
    },
    // replace the top layer, such that `underTop` stays the 2nd-highest layer
    replace: function (underTop, newTop, opts) {
      var oldTop = stack[stack.length - 1]
      if (oldTop != underTop)
        api.pop()
      api.push(newTop, opts)
    },
    // remove the top layer
    pop: function () {
      if (stack.length <= 1)
        return

      var oldTop = stack.pop()
      oldTop.detach()

      var newTop = stack[stack.length - 1]
      newTop.focus()
      screen.render()
    }
  }

  screen.key(['escape', 'q'], function(ch, key) {
    api.pop()
  })

  return api
}