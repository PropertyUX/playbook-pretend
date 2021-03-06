// # Middleware and Responses
//
// At the top of each middleware stack an event emits corresponding to the type
// of middleware, to test the context object going into each stack's execution.
// It also stores the incoming and outgoing response objects at this point.
// Examples below show how to make assertions that middleware is fired and
// response objects are being produced and processed correclty.
//
// Note responses on catch-all or ignored listeners will not be stored.
//
// [See the script being tested here](../scripts/basic-reply.html)

import pretend from '../../lib'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiPromise from 'chai-as-promised'
import chaiSubset from 'chai-subset'
import co from 'co'
chai.should()
chai.use(sinonChai)
chai.use(chaiPromise)
chai.use(chaiSubset)

describe('Middleware and Responses', () => {
  before(() => {
    pretend.read('test/scripts/basic-reply.js')
  })
  after(() => {
    pretend.clear()
  })
  beforeEach(() => {
    pretend.start()
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('user sending an unmatched message', () => {
    it('emits the receive event with context and response', (done) => {
      let receive = new Promise(resolve => pretend.robot.on('receive', resolve))
      receive.should.eventually.have.property('response').notify(done)
      pretend.user('alice').send('hubot hi')
    })
    it('does not emit listen event because nothing matched', () => co(function * () {
      let listenSpy = sinon.spy()
      pretend.robot.on('listen', listenSpy)
      yield pretend.user('alice').send('hubot do nothing')
      listenSpy.should.not.have.calledOnce // eslint-disable-line
    }))
  })
  context('user sending a matched message', () => {
    it('emits the receive event with context and response', (done) => {
      let receive = new Promise(resolve => pretend.robot.on('receive', resolve))
      receive.should.eventually.have.property('response').notify(done)
      pretend.user('alice').send('hubot hi')
    })
    it('response contains the correct user', (done) => {
      let user = pretend.user('alice')
      let receive = new Promise(resolve => pretend.robot.on('receive', resolve))
      receive.should.eventually.have.nested.property('response.message.user', user).notify(done)
      user.send('hubot hi')
    })
    it('listener matched the whole message', (done) => {
      let listen = new Promise(resolve => pretend.robot.on('listen', resolve))
      listen.should.eventually.have.nested.property('response.match[0]', 'hubot hi').notify(done)
      pretend.user('alice').send('hubot hi')
    })
    it('responded using reply method', (done) => {
      let respond = new Promise(resolve => pretend.robot.on('respond', resolve))
      respond.should.eventually.have.property('method', 'reply').notify(done)
      pretend.user('alice').send('hubot hi')
    })
    it('stores the last received response object', () => co(function * () {
      yield pretend.user('alice').send('foo')
      pretend.lastReceive().should.containSubset({
        message: {
          user: { name: 'alice' },
          text: 'foo'
        }
      })
    }))
    it('stores the last listened response object', () => co(function * () {
      yield pretend.user('alice').send('hubot hi')
      pretend.lastListen().should.containSubset({
        message: {
          user: { name: 'alice' },
          text: 'hubot hi'
        }
      })
    }))
    it('stores the last respond response object', () => co(function * () {
      let message = 'hubot hi'
      yield pretend.user('alice').send(message)
      pretend.lastRespond().should.containSubset({
        match: ['hubot hi'],
        message: {
          user: { name: 'alice' },
          text: 'hubot hi'
        }
      })
    }))
  })
})
