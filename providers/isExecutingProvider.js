module.exports = function (clojure) {
  return function (context) {
    context.isExecuting = function () {
      return clojure.count
    }
    return context
  }
}
