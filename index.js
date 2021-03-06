var MODULE = 'cerebral-module-recorder'
var signals = require('./signals')

module.exports = function (options) {
  options = options || {}
  return function (module, controller) {
    var signalMethods = controller.getSignals()

    var currentSeek = 0
    var currentRecording = null
    var durationTimer = null
    var playbackTimers = []
    var duration = 0
    var started = null
    var ended = null
    var isPlaying = false
    var isRecording = false
    var isCatchingUp = false
    var startSeek = 0
    var catchup = null
    var lastSignal = null
    var runningSignalCount = 0

    // Runs the signal synchronously
    var triggerSignal = function (signal) {
      lastSignal = signal
      var signalName = signal.name.split('.')
      var signalMethodPath = signalMethods
      while (signalName.length) {
        signalMethodPath = signalMethodPath[signalName.shift()]
      }

      signalMethodPath(signal.payload || signal.input, {
        isRecorded: !isCatchingUp,
        immediate: true,
        branches: isCatchingUp && signal.branches
      })
    }

    function seek (seek) {
      startSeek = seek
      clearTimeout(durationTimer)
      playbackTimers.forEach(clearTimeout)

      controller.emit('seek', startSeek, currentRecording)

      // Optimize with FOR loop
      catchup = currentRecording.signals.filter(function (signal) {
        return signal.start - currentRecording.start < startSeek
      })
      isCatchingUp = true
      catchup.forEach(triggerSignal)
      isCatchingUp = false
    }

    function createTimer () {
      var update = function () {
        duration += 500
        controller.emit('duration', duration)
        if (duration < currentRecording.duration) {
          durationTimer = setTimeout(update, 500)
          controller.emit('change')
        }
      }
      durationTimer = setTimeout(update, 500)
    }

    function play () {
      if (isPlaying || isRecording) {
        throw new Error('CEREBRAL Recorder - You can not play while already playing or recording')
      }

      createTimer()
      var signalsCount = currentRecording.signals.length
      var startIndex = catchup.length
      for (var x = startIndex; x < signalsCount; x++) {
        var signal = currentRecording.signals[x]
        var durationTarget = signal.start - currentRecording.start - startSeek
        playbackTimers.push(setTimeout(triggerSignal.bind(null, signal), durationTarget))
      }
      isPlaying = true
      started = Date.now()
    }

    function record (options) {
      options = options || {}

      // If we are recording over the previous stuff, go back to start
      if (currentRecording) {
        currentSeek = 0
        duration = 0
        ended = null
        startSeek = 0
        controller.emit('seek', 0, currentRecording)
      }

      var paths = options.paths || [[]]
      var state = paths.map(function (path) {
        return {
          path: path,
          value: controller.get(path)
        }
      })

      currentRecording = {
        initialState: state,
        start: Date.now(),
        signals: []
      }

      isRecording = true
    }

    function stop () {
      var wasPlaying = isPlaying
      clearTimeout(durationTimer)
      isPlaying = false
      isRecording = false

      if (wasPlaying) {
        return
      }

      currentRecording.end = Date.now()
      currentRecording.duration = currentRecording.end - currentRecording.start
    }

    function pause () {
      ended = Date.now()
      currentSeek = ended - started
      clearTimeout(durationTimer)
      playbackTimers.forEach(clearTimeout)
      isPlaying = false
    }

    function addSignal (signal) {
      currentRecording.signals.push(signal)
    }

    function getRecording () {
      return currentRecording
    }

    function getCurrentSeek () {
      return currentSeek
    }

    function loadRecording (recording) {
      currentRecording = recording
    }

    function onSignalTrigger (event) {
      var signal = event.signal

      if (
        (isPlaying && signal.options && !signal.options.isRecorded) ||
        (isPlaying && event.options && !event.options.isRecorded)
      ) {
        signal.preventSignalRun()
        console.warn('Cerebral - Recording is replaying, ignored signal ' + signal.name)
      }
    }

    function onSignalStart (args) {
      if (isRecording) addSignal(args.signal)
      if (args.signal.name.split('.') === module.name) runningSignalCount++
    }

    function onSignalEnd (args) {
      if (args.signal.name.split('.') === module.name) runningSignalCount--
    }

    function getLastSignal () {
      return lastSignal
    }

    module.alias(MODULE)

    var context = {}
    context[MODULE] = {
      path: module.path
    }
    controller.addContextProvider(context)
    controller.addContextProvider(require('cerebral/providers/actionMutationsProvider'))
    controller.addContextProvider(require('cerebral/providers/signalPayloadProvider'))
    controller.addContextProvider(require('./providers/isExecutingProvider')({
      count: runningSignalCount
    }))

    var state = options.state || {}
    state.isRecording = false
    state.isPlaying = false
    state.isPaused = false
    state.hasRecorded = false
    state.preventSignals = false

    var services = {
      getCurrentSeek: getCurrentSeek,
      getLastSignal: getLastSignal,
      getRecording: getRecording,
      loadRecording: loadRecording,
      record: record,
      play: play,
      stop: stop,
      pause: pause,
      seek: seek
    }

    module.addState(state)
    module.addSignals(signals)
    module.addServices(services)

    controller.on('signalTrigger', onSignalTrigger)
    controller.on('signalStart', onSignalStart)
    controller.on('signalEnd', onSignalEnd)
  }
}
