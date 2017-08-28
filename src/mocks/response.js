'use strict'

import sinon from 'sinon'
import { Response } from 'hubot-async/es2015'

/**
 * Add response method spies and .sendPrivate routed to adapter method.
 *
 * @param  {Robot}       robot   A Robot instance
 * @param  {TextMessage} message A Message instance (can also be catch-all)
 * @param  {array}       match   A Match object from the successful Regex match
 * @return MockResponse        New mock response instance
 */
class MockResponse extends Response {
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
   * @param  {array} strings...  Array of message text strings
   */
  sendPrivate (...strings) {
    return this.robot.adapter.sendPrivate(this.envelope, ...strings)
  }
}

export default MockResponse
