// Description:
// Tell robot to emit an event, and/or be told when event emitted
//
// Commands:
// hubot <send event> - emits event
//
module.exports = robot => {
  robot.on('some-event', (some, data) => robot.messageRoom('hub', `got event with ${some} ${data}`))
  robot.respond(/send event$/i, res => robot.emit('response-event', { content: 'hello' }))
}
