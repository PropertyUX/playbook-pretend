'use strict'

/**
 * Mock log, keeps log messages in array
 */
export default class {
  /**
   * Create a new log
   * @return {Object} Mock log methods (debug, info, warning, error)
   */
  constructor () {
    this.logs = []
  }

  debug (message) {
    this.logs.push(['debug', message])
  }

  info (message) {
    this.logs.push(['info', message])
  }

  warning (message) {
    this.logs.push(['warning', message])
  }

  error (message) {
    this.logs.push(['error', message])
  }
}
