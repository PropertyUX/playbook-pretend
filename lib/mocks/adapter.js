'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _es = require('hubot-async/es2015');
var _observer = require('../modules/observer');var _observer2 = _interopRequireDefault(_observer);
var _response = require('./response');var _response2 = _interopRequireDefault(_response);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

let _this; // to be adapter's `this`, for when method's `this` is bound to robot

/**
 * Extends Hubot Adapter, routing messages to internal collections
 */
class MockAdapter extends _es.Adapter {
  /**
                                        * Create mock adapter instance
                                       * @param  {Robot} @robot The robot instance
                                       * @return MockAdapter    A new mock adapter
                                       */
  constructor(robot) {
    super(robot);
    _this = this;
    this.name = 'pretend';
    this.observer = new _observer2.default([]);
    this.messages = this.observer.get();
    this.privateMessages = [];
  }

  /**
     * Invoked by robot when running, for adapter to extend bot
     */
  run() {
    this.robot.Response = _response2.default;
  }

  /**
     * Record details of a send from hubot
     * NB: robot.send calls adapter.send with this bound to robot
     * @param  {Object} envelope   A Object with message, room and user details
     * @param  {array} strings...  One or more Strings for each message to send
    */
  send(envelope) {for (var _len = arguments.length, strings = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {strings[_key - 1] = arguments[_key];}
    for (let str of strings) {
      let record = ['hubot', str];
      if (envelope.room != null) record.unshift(envelope.room);
      _this.messages.push(record);
    }
  }

  /**
     * Process and record details of a reply from hubot - prepends '@user '
     * @param  {Object} envelope   A Object with message, room and user details
     * @param  {array} strings...  One or more Strings for each message to send
    */
  reply(envelope) {for (var _len2 = arguments.length, strings = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {strings[_key2 - 1] = arguments[_key2];}
    for (let str of strings) {
      let record = ['hubot', `@${envelope.user.name} ${str}`];
      if (envelope.room != null) record.unshift(envelope.room);
      _this.messages.push(record);
    }
  }

  /**
     * Process and record details of received message
     * @param  {MockUser} user    Sender's user object
     * @param  {string}   message Message text
     * @return Promise            Promise resolving when robot finished processing
    */
  receive(user, message) {
    return new Promise(resolve => {
      let record = [user.name, message];
      if (user.room != null) record.unshift(user.room);
      this.messages.push(record);
      return this.robot.receive(new _es.TextMessage(user, message), resolve);
    });
  }

  /**
     * Process an enter message from user (not stored in messages)
     * @param  {User} user The entering user (assumes with room set)
     * @return {Promise}   Promise resolving when receive middleware complete
     */
  enter(user) {
    return new Promise(resolve => {
      return this.robot.receive(new _es.EnterMessage(user), resolve);
    });
  }

  /**
     * Process a leave message from user (not stored in messages)
     * @param  {User} user The leaving user (assumes with room set)
     * @return {Promise}   Promise resolving when receive middleware complete
     */
  leave(user) {
    return new Promise(resolve => {
      return this.robot.receive(new _es.LeaveMessage(user), resolve);
    });
  }

  /**
     * Custom method used by some platform adapters to process private messages
     * @param  {Object} envelope   A Object with message, room and user details
     * @param  {array} strings...  One or more Strings for each message to send
     */
  sendPrivate(envelope) {
    let username = envelope.user.name;
    if (!this.privateMessages[username]) this.privateMessages[username] = [];for (var _len3 = arguments.length, strings = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {strings[_key3 - 1] = arguments[_key3];}
    for (let str of strings) this.privateMessages[username].push(str);
  }}exports.default =


{
  use: function use(robot) {
    return new MockAdapter(robot);
  } };module.exports = exports['default'];
//# sourceMappingURL=adapter.js.map