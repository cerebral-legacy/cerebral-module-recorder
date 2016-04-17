var Controller = require('cerebral')
var Recorder = require('../index.js')

var suite = {}
var Model = function () {
  return function () {
    return {
      accessors: {
        get: function () {}
      },
      mutators: {
        set: function (path, value) {
          var state = {}
          state[path.pop()] = value
        }
      }
    }
  }
}

suite['should record signals'] = function (test) {
  var initialState = {}
  var state = initialState
  var ctrl = Controller(Model())
  ctrl.addModules({
    recorder: Recorder()
  })
  var signal = [
    function (args) {
      args.state.set('foo', args.input.foo)
    }
  ]

  ctrl.addSignals({
    'startTest': [
      function (args) {
        args.services.recorder.record(state)
      }
    ],
    'test': signal,
    'endTest': [
      function (args) {
        args.services.recorder.stop()
        test.equals(args.services.recorder.getRecording().signals.length, 2)
        test.done()
      }
    ]
  })
  ctrl.getSignals().startTest()

  setTimeout(function () {
    ctrl.getSignals().test({
      foo: 'bar'
    })
    setTimeout(function () {
      ctrl.getSignals().endTest()
    }, 100)
  }, 100)
}

suite['should play back recording'] = function (test) {
  var initialState = {}
  var state = initialState
  var Model = function () {
    return function (controller) {
      controller.on('seek', function (seek, recording) {
        state = initialState
      })
      return {
        accessors: {
          get: function () {
            return state
          },
          merge: function () {
            return state
          }
        },
        mutators: {
          set: function (path, value) {
            state = {}
            state[path.pop()] = value
          }
        }
      }
    }
  }
  var ctrl = Controller(Model())
  ctrl.addModules({
    recorder: Recorder()
  })
  var signal = [
    function (args) {
      args.state.set('foo', args.input.foo)
    }, [
      function (args) { args.output() }
    ]
  ]

  ctrl.addSignals({
    'record': [
      function (args) {
        args.services.recorder.record(state)
      }
    ],
    'stop': [
      function (args) {
        args.services.recorder.stop()
      }
    ],
    'replay': [
      function (args) {
        args.services.recorder.seek(0)
        args.services.recorder.play()
        test.deepEqual(state, {})
      }
    ],
    'test': signal
  })

  ctrl.getSignals().record()
  setTimeout(function () {
    ctrl.getSignals().test({
      foo: 'bar'
    })
    setTimeout(function () {
      ctrl.getSignals().stop()
      setTimeout(function () {
        ctrl.getSignals().replay()
        setTimeout(function () {
          test.deepEqual(state, {foo: 'bar'})
          test.done()
        }, 300)
      }, 100)
    }, 100)
  }, 100)
}

suite['should seek to specific point in recording'] = function (test) {
  var initialState = {}
  var state = initialState
  var Model = function () {
    return function (controller) {
      controller.on('seek', function (seek, recording) {
        state = initialState
      })
      return {
        accessors: {
          get: function () {
            return state
          },
          merge: function () {
            return state
          }
        },
        mutators: {
          set: function (path, value) {
            state = {}
            state[path.pop()] = value
          }
        }
      }
    }
  }
  var ctrl = Controller(Model())
  ctrl.addModules({
    recorder: Recorder()
  })
  var signal = [
    function (args) {
      args.state.set('foo', args.input.foo)
    }
  ]

  ctrl.addSignals({
    'record': [
      function (args) {
        args.services.recorder.record(state)
      }
    ],
    'stop': [
      function (args) {
        args.services.recorder.stop()
      }
    ],
    'seekPlay': [
      function (args) {
        args.services.recorder.seek(150)
        args.services.recorder.play()
        test.deepEqual(state, {foo: 'bar'})
        test.done()
      }
    ],
    'test': signal
  })
  ctrl.getSignals().record()

  setTimeout(function () {
    ctrl.getSignals().test({
      foo: 'bar'
    })
    setTimeout(function () {
      ctrl.getSignals().stop()
      setTimeout(function () {
        ctrl.getSignals().seekPlay()
      }, 100)
    }, 100)
  }, 100)
}

suite['should pause a playback'] = function (test) {
  var initialState = {}
  var state = initialState
  var Model = function () {
    return function (controller) {
      controller.on('seek', function (seek, recording) {
        state = initialState
      })
      return {
        accessors: {
          get: function () {
            return state
          },
          merge: function () {
            return state
          }
        },
        mutators: {
          set: function (path, value) {
            state = {}
            state[path.pop()] = value
          }
        }
      }
    }
  }
  var ctrl = Controller(Model())
  ctrl.addModules({
    recorder: Recorder()
  })
  var signal = [
    function (args) {
      args.state.set('foo', args.input.foo)
    }
  ]

  ctrl.addSignals({
    'record': [
      function (args) {
        args.services.recorder.record(state)
      }
    ],
    'stop': [
      function (args) {
        args.services.recorder.stop()
      }
    ],
    'replay': [
      function (args) {
        args.services.recorder.seek(0)
        args.services.recorder.play()
        test.deepEqual(state, {})
      }
    ],
    'pause': [
      function (args) {
        args.services.recorder.pause()
        test.deepEqual(state, {foo: 'bar'})
        test.done()
      }
    ],
    'test': signal
  })
  ctrl.getSignals().record()

  setTimeout(function () {
    ctrl.getSignals().test({
      foo: 'bar'
    })
    setTimeout(function () {
      ctrl.getSignals().test({
        foo: 'bar2'
      })
      setTimeout(function () {
        ctrl.getSignals().stop()
        setTimeout(function () {
          ctrl.getSignals().replay()
          setTimeout(function () {
            ctrl.getSignals().pause({}, {isRecorded: true})
          }, 150)
        }, 100)
      }, 100)
    }, 100)
  }, 100)
}

suite['should resume a paused playback'] = function (test) {
  var initialState = {}
  var state = initialState
  var Model = function () {
    return function (controller) {
      controller.on('seek', function (seek, recording) {
        state = initialState
      })
      return {
        accessors: {
          get: function () {
            return state
          },
          merge: function () {
            return state
          }
        },
        mutators: {
          set: function (path, value) {
            state = {}
            state[path.pop()] = value
          }
        }
      }
    }
  }
  var ctrl = Controller(Model())
  ctrl.addModules({
    recorder: Recorder()
  })
  var signal = [
    function (args) {
      args.state.set('foo', args.input.foo)
    }
  ]

  ctrl.addSignals({
    'record': [
      function (args) {
        args.services.recorder.record(state)
      }
    ],
    'stop': [
      function (args) {
        args.services.recorder.stop()
      }
    ],
    'replay': [
      function (args) {
        args.services.recorder.seek(0)
        args.services.recorder.play()
        test.deepEqual(state, {})
      }
    ],
    'pause': [
      function (args) {
        args.services.recorder.pause()
        test.deepEqual(state, {foo: 'bar'})
      }
    ],
    'continue': [
      function (args) {
        args.services.recorder.seek(args.services.recorder.getCurrentSeek())
        args.services.recorder.play()
      }
    ],
    'test': signal
  })
  ctrl.getSignals().record()

  setTimeout(function () {
    ctrl.getSignals().test({
      foo: 'bar'
    })
    setTimeout(function () {
      ctrl.getSignals().test({
        foo: 'bar2'
      })

      setTimeout(function () {
        ctrl.getSignals().stop()
        setTimeout(function () {
          ctrl.getSignals().replay()
          setTimeout(function () {
            ctrl.getSignals().pause({}, {isRecorded: true})
            setTimeout(function () {
              ctrl.getSignals().continue()
              setTimeout(function () {
                test.deepEqual(state, {foo: 'bar2'})
                test.done()
              }, 100)
            }, 100)
          }, 150)
        }, 100)
      }, 100)
    }, 100)
  }, 100)
}

suite['should expose default signals'] = function (test) {
  var initialState = {}
  var state = initialState
  var Model = function () {
    return function (controller) {
      controller.on('seek', function (seek, recording) {
        state = initialState
      })
      return {
        accessors: {
          get: function () {
            return state
          },
          merge: function () {
            return state
          }
        },
        mutators: {
          set: function (path, value) {
            state = {}
            state[path.pop()] = value
          }
        }
      }
    }
  }
  var ctrl = Controller(Model())
  ctrl.addModules({
    recorder: Recorder()
  })

  ctrl.addSignals({
    'test': {
      chain: [
        function (args) {
          args.state.set('foo', args.input.foo)
        }
      ],
      immediate: true
    }
  })
  ctrl.getSignals().recorder.recorded()

  setTimeout(function () {
    ctrl.getSignals().test({
      foo: 'bar'
    })
    setTimeout(function () {
      ctrl.getSignals().test({
        foo: 'bar2'
      })
      setTimeout(function () {
        ctrl.getSignals().recorder.stopped()
        setTimeout(function () {
          ctrl.getSignals().recorder.played({}, {immediate: true})
          test.deepEqual(state, {})
          setTimeout(function () {
            ctrl.getSignals().recorder.paused({}, {isRecorded: true, immediate: true})
            test.deepEqual(state, {foo: 'bar'})
            setTimeout(function () {
              ctrl.getSignals().recorder.resumed()
              setTimeout(function () {
                test.deepEqual(state, {foo: 'bar2'})
                test.done()
              }, 100)
            }, 100)
          }, 150)
        }, 100)
      }, 100)
    }, 100)
  }, 100)
}

module.exports = { recorder: suite }
