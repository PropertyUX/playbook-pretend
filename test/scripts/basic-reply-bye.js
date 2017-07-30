// Description:
// Says bye when you say bye
//
// Commands:
// hubot <bye> - responds bye
//
module.exports = robot => robot.respond(/bye$/i, res => res.reply('bye'))
