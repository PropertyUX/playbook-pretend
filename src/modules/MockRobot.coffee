_ = require 'lodash'
{Robot} = require 'hubot'

Adapter = require './MockAdapter'
Response = require './MockResponse'

###*
 * MockRobot extends Hubot with MockResponse and hardwired to use MockAdapter
 * @param  {Array} strings...  Array of message text strings
 * @return MockRobot           New robot instance
###
class MockRobot extends Robot
  constructor: (httpd=false) ->
    super null, null, httpd, 'hubot'
    @Response = Response

  loadAdapter: ->
    @adapter = new Adapter @
    return

module.exports = MockRobot
