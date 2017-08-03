// Description:
// Tell the robot to write log test messages
//
// Commands:
// hubot <debug> - writes debug log
// hubot <info> - writes info log
// hubot <warning> - writes warning log
// hubot <error> - writes error log
//
module.exports = robot => {
  robot.respond(/debug$/i, () => robot.logger.debug('log debug test'))
  robot.respond(/info$/i, () => robot.logger.info('log info test'))
  robot.respond(/warning$/i, () => robot.logger.warning('log warning test'))
  robot.respond(/error$/i, () => robot.logger.error('log error test'))
}
