import pretend from '../../src/modules/pretend'
import chai from 'chai'
chai.should()

/**
 * Examples below show the basic approaches to setting up a robot for testing
 * `pretend.read` read script file/s that will be loaded by robot on start
 * `pretend.start` initialises the robot and adapter to store messages
 * `pretend.user` creates a mock user and provides some helpers (like `send`)
 * `pretend.messages` is an observable array that stores messages to/from robot
 * `pretend.shutdown` closes the robot and reset user/room/message collections
 * `pretend clear` clear scripts memory to ensure nothing loaded on next start
 *
 * `.read()` `.start()` `.shutdown()` `.clear()` methods can all be chained.
 * `.start` optionally accepts script/s path and will pass to `read` internally.
 *
 * Script reading is seperated from start/shutdown for efficiency of multiple
 * tests on the same script. Using `.clear()` is only required if consecutive
 * tests will conflict with previously read scripts.
 *
 * Note that sending messages returns a promise, this is resolved when robot
 * (possibly with middleware) has finished processing receiving the message.
 *
 * [see the pretend module docs here]{@link '../../src/modules/pretend.js'}
 */
describe('Using pretend', function () {
  afterEach(() => {
    pretend.shutdown().clear()
  })
  context('by adding listeners directly to robot', () => {
    it('makes a robot, responds, stores messages', (done) => {
      pretend.start()
      pretend.robot.hear(/hi$/i, res => res.send('hi'))
      pretend.user('mo').send('hi').then(() => {
        pretend.messages.should.eql([
          ['mo', 'hi'],
          ['hubot', 'hi']
        ])
        done()
      })
    })
  })
  context('by reading a script into pretend robot', () => {
    it('makes a robot, reads and loads scripts, stores messages', (done) => {
      pretend.start()
      pretend.read('../scripts/basic-reply.js')
      pretend.user('jo').send('hubot hi').then(() => {
        pretend.messages.should.eql([
          ['jo', 'hubot hi'],
          ['hubot', '@jo hi']
        ])
        done()
      })
    })
  })
  context('by reading scripts first, then initialise robot', () => {
    it('reads scripts, makes a robot, loads scripts, stores messages', (done) => {
      pretend.read('../scripts/basic-reply.js')
      pretend.start()
      pretend.user('jo').send('hubot hi').then(() => {
        pretend.messages.should.eql([
          ['jo', 'hubot hi'],
          ['hubot', '@jo hi']
        ])
        done()
      })
    })
  })
})
