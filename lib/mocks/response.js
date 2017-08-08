'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _sinon = require('sinon');var _sinon2 = _interopRequireDefault(_sinon);
var _es = require('hubot-async/es2015');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                       * Add response method spies and .sendPrivate routed to adapter method
                                                                                                                                       * @param  {Array} strings...  Array of message text strings
                                                                                                                                       * @return MockResponse        New mock response instance
                                                                                                                                       */exports.default =
class extends _es.Response {
  constructor(robot, message, match) {
    super(robot, message, match);
    // spy on all instance methods
    Object.getOwnPropertyNames(_es.Response.prototype).map(key => {
      let spy = _sinon2.default.spy(this, key);
      delete spy.stackTrace; // remove verbose logging (see bug in robot.js)
    });
    robot.emit('response', this);
  }

  /**
     * Custom method for some platform adapters to process private messages
     * @param  {Array} strings...  Array of message text strings
     */
  sendPrivate(...strings) {
    return this.robot.adapter.sendPrivate(this.envelope, ...strings);
  }};module.exports = exports['default'];
//# sourceMappingURL=response.js.map