import Pretend from '../src'

const pretend = new Pretend('./scripts/httpd-world.js')

process.env.EXPRESS_PORT = 8080

describe('HTTPD World', () =>
  context('GET /hello/world', () => {
    beforeEach(function (done) {
      pretend.startup({ httpd: true })
      pretend.http.get('http://localhost:8080/hello/world', (response) => {
        this.response = response
        done()
      }).on('error', done)
    })

    afterEach(() => pretend.shutdown())

    it('responds with status 200', () =>
      this.response.statusCode.should.equal(200)
    )
  }))
