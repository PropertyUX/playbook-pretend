import chai from 'chai'
import Pretend from '../src'
chai.should()
const pretend = new Pretend('./scripts/events.js')

describe('Events', () => {
  context('emit event manually for hubot', () => {
    beforeEach(() => {
      pretend.startup()
      pretend.adapter.robotEvent('some-event', 'event', 'data')
    })

    it('messages the room', () =>
      pretend.messages.should.eql([['hub', 'hubot', 'got event with event data']])
    )
  })

  context('hubot emits event on listener match', () => {
    beforeEach(() => {
      pretend.startup()
      pretend.robot.on('response-event', ({ content }) => (this.response = content))
      pretend.user('bob').send('@hubot send event')
    })

    it('triggers an event', () =>
      this.response.should.eql('hello')
    )
  })
})
