co = require 'co'
sinon = require 'sinon'
chai = require 'chai'
chai.use require 'sinon-chai'
chai.should()

Pretend = require '../src/index'
pretend = new Pretend './scripts/hello-world.coffee'

describe 'Middleware and Responses', ->

  beforeEach ->
    pretend.startup()
    pretend.robot.on 'receive', (context) =>
      @inRes = context.response
      @user = context.response.message.user
    pretend.robot.on 'listen', (context) =>
      @match = context.response.match
    pretend.robot.on 'respond', (context) =>
      @outRes = context.response
      @method = context.method
      @strings = context.strings

  context 'user says hi to hubot', ->

    beforeEach ->
      @alice = pretend.user 'alice'
      @alice.send 'hubot hi'

    it 'received the message from the user', ->
      @user.should.eql @alice

    it 'matched the whole message', ->
      @match[0].should.eql 'hubot hi'

    it 'said hi in response', ->
      @strings.should.eql ['hi']

    it 'sent to room using reply method', ->
      @method.should.eql 'reply'

    it 'stored the incoming response object', ->
      pretend.responses.incoming[0].should.eql @inRes

    it 'stored the outgoing response object', ->
      pretend.responses.outgoing[0].should.eql @outRes

    it 'spied on the reply call from robot response', ->
      @outRes.reply.should.have.calledWith @strings[0]
