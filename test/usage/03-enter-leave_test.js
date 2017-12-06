// # Entering and leaving a room
//
// Simple example of enter and leave messages being triggered from a room method
//
// Note the room methods accept a user as the source of the enter/leave message
// where the user methods will just send from the users current room.
// The third example uses the user.in method to set their room on the fly.
//
// [See the pretend module docs here](../api/pretend.js.html)
//
// [See the script being tested here](../scripts/enter-leave.html)

const pretend = require('../../lib')
const chai = require('chai')
chai.should()

describe('Entering and leaving a room', function () {
  before(() => pretend.read('test/scripts/enter-leave.js'))
  after(() => pretend.clear())
  afterEach(() => pretend.shutdown())

  context('triggered from room, given user', () => {
    it('greets and farewells the user', async () => {
      pretend.start({ rooms: ['hub'] })
      await pretend.rooms.hub.enter(pretend.user('Toshi'))
      await pretend.rooms.hub.leave(pretend.user('Toshi'))
      pretend.messages.should.eql([
        ['hub', 'hubot', 'Hi Toshi!'],
        ['hub', 'hubot', 'Bye Toshi!']
      ])
    })
  })

  context('triggered from user, with set room', () => {
    it('greets and farewells the user', async () => {
      pretend.start({ users: ['Toshi'] })
      pretend.users.Toshi.room = 'hub'
      await pretend.users.Toshi.enter()
      await pretend.users.Toshi.leave()
      pretend.messages.should.eql([
        ['hub', 'hubot', 'Hi Toshi!'],
        ['hub', 'hubot', 'Bye Toshi!']
      ])
    })
  })

  context('triggered from user, with dynamic user/room', () => {
    it('greets and farewells the user', async () => {
      pretend.start()
      await pretend.user('Toshi').in('hub').enter()
      await pretend.user('Toshi').in('pub').leave()
      pretend.messages.should.eql([
        ['hub', 'hubot', 'Hi Toshi!'],
        ['pub', 'hubot', 'Bye Toshi!']
      ])
    })
  })
})
