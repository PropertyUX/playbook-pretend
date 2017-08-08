import pretend from '../../lib'
import chai from 'chai'
chai.should()

/**
 * By default, pretend is a room-less environment for receiving basic messages.
 * We can however setup an array of rooms, for listening and responding, across
 * multiple parallel rooms, or with different users in each, similar to a live
 * chat platform.
 *
 * The record of messages will prepend the name of the room where it was
 * received (if there was a room defined).
 *
 * Note the difference where users `send` to room, rooms `receive` from user.
 *
 * [see the pretend module docs here]{@link '../../src/modules/pretend.js'}
 *
 * [see the script being tested here]{@link '../scripts/basic-reply.js'}
 */
describe('Receiving in rooms', function () {
  before(() => {
    pretend.read('test/scripts/basic-reply.js')
  })
  after(() => {
    pretend.clear()
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('from users with room option set', () => {
    it('replies to user in the right room', function * () {
      pretend.start()
      let alice = pretend.user('alice', { room: 'dining' })
      let bob = pretend.user('bob', { room: 'kitchen' })
      yield alice.send('@hubot hi')
      yield bob.send('@hubot hi')
      pretend.messages.should.eql([
        ['dining', 'alice', '@hubot hi'],
        ['dining', 'hubot', '@alice hi'],
        ['kitchen', 'bob', '@hubot hi'],
        ['kitchen', 'hubot', '@bob hi']
      ])
    })
  })
  context('from user cloned into room as required)', () => {
    it('replies to user in the right room', function * () {
      pretend.start()
      let alice = pretend.user('alice', { room: 'dining' })
      yield alice.send('@hubot hi')
      yield alice.in('kitchen').send('@hubot hi')
      pretend.messages.should.eql([
        ['dining', 'alice', '@hubot hi'],
        ['dining', 'hubot', '@alice hi'],
        ['kitchen', 'alice', '@hubot hi'],
        ['kitchen', 'hubot', '@alice hi']
      ])
    })
  })
  context('from room setup to accept users)', () => {
    it('replies to user in the right room', function * () {
      pretend.start({ users: ['alice', 'bob'] })
      let kitchen = pretend.room('kitchen')
      yield kitchen.receive(pretend.users.alice, '@hubot hi')
      yield kitchen.receive(pretend.users.bob, '@hubot hi')
      pretend.messages.should.eql([
        ['kitchen', 'alice', '@hubot hi'],
        ['kitchen', 'hubot', '@alice hi'],
        ['kitchen', 'bob', '@hubot hi'],
        ['kitchen', 'hubot', '@bob hi']
      ])
    })
  })
  context('from users and rooms as collection properties', () => {
    it('replies to user in the right room', function * () {
      pretend.start({
        users: ['alice', 'bob'],
        rooms: ['kitchen', 'dining']
      })
      yield pretend.users.alice.in(pretend.rooms.dining).send('@hubot hi')
      yield pretend.rooms.kitchen.receive(pretend.users.bob, '@hubot hi')
      pretend.messages.should.eql([
        ['dining', 'alice', '@hubot hi'],
        ['dining', 'hubot', '@alice hi'],
        ['kitchen', 'bob', '@hubot hi'],
        ['kitchen', 'hubot', '@bob hi']
      ])
    })
  })
  context('with filtered results for specific room', () => {
    it('returns only messages for the right room', function * () {
      pretend.start({ users: ['bob'] })
      let garage = pretend.room('garage')
      let basement = pretend.room('basement')
      yield garage.receive(pretend.users.bob, '@hubot hi')
      yield basement.receive(pretend.users.bob, '@hubot hi')
      garage.messages().should.eql([
        ['bob', '@hubot hi'],
        ['hubot', '@bob hi']
      ])
    })
  })
})
