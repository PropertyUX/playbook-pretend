export default robot => {
  // Play marco polo, will randomly catch user's saying polo (1/6 chance)
  robot.respond(/play/i, res => res.reply('ok im it... MARCO!'))
  robot.hear(/polo/i, res => {
    if (Math.floor(Math.random() * 6) + 1 < 6) {
      return res.send('...MARCO')
    } else {
      return res.reply('I got you!')
    }
  })

  // Start counting seconds, stop when told to
  // NB: didn't end up using this for tests, kept it for later maybe
  let time = 0
  let count = 0
  let counting = null

  robot.respond(/count/i, res => {
    time = Date.now()
    return (counting = setInterval(() => res.send(count++), 1000))
  })

  robot.respond(/stop/i, res => {
    clearInterval(counting)
    res.reply(`OK. I counted to ${count}. You stopped me at ${Date.now() - time} milliseconds.`)
  })
}
