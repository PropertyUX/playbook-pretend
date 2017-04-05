Hubot = require 'hubot'

###*
 * MockResponse extends Response with .sendPrivate routed to adapter method
 * @param  {Array} strings...  Array of message text strings
 * @return MockResponse        New response instance
###
class MockResponse extends Hubot.Response
  sendPrivate: (strings...) ->
    return @robot.adapter.sendPrivate @envelope, strings...

module.exports = MockResponse
