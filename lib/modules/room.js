'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                              * Provides room attributes for envolope and adapter method shortcuts
                                                                                                                                                                              * @param  {String} @name=null Name for the room
                                                                                                                                                                              * @return Room                A new test room
                                                                                                                                                                             */exports.default =
class {
  constructor(name = null) {
    this.name = name;
    if (this.name == null) {
      this.name = _lodash2.default.uniqueId('room_');
    }
  }};module.exports = exports['default'];
//# sourceMappingURL=room.js.map