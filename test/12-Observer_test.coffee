co = require 'co'
sinon = require 'sinon'
chai = require 'chai'
chai.use require 'sinon-chai'
chai.should()

Pretend = require '../src/index'
pretend = new Pretend './scripts/random-messages.coffee'

describe 'Message Observer', ->

  beforeEach ->
    pretend.startup()

  afterEach ->
    pretend.shutdown()

  context 'Wait for the next message to appear', ->

    beforeEach (done) ->
      co =>
        yield pretend.user('test').send 'testing'
        pretend.observer.next().then (@msg) => done()
        yield pretend.user('test').send '1'
        yield pretend.user('test').send '2'
      return

    it 'resolves a promise with the next message after setup', ->
      @msg.should.eql ['test', '1']

    it 'did not continue with further messages', ->
      pretend.messages.pop().should.not.eql ['test', '2']

  context 'Loop until a specific message appears', ->

    beforeEach ->
      @found = ''
      @needle = ['hubot', '@player I got you!']
      @player = pretend.user 'player'
      @wait = pretend.observer.when @needle, (msg) => @found = msg
      co =>
        yield @player.send 'hubot play'
        yield @player.send 'polo' while @wait.isPending()

    it 'resolved after at least one round', ->
      pretend.messages.length.should.be.gt 3

    it 'resolved in a probable number of rounds', ->
      pretend.messages.length.should.be.lt 60
    
    it 'resolved with the message it was looking for', ->
      @found.should.eql @needle
  
  context 'Loop until a given number of messages', ->
    
    beforeEach ->
      @found = ''
      pretend.observer.when 3, (msg) => @found = msg
      co -> yield pretend.user('test').send "#{ i }..." for i in [1..5]
    
    it 'resolves only when limit reached', ->
      @found.should.eql ['test', '3...']
  
  context 'Loop until a specific message within limit', ->
    
    beforeEach ->
      @found = ''
      pretend.observer.when 6, ['test', '3...'], (msg) => @found = msg
      co -> yield pretend.user('test').send "#{ i }..." for i in [1..5]
    
    it 'resolves when found (before limit reached)', ->
      @found.should.eql ['test', '3...']
 
  context 'Wait for a message matching a pattern', ->
    
    beforeEach ->
      @player = pretend.user 'player', room: 'hide'
      pretend.robot.messageRoom 'hide', 'count to ten'
      pretend.observer.whenMatch /\d\d/
      .then -> pretend.robot.messageRoom 'hide', 'ok im coming'
      co =>
        yield @player.send '1'
        yield @player.send '2'
        yield @player.send '10'
    
    it 'resolved when the message matched', ->
      pretend.messages.should.eql [
        ['hide', 'hubot', 'count to ten']
        ['hide', 'player', '1']
        ['hide', 'player', '2']
        ['hide', 'player', '10']
        ['hide', 'hubot', 'ok im coming']
      ]

  context 'Do something with each message sent', ->

    beforeEach ->
      @msgs = ''
      pretend.observer.all (msg) => @msgs += msg[1]
      co -> yield pretend.user('test').send i for i in [1..5]

    it 'observed the series of messages', ->
      @msgs.should.eql '12345'
  
  context 'Do something with a given number of messages', ->
    
    beforeEach ->
      @msgs = ''
      pretend.observer.all 3, (msg) => @msgs += msg[1]
      co -> yield pretend.user('test').send i for i in [1..5]
    
    it 'observed up to given limit of messages', ->
      @msgs.should.eql '123'