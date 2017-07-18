_ = require 'lodash'
Hubot = require 'hubot-async'

###*
 * MockUser extends Hubot User with adapter method shortcuts, prefilling user
 * @param  {MockAdapter} @adapter The adapter to route methods to
 * @param  {Object} options={}    Key/valye user attributes
 * @return MockUser               A new test user
###
class MockUser extends Hubot.User
  constructor: (@adapter, options={}) ->
    id = _.uniqueId 'user_'
    super id, options
    @room ?= null

  ###*
   * Create a user clone with a designated room assigned
   * @param  {MockRoom} room Room to assign
   * @return MockUser        Clone of user
  ###
  in: (room) ->
    user = _.clone @
    user.room = if _.isString room then room else room.name
    return user

  ###*
   * Get this user's private messages (from hubot) from adapter
   * @return Array Private messages sent by hubot
  ###
  private: ->
    return @adapter.privateMessages[@name]

  ###
    Following methods proxy the adapter with this user in arguments, e.g.
    `this.send(message)` returns `adapter.send(this.room, this.name, message)`
    `.send` takes only a message, `.enter` and `.leave` take no arguments
    Each returns a promise.
  ###

  send: (message) ->
    return @adapter.receive @, message

  enter: ->
    return @adapter.enter @

  leave: ->
    return @adapter.leave @

module.exports = MockUser
