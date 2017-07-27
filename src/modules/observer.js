'use strict'

import _ from 'lodash'
import Promise from 'bluebird'

/**
 * Let tests observe additions to an array (of messages)
 */
export default class {
  /**
   * Get observer for array (this.observed should replace the original)
   * @param  {Array} arrayToObserve Array to observe
   * @return {Observer}             Observer containing observed array
   */
  constructor (arrayToObserve = null) {
    this.observers = {}
    if (arrayToObserve != null) this.proxy(arrayToObserve)
  }

  /**
   * Proxy the array to observe value setting
   * Applies only on setting an index (int), not propterties like length
   * @param  {Array} arrayToObserve Array to observe
   * @return {Array}                Observed (proxy) array
   */
  proxy (arrayToObserve) {
    let observers = this.observers
    this.observed = new Proxy(arrayToObserve, {
      get: function (target, property) {
        return target[property]
      },
      set: function (target, property, value, receiver) {
        let propertyIsIndex = Number.isInteger(parseInt(property))
        if (propertyIsIndex) _.map(observers, (cb) => cb.call(this, value))
        target[property] = value
        return true
      }
    })
    return this.observed
  }

  /**
   * Get the observed array
   * @return {Array} Observed (proxy) array
   */
  get () {
    return this.observed
  }

  /**
   * Add a callback to call with any addition to observed array
   * @param  {Function} cb Callback, given new value as argument
   * @return {String}      ID of callback in observer collection (for removing)
   */
  observe (cb) {
    let id = _.uniqueId('observer_')
    this.observers[id] = cb
    return id
  }

  /**
   * Remove a callback from observer collection
   * @param  {String} index ID of callback to remove
   */
  unobserve (index) {
    if (index in this.observers) delete this.observers[index]
  }

  /**
   * Remove all callbacks (reset observer collection)
   */
  unobserveAll () {
    this.observers = {}
  }

  /**
   * Watch for any new element
   * @return {Promise} Resolves with the next value added to observed array
   */
  next () {
    let observerId
    return new Promise((resolve, reject) => {
      observerId = this.observe(resolve)
    }).then((result) => {
      this.unobserve(observerId)
      return {
        next: result,
        observed: this.observed
      }
    })
  }

  /**
   * Look for a specific element (optionally up to limit or with iterator)
   * @param  {Mixed} needle        The element to find (e.g. [username, message])
   * @param  {Int} [max]           Stop observing and resolve when reached
   * @param  {Function} [iterator] Run with every push
   * @return {Promise}             Resolves with result object attributes
   */
  find (...args) {
    let observerId, max, find, iterator
    let count = 0
    if (_.isInteger(args[0])) max = args.shift()
    if (_.isArray(args[0])) find = args.shift()
    if (_.isFunction(args[0])) iterator = args.shift()
    if (max == null && find == null) throw new Error('Must be called with either max or find argument')
    return new Promise((resolve, reject) => {
      observerId = this.observe((value) => {
        count++
        if (iterator != null) iterator(value)
        if (find != null && find.join(' ') === value.join(' ')) resolve(value)
        if ((max != null && count === max)) resolve()
      })
    }).then((result) => {
      this.unobserve(observerId)
      return {
        count: count,
        found: result,
        observed: this.observed
      }
    })
  }

  /**
   * Look for message matching pattern (optionally up to limit or with iterator)
   * @param  {RegExp} regex        Pattern to match on element (forced to string)
   * @param  {Int} [max]           Stop observing and resolve when reached
   * @param  {Function} [iterator] Run with every push
   * @return {Promise}             Resolves with result object attributes
  */
  match (regex, ...args) {
    let observerId, max, iterator
    let count = 0
    if (_.isInteger(args[0])) max = args.shift()
    if (_.isFunction(args[0])) iterator = args.shift()
    return new Promise((resolve, reject) => {
      observerId = this.observe((value) => {
        count++
        if (iterator != null) iterator(value)
        let match = value.join(' ').match(regex)
        if (match) resolve(match)
        if ((max != null && count === max)) resolve()
      })
    }).then((result) => {
      this.unobserve(observerId)
      return {
        count: count,
        match: result,
        observed: this.observed
      }
    })
  }

  /**
   * Observe all additions, up to limit or with iterator (must have either)
   * @param  {Int} [max]           Stop observing and resolve when reached
   * @param  {Function} [iterator] Run with every push
   * @return {Promise}             Resolves with result object attributes
   */
  all (...args) {
    let observerId, max, iterator
    let count = 0
    if (_.isInteger(args[0])) max = args.shift()
    if (_.isFunction(args[0])) iterator = args.shift()
    if (iterator == null && max == null) throw new Error('Must be called with either max or iterator')
    return new Promise((resolve, reject) => {
      observerId = this.observe((value) => {
        count++
        if (iterator != null) iterator(value)
        if ((max != null && count === max)) resolve()
      })
    }).then((result) => {
      this.unobserve(observerId)
      return {
        count: count,
        observed: this.observed
      }
    })
  }
}
