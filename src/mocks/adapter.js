'use strict'

import Promise from 'bluebird'
import { Adapter, TextMessage } from 'hubot-async/es2015'
import MockResponse from './response'

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
    this.name = 'pretend'
    this.messages = []
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
   * NB: send is applied with this bound to robot
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {Array} strings...  One or more Strings for each message to send
  */
  send (envelope, ...strings) {
    for (let str of strings) {
      let record = ['hubot', str]
      if (envelope.room != null) {
        record.unshift(envelope.room)
      }
      this.adapter.messages.push(record)
    }
  }

  /**
   * Process and record details of a reply from hubot - prepends '@user '
   * NB: reply is applied with this bound to robot
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {Array} strings...  One or more Strings for each message to send
  */
  reply (envelope, ...strings) {
    for (let str of strings) {
      let record = ['hubot', `@${envelope.user.name} ${str}`]
      if (envelope.room != null) {
        record.unshift(envelope.room)
      }
      this.adapter.messages.push(record)
    }
  }

  /**
   * TODO: this is pretend.receive, not adapter.receive
   * Process and record details of received message
   * @param  {MockUser} user    Sender's user object
   * @param  {String}   message Message text
   * @return Promise            Promise resolving when robot finished processing
  */
  receive (user, message) {
    return new Promise(resolve => {
      let record = [user.name, message]
      if (user.room != null) {
        record.unshift(user.room)
      }
      this.messages.push(record)
      return this.robot.receive(new TextMessage(user, message), resolve)
    })
  }

  /**
   * Custom method used by some platform adapters to process private messages
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {Array} strings...  One or more Strings for each message to send
   */
  sendPrivate (envelope, ...strings) {
    let username = envelope.user.name
    if (!(username in this.privateMessages)) this.privateMessages[username] = []
    for (let str of strings) this.privateMessages.username.push(['hubot', str])
  }
}

export default {
  use: function (robot) {
    return new MockAdapter(robot)
  }
}
