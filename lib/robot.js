'use strict'

const sinon = require('sinon')
const mockery = require('mockery')
const nubot = require('nubot')
console.log(Object.keys(nubot.Robot))
const Robot = nubot.Robot
const CatchAllMessage = nubot.CatchAllMessage

const Adapter = require('./adapter')

require('coffee-script/register') // register extension for legacy coffee script

/**
 * Extends robot with mocked response, events, logs and adapter loading.
 *
 * @param  {Boolean} httpd      Whether to enable the HTTP daemon.
 * @param  {string} name        Bot name, defaults to nubot.
 * @param  {string} alias       Bot alias, defaults to null
 * @return {PretendRobot}              The pretend robot
 */
class PretendRobot extends Robot {
  constructor (httpd) {
    // replace robot required packages with mocks (adapter also replaces Response)
    mockery.enable({ warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true })
    mockery.registerMock('hubot-pretend', Adapter)

    super('pretend', httpd)
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

    console.log(Object.keys(this))

    // spy on all instance methods
    Object.keys(this).map(key => {
      if (typeof this[key] !== 'function') return
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
    Robot.prototype.loadFile.call(this, filepath, filename)
    this.loaded.push({
      path: filepath,
      file: filename
    })
  }

  /**
   * A wrapper around the EventEmitter API to make usage (log events for testing).
   *
   * @param  {string} event The event name
   * @param  {array} args   Arguments emitted by the event
   */
  emit (event, ...args) {
    this.eventLog.push([event, args])
    Robot.prototype.emit.call(this, event, ...args)
  }

  /**
   * Stop mockery replacements and do prototype shutdown.
   */
  shutdown () {
    mockery.deregisterAll()
    Robot.prototype.shutdown.call(this)
  }
}

module.exports = PretendRobot
