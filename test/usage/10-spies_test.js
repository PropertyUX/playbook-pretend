import pretend from '../../src/modules/pretend'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.should()
chai.use(sinonChai)

/**
 * All robot and response object methods are extended with sinon spies. Below
 * are examples of how to interogate hubot's internal methods, which can be
 * helpful for complex scripts that do more than send messages.
 *
 * [read more testing with sinon spies here]{@link 'http://sinonjs.org'}
 *
 * [see how robot methods are spied here]{@link '../../src/modules/robot.js'}
 * [see how response methods are spied here]{@link '../../src/mocks/response.js'}
 *
 * [see the script being tested here]{@link '../scripts/basic-reply.js'}
 */
describe('Method spies', () => {
  before(() => {
    pretend.read('../scripts/basic-reply.js')
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
    it('received both messages', function * () {
      yield pretend.user('alice').send('hubot hi')
      yield pretend.user('bob').send('hubot hi')
      pretend.robot.receive.should.have.calledTwice // eslint-disable-line
    })
  })
})
