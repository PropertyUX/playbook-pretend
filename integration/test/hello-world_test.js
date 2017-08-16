const pretend = require('hubot-pretend')
const expect = require('chai').expect

describe('Hello World (js)', function () {
  it('says hello back', function () {
    pretend.read('scripts/hello-world.coffee').start()
    pretend.user('margaret').send('hubot hello').then(function() {
      expect(pretend.messages).to.eql([
        ['margaret', 'hubot hello'],
        ['hubot', '@margaret hello']
      ])
      pretend.robot.shutdown()
    })
  })
})
