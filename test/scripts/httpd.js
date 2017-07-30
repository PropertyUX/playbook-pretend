// Description:
// Respond to httpd request to /hi with hi
//
// Commands:
// N/A
//
module.exports = robot =>
  robot.router.get('/hi', (req, res) => res.status(200).send('hi')
)
