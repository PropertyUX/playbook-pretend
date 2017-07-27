import Robot from '../../src/modules/robot'
import { TextMessage, User } from 'hubot-async/es2015'
import MockLog from '../../src/mocks/log'
import chai from 'chai'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)
chai.should()

/**
 * Some tests below require mocha-co to process generator functions
 * Generators (unlike arrow functions) set their own scope, use _this instead
 * @type {Object}
 */
let _this

describe('Robot', function () {
  beforeEach(() => {
    _this = this
    this.robot = new Robot()
  })
  afterEach(() => {
    this.robot.shutdown()
  })
  describe('constructor', () => {
    it('uses mock adapter', () => {
      this.robot.adapter.name.should.equal('pretend')
    })
    it('uses mock log', () => {
      this.robot.logger.should.instanceof(MockLog)
    })
    it('methods are spies', () => {
      this.robot.load()
      this.robot.load.should.have.calledWith()
    })
  })
  describe('middleware', () => {
    it('stores incoming (matched) responses', function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      _this.robot.hear(/.*/, () => {})
      yield _this.robot.receive(message)
      _this.robot.responses.incoming[0].message.should.eql(message)
    })
    it('stores outgoing (sent) responses', function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      _this.robot.hear(/.*/, (res) => res.reply('hello there'))
      yield _this.robot.receive(message)
      _this.robot.responses.outgoing[0].message.should.eql(message)
    })
  })
  describe('.emit', () => {
    it('stores emitted evetns', () => {
      this.robot.emit('ping', 'testing 1', 'testing 2')
      this.robot.emit('pong', 'testing 3', 'testing 4')
      this.robot.eventLog.should.eql([
        ['ping', ['testing 1', 'testing 2']],
        ['pong', ['testing 3', 'testing 4']]
      ])
    })
    it('still emits normmally', (done) => {
      this.robot.on('ping', done)
      this.robot.emit('ping')
    })
  })
})
