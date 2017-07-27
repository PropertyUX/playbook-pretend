import co from 'co'
import Pretend from '../src'

const pretend = new Pretend('./scripts/hello-world.js')

describe('Hello Rooms', () =>
  context('users in different rooms says hi to hubot', () => {
    context('basic usage (setup user vars with room option)', () => {
      beforeEach(() => {
        pretend.startup()
        this.alice = pretend.user('alice', { room: 'dining' })
        this.bob = pretend.user('bob', { room: 'kitchen' })
        return co(
          function * () {
            yield this.alice.send('@hubot hi')
            yield this.bob.send('@hubot hi')
          }.bind(this)
        )
      })

      it('replies to user in the right room', () =>
        pretend.messages.should.eql([['dining', 'alice', '@hubot hi'], ['dining', 'hubot', '@alice hi'], ['kitchen', 'bob', '@hubot hi'], ['kitchen', 'hubot', '@bob hi']])
      )
    })

    context('dynamic usage (clone user into room as required)', () => {
      beforeEach(() => {
        pretend.startup()
        this.alice = pretend.user('alice', { room: 'dining' })
        return co(
          function * () {
            yield this.alice.send('@hubot hi')
            yield this.alice.in('kitchen').send('@hubot hi')
          }.bind(this)
        )
      })

      it('replies to user in the right room', () =>
        pretend.messages.should.eql([['dining', 'alice', '@hubot hi'], ['dining', 'hubot', '@alice hi'], ['kitchen', 'alice', '@hubot hi'], ['kitchen', 'hubot', '@alice hi']])
      )
    })

    context('room usage (setup room var to accept users)', () => {
      beforeEach(() => {
        pretend.startup({ users: ['alice', 'bob'] })
        this.kitchen = pretend.room('kitchen')
        return co(
          function * () {
            yield this.kitchen.receive(pretend.users.alice, '@hubot hi')
            yield this.kitchen.receive(pretend.users.bob, '@hubot hi')
          }.bind(this)
        )
      })

      it('replies to user in the right room', () =>
        pretend.messages.should.eql([['kitchen', 'alice', '@hubot hi'], ['kitchen', 'hubot', '@alice hi'], ['kitchen', 'bob', '@hubot hi'], ['kitchen', 'hubot', '@bob hi']])
      )
    })

    context('inline usage (users and rooms as collection properties)', () => {
      beforeEach(() => {
        pretend.startup({
          users: ['alice', 'bob'],
          rooms: ['kitchen', 'dining']
        })
        return co(
          function * () {
            yield pretend.users.alice.in(pretend.rooms.dining).send('@hubot hi')
            yield pretend.rooms.kitchen.receive(pretend.users.bob, '@hubot hi')
          }
        )
      })

      it('replies to user in the right room', () =>
        pretend.messages.should.eql([['dining', 'alice', '@hubot hi'], ['dining', 'hubot', '@alice hi'], ['kitchen', 'bob', '@hubot hi'], ['kitchen', 'hubot', '@bob hi']])
      )
    })

    return context('filtered usage (separate results by room)', () => {
      beforeEach(() => {
        pretend.startup({ users: ['bob'] })
        this.garage = pretend.room('garage')
        this.basement = pretend.room('basement')
        return co(
          function * () {
            yield this.garage.receive(pretend.users.bob, '@hubot hi')
            yield this.basement.receive(pretend.users.bob, '@hubot hi')
          }.bind(this)
        )
      })

      it('returns messages from just first room', () =>
        this.garage.getMessages().should.eql([['bob', '@hubot hi'], ['hubot', '@bob hi']])
      )

      it('returns messages from just second room', () =>
        this.basement.getMessages().should.eql([['bob', '@hubot hi'], ['hubot', '@bob hi']])
      )
    })
  }))
