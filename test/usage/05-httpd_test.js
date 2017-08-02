import chai from 'chai'
import pretend from '../../src/modules/pretend'
chai.should()
pretend.read('../scripts/httpd.js')
process.env.PORT = 8080

/**
 * Examples below make and test requests using the built-in http daemon
 *
 * Note that in a normal hubot, it's enabled by default, but its less common for
 * tests to require the server, so in pretend its disabled by default and must
 * be enabled in the starting options.
 *
 * pretend.http is an alias for robot's technoweenie/node-scoped-http-client
 *
 * [see the script being tested here]{@link '../scripts/httpd.js'}
 */
describe('Receiving HTTP requests', function () {
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
            [ 'testing', 'hubot', 'hello there' ],
          ])
          done()
        })
    })
  })
})
