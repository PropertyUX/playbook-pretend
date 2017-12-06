'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const Robot = require('./robot')
const User = require('./user')
const Room = require('./modules')

// prevent issues with default port in use
if (!(process.env.PORT || process.env.EXPRESS_PORT)) process.env.PORT = '3000'

// init vars
let robot, users, rooms, scripts

// option fallbacks
const defaults = {
  name: 'bot',
  httpd: false,
  alias: false,
  rooms: null,
  users: null
}

/**
 * Read in scripts from path/s, will overwrite any previous reads.
 *
 * @param  {array|string} scriptPaths Paths to read for loading into hubot
 * @return {pretend}                  Self for chaining
 */
function read (scriptPaths) {
  scripts = []
  if (!Array.isArray(scriptPaths)) scriptPaths = [scriptPaths]
  for (let scriptPath of scriptPaths) {
    // get scripts if file path given, or all from directory
    scriptPath = path.resolve(scriptPath)
    if (fs.statSync(scriptPath).isDirectory()) {
      for (let file of fs.readdirSync(scriptPath).sort()) {
        scripts.push({
          path: scriptPath,
          file: file
        })
      }
    } else {
      scripts.push({
        path: path.dirname(scriptPath),
        file: path.basename(scriptPath)
      })
    }
  }

  // robot, load scripts
  load()

  return this
}

/**
 * Start (or restart) collections and create pretend robot.
 *
 * @param  {Object} [options={}]     Config object, optional attributes:
 * @param  {boolean} [options.httpd] Enable server (default: false)
 * @param  {string} [options.name]   Robot name
 * @param  {string} [options.alias]  Robot alias
 * @param  {array} [options.rooms]   Room names to start with
 * @param  {array} [options.rooms]   User names to start with
 * @return {pretend}                 Self for chaining
 */
function start (options = {}) {
  let config = Object.assign({}, defaults, options)

  // reset test user/room collections
  users = {}
  rooms = {}

  // create robot
  // TODO: Update nubot to not force hubot prefix
  robot = new Robot('pretend', null, config.httpd, config.name, config.alias)

  // create users and rooms as per config options
  if (config.rooms != null) config.rooms.map(r => room(r))
  if (config.users != null) config.users.map(u => user(u))

  // tell robot to load and go
  robot.run() // run before load, so scripts can extend robot after pretend does
  load()

  return this
}

/**
 * Shortcut to robot shutdown
 * @return {pretend}             Self for chaining
 */
function shutdown () {
  if (robot) robot.shutdown()
  reset()
  return this
}

/**
 * Reset (or init) robot and collection vars, for after tests clean up.
 */
function reset () {
  robot = null
  users = {}
  rooms = {}
}
reset()

/**
 * Clear read-in scripts, to ensure nothing loaded on next `.start()`.
 *
 * @return {pretend}             Self for chaining
 */
function clear () {
  scripts = []
  return this
}

/**
 * Load any read-in scripts (if robot created and script not already read).
 *
 * @return {pretend}             Self for chaining
 */
function load () {
  if (robot === null) return
  let scriptsToLoad = _.differenceBy(scripts, robot.loaded, _.isEqual)
  scriptsToLoad.map(s => robot.loadFile(s.path, s.file))
  return this
}

/**
 * Send message from a given user (through adapter).
 *
 * @param  {User} user       The user
 * @param  {Message} message Hubot message object
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function userSend (user, message) {
  return robot.adapter.receive(user, message)
}

/**
 * Send an enter message from a given user.
 *
 * @param  {User} user The user (assumes with room already set)
 * @return {Promise}   Promise resolving when receive middleware complete
 */
function userEnter (user) {
  return robot.adapter.enter(user)
}

/**
 * Send a leave message to robot from user.
 *
 * @param  {User} user The user (assumes with room already set)
 * @return {Promise}   Promise resolving when receive middleware complete
 */
function userLeave (user) {
  return robot.adapter.leave(user)
}

/**
 * Get any private message entries in adapter assigned to username.
 *
 * @param  {User} user The user
 * @return {array}     Private messages for user
 */
function userPrivates (user) {
  return robot.adapter.privateMessages[user.name]
}

/**
 * Get filtered array of given room's messages from adapter.
 *
 * @return {array} Messages [user, message] sent to room
*/
function roomMessages (room) {
  let messages = robot.adapter.messages.filter(msg => msg[0] === room.name)
  return messages.map(msg => msg.slice(1)) // truncates room column from messages
}

/**
 * Send message through adapter, coming from given room and user.
 *
 * @param  {Room} room       Source room
 * @param  {User} user       Source user
 * @param  {Message} message The message
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function roomReceive (room, user, message) {
  return robot.adapter.receive(user.in(room), message)
}

/**
 * Send enter message for given user in given room.
 *
 * @param  {Room} room       Source room
 * @param  {User} user       Source user
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function roomEnter (room, user) {
  return userEnter(user.in(room))
}

/**
 * Send leave message for given user in given room.
 *
 * @param  {Room} room       Source room
 * @param  {User} user       Source user
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function roomLeave (room, user) {
  return userLeave(user.in(room))
}

/**
 * Create or get existing user, for entering/leaving and sending messages.
 *
 * Extend with methods routing to pretend helpers with this user provided.
 *
 * @param  {string} name         Name for the user
 * @param  {Object} [options={}] Optional attributes for user
 * @return {User}                A new user instance with adapter helpers
 */
function user (name, options = {}) {
  if (_(users).keys().includes(name)) return users[name]
  options.name = name
  let user = new User(options)
  user.send = function (message) {
    return userSend(this, message)
  }
  user.enter = function () {
    return userEnter(this)
  }
  user.leave = function () {
    return userLeave(this)
  }
  user.privates = function () {
    return userPrivates(this)
  }
  users[name] = user
  return user
}

/**
 * Create or get existing room, for entering/leaving and receiving messages.
 *
 * Extend with methods routing to pretend helpers with this room provided.
 *
 * @param  {string} name Name for the room
 * @return {Room}        A new room instance with adapter helpers
 */
function room (name) {
  if (
    !_(rooms)
      .keys()
      .includes(name)
  ) {
    let room = new Room(name)
    room.messages = function () {
      return roomMessages(this)
    }
    room.receive = function (user, message) {
      return roomReceive(this, user, message)
    }
    room.enter = function (user) {
      return roomEnter(room, user)
    }
    room.leave = function (user) {
      return roomLeave(this, user)
    }
    rooms[name] = room
  }
  return rooms[name]
}

/**
 * Shortcut for sending/receiving just to get the latest response object,
 * which also may require async, instead just make one as required for tests.
 *
 * This response will not be in `pretend.responses` and message will not appear
 * in `pretend.messages`.
 *
 * @param  {string} username Name for user to get/create as response origin
 * @param  {string} text     Text for creating message instance
 * @param  {string} [room]   Room name (optional) to add to user object
 * @return {MockResponse}    A mock response instance
 */
function response (username, text, room = undefined) {
  return robot.adapter.response(user(username, {room: room}), text)
}

/**
 * Helper, retrieves the latest res before listens matched or not.
 *
 * @return {MockResponse} A mock response instance
 */
function lastReceive () {
  return robot.responses.receive.slice(-1).pop()
}

/**
 * Helper, retrieves the latest res from user matching a listener.
 *
 * @return {MockResponse} A mock response instance
 */
function lastListen () {
  return robot.responses.listen.slice(-1).pop()
}

/**
 * Helper, retrieves the latest res from a hubot sent response.
 *
 * @return {MockResponse} A mock response instance
 */
function lastRespond () {
  return robot.responses.respond.slice(-1).pop()
}

// Revealed API, uses getters to return current state of collections.
module.exports = {
  start,
  read,
  clear,
  load,
  shutdown,
  reset,
  user,
  room,
  response,
  lastReceive,
  lastListen,
  lastRespond,
  get users () { return users },
  get rooms () { return rooms },
  get scripts () { return scripts },
  get robot () { return robot },
  get http () { return robot.http },
  get adapter () { return robot.adapter },
  get messages () { return robot.adapter.messages },
  get observer () { return robot.adapter.observer },
  get responses () { return robot.responses },
  get events () { return robot.eventLog },
  get log () { return robot.logger },
  get logs () { return robot.logger.logs }
}
