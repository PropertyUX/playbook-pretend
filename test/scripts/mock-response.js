export default robot =>
  robot.respond(/give me a random number$/i, res => {
    let randomNumber = res.random([1, 2, 3, 4, 5])
    res.reply(randomNumber)
  })
