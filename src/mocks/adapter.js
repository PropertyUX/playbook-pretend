'use strict'

import { Adapter, TextMessage, EnterMessage, LeaveMessage } from 'hubot-async/es2015'
import Observer from '../modules/observer'
import MockResponse from './response'

let _this // to be adapter's `this`, for when method's `this` is bound to robot

/**
 * Extends Hubot Adapter, routing messages to internal collections.
 *
 * @param  {Robot} @robot The robot instance
 * @return MockAdapter    A new mock adapter
 */
class MockAdapter extends Adapter {
  constructor (robot) {
    super(robot)
    _this = this
    this.name = 'pretend'
    this.observer = new Observer([])
    this.messages = this.observer.get()
    this.privateMessages = []
  }

  /**
   * Invoked by robot when running, for adapter to extend bot.
   */
  run () {
    this.robot.Response = MockResponse
  }

  /**
   * Record details of a send from hubot.
   *
   * NB: robot.send calls adapter.send with this bound to robot.
   *
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {array} strings...  One or more Strings for each message to send
  */
  send (envelope, ...strings) {
    for (let str of strings) {
      let record = ['hubot', str]
      if (envelope.room != null) record.unshift(envelope.room)
      _this.messages.push(record)
    }
  }

  /**
   * Process and record details of a reply from hubot - prepends '@user '.
   *
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {array} strings...  One or more Strings for each message to send
  */
  reply (envelope, ...strings) {
    for (let str of strings) {
      let record = ['hubot', `@${envelope.user.name} ${str}`]
      if (envelope.room != null) record.unshift(envelope.room)
      _this.messages.push(record)
    }
  }

  /**
   * Process and record details of received message.
   *
   * @param  {MockUser} user    Sender's user object
   * @param  {string}   text    Message text
   * @return Promise            Promise resolving when robot finished processing
  */
  receive (user, text) {
    return new Promise(resolve => {
      let record = [user.name, text]
      if (user.room != null) record.unshift(user.room)
      this.messages.push(record)
      return this.robot.receive(new TextMessage(user, text), resolve)
    })
  }

  /**
   * Process an enter message from user (not stored in messages).
   *
   * @param  {User} user The entering user (assumes with room set)
   * @return {Promise}   Promise resolving when receive middleware complete
   */
  enter (user) {
    return new Promise(resolve => {
      return this.robot.receive(new EnterMessage(user), resolve)
    })
  }

  /**
   * Process a leave message from user (not stored in messages).
   *
   * @param  {User} user The leaving user (assumes with room set)
   * @return {Promise}   Promise resolving when receive middleware complete
   */
  leave (user) {
    return new Promise(resolve => {
      return this.robot.receive(new LeaveMessage(user), resolve)
    })
  }

  /**
   * Create a mock response, without processing it as received.
   *
   * @param  {User} user    The user for response to originate from
   * @param  {string} text  Text for creating a message from user
   * @return {MockResponse} The response object
   */
  response (user, text) {
    let message = new TextMessage(user, text)
    let match = text.match(/.*/)
    return new MockResponse(this.robot, message, match)
  }

  /**
   * Custom method used by some platform adapters to process private messages.
   *
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {array} strings...  One or more Strings for each message to send
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
