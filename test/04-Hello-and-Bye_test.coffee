co = require 'co'
chai = require 'chai'
chai.should()

Pretend = require '../src/index'
pretend = new Pretend ['./scripts/hello-world.coffee', './scripts/bye.coffee']

describe 'Hello and Bye (multiple scripts)', ->

  context 'one user says hi, other says bye to hubot', ->

    beforeEach ->
      pretend.startup()
      co =>
        yield pretend.user('alice').send '@hubot hi'
        yield pretend.user('bob').send '@hubot bye'

    it 'replies to each user in kind', ->
      pretend.messages.should.eql [
        ['alice', '@hubot hi']
        ['hubot', '@alice hi']
        ['bob',   '@hubot bye']
        ['hubot', '@bob bye']
      ]
