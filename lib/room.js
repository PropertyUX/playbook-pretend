'use strict'

const _ = ('lodash')

/**
 * Provides room attributes for envolope and adapter method shortcuts.
 *
 * @param  {string} name=null Name for the room
 * @return Room               A new test room
*/
class Room {
  constructor (name = null) {
    this.name = name
    if (this.name == null) {
      this.name = _.uniqueId('room_')
    }
  }
}

module.exports = Room
