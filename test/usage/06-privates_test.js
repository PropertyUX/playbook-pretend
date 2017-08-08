import pretend from '../../lib'
import chai from 'chai'
chai.should()

/**
 * Some platform adapters have a custom method to process private messages,
 * the examples below shows how to retrieve a user's private messages, but these
 * arrays are not currently observable.
 *
 * They can all be accessed from `pretend.adapter.privateMessages`, or per user
 * as shown below.
 *
 * [see the script being tested here]{@link '../scripts/private-message.js'}
 */
describe('Private messages', () => {
  before(() => {
    pretend.read('test/scripts/private-message.js')
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
  context('requested from hubot', () => {
    it('does not post to the originating room', function * () {
      yield pretend.user('alice').send('hubot tell me a secret')
      pretend.messages.should.eql([
        ['alice', 'hubot tell me a secret']
      ])
    })
    it('private messages user', function * () {
      yield pretend.user('alice').send('hubot tell me a secret')
      pretend.user('alice').privates().should.eql(['whisper whisper whisper'])
    })
  })
})
