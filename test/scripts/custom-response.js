// Description:
// Use extended response method to return random numbers
//
// Commands:
// hubot <random number> - replies with random number between 1-5
//
export default robot =>
  robot.respond(/random number$/i, res => res.reply(res.random([1, 2, 3, 4, 5])))
