import Observer from '../../src/modules/observer'
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiPromise from 'chai-as-promised'
chai.use(sinonChai)
chai.use(chaiPromise)
const should = chai.should()

describe('Observer', function () {
  beforeEach(() => {
    this.testInterval = null
    this.testTimeout = null
    this.testSpy = sinon.spy()
    this.observer = new Observer([['hubot', 'hello']])
    this.messages = this.observer.observed
  })
  afterEach(() => {
    if (this.testInterval != null) clearInterval(this.testInterval)
    if (this.testTimeout != null) clearTimeout(this.testTimeout)
  })
  describe('constructor', () => {
    it('observes the given array', () => {
      this.observer.observed.should.eql(this.messages)
    })
    it('has observers object for callbacks', () => {
      this.observer.observers.should.be.a('object')
    })
  })
  describe('.proxy', () => {
    it('proxies array, calling observers with any new value', () => {
      this.observer.observers.test = this.testSpy
      let testArray = this.observer.proxy([])
      testArray.push(1)
      this.testSpy.should.have.calledWith(1)
    })
  })
  describe('.get', () => {
    it('returns the proxied array', () => {
      this.observer.get().should.eql(this.observer.observed)
    })
  })
  describe('.observe', () => {
    it('stores given callback in observers collection, returning ID', () => {
      this.testObserverId = this.observer.observe(this.testSpy)
      this.observer.observers[this.testObserverId].should.eql(this.testSpy)
    })
  })
  describe('.unobserve', () => {
    it('removes the observer with given key', () => {
      this.observer.observers.test = () => {}
      this.observer.unobserve('test')
      should.not.exist(this.observer.observers.test)
    })
  })
  describe('.unobserveAll', () => {
    it('removes the observer with given key', () => {
      this.observer.observers.A = () => {}
      this.observer.observers.B = () => {}
      this.observer.unobserveAll()
      this.observer.observers.should.eql({})
    })
  })
  describe('.next', () => {
    it('resolves promise with the next value added', () => {
      this.testTimeout = setTimeout(() => {
        this.messages.push(['tester', 'testing'])
      }, 15)
      this.observer.next().should.eventually.eql({
        next: ['tester', 'testing'],
        observed: [
          ['hubot', 'hello'],
          ['tester', 'testing']
        ]
      })
    })
  })
  describe('.find', () => {
    it('resolves when "needle" found', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 2']).should.eventually.eql({
        count: 2,
        found: ['test', 'ping 2'],
        observed: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ]
      })
    })
    it('with max, returns when found before max', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 2'], 3).should.eventually.eql({
        count: 2,
        found: ['test', 'ping 2'],
        observed: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ]
      })
    })
    it('with max, returns when max before found', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 3'], 2).should.eventually.eql({
        count: 2,
        found: null,
        observed: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ]
      })
    })
    it('with iterator, calls iterator on every addition', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 2'], this.testSpy).then(() => {
        this.testSpy.args.should.eql([
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ])
      })
    })
  })
  describe('.match', () => {
    it('resolves on match', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/ping 2/).should.eventually.eql({
        count: 2,
        match: ['test', 'ping 2'].join(' ').match(/ping 2/),
        observed: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ]
      })
    })
    it('wtth max, returns on match before max', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/ping 2/, 3).should.eventually.eql({
        count: 2,
        match: ['test', 'ping 2'].join(' ').match(/ping 2/),
        observed: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ]
      })
    })
    it('with max, returns on max before matched', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/ping 3/, 2).should.eventually.eql({
        count: 2,
        match: null,
        observed: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ]
      })
    })
    it('with iterator, calls iterator on every addition', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/pint 2/, this.testSpy).then(() => {
        this.testSpy.args.should.eql([
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ])
      })
    })
  })
  describe('.all', () => {
    it('with max, resolves when max reached', () => {
      this.testInterval = setInterval(() => {
        this.observer.observed.push(['test', 'ping'])
      }, 15)
      this.observer.all(2).should.eventually.eql({
        count: 2,
        observed: [
          ['hubot', 'hello'],
          ['test', 'ping'],
          ['test', 'ping']
        ]
      })
    })
    it('with iterator, calls iterator on every addition', () => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.all(this.testSpy).then(() => {
        this.testSpy.args.should.eql([
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ])
      })
    })
  })
})
