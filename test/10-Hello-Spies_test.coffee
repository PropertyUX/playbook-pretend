co = require 'co'
sinon = require 'sinon'
chai = require 'chai'
chai.use require 'sinon-chai'
chai.should()

Pretend = require '../src/index'
pretend = new Pretend './scripts/hello-world.coffee'

describe 'Hello Spies', ->

  beforeEach ->
    pretend.startup()

  context 'after startup', ->

    it 'loads given script path and file into hubot', ->
      path = sinon.match new RegExp /scripts$/
      file = 'hello-world.coffee'
      pretend.robot.loadFile.lastCall.should.have.calledWith path, file

    it 'set up a listener to respond to hi', ->
      pattern = /hi$/i
      callback = sinon.match.func
      pretend.robot.respond.lastCall.should.have.calledWith pattern, callback

  context 'two users say hi to hubot', ->

    beforeEach ->
      @alice = pretend.user 'alice'
      @bob = pretend.user 'bob'
      co =>
        yield @alice.send '@hubot hi'
        yield @bob.send '@hubot hi'

    it 'received both messages', ->
      pretend.robot.receive.should.have.calledTwice
