import Adapter from '../../src/mocks/adapter'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset'
import chaiPromise from 'chai-as-promised'
chai.use(sinonChai)
chai.use(chaiSubset)
chai.use(chaiPromise)
chai.should()

describe('Adapter', function () {
  beforeEach(() => {
    this.robot = {
      server: { close: sinon.spy() },
      receive: sinon.spy((msg, cb) => {
        setTimeout(() => cb.call(this, 'mock result'), 15)
      }),
      emit: sinon.spy()
    }
    this.adapter = Adapter.use(this.robot)
    this.mockUser = { id: '111', name: 'tester', room: 'testing' }
  })
  afterEach(() => {
    this.adapter.close()
  })
  describe('.send', () => {
    it('records hubot sends in messages', () => {
      this.adapter.send({ room: 'testing' }, '...', '...')
      this.adapter.send({ room: 'testing' }, 'hello there')
      this.adapter.messages.should.eql([
        [ 'testing', 'hubot', '...' ],
        [ 'testing', 'hubot', '...' ],
        [ 'testing', 'hubot', 'hello there' ]
      ])
    })
  })
  describe('.reply', () => {
    it('records hubot (@ prepended) replies in messages', () => {
      this.adapter.reply({ room: 'testing', user: { name: 'general-kenobi' } }, '!')
      this.adapter.messages.should.eql([
        [ 'testing', 'hubot', '@general-kenobi !' ]
      ])
    })
  })
  describe('.receive', () => {
    beforeEach(() => {
      this.promise = this.adapter.receive(this.mockUser, 'hello there')
    })
    it('calls robot receive with message', () => {
      this.adapter.robot.receive.lastCall.args[0].should.containSubset({
        user: this.mockUser,
        text: 'hello there'
      })
    })
    it('stores username and text', () => {
      this.adapter.messages.should.eql([
        [ 'testing', 'tester', 'hello there' ]
      ])
    })
    it('returns a promise', () => {
      this.promise.should.be.instanceof(Promise)
    })
    it('resolves when robot finished processing', (done) => {
      this.promise.should.eventually.equal('mock result').notify(done)
    })
  })
  describe('.enter', () => {
    it('calls robot receive with enter message', () => {
      this.promise = this.adapter.enter(this.mockUser)
      this.adapter.robot.receive.lastCall.args[0].should.containSubset({
        user: this.mockUser,
        room: this.mockUser.room
      })
    })
    it('returns a promise', () => {
      this.promise.should.be.instanceof(Promise)
    })
    it('resolves when robot finished processing', (done) => {
      this.promise.should.eventually.equal('mock result').notify(done)
    })
  })
  describe('.leave', () => {
    it('calls robot receive with leave message', () => {
      this.promise = this.adapter.leave(this.mockUser)
      this.adapter.robot.receive.lastCall.args[0].should.containSubset({
        user: this.mockUser,
        room: this.mockUser.room
      })
    })
    it('returns a promise', () => {
      this.promise.should.be.instanceof(Promise)
    })
    it('resolves when robot finished processing', (done) => {
      this.promise.should.eventually.equal('mock result').notify(done)
    })
  })
  describe('.sendPrivate', () => {
    it('stores messages in array under user key', () => {
      let envelope = { user: this.mockUser, room: this.mockUser.room }
      this.adapter.sendPrivate(envelope, '...', '...')
      this.adapter.sendPrivate(envelope, 'hello there')
      this.adapter.privateMessages.tester.should.eql([
        '...', '...', 'hello there'
      ])
    })
  })
})
