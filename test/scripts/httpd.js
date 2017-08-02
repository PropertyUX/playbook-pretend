// Description:
// Respond to http request to /hi with hi
//
// Commands:
// N/A
//
// Notes:
// robot.router is alias for expressjs/express
//
module.exports = robot => {
  robot.router.get('/status', (req, res) => {
    res.status(200).send()
  })
  robot.router.get('/hi', (req, res) => {
    res.send('hello there')
  })
  robot.router.post('/send', (req, res) => {
    let room = req.body.room
    let strings = req.body.strings
    if (typeof strings === 'undefined') {
      return res.status(500).send('missing strings')
    }
    robot.send({ room: room }, ...strings)
    res.status(200).send('message sent')
  })
}
