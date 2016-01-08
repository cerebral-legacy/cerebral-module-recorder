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

    /*
      SIGNALS
    */
    function play(arg) {
      controller.recorder.seek(0);
      arg.module.state.merge([], {
        isPlaying: true
      });
      controller.recorder.play();
    }
    module.signal('played', [play]);

    function record(arg) {
      arg.module.state.set(['isRecording'], true);
      controller.recorder.record({
        paths: arg.input.paths
      });
    }
    module.signal('recorded', [record]);

    function stop(arg) {
      arg.module.state.merge([], {
        isPlaying: false,
        isRecording: false,
        isPaused: false,
        hasRecorded: true
      });
      controller.recorder.stop();
    }
    module.signal('stopped', [stop]);

    function pause(arg) {
      arg.module.state.merge([], {
        isPlaying: false,
        isPaused: true
      });
      controller.recorder.pause();
    }
    module.signal('paused', [pause]);

    function resume(arg) {
      arg.module.state.merge([], {
        isPlaying: true,
        isPaused: false
      });
      controller.recorder.seek(controller.recorder.getCurrentSeek());
      controller.recorder.play();
    }
    module.signal('resumed', [resume]);

    /*
      SERVICES
    */
    module.service('getRecording', function () {
      return controller.recorder.getRecording();
    });
    module.service('loadRecording', function () {
      return controller.recorder.loadRecording();
    });
    module.service('record', function (options) {
      return controller.recorder.record(options);
    });
    module.service('play', function () {
      return controller.recorder.play();
    });
    module.service('stop', function () {
      return controller.recorder.stop();
    });
    module.service('pause', function () {
      return controller.recorder.pause();
    });
    module.service('seek', function (duration) {
      return controller.recorder.seek(duration);
    });
  };
}
