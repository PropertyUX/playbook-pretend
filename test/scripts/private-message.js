// Description:
// Ask the robot to send you a private message
//
// Commands:
// hubot <tell me a secret> - replies via private message
//
module.exports = robot => robot.respond(/tell me a secret$/i, res => res.sendPrivate('whisper whisper whisper'))
