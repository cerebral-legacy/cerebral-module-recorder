var React = require('react')
var Cerebral = require('cerebral-view-react').Mixin

module.exports = React.createClass({
  mixins: [Cerebral],
  asyncCount: 0,
  componentWillMount: function () {
    this.context.controller.on('actionStart', this.actionStart)
    this.context.controller.on('actionEnd', this.actionEnd)
  },
  componentWillUnmount: function () {
    this.context.controller.off('actionStart', this.actionStart)
    this.context.controller.on('actionEnd', this.actionEnd)
  },
  actionStart: function (data) {
    this.asyncCount += data.action.isAsync ? 1 : 0
    if (this.asyncCount === 1) {
      this.setState({
        isExecutingAsync: true
      })
    }
  },
  actionEnd: function (data) {
    this.asyncCount -= data.action.isAsync ? 1 : 0
    if (this.asyncCount === 0) {
      this.setState({
        isExecutingAsync: false
      })
    }
  },
  getInitialState: function () {
    return {
      isExecutingAsync: false
    }
  },
  getStatePaths: function () {
    return {
      recorder: this.modules['cerebral-module-recorder'].path
    }
  },
  render: function () {
    var isDisabled = this.state.isExecutingAsync
    var style = {
      border: '1px solid black',
      borderRadius: '2px',
      height: '25px',
      backgroundColor: '#EAEAEA',
      padding: '5px',
      lineHeight: '15px',
      boxSizing: 'border-box',
      opacity: isDisabled ? '0.5' : '1'
    }
    var signals = this.signals
    if (this.state.recorder.isPlaying) {
      return React.createElement('button', {
        style: style,
        onClick: function () {
          signals.recorder.paused({}, {
            isRecorded: true
          })
        },
        disabled: isDisabled
      }, 'Pause playback')
    }
    if (this.state.recorder.isPaused) {
      return React.createElement('button', {
        style: style,
        onClick: function () { signals.recorder.resumed() },
        disabled: isDisabled
      }, 'Play')
    }
    if (this.state.recorder.isRecording) {
      return React.createElement('button', {
        style: style,
        onClick: function () { signals.recorder.stopped() },
        disabled: isDisabled
      }, 'Stop recording')
    }
    if (this.state.recorder.hasRecorded) {
      return React.createElement('button', {
        style: style,
        onClick: function () { signals.recorder.played() },
        disabled: isDisabled
      }, 'Play')
    }
    return React.createElement('button', {
      style: style,
      onClick: function () { signals.recorder.recorded() },
      disabled: isDisabled
    }, 'Record')
  }
})
