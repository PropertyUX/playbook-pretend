// # Testing events
//
// Examples below show how to make assertions on event emits.
// You could add event listeners directly in tests, but the pretend.events array
// can be useful if you need to make assertions on a series of prior events.
//
// [See the script being tested here](../scripts/events.html)

import pretend from '../../lib'
import chai from 'chai'
import chaiPromise from 'chai-as-promised'
chai.should()
chai.use(chaiPromise)

describe('Testing events', () => {
  before(() => {
    pretend.read('test/scripts/events.js')
  })
  after(() => {
    pretend.clear()
  })
  context('emitting to trigger response', () => {
    it('messages the room', (done) => {
      pretend.startup()
      pretend.observer.next().should.eventually.have.deep.property('value', [
        'hub', 'hubot', 'got event with: foo'
      ]).notify(done)
      pretend.robot.emit('listen-event', 'foo')
    })
  })
  context('hubot emits event on listener match', () => {
    it('triggers an event', function * () {
      pretend.startup()
      yield pretend.user('bob').send('hubot send event')
      pretend.events.slice(-1).pop().should.eql([
        'response-event', [ 'hello there' ]
      ])
    })
  })
})
