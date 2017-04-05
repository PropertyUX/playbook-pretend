chai = require 'chai'
chai.should()

Pretend = require '../src/index'
pretend = new Pretend './scripts/private-message.coffee'

describe 'private-message', ->

  context 'user asks hubot for a secret', ->

    beforeEach ->
      pretend.startup()
      pretend.user('alice').send '@hubot tell me a secret'

    it 'does not post to the originating room', ->
      pretend.messages.should.eql [
        ['alice', '@hubot tell me a secret']
      ]

    it 'private messages user', ->
      pretend.adapter.privateMessages.should.eql {
        'alice': [
          ['hubot', 'whisper whisper whisper']
        ]
      }
