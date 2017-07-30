// Description:
// Play marco polo, will randomly catch users
//
// Commands:
// hubot <play> - starts the game
// hubot <polo> - continues or ends the game (1/6 chance)
//
module.exports = robot => {
  robot.respond(/play/i, res => res.reply('ok im it... MARCO!'))
  robot.hear(/polo/i, res => {
    if (Math.floor(Math.random() * 6) + 1 < 6) {
      return res.send('...MARCO')
    } else {
      return res.reply('I got you!')
    }
  })
}
