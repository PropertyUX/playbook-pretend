import pretend from '../../src/modules/pretend'
import chai from 'chai'
chai.should()
pretend.read('../scripts/enter-leave.js')

/**
 * Simple example of enter and leave messages being triggered from a room method
 *
 * Note the room methods accept a user as the source of the enter/leave message
 * where the user methods will just send from the users current room.
 * The third example uses the user.in method to set their room on the fly.
 *
 * [see the pretend module docs here]{@link '../../src/modules/pretend.js'}
 *
 * [see the script being tested here]{@link '../scripts/enter-leave.js'}
 */
describe('Entering and leaving a room', function () {
  beforeEach(() => {
    pretend.start()
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('triggered from room, given user', () => {
    it('greets and farewells the user', function * () {
      pretend.start({ rooms: ['hub'] })
      yield pretend.rooms.hub.enter(pretend.user('Toshi'))
      yield pretend.rooms.hub.leave(pretend.user('Toshi'))
      pretend.messages.should.eql([
        ['hub', 'hubot', 'Hi Toshi!'],
        ['hub', 'hubot', 'Bye Toshi!']
      ])
    })
  })
  context('triggered from user, with set room', () => {
    it('greets and farewells the user', function * () {
      pretend.start({ users: ['Toshi'] })
      pretend.users.Toshi.room = 'hub'
      yield pretend.users.Toshi.enter()
      yield pretend.users.Toshi.leave()
      pretend.messages.should.eql([
        ['hub', 'hubot', 'Hi Toshi!'],
        ['hub', 'hubot', 'Bye Toshi!']
      ])
    })
  })
  context('triggered from user, with dynamic user/room', () => {
    it('greets and farewells the user', function * () {
      pretend.start()
      yield pretend.user('Toshi').in('hub').enter()
      yield pretend.user('Toshi').in('pub').leave()
      pretend.messages.should.eql([
        ['hub', 'hubot', 'Hi Toshi!'],
        ['pub', 'hubot', 'Bye Toshi!']
      ])
    })
  })
})
