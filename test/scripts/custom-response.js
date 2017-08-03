// Description:
// Use extended response method to return random numbers
//
// Commands:
// hubot <random number> - replies with random number between 1-5
//
module.exports = robot => {
  class CustomResponse extends robot.Response {
    random (min, max) {
      let rand = Math.random() * (max - min) + min
      return parseInt(rand).toString()
    }
  }
  robot.Response = CustomResponse

  robot.respond(/.*\brandom number\b/i, res => {
    res.send(res.random(1, 5))
  })
}
