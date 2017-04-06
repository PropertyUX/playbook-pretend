# Description:
#   Test script
module.exports = (robot) ->
  robot.respond /bye$/i, (res) ->
    res.reply 'bye'
