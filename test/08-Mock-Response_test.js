import co from 'co'
import chai from 'chai'
import Pretend from '../src'
chai.should()

const pretend = new Pretend('./scripts/mock-response.js')

class NewResponse extends pretend.Response {
  random (items) {
    return 3
  }
}

describe('Mock Response', () => {
  context('user says "give me a random" number to hubot', () => {})

  beforeEach(() => {
    pretend.Response = NewResponse
    pretend.startup()
    return co(
      function * () {
        yield pretend.user('alice').send('@hubot give me a random number')
        yield pretend.user('bob').send('@hubot give me a random number')
      }
    )
  })

  it('replies to user with a random number', () =>
    pretend.messages.should.eql([['alice', '@hubot give me a random number'], ['hubot', '@alice 3'], ['bob', '@hubot give me a random number'], ['hubot', '@bob 3']])
  )
})
