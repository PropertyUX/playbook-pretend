import Robot from '../../src/modules/robot'
import { TextMessage, User } from 'hubot-async/es2015'
import MockLog from '../../src/mocks/log'
import path from 'path'
import chai from 'chai'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)
chai.should()

/**
 * Some tests below require mocha-co to process generator functions
 * Generators (unlike arrow functions) set block scope so we inherit robot
 * @type {Object}
 */
let robot

describe('Robot', function () {
  beforeEach(() => {
    robot = new Robot()
  })
  afterEach(() => {
    robot.shutdown()
  })
  describe('constructor', () => {
    it('uses mock adapter', () => {
      robot.adapter.name.should.equal('pretend')
    })
    it('uses mock log', () => {
      robot.logger.should.instanceof(MockLog)
    })
    it('methods are spies', () => {
      robot.load()
      robot.load.should.have.calledWith()
    })
  })
  describe('middleware', () => {
    it('stores incoming (matched) responses', function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      robot.hear(/.*/, () => {})
      yield robot.receive(message)
      robot.responses.incoming[0].message.should.eql(message)
    })
    it('stores outgoing (sent) responses', function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      robot.hear(/.*/, (res) => res.reply('hello there'))
      yield robot.receive(message)
      robot.responses.outgoing[0].message.should.eql(message)
    })
  })
  describe('.loadFile', () => {
    it('stores the file reference', () => {
      let filepath = path.resolve('test/scripts')
      let filename = 'basic-reply.js'
      robot.loadFile(filepath, filename)
      robot.loaded.shift(-1).should.eql({ path: filepath, file: filename })
    })
    it('loads js files normmally', () => {
      let filepath = path.resolve('test/scripts')
      let filename = 'basic-reply.js'
      robot.loadFile(filepath, filename)
      robot.parseHelp.should.have.calledWith(path.join(filepath, filename))
    })
    it('loads coffee files normmally', () => {
      let filepath = path.resolve('test/scripts')
      let filename = 'legacy-reply.coffee'
      robot.loadFile(filepath, filename)
      robot.parseHelp.should.have.calledWith(path.join(filepath, filename))
    })
  })
  describe('.emit', () => {
    it('stores emitted evetns', () => {
      robot.emit('ping', 'testing 1', 'testing 2')
      robot.emit('pong', 'testing 3', 'testing 4')
      robot.eventLog.should.eql([
        ['ping', ['testing 1', 'testing 2']],
        ['pong', ['testing 3', 'testing 4']]
      ])
    })
    it('emits normmally', (done) => {
      robot.on('ping', done)
      robot.emit('ping')
    })
  })
})
