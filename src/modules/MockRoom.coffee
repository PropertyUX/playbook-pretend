_ = require 'lodash'
Hubot = require 'hubot'

###*
 * MockRoom provides adapter method shortcuts, prefilling room name
 * @param  {MockAdapter} @adapter The adapter to route methods to
 * @param  {String} @name=null    Name for the room
 * @return MockRoom               A new test room
###
class MockRoom
  constructor: (@adapter, @name=null) ->
    @name ?= _.uniqueId 'room_'

  ###*
   * Get filtered array of this room's messages from adapter
   * @return Array Messages ([user, message]) sent to room
  ###
  getMessages: =>
    roomMessages = _.filter @adapter.messages, (msg) => msg[0] is @name
    return _.map roomMessages, _.drop

  ###
    Following methods proxy the adapter with a user in this room in arguments,
    e.g.  `this.receive(user, message)` puts user in this room, before returning
          `adapter.receive(user, message)`
          `.enter` and `.leave` perform the same, but take no arguments
    Each returns a promise.
  ###

  receive: (user, message) ->
    return @adapter.receive user.in(@), message

  enter: (user) ->
    return @adapter.enter user.in @

  leave: (user) ->
    return @adapter.leave user.in @

module.exports = MockRoom
