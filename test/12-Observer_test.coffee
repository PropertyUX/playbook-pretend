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
    @tester = pretend.user 'tester'

  afterEach ->
    pretend.shutdown()

  context 'Wait for the next message to appear', ->

    beforeEach (done) ->
      co =>
        yield @tester.send 'test'
        pretend.observer.next().then (@msg) => done()
        yield @tester.send '1'
        yield @tester.send '2'
      return

    it 'resolves a promise with the next message after setup', ->
      @msg.should.eql ['tester', '1']

    it 'did not continue with further messages', ->
      pretend.messages.pop().should.not.eql ['tester', '2']

  context 'Loop until a specific message appears', ->

    beforeEach ->
      @found = ''
      @needle = ['hubot', '@tester I got you!']
      @wait = pretend.observer.when @needle, (msg) => @found = msg
      co =>
        yield @tester.send 'hubot play'
        yield @tester.send 'polo' while @wait.isPending()

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
      co => yield @tester.send "#{ i }..." for i in [1..5]
    
    it 'resolves only when limit reached', ->
      @found.should.eql ['tester', '3...']
  
  context 'Loop until a specific message within limit', ->
    
    beforeEach ->
      @found = ''
      pretend.observer.when 6, ['tester', '3...'], (msg) =>
        @found = msg
      co => yield @tester.send "#{ i }..." for i in [1..5]
    
    it 'resolves when found (before limit reached)', ->
      @found.should.eql ['tester', '3...']
 
  context 'Wait for a message matching a pattern', ->
    
    beforeEach ->
      pretend.robot.messageRoom 'hide', 'count to ten'
      pretend.observer.whenMatch /\d\d/
      .then -> pretend.robot.messageRoom 'hide', 'ok im coming'
      co =>
        yield @tester.in('hide').send '1'
        yield @tester.in('hide').send '2'
        yield @tester.in('hide').send '10'
    
    it 'resolved when the message matched', ->
      pretend.messages.should.eql [
        ['hide', 'hubot', 'count to ten']
        ['hide', 'tester', '1']
        ['hide', 'tester', '2']
        ['hide', 'tester', '10']
        ['hide', 'hubot', 'ok im coming']
      ]

  context 'Do something with each message sent', ->

    beforeEach ->
      @msgs = ''
      pretend.observer.all (msg) => @msgs += msg[1]
      co => yield @tester.send i for i in [1..5]

    it 'observed the series of messages', ->
      @msgs.should.eql '12345'
  
  context 'Do something with a given number of messages', ->
    
    beforeEach ->
      @msgs = ''
      pretend.observer.all 3, (msg) => @msgs += msg[1]
      co => yield @tester.send i for i in [1..5]
    
    it 'observed up to given limit of messages', ->
      @msgs.should.eql '123'
  
  context 'with subsequent observers', ->
    
    beforeEach ->
      @msgs = []
      wait = pretend.observer.next().then (msg) => @msgs.push msg
      .then =>
        wait = pretend.observer.next().then (msg) => @msgs.push msg
        @tester.send 'hello father'
        return wait
      @tester.send 'hello mother'
      return wait
    
    it 'did not throw (from re-observing)', ->
      pretend.observer.next.should.not.throw
    
    it 'observed messages in the correct order', ->
      @msgs.should.eql [
        ['tester', 'hello mother']
        ['tester', 'hello father']
      ]
  
  context 'observing both sent and received messages', ->
    
    beforeEach ->
      @msgs = []
      wait = pretend.observer.all 5, (msg) => @msgs.push msg
      @tester.in('testing').send 'receive 1'
      .then ->
        pretend.responses.incoming[0].reply 'reply 2'
        pretend.responses.incoming[0].send 'send 3'
        pretend.robot.messageRoom 'testing', 'room 4'
        pretend.robot.send room: 'testing', 'envelope 5'
      return wait
    
    # TODO: try work promises into middleware and yield to put messages in order
    it 'observed all messages', ->
      @msgs.should.include.deep.members [
        [ 'testing', 'tester', 'receive 1' ]
        [ 'testing', 'hubot', '@tester reply 2' ]
        [ 'testing', 'hubot', 'send 3' ]
        [ 'testing', 'hubot', 'room 4' ]
        [ 'testing', 'hubot', 'envelope 5' ]
      ]
  
  context 'observing both sent and received messages (alternate method)', ->
    
    beforeEach ->
      wait = pretend.observer.when 5
      @tester.in('testing').send 'receive 1'
      .then ->
        pretend.responses.incoming[0].reply 'reply 2'
        pretend.responses.incoming[0].send 'send 3'
        pretend.robot.messageRoom 'testing', 'room 4'
        pretend.robot.send room: 'testing', 'envelope 5'
      return wait
    
    it 'observed all messages', ->
      pretend.messages.should.include.deep.members [
        [ 'testing', 'tester', 'receive 1' ]
        [ 'testing', 'hubot', '@tester reply 2' ]
        [ 'testing', 'hubot', 'send 3' ]
        [ 'testing', 'hubot', 'room 4' ]
        [ 'testing', 'hubot', 'envelope 5' ]
      ]