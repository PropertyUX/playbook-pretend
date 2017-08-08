import pretend from '../../lib'
import chai from 'chai'
chai.should()

/**
 * Custom response objects can replace the prototype used by hubot. There's
 * no new features shown here, just another use case demonstration.
 *
 * [see the script being tested here]{@link '../scripts/random-messages.js'}
 */
describe('Custom response objects', () => {
  before(() => {
    pretend.read('test/scripts/custom-response.js')
  })
  after(() => {
    pretend.clear()
  })
  context('when user asks for a random number', () => {
    it('replies to user with a random number', function * () {
      pretend.start()
      yield pretend.user('cecil').send('hubot give me a random number')
      let random = pretend.messages.pop().pop()
      parseInt(random).should.be.gt(0).and.lt(5)
      pretend.shutdown()
    })
  })
})
