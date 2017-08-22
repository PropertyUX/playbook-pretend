// # Method spies
//
// All robot and response object methods are extended with sinon spies. Below
// are examples of how to interogate hubot's internal methods, which can be
// helpful for complex scripts that do more than send messages.
//
// [Read more testing with sinon spies here](http://sinonjs.org)
//
// [See how robot methods are spied here](../source/robot.html)
//
// [See how response methods are spied here](../source/response.html)
//
// [See the script being tested here](../scripts/basic-reply.html)

import pretend from '../../lib'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import co from 'co'
chai.should()
chai.use(sinonChai)

describe('Method spies', () => {
  before(() => {
    pretend.read('test/scripts/basic-reply.js')
  })
  after(() => {
    pretend.clear()
  })
  beforeEach(() => {
    pretend.start()
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('on robot processing script', () => {
    it('loads given script path and file into hubot', () => {
      let path = sinon.match(new RegExp(/scripts$/))
      let file = 'basic-reply.js'
      pretend.robot.loadFile.lastCall.should.have.calledWith(path, file)
    })
    it('set up a listener to respond to hi', () => {
      pretend.robot.respond.lastCall.should.have.calledWith(/hi/i, sinon.match.func)
    })
  })
  context('on robot processing listeners', () => {
    it('received both messages', () => co(function * () {
      yield pretend.user('alice').send('hubot hi')
      yield pretend.user('bob').send('hubot hi')
      pretend.robot.receive.should.have.calledTwice // eslint-disable-line
    }))
  })
})
