{Response} = require 'hubot'
sinon = require 'sinon'
_ = require 'lodash'

###*
 * MockResponse extends Response with .sendPrivate routed to adapter method
 * @param  {Array} strings...  Array of message text strings
 * @return MockResponse        New response instance
###
class MockResponse extends Response
  constructor: (robot, message, match) ->
    super robot, message, match
    _.forIn Response.prototype, (func, key) =>
      spy = sinon.spy @, key if _.isFunction func
      delete spy.stackTrace
    robot.emit 'response', @

  sendPrivate: (strings...) ->
    return @robot.adapter.sendPrivate @envelope, strings...

# BUG was getting reems of unknown errors `at wrapMethod` from sinon.spy
#     wasn't actually breaking anything so the temp fix is just to delete
#     the stackTrace property for readability when logging spied objects

module.exports = MockResponse
