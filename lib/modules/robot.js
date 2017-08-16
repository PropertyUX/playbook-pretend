'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _sinon = require('sinon');var _sinon2 = _interopRequireDefault(_sinon);
var _mockery = require('mockery');var _mockery2 = _interopRequireDefault(_mockery);
var _es = require('hubot-async/es2015');
var _log = require('../mocks/log');var _log2 = _interopRequireDefault(_log);
var _adapter = require('../mocks/adapter');var _adapter2 = _interopRequireDefault(_adapter);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

require('coffee-script/register'); // register extension for legacy coffee script

/**
 * Extends Hubot with mocked response, events, logs and adapter loading
 */exports.default =
class extends _es.Robot {
  /**
                          * Create a pretend Robot (overrides adapter and adapterPath declaration)
                          * @param  {Boolean} httpd      Whether to enable the HTTP daemon.
                          * @param  {string} name        Robot name, defaults to Hubot.
                          * @param  {string} alias       Robot alias, defaults to null
                          * @return {Robot}              The pretend robot
                          */
  constructor(httpd) {let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'hubot';let alias = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'pretend';
    // replace robot required packages with mocks (adapter also replaces Response)
    _mockery2.default.enable({ warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true });
    _mockery2.default.registerMock('hubot-pretend-adapter', _adapter2.default);
    _mockery2.default.registerMock('log', _log2.default); // BUG: mockery can't replace log used in Robot require, as its private

    super(null, 'pretend-adapter', httpd, name, alias);
    this.logger = new _log2.default(process.env.HUBOT_LOG_LEVEL); // TODO: remove this when log mockery issue resovled (should capture load logs)
    this.loaded = [];
    this.eventLog = [];
    this.responses = {
      incoming: [],
      outgoing: []


      // allow tests to listen in on middleware stacks and record context response
      // BUG: because it prepends a middleware piece, it could throw off some tests expecting a given number in the stack
      // TODO: extend Middleware to listen on each piece's context, without adding a middleware
    };this.middleware.listener.register((context, next, done) => {
      this.emit('listen', context);
      return next();
    });
    this.middleware.receive.register((context, next, done) => {
      if (!(context.response.message instanceof _es.CatchAllMessage)) {
        this.responses.incoming.push(context.response);
      }
      this.emit('receive', context);
      return next();
    });
    this.middleware.response.register((context, next, done) => {
      this.responses.outgoing.push(context.response);
      this.emit('respond', context);
      return next();
    });

    // spy on all instance methods
    Object.getOwnPropertyNames(_es.Robot.prototype).map(key => {
      let spy = _sinon2.default.spy(this, key);
      delete spy.stackTrace;
      /**
                              * BUG getting reems of unknown errors `at wrapMethod` from sinon.spy
                              * wasn't actually breaking anything so the temp fix is just to delete
                              * the stackTrace property for readability when logging spied objects
                              */
    });
  }

  /**
     * Loads a file in path (storing each for tests to compare)
     * @param  {string} filepath Path on the filesystem
     * @param  {string} filename Name of file at filepath
     */
  loadFile(filepath, filename) {
    this.loaded.push({
      path: filepath,
      file: filename });

    _es.Robot.prototype.loadFile.call(this, filepath, filename);
  }

  /**
     * A wrapper around the EventEmitter API to make usage (log events for testing)
     * @param  {string} event The event name
     * @param  {array} args   Arguments emitted by the event
     */
  emit(event) {var _Robot$prototype$emit;for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
    this.eventLog.push([event, args]);
    (_Robot$prototype$emit = _es.Robot.prototype.emit).call.apply(_Robot$prototype$emit, [this, event].concat(args));
  }

  /**
     * Stop mockery replacements and do prototype shutdown
     */
  shutdown() {
    _mockery2.default.deregisterAll();
    _es.Robot.prototype.shutdown.call(this);
  }};module.exports = exports['default'];
//# sourceMappingURL=robot.js.map