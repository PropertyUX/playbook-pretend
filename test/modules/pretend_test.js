import pretend from '../../src/modules/pretend'
import Robot from '../../src/modules/robot'
import path from 'path'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiThings from 'chai-things'
chai.use(sinonChai)
chai.use(chaiThings)
chai.should()

describe('Pretend', function () {
  afterEach(() => {
    pretend.shutdown()
  })
  describe('.start', () => {
    beforeEach(() => {
      pretend.start({ httpd: true })
    })
    it('has a pretend robot', () => {
      pretend.robot.should.be.instanceof(Robot)
    })
    it('messages are accessable', () => {
      pretend.messages.should.eql(pretend.robot.adapter.messages)
    })
    it('logs are accessable', () => {
      pretend.logs.should.eql(pretend.robot.logger.logs)
    })
    it('responses are accessable', () => {
      pretend.responses.should.eql(pretend.robot.responses)
    })
    it('events are accessable', () => {
      pretend.events.should.eql(pretend.robot.eventLog)
    })
    it('http is accessable', () => {
      pretend.http.should.eql(pretend.robot.http)
    })
  })
  describe('.read', () => {
    it('readss in script files', () => {
      let fullpath = path.resolve('test/scripts/basic-reply.js')
      pretend.read(fullpath).scripts[0].should.eql({
        path: path.dirname(fullpath),
        file: path.basename(fullpath)
      })
    })
    it('reads in script directory', () => {
      pretend.read('../scripts').scripts.should.all.have.keys('path', 'file')
    })
  })
  describe('.load', () => {
    it('robot loads each script once only', () => {
      pretend.start()
      pretend.read('../scripts')
      pretend.load()
      pretend.robot.loadFile.callCount.should.equal(pretend.scripts.length)
    })
  })
  describe('shutdown', () => {
    it('calls robot shutdown', () => {
      pretend.start()
      let robot = pretend.robot
      pretend.shutdown()
      robot.shutdown.should.have.calledWith()
    })
  })
  describe('.user', () => {
    it('stores new user if unknown', () => {
      let testUser = pretend.user('tester')
      pretend.users.tester.should.eql(testUser)
    })
    it('returns existing user if known', () => {
      let testUser = pretend.user('tester')
      pretend.user('tester').should.eql(testUser)
    })
    it('has helper methods routing to adapter', () => {
      let testUser = pretend.user('tester')
      Object.keys(testUser).should.include.members(['send', 'enter', 'leave', 'privates'])
    })
    context('helpers', () => {
      beforeEach(() => {
        pretend.start({ rooms: ['testing'], users: ['tester'] })
        pretend.users.tester.room = 'testing'
        sinon.stub(pretend.adapter, 'receive')
        sinon.stub(pretend.adapter, 'enter')
        sinon.stub(pretend.adapter, 'leave')
      })
      afterEach(() => {
        pretend.shutdown()
      })
      describe('.send', () => {
        it('calls adapter receive with user', () => {
          pretend.users.tester.send('hi')
          pretend.adapter.receive.should.have.calledWith(pretend.users.tester, 'hi')
        })
      })
      describe('.enter', () => {
        it('calls adapter enter with user', () => {
          pretend.users.tester.enter()
          pretend.adapter.enter.should.have.calledWith(pretend.users.tester)
        })
      })
      describe('.leave', () => {
        it('calls adapter leave with user', () => {
          pretend.users.tester.leave()
          pretend.adapter.leave.should.have.calledWith(pretend.users.tester)
        })
      })
      describe('.privates', () => {
        it('returns adapter private messages for user', () => {
          pretend.adapter.privateMessages = {
            'tester': ['private message to user'],
            'not-tester': ['private message to another user']
          }
          pretend.users.tester.privates().should.eql(['private message to user'])
        })
      })
    })
  })
  describe('room', () => {
    it('stores new room if unknown', () => {
      let testRoom = pretend.room('testing')
      pretend.rooms.testing.should.eql(testRoom)
    })
    it('returns existing room if known', () => {
      let testRoom = pretend.room('testing')
      pretend.room('testing').should.eql(testRoom)
    })
    it('has helper methods routing to adapter', () => {
      let testRoom = pretend.room('testing')
      Object.keys(testRoom).should.include.members(['messages', 'receive', 'enter', 'leave'])
    })
    context('helpers', () => {
      beforeEach(() => {
        pretend.start({ rooms: ['A', 'B'], users: ['tester'] })
        pretend.users.tester.room = 'A'
        pretend.adapter.messages = [
          ['A', 'tester', 'hubot hi'],
          ['A', 'hubot', 'tester hi'],
          ['B', 'tester', 'just testing']
        ]
        sinon.stub(pretend.adapter, 'receive')
        sinon.stub(pretend.adapter, 'enter')
        sinon.stub(pretend.adapter, 'leave')
      })
      afterEach(() => {
        pretend.shutdown()
      })
      describe('.messages', () => {
        it('returns adapter messages for room', () => {
          pretend.rooms.B.messages().should.eql([
            ['tester', 'just testing']
          ])
        })
      })
      describe('receive', () => {
        it('calls adapter receive with user in room', () => {
          pretend.rooms.B.receive(pretend.users.tester, 'hi')
          pretend.adapter.receive.should.have.calledWith(pretend.users.tester.in('B'), 'hi')
        })
      })
      describe('enter', () => {
        it('calls adapter enter with user in room', () => {
          pretend.rooms.B.enter(pretend.users.tester)
          pretend.adapter.enter.should.have.calledWith(pretend.users.tester.in('B'))
        })
      })
      describe('leave', () => {
        it('calls adapter leave with user in room', () => {
          pretend.rooms.B.leave(pretend.users.tester)
          pretend.adapter.leave.should.have.calledWith(pretend.users.tester.in('B'))
        })
      })
    })
  })
})
