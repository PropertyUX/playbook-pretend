Fs      = require 'fs'
Path    = require 'path'
Promise = require 'bluebird'
Hubot   = require 'hubot'
_       = require 'lodash'

process.setMaxListeners 0

###*
 * Create Pretend instance for Hubot testing scripts
 * @param  {Array|String} scriptsPaths Path to script/s for loading into hubot
 * @return Pretend                      The Pretend instance
###
class Pretend
  constructor: (scriptsPaths) ->
    @scripts = []
    scriptsPaths = [scriptsPaths] if not _.isArray scriptsPaths
    for script in scriptsPaths
      script = Path.resolve Path.dirname(module.parent.filename), script
      if Fs.statSync(script).isDirectory()
        for file in Fs.readdirSync(script).sort()
          @scripts.push path: script, file: file
      else
        @scripts.push path: Path.dirname(script), file: Path.basename(script)

  ###*
   * initialise robot for tests
   * @param  {Object} options={} Key/value config attributes:
   *                             name {String} for the hubot
   *                             httpd {Boolean} start a server for requests
   *                             response {Response} replace new response super
   *                             rooms {Array} names of rooms to create
   *                             users {Array} names of users to create
   * @return MockAdapter         The robot's adapter instance
  ###
  startup: (options={}) ->
    @rooms = {}
    @users = {}
    @config = _.defaults options,
      name: 'hublet'
      httpd: false
      response: null
      rooms: null
      users: null
      log: true

    @robot = new MockRobot @config.httpd
    # @robot.logger.level = 'silent'
    # @readLog() if @config.log
    @robot.Response = @config.response if @config.response?
    @robot.loadFile script.path, script.file for script in @scripts
    @robot.brain.emit 'loaded'
    @adapter = @robot.adapter
    @adapter.name = @config.name
    @messages = @adapter.messages
    @room room for room in @config.rooms if @config.rooms?
    @user user for user in @config.users if @config.users?
    return @adapter

  ###*
   * Read the robot's log stream into an array for easy access by tests
   * @return Promise  Resolved when the robot is finished writing to log stream
   * NB - this isn't tested or called yet - work in progress
  ###
  readLog: ->
    @logs = []
    @robot.logger.stream.readable = true
    stream = @robot.logger.stream
    events =
      onData: (doc) =>
        @logs.push doc
      onEnd: (err) =>
        if err then reject err else resolve err
        events.cleanup()
      onClose: =>
        resolve @logs
        events.cleanup()
      cleanup: =>
        stream.removeListener 'data', events.onData
        stream.removeListener 'end', events.onEnd
        stream.removeListener 'error', events.onEnd
        stream.removeListener 'close', events.onClose

    return new Promise (resolve, reject) =>
      return resolve @logs unless stream.readable
      stream.on 'data', events.onData
      stream.on 'end', events.onEnd
      stream.on 'error', events.onEnd
      stream.on 'close', events.onClose

  ###*
   * Create or get existing room, for entering/leaving and receiving messages
   * @param  {String} name Name for the room
   * @return MockRoom      A new room
  ###
  room: (name) ->
    room = @rooms[name] = new MockRoom @adapter, name
    return room

  ###*
   * Create or get existing user, for entering/leaving and sending messages
   * @param  {[type]} @name=null [description]
   * @return [type]              [description]
  ###
  user: (name, options={}) ->
    return @users[name] if name in _.keys @users
    options.name = name
    newUser = @users[name] = new MockUser @adapter, options
    return newUser

  ###*
   * Run adapter shutdown, closes server if one was started.
   * @return null
  ###
  shutdown: ->
    @adapter.shutdown()
    return

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
  received: =>
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

###*
 * MockAdapter extends Hubot Adapter, routing messages to an internal array
 * @param  {Robot} @robot The hubot instance
 * @return MockAdapter    A new adapter
###
class MockAdapter extends Hubot.Adapter
  constructor: (@robot) ->
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
      @robot.receive new Hubot.TextMessage(user, message), resolve

  ###*
   * Process and record details of a reply from hubot - prepends '@user '
   * @param  {Object} envelope   Envelope from response object
   * @param  {Array} strings...  Array of message text strings
   * @return null
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
   * @return null
  ###
  send: (envelope, strings...) ->
    for str in strings
      @messages.push [envelope.room, 'hubot', str]
    return

  ###*
   * Record details of a private message from hubot
   * @param  {Object} envelope   Envelope from response object
   * @param  {Array} strings...  Array of message text strings
   * @return null
  ###
  sendPrivate: (envelope, strings...) ->
    if envelope.user.name not of @privateMessages
      @privateMessages[envelope.user.name] = []
    @privateMessages[envelope.user.name].push ['hubot', str] for str in strings
    return

  ###*
   * Record details of an event emitted by hubot
   * @return null
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
      @robot.receive new Hubot.EnterMessage(user), resolve

  ###*
   * Process and record details of a user leaving a room
   * @param  {MockUser} user    Sender's user object
   * @return Promise            Promise resolving when robot finished processing
  ###
  leave: (user) ->
    return new Promise (resolve) =>
      @robot.receive new Hubot.LeaveMessage(user), resolve

  ###*
   * Close hubot http server, if open
   * @return null
  ###
  shutdown: ->
    @robot.server.close() if @robot.server
    return

###*
 * MockResponse extends Response with .sendPrivate routed to adapter method
 * @param  {Array} strings...  Array of message text strings
 * @return MockResponse        New response instance
###
class MockResponse extends Hubot.Response
  sendPrivate: (strings...) ->
    return @robot.adapter.sendPrivate @envelope, strings...

Pretend.Response = MockResponse # Allow extending the default response in tests

###*
 * MockRobot extends Hubot with MockResponse and hardwired to use MockAdapter
 * @param  {Array} strings...  Array of message text strings
 * @return MockRobot           New robot instance
###
class MockRobot extends Hubot.Robot
  constructor: (httpd=true) ->
    super null, null, httpd, 'hubot'
    @Response = MockResponse

  loadAdapter: ->
    @adapter = new MockAdapter @
    return

module.exports = Pretend
