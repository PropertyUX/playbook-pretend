'use strict'

import fs from 'fs'
import path from 'path'
import _ from 'lodash'

import { CatchAllMessage } from 'hubot-async/src/message'

import User from './modules/MockUser'

process.setMaxListeners(0)

/**
 * Pretend mocks a Hubot robot, routing messaging to mock users/rooms
 */
export default class {
  /**
   * Create new Pretend instance
   * @param  {String} [scriptPaths=null] Read scripts in path if given
   */
  constructor (scriptPaths = null) {
    if (scriptPaths != null) {
      this.read(scriptPaths)
    }
  }

  /**
   * Create or get existing user, for entering/leaving and sending messages
   * @param  {String} name         Name for the user
   * @param  {Object} [options={}] Optional attributes for user
   * @return {MockUser}            A new mock user
   */
  user (name, options = {}) {
    if (!_.keys(this.users).includes(name)) {
      options.name = name
      this.users[name] = new User(this.adapter, options)
    }
    return this.users[name]
  }

  /**
   * Create or get existing room, for entering/leaving and receiving messages
   * @param  {String} name Name for the room
   * @return {MockRoom}    A new room
   */
  room (name) {
    if (!_.keys(this.rooms).includes(name)) {
      this.rooms[name] = new this.Room(this.adapter, name)
    }
    return this.rooms[name]
  }

  /**
   * Route robot log stream into an array for easy access by tests
   * @return {Object} Mock log functions
   */
  log () {
    return {
      debug: message => this.logs.push(['debug', message]),
      info: message => this.logs.push(['info', message]),
      warning: message => this.logs.push(['warning', message]),
      error: message => this.logs.push(['error', message])
    }
  }

  /**
   * Read in scripts from path/s, will overwrite any previous reads
   * @param  {Array|String} scriptPaths Paths to read for loading into hubot
   * @return {Int}                      Number of scripts found
   */
  read (scriptPaths) {
    this.scripts = []
    scriptPaths = _.castArray(scriptPaths)
    for (let scriptPath of scriptPaths) {
      scriptPath = path.resolve(path.dirname(module.parent.filename), scriptPath)
      if (fs.statSync(scriptPath).isDirectory()) {
        for (let file of fs.readdirSync(scriptPath).sort()) {
          this.scripts.push({
            path: scriptPath,
            file: file
          })
        }
      } else {
        this.scripts.push({
          path: path.dirname(scriptPath),
          file: path.basename(scriptPath)
        })
      }
    }
    return this.scripts.length
  }

  startup (options = {}) {
    if (!this.scripts.length) {
      throw new Error('No scripts read yet')
    }
    this.users = {}
    this.rooms = {}
    this.config = _.defaults(options, {
      httpd: false,
      alias: false,
      rooms: null,
      users: null,
      log: true
    })
    this.robot = new this.Robot(this.config.httpd)
    this.robot.alias = this.config.alias
    if (this.config.log) {
      this.robot.logger = this.log()
    }
    this.robot.Response = this.Response

    for (let script of this.scripts) {
      this.robot.loadFile(script.path, script.file)
    }

    this.robot.brain.emit('loaded')
    this.adapter = this.robot.adapter
    this.messages = this.adapter.messages
    this.observer = new this.Observer(this.messages)
    this.responses = {
      incoming: [],
      outgoing: []
    }

    this.robot.on('receive', ({ response }) => {
      if (!(response.message instanceof CatchAllMessage)) {
        return this.responses.incoming.push(response)
      }
    })

    this.robot.on('respond', ({ response }) => {
      return this.responses.outgoing.push(response)
    })

    if (this.config.rooms != null) {
      for (let r of this.config.rooms) {
        this.room(r)
      }
    }

    if (this.config.users != null) {
      for (let u of this.config.users) {
        this.user(u)
      }
    }

    return this.adapter
  }

  /**
   * Run adapter shutdown, closes server if one was started
  */
  shutdown () {
    this.observer.stop()
    this.adapter.shutdown()
  }
}
