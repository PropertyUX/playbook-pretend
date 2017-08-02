'use strict'

import { Adapter, TextMessage, EnterMessage, LeaveMessage } from 'hubot-async/es2015'
import Observer from '../modules/observer'
import MockResponse from './response'

let _this // to be adapter's `this`, for when method's `this` is bound to robot

/**
 * Extends Hubot Adapter, routing messages to internal collections
 */
class MockAdapter extends Adapter {
  /**
   * Create mock adapter instance
  * @param  {Robot} @robot The robot instance
  * @return MockAdapter    A new mock adapter
  */
  constructor (robot) {
    super(robot)
    _this = this
    this.name = 'pretend'
    this.observer = new Observer([])
    this.messages = this.observer.get()
    this.privateMessages = []
  }

  /**
   * Invoked by robot when running, for adapter to extend bot
   */
  run () {
    this.robot.Response = MockResponse
  }

  /**
   * Record details of a send from hubot
   * NB: robot.send calls adapter.send with this bound to robot
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {Array} strings...  One or more Strings for each message to send
  */
  send (envelope, ...strings) {
    for (let str of strings) {
      let record = ['hubot', str]
      if (envelope.room != null) record.unshift(envelope.room)
      _this.messages.push(record)
    }
  }

  /**
   * Process and record details of a reply from hubot - prepends '@user '
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {Array} strings...  One or more Strings for each message to send
  */
  reply (envelope, ...strings) {
    for (let str of strings) {
      let record = ['hubot', `@${envelope.user.name} ${str}`]
      if (envelope.room != null) record.unshift(envelope.room)
      _this.messages.push(record)
    }
  }

  /**
   * Process and record details of received message
   * @param  {MockUser} user    Sender's user object
   * @param  {String}   message Message text
   * @return Promise            Promise resolving when robot finished processing
  */
  receive (user, message) {
    return new Promise(resolve => {
      let record = [user.name, message]
      if (user.room != null) record.unshift(user.room)
      this.messages.push(record)
      return this.robot.receive(new TextMessage(user, message), resolve)
    })
  }

  /**
   * Process an enter message from user (not stored in messages)
   * @param  {User} user The entering user (assumes with room set)
   * @return {Promise}   Promise resolving when receive middleware complete
   */
  enter (user) {
    return new Promise(resolve => {
      return this.robot.receive(new EnterMessage(user), resolve)
    })
  }

  /**
   * Process a leave message from user (not stored in messages)
   * @param  {User} user The leaving user (assumes with room set)
   * @return {Promise}   Promise resolving when receive middleware complete
   */
  leave (user) {
    return new Promise(resolve => {
      return this.robot.receive(new LeaveMessage(user), resolve)
    })
  }

  /**
   * Custom method used by some platform adapters to process private messages
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {Array} strings...  One or more Strings for each message to send
   */
  sendPrivate (envelope, ...strings) {
    let username = envelope.user.name
    if (!this.privateMessages[username]) this.privateMessages[username] = []
    for (let str of strings) this.privateMessages[username].push(str)
  }
}

export default {
  use: function (robot) {
    return new MockAdapter(robot)
  }
}
