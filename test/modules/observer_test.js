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
    it('proxies array, calling observers with new value and state', () => {
      this.observer.observers.test = this.testSpy
      let testArray = this.observer.proxy([])
      testArray.push(1)
      this.testSpy.should.have.calledWith(1, [1])
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
    it('resolves promise with the next value added', (done) => {
      this.testTimeout = setTimeout(() => {
        this.messages.push(['tester', 'testing'])
      }, 15)
      this.observer.next().should.eventually.eql({
        value: ['tester', 'testing'],
        state: [
          ['hubot', 'hello'],
          ['tester', 'testing']
        ],
        count: 1
      }).notify(done)
    })
  })
  describe('.find', () => {
    it('resolves when "needle" found', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 2']).should.eventually.eql({
        value: ['test', 'ping 2'],
        state: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ],
        count: 2
      }).notify(done)
    })
    it('with max, returns when found before max', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 2'], 3).should.eventually.eql({
        value: ['test', 'ping 2'],
        state: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ],
        count: 2
      }).notify(done)
    })
    it('with max, returns when max before found', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 3'], 2).should.eventually.eql({
        value: null,
        state: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ],
        count: 2
      }).notify(done)
    })
    it('with iterator, calls iterator on every addition', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.find(['test', 'ping 2'], this.testSpy).then((result) => {
        this.testSpy.args.should.eql([
          [ ['test', 'ping 1'] ],
          [ ['test', 'ping 2'] ]
        ])
        done()
      })
    })
  })
  describe('.match', () => {
    it('resolves on match', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/ping 2/).should.eventually.eql({
        count: 2,
        value: ['test', 'ping 2'],
        state: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ],
        match: ['test', 'ping 2'].join(' ').match(/ping 2/)
      }).notify(done)
    })
    it('wtth max, returns on match before max', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/ping 2/, 3).should.eventually.eql({
        count: 2,
        value: ['test', 'ping 2'],
        state: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ],
        match: ['test', 'ping 2'].join(' ').match(/ping 2/)
      }).notify(done)
    })
    it('with max, returns on max before matched', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/ping 3/, 2).should.eventually.eql({
        count: 2,
        value: null,
        state: [
          ['hubot', 'hello'],
          ['test', 'ping 1'],
          ['test', 'ping 2']
        ]
      }).notify(done)
    })
    it('with iterator, calls iterator on every addition', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.match(/ping 2/, this.testSpy).then((result) => {
        this.testSpy.args.should.eql([
          [ ['test', 'ping 1'] ],
          [ ['test', 'ping 2'] ]
        ])
        done()
      })
    })
  })
  describe('.all', () => {
    it('with max, resolves when max reached', (done) => {
      this.testInterval = setInterval(() => {
        this.observer.observed.push(['test', 'ping'])
      }, 15)
      this.observer.all(2).should.eventually.eql({
        value: ['test', 'ping'],
        state: [
          ['hubot', 'hello'],
          ['test', 'ping'],
          ['test', 'ping']
        ],
        count: 2
      }).notify(done)
    })
    it('with iterator, calls iterator on every addition', (done) => {
      let count = 0
      this.testInterval = setInterval(() => {
        count++
        this.observer.observed.push(['test', `ping ${count}`])
      }, 15)
      this.observer.all(2, this.testSpy).then(() => {
        this.testSpy.args.should.eql([
          [ ['test', 'ping 1'] ],
          [ ['test', 'ping 2'] ]
        ])
        done()
      })
    })
  })
})
