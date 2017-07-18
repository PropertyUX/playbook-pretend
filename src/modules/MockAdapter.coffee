_ = require 'lodash'
sinon = require 'sinon'
Promise = require 'bluebird'

{Adapter,TextMessage,EnterMessage,LeaveMessage} = require 'hubot-async'

###*
 * MockAdapter extends Hubot Adapter, routing messages to an internal array
 * @param  {Robot} @robot The hubot instance
 * @return MockAdapter    A new adapter
###
class MockAdapter extends Adapter
  constructor: (@robot) ->
    @name = 'pretend'
    @messages = []
    @privateMessages = {}
    @events = []

  ###*
   * Process and record details of received message
   * @param  {MockUser} user    Sender's user object
   * @param  {String}   message Message text
   * @return Promise            Promise resolving when robot finished processing
  ###
  receive: (user, message) ->
    return new Promise (resolve) =>
      record = [user.name, message]
      record.unshift user.room if user.room?
      @messages.push record
      @robot.receive new TextMessage(user, message), resolve

  ###*
   * Process and record details of a reply from hubot - prepends '@user '
   * @param  {Object} envelope   Envelope from response object
   * @param  {Array} strings...  Array of message text strings
  ###
  reply: (envelope, strings...) ->
    for str in strings
      record = ['hubot', "@#{envelope.user.name} #{str}"]
      record.unshift envelope.room if envelope.room?
      @messages.push record
    return

  ###*
   * Record details of a send from hubot
   * @param  {Object} envelope   Envelope from response object
   * @param  {Array} strings...  Array of message text strings
  ###
  send: (envelope, strings...) ->
    for str in strings
      record = ['hubot', str]
      record.unshift envelope.room if envelope.room?
      @messages.push record
    return

  ###*
   * Record details of a private message from hubot
   * @param  {Object} envelope   Envelope from response object
   * @param  {Array} strings...  Array of message text strings
  ###
  sendPrivate: (envelope, strings...) ->
    if envelope.user.name not of @privateMessages
      @privateMessages[envelope.user.name] = []
    @privateMessages[envelope.user.name].push ['hubot', str] for str in strings
    return

  ###*
   * Record details of an event emitted by hubot
  ###
  robotEvent: () ->
    @events.push arguments...
    @robot.emit.apply @robot, arguments
    return

  ###*
   * Process and record details of a user entering a room
   * @param  {MockUser} user    Sender's user object
   * @return Promise            Promise resolving when robot finished processing
  ###
  enter: (user) ->
    return new Promise (resolve) =>
      @robot.receive new EnterMessage(user), resolve

  ###*
   * Process and record details of a user leaving a room
   * @param  {MockUser} user    Sender's user object
   * @return Promise            Promise resolving when robot finished processing
  ###
  leave: (user) ->
    return new Promise (resolve) =>
      @robot.receive new LeaveMessage(user), resolve

  ###*
   * Close hubot http server, if open
  ###
  shutdown: ->
    @robot.server.close() if @robot.server
    return

module.exports = MockAdapter
