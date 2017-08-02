import pretend from '../../src/modules/pretend'
import chai from 'chai'
chai.should()

/**
 * Examples below show the basic approaches to setting up a robot for testing
 * `pretend.start` initialises the robot and adapter to store messages
 * `pretend.read` loads script files, registering as normal with listeners etc
 * `pretend.user` creates a mock user and provides some helpers (like `send`)
 * `pretend.messages` is an observable array that stores messages to/from robot
 * `pretend.shutdown` closes the robot and reset user/room/message collections
 *
 * Note that sending messages returns a promise, this is resolved when robot
 * (possibly with middleware) has finished processing receiving the message.
 *
 * [see the pretend module docs here]{@link '../../src/modules/pretend.js'}
 */
describe('Using pretend', function () {
  afterEach(() => {
    pretend.shutdown()
  })
  context('by adding listeners directly to robot', () => {
    it('makes a robot, responds, stores messages', () => {
      pretend.start()
      pretend.robot.hear(/hi$/i, res => res.send('hi'))
      pretend.user('mo').send('hi').then(() => {
        pretend.messages.should.eql([
          ['mo', 'hi'],
          ['hubot', 'hi']
        ])
      })
    })
  })
  context('by reading a script into pretend robot', () => {
    it('makes a robot, reads and loads scripts, stores messages', () => {
      pretend.start()
      pretend.read('../scripts/basic-reply.js')
      pretend.user('jo').send('hubot hi').then(() => {
        pretend.messages.should.eql([
          ['jo', 'hubot hi'],
          ['hubot', '@jo hi']
        ])
      })
    })
  })
  context('by reading scripts first, then initialise robot', () => {
    it('reads scripts, makes a robot, loads scripts, stores messages', () => {
      pretend.read('../scripts/basic-reply.js')
      pretend.start()
      pretend.user('jo').send('hubot hi').then(() => {
        pretend.messages.should.eql([
          ['jo', 'hubot hi'],
          ['hubot', '@jo hi']
        ])
      })
    })
  })
})
