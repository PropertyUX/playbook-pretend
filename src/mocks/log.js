'use strict'

import log from 'npmlog'

/**
 * Keeps log messages in array.
 *
 * @return {Object} Mock log methods (debug, info, warning, error)
 */
class MockLog {
  constructor (level = 'error') {
    this.logs = []
    log.level = level
    log.heading = '[hubot]'
    log.headingStyle = { fg: 'magenta' }
    log.addLevel('debug', 1000, { fg: 'yellow' }, 'dbug')
    log.addLevel('error', 5000, { fg: 'white', bg: 'red' }, 'ERR!')
  }

  /**
   * Put time in front of all logs
   * @return {string} Current time
   */
  prefix () {
    return new Date().toLocaleTimeString()
  }

  debug (message) {
    this.logs.push(['debug', message])
    log.debug(this.prefix(), message)
  }

  info (message) {
    this.logs.push(['info', message])
    log.info(this.prefix(), message)
  }

  warning (message) {
    this.logs.push(['warning', message])
    log.warn(this.prefix(), message)
  }

  error (message) {
    this.logs.push(['error', message])
    log.error(this.prefix(), message)
  }

  set level (lvl) {
    log.level = lvl
  }
}

export default MockLog
