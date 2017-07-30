// Description:
// Start counting seconds, stop when told to
//
// Commands:
// hubot <count> - starts counting
// hubot <stop> - says what count it got up to
//
module.exports = robot => {
  let time = 0
  let count = 0
  let counting = null
  robot.respond(/count/i, res => {
    time = Date.now()
    counting = setInterval(() => res.send(count++), 1000)
    res.reply("OK. I'm counting in my head.")
  })
  robot.respond(/stop/i, res => {
    clearInterval(counting)
    res.reply(`OK. I counted to ${count}. You stopped me at ${Date.now() - time} milliseconds.`)
  })
}
