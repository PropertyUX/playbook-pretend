# Description:
# Says hi when you say hi
#
# Commands:
# hubot <hi> - replies hi
#
module.exports = (robot) ->
  robot.respond /hi/i, (res) -> res.reply 'hi'
