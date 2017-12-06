pretend = require 'playbook-pretend'
{ expect } = require 'chai'

describe 'Hello World (coffee)', () ->
  it 'says hello back', ->
    pretend.read('scripts/hello-world.coffee').start()
    pretend.user('margaret').send('hubot hello').then () ->
      expect(pretend.messages).to.eql [
        ['margaret', 'hubot hello']
        ['hubot', '@margaret hello']
      ]
      pretend.robot.shutdown()
