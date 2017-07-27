'use strict'

import sinon from 'sinon'
import { Response } from 'hubot-async/es2015'

/**
 * Add response method spies and .sendPrivate routed to adapter method
 * @param  {Array} strings...  Array of message text strings
 * @return MockResponse        New mock response instance
 */
export default class extends Response {
  constructor (robot, message, match) {
    super(robot, message, match)
    // spy on all instance methods
    Object.getOwnPropertyNames(Response.prototype).map(key => {
      let spy = sinon.spy(this, key)
      delete spy.stackTrace // remove verbose logging (see bug in robot.js)
    })
    robot.emit('response', this)
  }

  /**
   * Custom method for some platform adapters to process private messages
   * @param  {Array} strings...  Array of message text strings
   */
  sendPrivate (...strings) {
    return this.robot.adapter.sendPrivate(this.envelope, ...strings)
  }
}
