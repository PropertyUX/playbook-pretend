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
   * Look for a specific message, resolve promise when found or max reached
   * @param  {Int}      [max]      Stop observing and resolve when reached
   * @param  {Array}    [needle]   The message needle ([username, message])
   * @param  {Function} [callback] Run with every messages push
   * @return {Promise}             Promise (bluebird wrapped)
  ###
  when: (args...) ->
    max = args.shift() if _.isInteger args[0]
    needle = args.shift() if _.isArray args[0]
    callback = args.shift() if _.isFunction args[0]
    count = 0
    return new Promise (resolve, reject) =>
      _.observe @messages, 'create', (created) ->
        count++
        if ( needle? and created.join(' ') is needle.join(' ') ) or
        ( max? and count is max )
          callback created if callback?
          _.unobserve()
          resolve created
  
  ###*
   * Look for message matching pattern, resolve promise when found
   * @param  {RegExp}   regex      Message matching pattern
   * @param  {Function} [callback] Run with every messages push
   * @return {Promise}             Promise (bluebird wrapped)
  ###
  whenMatch: (args...) ->
    regex = args.shift() if _.isRegExp args[0]
    callback = args.shift() if _.isFunction args[0]
    return new Promise (resolve, reject) =>
      _.observe @messages, 'create', (created) ->
        match = created.join(' ').match regex
        if match
          callback match if callback?
          _.unobserve()
          resolve match

  ###*
   * Observe and perform action every message (optionally up to a limit)
   * @param  {Int}      [max]      Stop observing and resolve when reached
   * @param  {Function} [callback] Run with every messages push
   * @return {Promise}             Promise (bluebird wrapped)
  ###
  all: (args...) ->
    max = args.shift() if _.isInteger args[0]
    callback = args.shift() if _.isFunction args[0]
    count = 0
    return new Promise (resolve, reject) =>
      _.observe @messages, 'create', (created) ->
        callback created if callback?
        count++
        if max? and max is count
          _.unobserve()
          resolve created

  ###*
   * Stop looking at all (alias for consistent syntax)
  ###
  stop: ->
    _.unobserve()
    return

module.exports = Observer
