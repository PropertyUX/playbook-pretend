# Description:
#   Hubot replies to 'hello' with 'hello'
#
# Dependencies:
#   N/A
#
# Configuration:
#   N/A
#
# Commands:
#   hubot <hello> - say hello to hubot, it will say hi back
#
# Author:
#   Tim Kinnane
#
module.exports = (robot) ->
  robot.respond /hello$/i, (msg) -> msg.reply 'hello'
