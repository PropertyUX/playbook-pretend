# Description:
#   Test script
module.exports = (robot) ->
  robot.respond /tell me a secret$/i, (res) ->
    res.sendPrivate 'whisper whisper whisper'
