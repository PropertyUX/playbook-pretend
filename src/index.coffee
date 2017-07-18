Robot     = require './modules/MockRobot'
Adapter   = require './modules/MockAdapter'
Response  = require './modules/MockResponse'
User      = require './modules/MockUser'
Room      = require './modules/MockRoom'
Observer  = require './modules/Observer'

Fs        = require 'fs'
Path      = require 'path'
_         = require 'lodash'
Hubot     = require 'hubot-async'

process.setMaxListeners 0

###*
 * Hubot Pretend allows testing Hubot scripts / messaging with mock users/rooms
 * Exports properties for accessing mock prototypes, e.g. for constructor spies
###
class Pretend
  constructor: (scriptsPaths=null) ->
    @Hubot = Hubot
    @Robot = Robot
    @Adapter = Adapter
    @Response = Response
    @User = User
    @Room = Room
    @Observer = Observer

    @read scriptsPaths if scriptsPaths?

  ###*
   * Create or get existing user, for entering/leaving and sending messages
   * @param  {[type]} @name=null [description]
   * @return [type]              [description]
  ###
  user: (name, options={}) ->
    if name not in _.keys @users
      options.name = name
      @users[name] = new @User @adapter, options
    return @users[name]

  ###*
   * Create or get existing room, for entering/leaving and receiving messages
   * @param  {String} name Name for the room
   * @return MockRoom      A new room
  ###
  room: (name) ->
    if name not in _.keys @rooms
      @rooms[name] = new @Room @adapter, name
    return @rooms[name]

  ###*
   * Read the robot's log stream into an array for easy access by tests
   * @return Promise  Resolved when the robot is finished writing to log stream
   * NB - this isn't tested or called yet - work in progress
  ###
  log: =>
    debug: (message) => @logs.push ['debug', message]
    info: (message) => @logs.push ['info', message]
    warning: (message) => @logs.push ['warning', message]
    error: (message) => @logs.push ['error', message]

  ###*
   * Read in scripts from path, one or more, will overwrite any previous reads
   * @param  {Array|String} scriptsPaths Path to script/s for loading into hubot
   * @return {Int}                       Number of scripts read in
  ###
  read: (scriptsPaths) ->
    @scripts = []
    scriptsPaths = _.castArray scriptsPaths
    for script in scriptsPaths
      script = Path.resolve Path.dirname(module.parent.filename), script
      if Fs.statSync(script).isDirectory()
        for file in Fs.readdirSync(script).sort()
          @scripts.push path: script, file: file
      else
        @scripts.push path: Path.dirname(script), file: Path.basename(script)
    return @scripts.length

  ###*
   * Initialise robot for tests
   * Every inherited method of robot and adapter is spied on from here forward
   * @param  {Object} options={} Key/value config attributes:
   *                             name {String} for the hubot
   *                             httpd {Boolean} start a server for requests
   *                             response {Response} replace new response super
   *                             rooms {Array} names of rooms to create
   *                             @users {Array} names of @users to create
   *                             log {Boolean} re-route hubot's logs here
   *                             robot {Object} key/val atts to pass into robot
   * @return MockAdapter         The robot's adapter instance
  ###
  startup: (options={}) ->
    throw new Error "No scripts read yet" unless @scripts.length
    @logs = []
    @users = {}
    @rooms = {}
    @config = _.defaults options,
      httpd: false
      alias: false
      rooms: null
      users: null
      log: true
    @robot = new @Robot @config.httpd
    @robot.alias = @config.alias
    @robot.logger = @log() if @config.log
    @robot.Response = @Response
    @robot.loadFile script.path, script.file for script in @scripts
    @robot.brain.emit 'loaded'
    @adapter = @robot.adapter
    @messages = @adapter.messages
    @observer = new @Observer @messages
    @responses =
      incoming: []
      outgoing: []
    @robot.on 'receive', (context) =>
      unless context.response.message instanceof Hubot.CatchAllMessage
        @responses.incoming.push context.response
    @robot.on 'respond', (context) =>
      @responses.outgoing.push context.response
    @room r for r in @config.rooms if @config.rooms?
    @user u for u in @config.users if @config.users?
    return @adapter

  ###*
   * Run adapter shutdown, closes server if one was started
  ###
  shutdown: ->
    @observer.stop()
    @adapter.shutdown()
    return

module.exports = Pretend
