// # Testing logs
//
// Pretend keeps a copy of every* log written by hubot. These can be used to
// make assertions on the behind-the-scenes robot operations.
//
// Currently the log is extended after robot starts, so it might miss a couple
// on load logs.
//
// [See the script being tested here](../scripts/write-logs.html)

import pretend from '../../lib'
import chai from 'chai'
import co from 'co'
chai.should()

describe('Testing logs', () => {
  before(() => {
    pretend.read('test/scripts/write-logs.js')
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
    it('can read from internal array', () => co(function * () {
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
    }))
  })
  context('robot loading writes standard logs', () => {
    it('can assert on errors or warnings', () => {
      let logTypes = pretend.logs.map((log) => log[0])
      logTypes.should.not.include('error').and.not.include('warning')
    })
  })
})
