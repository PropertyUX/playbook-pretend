'use strict'

import sinon from 'sinon'
import mockery from 'mockery'
import { Robot as HubotRobot, CatchAllMessage } from 'hubot-async/es2015'
import MockLog from '../mocks/log'
import MockAdapter from '../mocks/adapter'

require('coffee-script/register') // register extension for legacy coffee script

/**
 * Extends Hubot with mocked response, events, logs and adapter loading.
 *
 * @param  {Boolean} httpd      Whether to enable the HTTP daemon.
 * @param  {string} name        Robot name, defaults to Hubot.
 * @param  {string} alias       Robot alias, defaults to null
 * @return {Robot}              The pretend robot
 */
class Robot extends HubotRobot {
  constructor (httpd, name = 'hubot', alias = 'pretend') {
    // replace robot required packages with mocks (adapter also replaces Response)
    mockery.enable({ warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true })
    mockery.registerMock('hubot-pretend-adapter', MockAdapter)
    mockery.registerMock('log', MockLog) // BUG: mockery can't replace log used in Robot require, as its private

    super(null, 'pretend-adapter', httpd, name, alias)
    this.logger = new MockLog(process.env.HUBOT_LOG_LEVEL) // TODO: remove this when log mockery issue resovled (should capture load logs)
    this.loaded = []
    this.eventLog = []
    this.responses = {
      receive: [],
      listen: [],
      respond: []
    }

    // allow tests to listen in on middleware stacks and record context response
    // BUG: because it prepends a middleware piece, it could throw off some tests expecting a given number in the stack
    // TODO: extend Middleware to listen on each piece's context, without adding a middleware
    this.middleware.receive.register((context, next, done) => {
      if (!(context.response.message instanceof CatchAllMessage)) {
        this.responses.receive.push(context.response)
      }
      this.emit('receive', context)
      return next()
    })
    this.middleware.listener.register((context, next, done) => {
      if (!(context.response.message instanceof CatchAllMessage)) {
        this.responses.listen.push(context.response)
      }
      this.emit('listen', context)
      return next()
    })
    this.middleware.response.register((context, next, done) => {
      this.responses.respond.push(context.response)
      this.emit('respond', context)
      return next()
    })

    // spy on all instance methods
    Object.getOwnPropertyNames(HubotRobot.prototype).map(key => {
      let spy = sinon.spy(this, key)
      delete spy.stackTrace
      /**
       * BUG getting reems of unknown errors `at wrapMethod` from sinon.spy
       * wasn't actually breaking anything so the temp fix is just to delete
       * the stackTrace property for readability when logging spied objects
       */
    })
  }

  /**
   * Loads a file in path (storing each for tests to compare).
   *
   * @param  {string} filepath Path on the filesystem
   * @param  {string} filename Name of file at filepath
   */
  loadFile (filepath, filename) {
    this.loaded.push({
      path: filepath,
      file: filename
    })
    HubotRobot.prototype.loadFile.call(this, filepath, filename)
  }

  /**
   * A wrapper around the EventEmitter API to make usage (log events for testing).
   *
   * @param  {string} event The event name
   * @param  {array} args   Arguments emitted by the event
   */
  emit (event, ...args) {
    this.eventLog.push([event, args])
    HubotRobot.prototype.emit.call(this, event, ...args)
  }

  /**
   * Stop mockery replacements and do prototype shutdown.
   */
  shutdown () {
    mockery.deregisterAll()
    HubotRobot.prototype.shutdown.call(this)
  }
}

export default Robot
