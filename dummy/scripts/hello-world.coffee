# Description:
#   Hubot replies to 'hi' with 'hi'
#
# Dependencies:
#   N/A
#
# Configuration:
#   N/A
#
# Commands:
#   hubot hi - say hi to hubot, it will say hi back
#
# Author:
#   Tim Kinnane
#
module.exports = (robot) ->
  robot.respond /hi$/i, (res) -> res.reply 'hi'
