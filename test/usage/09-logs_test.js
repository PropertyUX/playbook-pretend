import pretend from '../../src/modules/pretend'
import chai from 'chai'
chai.should()

/**
 * Pretend keeps a copy of every* log written by hubot. These can be used to
 * make assertions on the behind-the-scenes robot operations.
 *
 * *Currently the log is extended after robot starts, so it might miss a couple
 * on load logs.
 *
 * [see the script being tested here]{@link '../scripts/write-logs.js'}
 */
describe('Reading logs', () => {
  before(() => {
    pretend.read('../scripts/write-logs.js')
  })
  after(() => {
    pretend.clear()
  })
  beforeEach(() => {
    pretend.start()
  })
  afterEach(() => {
    pretend.shutdown()
  })
  context('user triggers log events', () => {
    it('can read from internal array', function * () {
      let latestLogs = []
      pretend.log.level = 'silent'
      yield pretend.user('bob').send('hubot debug')
      latestLogs.push(pretend.logs.slice(-1).pop())
      yield pretend.user('bob').send('hubot info')
      latestLogs.push(pretend.logs.slice(-1).pop())
      yield pretend.user('bob').send('hubot warning')
      latestLogs.push(pretend.logs.slice(-1).pop())
      yield pretend.user('bob').send('hubot error')
      latestLogs.push(pretend.logs.slice(-1).pop())
      latestLogs.should.eql([
        ['debug', 'log debug test'],
        ['info', 'log info test'],
        ['warning', 'log warning test'],
        ['error', 'log error test']
      ])
    })
  })
  context('robot loading writes standard logs', () => {
    it('can assert on errors or warnings', () => {
      let logTypes = pretend.logs.map((log) => log[0])
      logTypes.should.not.include('error').and.not.include('warning')
    })
  })
})
