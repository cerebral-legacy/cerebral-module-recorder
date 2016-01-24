function play (arg) {
  arg.module.services.seek(0)
  arg.module.state.merge([], {
    isPlaying: true
  })
  arg.module.services.play()
}

function record (arg) {
  arg.module.state.set(['isRecording'], true)
  arg.module.services.record({
    paths: arg.input.paths
  })
}

function stop (arg) {
  arg.module.state.merge([], {
    isPlaying: false,
    isRecording: false,
    isPaused: false,
    hasRecorded: true
  })
  arg.module.services.stop()
}

function pause (arg) {
  arg.module.state.merge([], {
    isPlaying: false,
    isPaused: true
  })
  arg.module.services.pause()
}

function resume (arg) {
  arg.module.state.merge([], {
    isPlaying: true,
    isPaused: false
  })
  arg.module.services.seek(arg.module.services.getCurrentSeek())
  arg.module.services.play()
}

module.exports = {
  played: [ play ],
  recorded: [ record ],
  stopped: [ stop ],
  paused: [ pause ],
  resumed: [ resume ]
}
