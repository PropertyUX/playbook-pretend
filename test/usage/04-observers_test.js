import pretend from '../../src/modules/pretend'
import chai from 'chai'
import chaiPromise from 'chai-as-promised'
chai.should()
chai.use(chaiPromise)

/**
 * These examples show how to make assertions for messages with unpredictable
 * content or timing usiang the observer module.
 *
 * Note the use of chai-as-promised to shorthand assertions on promise results.
 * When using assertions on a promise, tests must return the promise or call
 * the test's `done` function, the latter is used here for consistent style.
 *
 * [see the observer method docs here]{@link '../../src/modules/observer.js'}
 *
 * [see the script being tested here]{@link '../scripts/random-messages.js'}
 */
describe('Observering messages', () => {
  before(() => {
    pretend.read('../scripts/random-messages.js')
  })
  after(() => {
    pretend.clear()
  })
  beforeEach(() => {
    pretend.startup()
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('wait for the next message to appear', () => {
    it('resolves with the next message', (done) => {
      let tester = pretend.user('tester')
      pretend.observer.next().should.eventually.have.deep.property('value', ['tester', 'one']).notify(done)

      tester.send('one')
      tester.send('two')
    })
    it('can make assertions on state at point of resolution', (done) => {
      let tester = pretend.user('tester')
      tester.send('test')
      pretend.observer.next().should.eventually.have.deep.property('state', [
        ['tester', 'test'],
        ['tester', 'one']
      ]).notify(done)

      tester.send('one')
      tester.send('two')
    })
  })
  context('loop until a specific message appears', () => {
    it('resolve in a probable time with the right message', (done) => {
      let intervalId
      let tester = pretend.user('tester')
      let targetMessage = ['hubot', '@tester I got you!']
      let promise = pretend.observer.find(targetMessage, 60).then((result) => {
        result.state.length.should.be.gt(3).and.lt(60)
        result.value.should.eql(targetMessage)
        clearInterval(intervalId)
        done()
      })

      tester.send('hubot play')
      intervalId = setInterval(() => {
        if (promise.value == null) tester.send('polo')
      }, 2)
    })
  })
  context('wait for a message matching a pattern', () => {
    it('resolves when the message matched', (done) => {
      let tester = pretend.user('tester')
      pretend.observer.match(/\d\d/).should.eventually.have.deep.property('value', ['tester', '10']).notify(done)

      tester.send('1')
      tester.send('2')
      tester.send('10')
      tester.send('20')
    })
  })
  context('do something with each message sent', () => {
    it('observed the series of messages', (done) => {
      let tester = pretend.user('tester')
      let msgs = ''
      let runs = 5
      pretend.observer.all(runs, msg => {
        msgs += msg[1]
      }).then(() => {
        msgs.should.equal('12345')
        done()
      })

      for (let i = 1; i <= runs; i++) tester.send(i.toString())
    })
  })
})
