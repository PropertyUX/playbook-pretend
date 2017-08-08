'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _npmlog = require('npmlog');var _npmlog2 = _interopRequireDefault(_npmlog);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                              * Mock log, keeps log messages in array
                                                                                                                                                                              */exports.default =
class {
  /**
        * Create a new log
        * @return {Object} Mock log methods (debug, info, warning, error)
        */
  constructor(level = 'error') {
    this.logs = [];
    _npmlog2.default.level = level;
    _npmlog2.default.heading = '[hubot]';
    _npmlog2.default.headingStyle = { fg: 'magenta' };
    _npmlog2.default.addLevel('debug', 1000, { fg: 'yellow' }, 'dbug');
    _npmlog2.default.addLevel('error', 5000, { fg: 'white', bg: 'red' }, 'ERR!');
  }

  prefix() {
    // return new Date().toLocaleString()
    return new Date().toLocaleTimeString();
  }

  debug(message) {
    this.logs.push(['debug', message]);
    _npmlog2.default.debug(this.prefix(), message);
  }

  info(message) {
    this.logs.push(['info', message]);
    _npmlog2.default.info(this.prefix(), message);
  }

  warning(message) {
    this.logs.push(['warning', message]);
    _npmlog2.default.warn(this.prefix(), message);
  }

  error(message) {
    this.logs.push(['error', message]);
    _npmlog2.default.error(this.prefix(), message);
  }

  set level(lvl) {
    _npmlog2.default.level = lvl;
  }};module.exports = exports['default'];
//# sourceMappingURL=log.js.map