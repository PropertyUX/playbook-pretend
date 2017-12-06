'use strict'

const sinon = require('sinon')

class PretendStorage {
  constructor (robot) {
    this.robot = robot
    this.privateCache = {}
    this.connection = sinon.stub()
    return this.connect()
  }

  connect () {
    return Promise.resolve()
  }
}

module.exports = (robot) => new PretendStorage(robot)
