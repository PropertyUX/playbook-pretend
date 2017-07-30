import co from 'co'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import Pretend from '../src'
chai.use(sinonChai)
chai.should()

const pretend = new Pretend('./scripts/hello-world.coffee')

describe('Hello Spies', () => {
  beforeEach(() => pretend.startup())

  context('after startup', () => {
    it('loads given script path and file into hubot', () => {
      const path = sinon.match(new RegExp(/scripts$/))
      const file = 'hello-world.coffee'
      return pretend.robot.loadFile.lastCall.should.have.calledWith(path, file)
    })

    it('set up a listener to respond to hi', () => {
      const pattern = /hi$/i
      const callback = sinon.match.func
      return pretend.robot.respond.lastCall.should.have.calledWith(pattern, callback)
    })
  })

  context('two users say hi to hubot', () => {
    beforeEach(() => {
      this.alice = pretend.user('alice')
      this.bob = pretend.user('bob')
      return co(
        function * () {
          yield this.alice.send('@hubot hi')
          yield this.bob.send('@hubot hi')
        }.bind(this)
      )
    })

    it('received both messages', () =>
      pretend.robot.receive.should.have.calledTwice
    )
  })
})
