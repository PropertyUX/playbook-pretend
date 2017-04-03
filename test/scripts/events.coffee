# Description:
#   Test script
module.exports = (robot) ->
  robot.on 'some-event', (some, data) ->
    robot.messageRoom 'hub', "got event with #{some} #{data}"

  robot.respond /send event$/i, (msg) ->
    robot.emit 'response-event',
      content: 'hello'
