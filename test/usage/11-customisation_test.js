// # Custom response objects
//
// Custom response objects can replace the prototype used by hubot. There's
// no new features shown here, just another use case demonstration.
//
// [See the script being tested here](../scripts/random-messages.html)

const pretend = require('../../lib')
const chai = require('chai')
chai.should()

describe('Custom response objects', () => {
  before(() => pretend.read('test/scripts/custom-response.js'))
  after(() => pretend.clear())

  context('when user asks for a random number', () => {
    it('replies to user with a random number', async () => {
      pretend.start()
      await pretend.user('cecil').send('hubot give me a random number')
      let random = pretend.messages.pop().pop()
      parseInt(random).should.be.gt(0).and.lt(5)
      pretend.shutdown()
    })
  })
})
