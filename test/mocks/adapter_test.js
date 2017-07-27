import Adapter from '../../src/mocks/adapter'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)
chai.should()

describe('Adapter', function () {
  beforeEach(() => {
    this.robot = {
      server: { close: sinon.spy() },
      receive: sinon.spy(),
      emit: sinon.spy()
    }
    this.adapter = Adapter.use(this.robot)
  })
  afterEach(() => {
    this.adapter.close()
  })

  describe('.send', () => {
    it('records hubot sends in messages', () => {
      this.adapter.send({ room: 'test' }, '...', '...', '...')
      this.adapter.send({ room: 'test' }, 'hello there')
      this.adapter.messages.should.eql([
        [ 'test', 'hubot', '...' ],
        [ 'test', 'hubot', '...' ],
        [ 'test', 'hubot', '...' ],
        [ 'test', 'hubot', 'hello there' ]
      ])
    })
  })

  describe('.reply', () => {
    it('records hubot (@ prepended) replies in messages', () => {
      this.adapter.reply({ room: 'test', user: { name: 'general-kenobi' } }, '!')
      this.adapter.messages.should.eql([
        [ 'test', 'hubot', '@general-kenobi !' ]
      ])
    })
  })
})
