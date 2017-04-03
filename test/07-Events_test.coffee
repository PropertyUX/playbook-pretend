Pretend = require '../src/index'
pretend = new Pretend './scripts/events.coffee'

chai = require 'chai'
should = chai.should()

describe 'Events', ->

  context 'emit event manually for hubot', ->

    beforeEach ->
      pretend.startup()
      pretend.adapter.robotEvent 'some-event', 'event', 'data'

    it 'messages the room', ->
      pretend.messages.should.eql [
        ['hub', 'hubot', 'got event with event data']
      ]

  context 'hubot emits event on listener match', ->

    beforeEach ->
      pretend.startup()
      pretend.robot.on 'response-event', (event) => @response = event.content
      pretend.user('bob').send '@hubot send event'

    it 'triggers an event', ->
      @response.should.eql 'hello'
