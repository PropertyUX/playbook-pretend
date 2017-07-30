import co from 'co'
import chai from 'chai'
import Pretend from '../src'
chai.should()

const pretend = new Pretend('./scripts/hello-world.coffee')

describe('Hello World', function () {
  context('two users say hi to hubot', () => {
    before(() => {
      this.expectedMessages = [
        ['alice', '@hubot hi'],
        ['hubot', '@alice hi'],
        ['bob', '@hubot hi'],
        ['hubot', '@bob hi']
      ]
    })

    context('basic usage (setup user vars)', () => {
      beforeEach(() => {
        pretend.startup()
        this.alice = pretend.user('alice')
        this.bob = pretend.user('bob')
        return co(
          function * () {
            yield this.alice.send('@hubot hi')
            yield this.bob.send('@hubot hi')
          }.bind(this)
        )
      })

      it('replies to each', () =>
        pretend.messages.should.eql(this.expectedMessages)
      )
    })

    context('inline usage (users as collection on startup)', () => {
      beforeEach(() => {
        pretend.startup({ users: ['alice', 'bob'] })
        return co(
          function * () {
            yield pretend.users['alice'].send('@hubot hi') // works as array key
            yield pretend.users.bob.send('@hubot hi')
          }
        )
      }) // and attribute if valid name

      it('replies to user', () =>
        pretend.messages.should.eql(this.expectedMessages)
      )
    })

    return context('dynamic usage (users created as required)', () => {
      beforeEach(() => {
        pretend.startup({ users: ['bob'] })
        return co(
          function * () {
            yield pretend.user('alice').send('@hubot hi') // creates and sends in one
            yield pretend.user('bob').send('@hubot hi')
          }
        )
      }) // works for existing users

      return it('replies to user', () =>
        pretend.messages.should.eql(this.expectedMessages)
      )
    })
  })
})
