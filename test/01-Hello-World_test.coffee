Pretend = require '../src/index'
pretend = new Pretend './scripts/hello-world.coffee'

co = require 'co'
chai = require 'chai'
should = chai.should()

describe 'Hello World', ->

  context 'two users say hi to hubot', ->

    before ->
      @expectedMessages = [
        ['alice', '@hubot hi']
        ['hubot', '@alice hi']
        ['bob',   '@hubot hi']
        ['hubot', '@bob hi']
      ]

    context 'basic usage (setup user vars)', ->

      beforeEach ->
        pretend.startup()
        @alice = pretend.user 'alice'
        @bob = pretend.user 'bob'
        co =>
          yield @alice.send '@hubot hi'
          yield @bob.send '@hubot hi'

      it 'replies to each', ->
        pretend.messages.should.eql @expectedMessages

    context 'inline usage (users as collection on startup)', ->

      beforeEach ->
        pretend.startup users: ['alice', 'bob']
        co =>
          yield pretend.users['alice'].send '@hubot hi' # works as array key
          yield pretend.users.bob.send '@hubot hi' # and attribute if valid name

      it 'replies to user', ->
        pretend.messages.should.eql @expectedMessages

    context 'dynamic usage (users created as required)', ->

      beforeEach ->
        pretend.startup users: ['bob']
        co =>
          yield pretend.user('alice').send '@hubot hi' # creates and sends in one
          yield pretend.user('bob').send '@hubot hi' # works for existing users

      it 'replies to user', ->
        pretend.messages.should.eql @expectedMessages
