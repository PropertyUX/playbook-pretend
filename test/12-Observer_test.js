import co from 'co'
import chai from 'chai'
import Pretend from '../src'
chai.should()

const pretend = new Pretend('./scripts/random-messages.js')

describe('Message Observer', () => {
  beforeEach(() => {
    pretend.startup()
    this.tester = pretend.user('tester')
  })

  afterEach(() => pretend.shutdown())

  context('Wait for the next message to appear', () => {
    beforeEach(function (done) {
      co(
        function * () {
          yield this.tester.send('test')
          pretend.observer.next().then(msg => {
            this.msg = msg
            done()
          })
          yield this.tester.send('1')
          yield this.tester.send('2')
        }.bind(this)
      )
    })

    it('resolves a promise with the next message after setup', () =>
      this.msg.should.eql(['tester', '1'])
    )

    it('did not continue with further messages', () =>
      pretend.messages.pop().should.not.eql(['tester', '2'])
    )
  })

  context('Loop until a specific message appears', () => {
    beforeEach(() => {
      this.found = ''
      this.needle = ['hubot', '@tester I got you!']
      this.wait = pretend.observer.when(this.needle, msg => (this.found = msg))
      return co(
        function * () {
          yield this.tester.send('hubot play')
          return yield * (function * () {
            const result = []
            while (this.wait.isPending()) {
              result.push(yield this.tester.send('polo'))
            }
            return result
          }.call(this))
        }.bind(this)
      )
    })

    it('resolved after at least one round', () =>
      pretend.messages.length.should.be.gt(3)
    )

    it('resolved in a probable number of rounds', () =>
      pretend.messages.length.should.be.lt(60)
    )

    it('resolved with the message it was looking for', () =>
      this.found.should.eql(this.needle)
    )
  })

  context('Loop until a given number of messages', () => {
    beforeEach(() => {
      this.found = ''
      pretend.observer.when(3, msg => (this.found = msg))
      return co(
        function * () {
          return yield * (function * () {
            const result = []
            for (let i = 1; i <= 5; i++) {
              result.push(yield this.tester.send(`${i}...`))
            }
            return result
          }.call(this))
        }.bind(this)
      )
    })

    it('resolves only when limit reached', () =>
      this.found.should.eql(['tester', '3...'])
    )
  })

  context('Loop until a specific message within limit', () => {
    beforeEach(() => {
      this.found = ''
      pretend.observer.when(6, ['tester', '3...'], msg => {
        this.found = msg
      })
      return co(
        function * () {
          return yield * (function * () {
            const result = []
            for (let i = 1; i <= 5; i++) {
              result.push(yield this.tester.send(`${i}...`))
            }
            return result
          }.call(this))
        }.bind(this)
      )
    })

    it('resolves when found (before limit reached)', () =>
      this.found.should.eql(['tester', '3...'])
    )
  })

  context('Wait for a message matching a pattern', () => {
    beforeEach(() => {
      pretend.robot.messageRoom('hide', 'count to ten')
      pretend.observer.whenMatch(/\d\d/).then(() => pretend.robot.messageRoom('hide', 'ok im coming'))
      return co(
        function * () {
          yield this.tester.in('hide').send('1')
          yield this.tester.in('hide').send('2')
          yield this.tester.in('hide').send('10')
        }.bind(this)
      )
    })

    it('resolved when the message matched', () =>
      pretend.messages.should.eql([
        ['hide', 'hubot', 'count to ten'],
        ['hide', 'tester', '1'],
        ['hide', 'tester', '2'],
        ['hide', 'tester', '10'],
        ['hide', 'hubot', 'ok im coming']
      ]))
  })

  context('Do something with each message sent', () => {
    beforeEach(() => {
      this.msgs = ''
      pretend.observer.all(msg => (this.msgs += msg[1]))
      return co(
        function * () {
          return yield * (function * () {
            const result = []
            for (let i = 1; i <= 5; i++) {
              result.push(yield this.tester.send(i))
            }
            return result
          }.call(this))
        }.bind(this)
      )
    })

    it('observed the series of messages', function () {
      return this.msgs.should.eql('12345')
    })
  })

  context('Do something with a given number of messages', () => {
    beforeEach(() => {
      this.msgs = ''
      pretend.observer.all(3, msg => (this.msgs += msg[1]))
      return co(
        function * () {
          return yield * (function * () {
            const result = []
            for (let i = 1; i <= 5; i++) {
              result.push(yield this.tester.send(i))
            }
            return result
          }.call(this))
        }.bind(this)
      )
    })

    it('observed up to given limit of messages', () =>
      this.msgs.should.eql('123')
    )
  })

  context('with subsequent observers', () => {
    beforeEach(() => {
      this.msgs = []
      let wait = pretend.observer.next().then(msg => this.msgs.push(msg)).then(() => {
        wait = pretend.observer.next().then(msg => this.msgs.push(msg))
        this.tester.send('hello father')
        return wait
      })
      this.tester.send('hello mother')
      return wait
    })

    it('did not throw (from re-observing)', () => pretend.observer.next.should.not.throw)

    it('observed messages in the correct order', () =>
      this.msgs.should.eql([['tester', 'hello mother'], ['tester', 'hello father']])
    )
  })

  context('observing both sent and received messages', () => {
    beforeEach(() => {
      this.msgs = []
      const wait = pretend.observer.all(5, msg => this.msgs.push(msg))
      this.tester.in('testing').send('receive 1').then(() => {
        pretend.responses.incoming[0].reply('reply 2')
        pretend.responses.incoming[0].send('send 3')
        pretend.robot.messageRoom('testing', 'room 4')
        pretend.robot.send({ room: 'testing' }, 'envelope 5')
      })
      return wait
    })

    // TODO: try work promises into middleware and yield to put messages in order
    it('observed all messages', () =>
      this.msgs.should.include.deep.members([
        ['testing', 'tester', 'receive 1'],
        ['testing', 'hubot', '@tester reply 2'],
        ['testing', 'hubot', 'send 3'],
        ['testing', 'hubot', 'room 4'],
        ['testing', 'hubot', 'envelope 5']
      ])
    )
  })

  context('observing both sent and received messages (alternate method)', () => {
    beforeEach(() => {
      const wait = pretend.observer.when(5)
      this.tester.in('testing').send('receive 1').then(() => {
        pretend.responses.incoming[0].reply('reply 2')
        pretend.responses.incoming[0].send('send 3')
        pretend.robot.messageRoom('testing', 'room 4')
        pretend.robot.send({ room: 'testing' }, 'envelope 5')
      })
      return wait
    })

    it('observed all messages', () =>
      pretend.messages.should.include.deep.members([
        ['testing', 'tester', 'receive 1'],
        ['testing', 'hubot', '@tester reply 2'],
        ['testing', 'hubot', 'send 3'],
        ['testing', 'hubot', 'room 4'],
        ['testing', 'hubot', 'envelope 5']
      ]))
  })
})
