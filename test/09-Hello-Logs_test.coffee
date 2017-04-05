chai = require 'chai'
chai.should()

Pretend = require '../src/index'
pretend = new Pretend './scripts/hello-logs.coffee'

describe 'Mock Logs', ->

  context 'user tells robot to write a debug log', ->

    beforeEach ->
      pretend.startup()
      pretend.user('bob').send 'hubot debug'

    it 'writes a debug log', ->
      pretend.logs.pop().should.eql ['debug', 'log debug test']

  context 'user tells robot to write a info log', ->

    beforeEach ->
      pretend.startup()
      pretend.user('bob').send 'hubot info'

    it 'writes a info log', ->
      pretend.logs.pop().should.eql ['info', 'log info test']

  context 'user tells robot to write a warning log', ->

    beforeEach ->
      pretend.startup()
      pretend.user('bob').send 'hubot warning'

    it 'writes a warning log', ->
      pretend.logs.pop().should.eql ['warning', 'log warning test']

  context 'user tells robot to write a error log', ->

    beforeEach ->
      pretend.startup()
      pretend.user('bob').send 'hubot error'

    it 'writes a error log', ->
      pretend.logs.pop().should.eql ['error', 'log error test']
