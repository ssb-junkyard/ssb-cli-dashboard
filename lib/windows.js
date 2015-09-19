
module.exports = function (screen) {
  var stack = []

  var api = {
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
    pop: function () {
      if (stack.length <= 1)
        return

      var oldTop = stack.pop()
      oldTop.hide()

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