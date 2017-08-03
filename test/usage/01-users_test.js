import pretend from '../../src/modules/pretend'
import chai from 'chai'
chai.should()

/**
 * Examples below show different approaches to setting up users to send messages
 *
 * Note the use of *generators* and *yield* to wait for messages to be processed
 * by middleware before assertions test the sent response success. This is
 * achieved by requiring *mocha-co* in mocha.opts, but can also be done inline
 * with packages like *co*. Eventually async will be supported by standard js
 * and replace the need for dependencies.
 *
 * [see the pretend module docs here]{@link '../../src/modules/pretend.js'}
 *
 * [see the script being tested here]{@link '../scripts/basic-reply.js'}
 */
describe('Sending from users', function () {
  before(() => {
    pretend.read('../scripts/basic-reply.js')
  })
  after(() => {
    pretend.clear()
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('with prepared user objects', () => {
    it('replies to each', function * () {
      pretend.start()
      let alice = pretend.user('alice')
      let bob = pretend.user('bob')
      yield alice.send('hubot hi')
      yield bob.send('hubot hi')
      pretend.messages.should.eql([
        ['alice', 'hubot hi'],
        ['hubot', '@alice hi'],
        ['bob', 'hubot hi'],
        ['hubot', '@bob hi']
      ])
    })
  })
  context('with usernames registered on startup', () => {
    it('replies to each', function * () {
      pretend.start({ users: ['alice', 'bob'] })
      yield pretend.users['alice'].send('hubot hi') // works as array key
      yield pretend.users.bob.send('hubot hi') // or property if valid name
      pretend.messages.should.eql([
        ['alice', 'hubot hi'],
        ['hubot', '@alice hi'],
        ['bob', 'hubot hi'],
        ['hubot', '@bob hi']
      ])
    })
  })
  context('with users created as required', () => {
    it('replies to each', function * () {
      pretend.start()
      yield pretend.user('alice').send('hubot hi')
      yield pretend.user('bob').send('hubot hi')
      pretend.messages.should.eql([
        ['alice', 'hubot hi'],
        ['hubot', '@alice hi'],
        ['bob', 'hubot hi'],
        ['hubot', '@bob hi']
      ])
    })
  })
})
