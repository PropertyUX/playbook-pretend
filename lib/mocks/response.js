'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _sinon = require('sinon');var _sinon2 = _interopRequireDefault(_sinon);
var _es = require('hubot-async/es2015');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                       * Add response method spies and .sendPrivate routed to adapter method.
                                                                                                                                       *
                                                                                                                                       * @param  {Robot}       robot   A Robot instance
                                                                                                                                       * @param  {TextMessage} message A Message instance (can also be catch-all)
                                                                                                                                       * @param  {array}       match   A Match object from the successful Regex match
                                                                                                                                       * @return MockResponse        New mock response instance
                                                                                                                                       */
class MockResponse extends _es.Response {
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
     * @param  {array} strings...  Array of message text strings
     */
  sendPrivate() {var _robot$adapter;for (var _len = arguments.length, strings = Array(_len), _key = 0; _key < _len; _key++) {strings[_key] = arguments[_key];}
    return (_robot$adapter = this.robot.adapter).sendPrivate.apply(_robot$adapter, [this.envelope].concat(strings));
  }}exports.default =


MockResponse;module.exports = exports['default'];
//# sourceMappingURL=response.js.map