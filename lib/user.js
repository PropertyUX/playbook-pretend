'use strict'

const _ = require('lodash')
const { User } = require('nubot')

/**
 * Represents a participating user in the chat.
 *
 * NB: not used as mock because it changes constructor to remove id argument.
 *
 * @param  {string} [name]    Name for the user (alternative to giving as attribute in options)
 * @param  {Object} [options] Key/valye user attributes
 * @return PretendUser                A new test user
*/
class PretendUser extends User {
  constructor (...args) {
    let id, options, name
    if (_.isString(args[0])) name = args.shift()
    if (_.isObject(args[0])) options = args.shift()
    if (options == null) options = {}
    if (name != null) options.name = name
    if (options.id) id = options.id
    else id = _.uniqueId('user_')
    super(id, options)
  }

  /**
   * Create a user clone with a designated room assigned.
   *
   * @param  {Room|String} room Room object or name of room to assign
   * @return PretendUser        Clone of user in different room
  */
  in (room) {
    let clone = _.clone(this)
    clone.room = _.isString(room) ? room : room.name
    return clone
  }
}

module.exports = PretendUser
