var MODULE = 'cerebral-module-recorder'
var getRecorderServices = function (modulePath, context) {
  return modulePath.reduce(function (services, key) {
    return services[key]
  }, context.services)
}
var getModulePath = function (context) {
  return context[MODULE] ? context[MODULE].path : context.modules[MODULE].path
}

function checkPrevent (context) {
  if (context.state.get(getModulePath(context).concat('preventSignals'))) {
    context.output.reject()
  } else {
    context.output.accept()
  }
}

function setPrevent (context) {
  context.state.set(getModulePath(context).concat('preventSignals'), true)
}

function unsetPrevent (context) {
  context.state.set(getModulePath(context).concat('preventSignals'), false)
}

function waitSignalsFinished (context) {
  var id = setInterval(function () {
    if (!context.isExecuting()) {
      clearInterval(id)
      context.output()
    }
  }, 10)
}
waitSignalsFinished.async = true

function play (context) {
  var modulePath = getModulePath(context)
  var services = getRecorderServices(modulePath, context)
  services.seek(0)
  context.state.merge(modulePath, {
    isPlaying: true
  })
  services.play()
}

function record (context) {
  var modulePath = getModulePath(context)
  var services = getRecorderServices(modulePath, context)
  context.state.set(modulePath.concat('isRecording'), true)
  services.record({
    paths: context.input.paths
  })
}

function stop (context) {
  var modulePath = getModulePath(context)
  var services = getRecorderServices(modulePath, context)
  context.state.merge(modulePath, {
    isPlaying: false,
    isRecording: false,
    isPaused: false,
    hasRecorded: true
  })
  services.stop()
}

function pause (context) {
  var modulePath = getModulePath(context)
  var services = getRecorderServices(modulePath, context)
  context.state.merge(modulePath, {
    isPlaying: false,
    isPaused: true
  })
  services.pause()
}

function resume (context) {
  var modulePath = getModulePath(context)
  var services = getRecorderServices(modulePath, context)
  context.state.merge(modulePath, {
    isPlaying: true,
    isPaused: false
  })
  services.seek(services.getCurrentSeek())
  services.play()
}

function chainFactory (action) {
  return [
    checkPrevent, {
      accept: [
        setPrevent,
        waitSignalsFinished,
        action,
        unsetPrevent
      ],
      reject: []
    }
  ]
}

module.exports = {
  played: chainFactory(play),
  recorded: chainFactory(record),
  stopped: chainFactory(stop),
  paused: chainFactory(pause),
  resumed: chainFactory(resume)
}
