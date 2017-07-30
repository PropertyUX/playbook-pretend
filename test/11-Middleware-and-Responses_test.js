import chai from 'chai'
import Pretend from '../src'
chai.should()

const pretend = new Pretend('./scripts/hello-world.coffee')

describe('Middleware and Responses', () => {
  beforeEach(() => {
    pretend.startup()
    pretend.robot.on('receive', ({ response }) => {
      this.inRes = response
      this.user = response.message.user
    })
    pretend.robot.on('listen', ({ response }) => {
      this.match = response.match
    })
    pretend.robot.on('respond', ({ response, method, strings }) => {
      this.outRes = response
      this.method = method
      this.strings = strings
    })
  })

  context('user says hi to hubot', () => {
    beforeEach(() => {
      this.alice = pretend.user('alice')
      this.alice.send('hubot hi')
    })

    it('received the message from the user', () =>
      this.user.should.eql(this.alice)
    )

    it('matched the whole message', () =>
      this.match[0].should.eql('hubot hi')
    )

    it('said hi in response', () =>
      this.strings.should.eql(['hi'])
    )

    it('sent to room using reply method', () =>
      this.method.should.eql('reply')
    )

    it('stored the incoming response object', () =>
      pretend.responses.incoming[0].should.eql(this.inRes)
    )

    it('stored the outgoing response object', () =>
      pretend.responses.outgoing[0].should.eql(this.outRes)
    )

    it('spied on the reply call from robot response', () =>
      this.outRes.reply.should.have.calledWith(this.strings[0])
    )
  })
})
