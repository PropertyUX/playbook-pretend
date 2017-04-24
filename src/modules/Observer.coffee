_ = require 'lodash'
sinon = require 'sinon'
Promise = require 'bluebird'
require('../vendor/mennovanslooten/underscore-observe.js')(_) # extends lodash

###*
 * Observer lets tests watch for message events
 * @param  {Array} @messages Array of messages
###
class Observer
  constructor: (@messages) -> return

  ###*
   * Look for any new message
   * @return {Promise}  Promise, resolving when found
  ###
  next: ->
    return new Promise (resolve, reject) =>
      start = @messages.length
      _.observe @messages, 'create', (created) =>
        if @messages.length > start
          _.unobserve()
          resolve created

  ###*
   * Look for a specific message (resolve promise when found)
   * @param  {String} message The message needle
   * @return null
  ###
  when: (message) ->
    return new Promise (resolve, reject) =>
      _.observe @messages, 'create', (created) =>
        resolve _.unobserve() if message.toString() is created.toString()

  ###*
   * Run callback with every messages push
   * @param  {Function} cb Callback
  ###
  all: (cb) ->
    _.observe @messages, 'create', (created) -> cb created # every time
    return

  ###*
   * Stop looking at all (alias for consistent syntax)
  ###
  stop: ->
    _.unobserve()
    return

module.exports = Observer
