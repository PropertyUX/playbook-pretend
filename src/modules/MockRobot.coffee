_ = require 'lodash'
{Robot} = require 'hubot'
sinon     = require 'sinon'

Adapter = require './MockAdapter'
Response = require './MockResponse'

###*
 * MockRobot extends Hubot with MockResponse and hardwired to use MockAdapter
 * Spies setup after constructor so it doesn't inherit calls from re-used parent
 * @param  {Array} strings...  Array of message text strings
 * @return MockRobot           New robot instance
###
class MockRobot extends Robot
  constructor: (httpd=false) ->
    super null, null, httpd, 'hubot'
    @Response = Response

    # allow tests to listen in on middleware processing stages
    @middleware.listener.register (context, next, done) =>
      @emit 'listen', context
      next()
    @middleware.receive.register (context, next, done) =>
      @emit 'receive', context
      next()
    @middleware.response.register (context, next, done) =>
      @emit 'respond', context
      next()

    # spy on everything
    _.forIn Robot.prototype, (func, key) =>
      spy = sinon.spy @, key if _.isFunction func
      delete spy.stackTrace

  loadAdapter: ->
    @adapter = new Adapter @
    return

  # receive: (message, cb) ->


module.exports = MockRobot

# events allow tests to listen in
# robot.receiveMiddleware (context, next, done) ->
#   robot.emit 'receive', context.response
#   next()
# robot.responseMiddleware (context, next, done) ->
#   robot.emit 'respond', context.response, context.strings, context.method
#   next()
