module.exports = function (options) {
  options = options || {};
  return function (module, controller) {

    module.alias('cerebral-module-recorder');

    module.state({
      isRecording: false,
      isPlaying: false,
      isPaused: false,
      hasRecorded: false
    });

    module.signals({
      played: [
        function play(arg) {
          arg.module.services.seek(0);
          arg.module.state.merge([], {
            isPlaying: true
          });
          arg.module.services.play();
        }
      ],
      recorded: [
        function record(arg) {
          arg.module.state.set(['isRecording'], true);
          arg.module.services.record({
            paths: arg.input.paths
          });
        }
      ],
      stopped: [
        function stop(arg) {
          arg.module.state.merge([], {
            isPlaying: false,
            isRecording: false,
            isPaused: false,
            hasRecorded: true
          });
          arg.module.services.stop();
        }
      ],
      paused: [
        function pause(arg) {
          arg.module.state.merge([], {
            isPlaying: false,
            isPaused: true
          });
          arg.module.services.pause();
        }
      ],
      resumed: [
        function resume(arg) {
          arg.module.state.merge([], {
            isPlaying: true,
            isPaused: false
          });
          arg.module.services.seek(arg.module.services.getCurrentSeek());
          arg.module.services.play();
        }
      ]
    });

    var recorder = controller.getRecorder();
    module.services({
      getCurrentSeek: function() {
        return recorder.getCurrentSeek();
      },
      getRecording: function() {
        return recorder.getRecording();
      },
      loadRecording: function(recording) {
        return recorder.loadRecording(recording);
      },
      record: function(options) {
        return recorder.record(options);
      },
      play: function() {
        return recorder.play();
      },
      stop: function() {
        return recorder.stop();
      },
      pause: function() {
        return recorder.pause();
      },
      seek: function(duration) {
        return recorder.seek(duration);
      }
    });

  };
}
