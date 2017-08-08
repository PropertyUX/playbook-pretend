'use strict'

import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import Robot from './robot'
import User from './user'
import Room from './room'

// prevent issues with default port in use
if (!(process.env.PORT || process.env.EXPRESS_PORT)) process.env.PORT = '3000'

// init vars
let robot, users, rooms, scripts

// option fallbacks
const defaults = {
  httpd: false,
  name: 'hubot',
  alias: false,
  rooms: null,
  users: null
}

/**
 * Read in scripts from path/s, will overwrite any previous reads
 * @param  {Array|String} scriptPaths Paths to read for loading into hubot
 * @return {Int}                      Number of scripts found
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

  return this // for chaining
}

/**
 * Start (or restart) collections and create pretend robot
 * @param  {Object} [options={}] Config object, optional attributes:
 *                               - httpd: enable server (default: false)
 *                               - name: robot name
 *                               - alias: robot alias
 *                               - rooms: array of room names to start with
 *                               - users: array of user names to start with
 * @return {[type]}              [description]
 */
function start (options = {}) {
  let config = Object.assign({}, defaults, options)

  // reset test user/room collections
  users = {}
  rooms = {}

  // force a log level if given in options
  if (options.logLevel) process.env.HUBOT_LOG_LEVEL = options.logLevel

  // create robot
  // TODO: update to options object when that happens in hubot core
  robot = new Robot(config.httpd, config.name, config.alias)

  // create users and rooms as per config options
  if (config.rooms != null) config.rooms.map(r => room(r))
  if (config.users != null) config.users.map(u => user(u))

  // tell robot to load and go
  robot.run() // run before load, so scripts can extend robot after pretend does
  load()

  return this // for chaining
}

/**
 * Shortcut to robot shutdown
 */
function shutdown () {
  if (robot) robot.shutdown()
  reset()
  return this // for chaining
}

/**
 * Reset (or init) robot and collection vars, for after tests clean up
 */
function reset () {
  robot = null
  users = {}
  rooms = {}
}
reset()

/**
 * Clear read-in scripts, to ensure nothing loaded on next `.start()`
 */
function clear () {
  scripts = []
  return this // for chaining
}

/**
 * Load any read-in scripts (if robot created and script not already read)
 */
function load () {
  if (robot === null) return
  let scriptsToLoad = _.differenceBy(scripts, robot.loaded, _.isEqual)
  scriptsToLoad.map(s => robot.loadFile(s.path, s.file))
  return this // for chaining
}

/**
 * Send message from a given user (through adapter)
 * @param  {User} user       The user
 * @param  {Message} message Hubot message object
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function userSend (user, message) {
  return robot.adapter.receive(user, message)
}

/**
 * Send an enter message from a given user
 * @param  {User} user The user (assumes with room already set)
 * @return {Promise}   Promise resolving when receive middleware complete
 */
function userEnter (user) {
  return robot.adapter.enter(user)
}

/**
 * Send a leave message to robot from user
 * @param  {User} user The user (assumes with room already set)
 * @return {Promise}   Promise resolving when receive middleware complete
 */
function userLeave (user) {
  return robot.adapter.leave(user)
}

/**
 * Get any private message entries in adapter assigned to username
 * @param  {User} user The user
 * @return {Array}     Private messages for user
 */
function userPrivates (user) {
  return robot.adapter.privateMessages[user.name]
}

/**
 * Get filtered array of given room's messages from adapter
 * @return {Array} Messages [user, message] sent to room
*/
function roomMessages (room) {
  let messages = _.filter(robot.adapter.messages, msg => msg[0] === room.name)
  return _.map(messages, _.drop) // truncates room column from messages
}

/**
 * Send message through adapter, coming from given room and user
 * @param  {Room} room       Source room
 * @param  {User} user       Source user
 * @param  {Message} message The message
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function roomReceive (room, user, message) {
  return robot.adapter.receive(user.in(room), message)
}

/**
 * Send enter message for given user in given room
 * @param  {Room} room       Source room
 * @param  {User} user       Source user
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function roomEnter (room, user) {
  return userEnter(user.in(room))
}

/**
 * Send leave message for given user in given room
 * @param  {Room} room       Source room
 * @param  {User} user       Source user
 * @return {Promise}         Promise resolving when receive middleware complete
 */
function roomLeave (room, user) {
  return userLeave(user.in(room))
}

/**
 * Create or get existing user, for entering/leaving and sending messages
 * Extend with methods routing to pretend helpers with this user provided
 * @param  {String} name         Name for the user
 * @param  {Object} [options={}] Optional attributes for user
 * @return {MockUser}            A new mock user
 */
function user (name, options = {}) {
  if (!_.keys(users).includes(name)) {
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
  }
  return users[name]
}

/**
 * Create or get existing room, for entering/leaving and receiving messages
 * Extend with methods routing to pretend helpers with this room provided
 * @param  {String} name Name for the room
 * @return {MockRoom}    A new room
 */
function room (name) {
  if (!_.keys(rooms).includes(name)) {
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
    rooms[name] = (room)
  }
  return rooms[name]
}

/**
 * Revealed API, uses getters to return current state of collections
 * @type {Object} Containing exposed methods and propterties
 */
export default {
  startup: start, // support pre-release method
  start: start,
  read: read,
  clear: clear,
  load: load,
  shutdown: shutdown,
  user: user,
  room: room,
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
