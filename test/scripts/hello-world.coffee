# Description:
#   Test script
module.exports = (robot) ->
  robot.respond /hi$/i, (res) ->
    res.reply 'hi'
