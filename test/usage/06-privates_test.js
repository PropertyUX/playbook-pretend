// # Private messages
//
// Some platform adapters have a custom method to process private messages,
// the examples below shows how to retrieve a user's private messages, but these
// arrays are not currently observable.
//
// They can all be accessed from `pretend.adapter.privateMessages`, or per user
// as shown below.
//
// [See the script being tested here](../scripts/private-message.html)

import pretend from '../../lib'
import chai from 'chai'
import co from 'co'
chai.should()

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
    it('does not post to the originating room', () => co(function * () {
      yield pretend.user('alice').send('hubot tell me a secret')
      pretend.messages.should.eql([
        ['alice', 'hubot tell me a secret']
      ])
    }))
    it('private messages user', () => co(function * () {
      yield pretend.user('alice').send('hubot tell me a secret')
      pretend.user('alice').privates().should.eql(['whisper whisper whisper'])
    }))
  })
})
