import co from 'co'
import chai from 'chai'
import Pretend from '../src'
chai.should()

const pretend = new Pretend('./scripts/enter-leave.js')

describe('Enter and Leave', () =>
  context('user entering then leaving the room', () => {
    beforeEach(() => {
      pretend.startup({ rooms: ['hub'] })
      return co(
        function * () {
          yield pretend.rooms.hub.enter(pretend.user('Toshi'))
          yield pretend.rooms.hub.leave(pretend.user('Toshi'))
        }
      )
    })

    it('greets and farewells the user', () =>
      pretend.messages.should.eql([['hub', 'hubot', 'Hi Toshi!'], ['hub', 'hubot', 'Bye Toshi!']])
    )
  }))
