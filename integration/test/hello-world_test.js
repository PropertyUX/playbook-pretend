const pretend = require('playbook-pretend')
const expect = require('chai').expect

describe('Hello World (js)', () => {
  beforeEach(() => pretend.read('scripts/hello-world.coffee').start())
  afterEach(() => pretend.robot.shutdown())
  it('says hello back', async () => {
    await pretend.user('margaret').send('hubot hello')
    expect(pretend.messages).to.eql([
      ['margaret', 'hubot hello'],
      ['hubot', '@margaret hello']
    ])
  })
})
