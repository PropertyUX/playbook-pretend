import Robot from '../../src/modules/robot'
import { TextMessage, User } from 'hubot-async/es2015'
import MockLog from '../../src/mocks/log'
import co from 'co'
import path from 'path'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)
chai.should()

/**
 * Some tests below use generators that (unlike arrow functions) set block
 * scope, so we `let` that here to allow inheriting in each function's scope.
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
    it('stores received responses', () => co(function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      yield robot.receive(message)
      robot.responses.receive[0].message.should.eql(message)
    }))
    it('stores listen (matched) responses', () => co(function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      robot.hear(/.*/, () => {})
      yield robot.receive(message)
      robot.responses.listen[0].message.should.eql(message)
    }))
    it('stores respond (sent) responses', () => co(function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      robot.hear(/.*/, (res) => res.reply('hello there'))
      yield robot.receive(message)
      robot.responses.respond[0].message.should.eql(message)
    }))
    it('processes any further middleware as normmal', () => co(function * () {
      let user = new User(111, {name: 'tester'})
      let message = new TextMessage(user, 'testing', 999)
      let middlewareSpy = sinon.spy()
      robot.responseMiddleware((context, next, done) => {
        middlewareSpy(context)
        next()
      })
      robot.hear(/.*/, (res) => res.reply('hello there'))
      yield robot.receive(message)
      middlewareSpy.lastCall.should.have.calledWith({
        'response': robot.responses.respond[0],
        'strings': ['hello there'],
        'method': 'reply',
        'plaintext': true
      })
    }))
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
