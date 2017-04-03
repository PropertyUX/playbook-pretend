Pretend = require '../src/index'
pretend = new Pretend './scripts/enter-leave.coffee'

co = require 'co'
chai = require 'chai'
should = chai.should()

describe 'Enter and Leave', ->

  context 'user entering then leaving the room', ->

    beforeEach ->
      pretend.startup rooms: ['hub']
      co =>
        yield pretend.rooms.hub.enter pretend.user 'Toshi'
        yield pretend.rooms.hub.leave pretend.user 'Toshi'

    it 'greets and farewells the user', ->
      pretend.messages.should.eql [
        ['hub', 'hubot', 'Hi Toshi!']
        ['hub', 'hubot', 'Bye Toshi!']
      ]
