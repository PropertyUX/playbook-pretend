Pretend = require '../src/index'
pretend = new Pretend './scripts/httpd-world.coffee'

http = require 'http'
co = require 'co'
chai = require 'chai'
should = chai.should()

process.env.EXPRESS_PORT = 8080

describe 'HTTPD World', ->

  context 'GET /hello/world', ->

    beforeEach (done) ->
      pretend.startup httpd: true
      http.get 'http://localhost:8080/hello/world', (@response) => done()
      .on 'error', done

    afterEach ->
      pretend.shutdown()

    it 'responds with status 200', ->
      @response.statusCode.should.equal 200
