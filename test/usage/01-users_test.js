// # Sending from users
//
// Examples below show different approaches to setting up users to send messages
// Note the use of *generators* and *await* to wait for messages to be processed
// by middleware before assertions test the success of responses. This is
// achieved by returning the generator to co. Eventually async will be
// supported by standard js and replace the need for these dependencies.
//
// [See the pretend module docs here](../api/pretend.js.html)
//
// [See the script being tested here](../scripts/basic-reply.html)

const pretend = require('../../lib')
const chai = require('chai')
chai.should()

describe('Sending from users', function () {
  before(() => pretend.read('test/scripts/basic-reply.js'))
  after(() => pretend.clear())
  afterEach(() => pretend.shutdown())

  context('with prepared user objects', () => {
    it('replies to each', async () => {
      pretend.start()
      let alice = pretend.user('alice')
      let bob = pretend.user('bob')
      await alice.send('hubot hi')
      await bob.send('hubot hi')
      pretend.messages.should.eql([
        ['alice', 'hubot hi'],
        ['hubot', '@alice hi'],
        ['bob', 'hubot hi'],
        ['hubot', '@bob hi']
      ])
    })
  })

  context('with usernames registered on startup', () => {
    it('replies to each', async () => {
      pretend.start({ users: ['alice', 'bob'] })
      await pretend.users['alice'].send('hubot hi') // works as array key
      await pretend.users.bob.send('hubot hi') // or property if valid name
      pretend.messages.should.eql([
        ['alice', 'hubot hi'],
        ['hubot', '@alice hi'],
        ['bob', 'hubot hi'],
        ['hubot', '@bob hi']
      ])
    })
  })

  context('with users created as required', () => {
    it('replies to each', async () => {
      pretend.start()
      await pretend.user('alice').send('hubot hi')
      await pretend.user('bob').send('hubot hi')
      pretend.messages.should.eql([
        ['alice', 'hubot hi'],
        ['hubot', '@alice hi'],
        ['bob', 'hubot hi'],
        ['hubot', '@bob hi']
      ])
    })
  })
})
