'use strict'

// Pretend modules
const Robot = require('./robot')
const Adapter = require('./adapter')
const Response = require('./response')
const Observer = require('./observer')
const User = require('./user')
const Room = require('./room')

// Original modules
const {
  Logger,
  Brain,
  Listener,
  TextListener,
  Message,
  TextMessage,
  EnterMessage,
  LeaveMessage,
  TopicMessage,
  CatchAllMessage
} = require('nubot')

const modules = {
  Robot,
  Adapter,
  Response,
  Observer,
  User,
  Room,
  Logger,
  Brain,
  Listener,
  TextListener,
  Message,
  TextMessage,
  EnterMessage,
  LeaveMessage,
  TopicMessage,
  CatchAllMessage
}

module.exports = modules
