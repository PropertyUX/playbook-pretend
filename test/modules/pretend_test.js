import pretend from '../../src/modules/pretend'
import Robot from '../../src/modules/robot'
import chai from 'chai'
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
      pretend.start()
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
  })
  describe('.read', () => {
    it('readss in script files', () => {
      pretend.read('../scripts/hello-world.coffee').scripts[0].should.have.keys('path', 'file')
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

})
