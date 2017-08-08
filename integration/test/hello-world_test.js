const pretend = require('hubot-pretend')
const { expect } = require('chai')

describe('Hello World', function () {
  it('says hello back', function (done) {
    pretend.read('scripts/hello-world.coffee').start()
    pretend.user('margaret').send('hubot hello').then(function() {
      expect(pretend.messages).to.eql([
        ['margaret', 'hubot hello'],
        ['hubot', '@margaret hello']
      ])
      done()
      pretend.robot.shutdown()
    })
  })
})
