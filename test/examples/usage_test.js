import pretend from '../../src/pretend'

describe('pretend', function () {
  describe('Inline Usage', () => {
    it('makes a robot, responds, records messages', () => {
      pretend.start()
      pretend.robot.respond(/hi$/i, res => res.reply('hi'))
      pretend.user('mo').send('hi')
      pretend.messages.should.eql([
        ['mo', 'hi'],
        ['hubot', 'hi']
      ])
    })
  })

  describe('Scripts Usage', () => {
    it('makes a robot, reads and loads scripts, records messages', () => {
      pretend.start()
      pretend.read('../scripts/hello-world.js')
      pretend.user('jo').send('hi')
      pretend.messages.should.eql([
        ['jo', 'hi'],
        ['hubot', 'hi']
      ])
    })
  })

  describe('Pre-Read Usage', () => {
    it('reads scripts, makes a robot, loads scripts, records messages', () => {
      pretend.read('../scripts/hello-world.js')
      pretend.start()
      pretend.user('jo').send('hi')
      pretend.messages.should.eql([
        ['jo', 'hi'],
        ['hubot', 'hi']
      ])
    })
  })
})
