// # Receiving HTTP requests
//
// Examples below make and test requests using the built-in http daemon
//
// Note that in a normal hubot, it's enabled by default, but its less common for
// tests to require the server, so in pretend its disabled by default and must
// be enabled in the starting options.
//
// pretend.http is an alias for robot's technoweenie/node-scoped-http-client
//
// [See the script being tested here](../scripts/httpd.html)

import pretend from '../../lib'
import chai from 'chai'
chai.should()
process.env.PORT = 8080

describe('Receiving HTTP requests', function () {
  before(() => {
    pretend.read('test/scripts/httpd.js')
  })
  after(() => {
    pretend.clear()
  })
  beforeEach(() => {
    pretend.start({ httpd: true })
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('GET request sent to /status', () => {
    it('responds with status 200', (done) => {
      pretend.http('http://0.0.0.0:8080/status').get()(function (err, resp, body) {
        if (err) console.log(err)
        resp.statusCode.should.equal(200)
        done()
      })
    })
  })
  context('GET request sent to /hi', () => {
    it('responds with a body', (done) => {
      pretend.http('http://0.0.0.0:8080/hi').get()(function (err, resp, body) {
        if (err) console.log(err)
        body.should.equal('hello there')
        done()
      })
    })
  })
  context('POST request sent to /send', () => {
    it('hubot uses post data in message', (done) => {
      let data = JSON.stringify({
        room: 'testing',
        strings: ['...', 'hello there']
      })
      pretend.http('http://0.0.0.0:8080/send')
        .header('Content-Type', 'application/json')
        .post(data)(function (err, resp, body) {
          if (err) console.log(err)
          pretend.messages.should.eql([
            [ 'testing', 'hubot', '...' ],
            [ 'testing', 'hubot', 'hello there' ]
          ])
          done()
        })
    })
  })
})
