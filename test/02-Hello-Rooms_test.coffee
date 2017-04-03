Pretend = require '../src/index'
pretend = new Pretend './scripts/hello-world.coffee'

co = require 'co'
chai = require 'chai'
should = chai.should()

describe 'Hello Rooms', ->

  context 'users in different rooms says hi to hubot', ->

    context 'basic usage (setup user vars with room option)', ->

      beforeEach ->
        pretend.startup()
        @alice = pretend.user 'alice', room: 'dining'
        @bob = pretend.user 'bob', room: 'kitchen'
        co =>
          yield @alice.send '@hubot hi'
          yield @bob.send '@hubot hi'

      it 'replies to user in the right room', ->
        pretend.messages.should.eql [
          ['dining',  'alice', '@hubot hi']
          ['dining',  'hubot', '@alice hi']
          ['kitchen', 'bob',   '@hubot hi']
          ['kitchen', 'hubot', '@bob hi']
        ]

    context 'dynamic usage (clone user into room as required)', ->

      beforeEach ->
        pretend.startup()
        @alice = pretend.user 'alice', room: 'dining'
        co =>
          yield @alice.send '@hubot hi'
          yield @alice.in('kitchen').send '@hubot hi'

      it 'replies to user in the right room', ->
        pretend.messages.should.eql [
          ['dining',  'alice', '@hubot hi']
          ['dining',  'hubot', '@alice hi']
          ['kitchen', 'alice', '@hubot hi']
          ['kitchen', 'hubot', '@alice hi']
        ]

    context 'room usage (setup room var to accept users)', ->

      beforeEach ->
        pretend.startup users: ['alice', 'bob']
        @kitchen = pretend.room 'kitchen'
        co =>
          yield @kitchen.receive pretend.users.alice, '@hubot hi'
          yield @kitchen.receive pretend.users.bob, '@hubot hi'

      it 'replies to user in the right room', ->
        pretend.messages.should.eql [
          ['kitchen', 'alice', '@hubot hi']
          ['kitchen', 'hubot', '@alice hi']
          ['kitchen', 'bob',   '@hubot hi']
          ['kitchen', 'hubot', '@bob hi']
        ]

    context 'inline usage (users and rooms as collection properties)', ->

      beforeEach ->
        pretend.startup
          users: ['alice', 'bob']
          rooms: ['kitchen', 'dining']
        co =>
          yield pretend.users.alice.in(pretend.rooms.dining).send '@hubot hi'
          yield pretend.rooms.kitchen.receive pretend.users.bob, '@hubot hi'

      it 'replies to user in the right room', ->
        pretend.messages.should.eql [
          ['dining',  'alice', '@hubot hi']
          ['dining',  'hubot', '@alice hi']
          ['kitchen', 'bob',   '@hubot hi']
          ['kitchen', 'hubot', '@bob hi']
        ]

    context 'filtered usage (separate results by room)', ->

      beforeEach ->
        pretend.startup users: ['bob']
        @garage = pretend.room 'garage'
        @basement = pretend.room 'basement'
        co =>
          yield @garage.receive pretend.users.bob, '@hubot hi'
          yield @basement.receive pretend.users.bob, '@hubot hi'

      it 'returns messages from just first room', ->
        @garage.received().should.eql [
          ['bob',   '@hubot hi']
          ['hubot', '@bob hi']
        ]

      it 'returns messages from just second room', ->
        @basement.received().should.eql [
          ['bob',   '@hubot hi']
          ['hubot', '@bob hi']
        ]
