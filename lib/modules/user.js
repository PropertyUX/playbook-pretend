'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _es = require('hubot-async/es2015');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                       * Represents a participating user in the chat
                                                                                                                                       * NB: not used as mock because it changes constructor to remove id argument
                                                                                                                                       * @param  {String} [name]    Name for the user (alternative to giving as attribute in options)
                                                                                                                                       * @param  {Object} [options] Key/valye user attributes
                                                                                                                                       * @return User                A new test user
                                                                                                                                      */exports.default =
class extends _es.User {
  constructor(...args) {
    let id, options, name;
    if (_lodash2.default.isString(args[0])) name = args.shift();
    if (_lodash2.default.isObject(args[0])) options = args.shift();
    if (options == null) options = {};
    if (name != null) options.name = name;
    if (options.id) id = options.id;else
    id = _lodash2.default.uniqueId('user_');
    super(id, options);
  }

  /**
     * Create a user clone with a designated room assigned
     * @param  {Room|String} room Room object or name of room to assign
     * @return User               Clone of user
    */
  in(room) {
    let clone = _lodash2.default.clone(this);
    clone.room = _lodash2.default.isString(room) ? room : room.name;
    return clone;
  }};module.exports = exports['default'];
//# sourceMappingURL=user.js.map