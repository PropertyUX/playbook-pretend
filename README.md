# Hubot Pretend

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://img.shields.io/npm/v/hubot-pretend.svg?style=flat)](https://www.npmjs.com/package/hubot-pretend)
[![Build Status](https://travis-ci.org/timkinnane/hubot-pretend.svg?branch=master)](https://travis-ci.org/timkinnane/hubot-pretend)
[![dependencies Status](https://david-dm.org/timkinnane/hubot-pretend/status.svg)](https://david-dm.org/timkinnane/hubot-pretend)
[![devDependencies Status](https://david-dm.org/timkinnane/hubot-pretend/dev-status.svg)](https://david-dm.org/timkinnane/hubot-pretend?type=dev)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

**Hubot Pretend** is for [Hubot](hubot.github.com) messaging tests with a mock
robot, rooms and users.

This is an adaptation of
[Hubot Test Helper](https://github.com/mtsmfm/hubot-test-helper)
by Fumiaki Matsushima.

The main difference is support for a single robot across multiple rooms. Where
Hubot Test Helper works well for testing the end results of messaging, the
feature roadmap for Hubot Pretend is focused on testing more of the internals,
like logs, response objects and middleware.

The methods are similar, but mostly incompatible so please read carefully if
migrating from
[Hubot Test Helper](https://github.com/mtsmfm/hubot-test-helper)
to [Hubot Pretend](https://github.com/timkinnane/hubot-pretend).

---

## Install

`npm install hubot-pretend --save-dev`

## Usage

We have the following Hubot script...

```coffee
module.exports = (robot) ->
  robot.respond /hi$/i, (msg) ->
    msg.reply 'hi'
```

Set up test file like so...

```coffee
Pretend = require 'hubot-pretend'
pretend = new Pretend './scripts/my-script.coffee'

co = require 'co'
{expect} = require 'chai'
```

`Pretend` constructor accepts one or more script paths, even a directory of
scripts.

Now process some messages...

```coffee
describe 'Hello World', ->

  beforeEach ->
    pretend.startup()
    @alice = pretend.user 'alice'
    @bob = pretend.user 'bob'
    co =>
      yield @alice.send '@hubot hi'
      yield @room.send '@hubot hi'

  afterEach ->
    pretend.shutdown()
```

`.startup()` reads in the scripts, creating a robot and adapter that routes
messages internally.

`.user` and `.room` return mock user and room classes, providing shortcuts to
send and receive with a pre-populated user.

`.shutdown()` is not strictly required unless using httpd (to close ports).

Lastly, make assertions to test...

```coffee
  it 'should reply to user', ->
    expect(pretend.messages).to.eql [
      ['alice', '@hubot hi']
      ['hubot', '@alice hi']
      ['bob',   '@hubot hi']
      ['hubot', '@bob hi']
    ]
```

There are many other ways to send and receive test messages.
See [this test](test/01-Hello-World_test.coffee) for usage examples.

Note that `yield` and *generators* are part of **ECMA6** so it may not work on
older node versions. It will wait for the delay to complete the `beforeEach`
before proceeding to the test `it`.

#### Multiple Rooms

By default, Pretend is a room-less environment for receiving basic messages.

We can however setup an array of rooms, for listening and responding to a user
across parallel rooms, or different sets of users in each room.

The record of messages will prepend the name of the room where it was received
(if there was a room defined).

See [this test](test/02-Hello-Rooms_test.coffee) for an example of multiple
rooms.

#### HTTPD

If required, Hubot can enable a built in HTTP server. The server continues so
it must be shutdown after tests using `pretend.shutdown()`.

See [the tests](test/03-HTTPD-World_test.coffee) for an example of testing the
HTTP server.

#### Hubot Internals

[Sinon](http://sinonjs.org/) is used to spy on the methods of Hubot's Robot
class, so we can test what's happening under the hood.

See [this test](test/10-Hello-Spies_test.coffee) for an example of testing the
Robot methods.

#### Manual Delay

Sometimes we can't access callback actions from a script.
Just like in real use case we may have to wait for a bot to finish processing
before replying, in testing we may anticipate the delayed reply with a manual
time delay.

For example we have the following script...

```coffee
module.exports = (robot) ->
  robot.hear /(http(?:s?):\/\/(\S*))/i, (res) ->
    url = res.match[1]
    res.send "getting: #{url}"
    robot.http(url).get() (err, response, body) ->
      res.send "finished: #{url}"
```

Test the second callback response we use the following script...

```coffee
Pretend = require 'hubot-pretend'
pretend = new Pretend '../scripts/http.coffee'

Promise = require 'bluebird'
co = require 'co'
{expect} = require 'chai'

describe 'http ping', ->

  context 'user posts link', ->

    beforeEach ->
      pretend.startup()
      co ->
        yield pretend.user('alice').say 'http://google.com'
        yield new Promise.delay 1000 # delay one second for the second

    it 'expects delayed callback from ok2', ->
      expect(pretend.adapter.messages).to.eql [
        ['alice', 'http://google.com']
        ['hubot', 'getting: http://google.com']
        ['hubot', 'finished: http://google.com']
      ]
```

#### Testing Events

We can also test events emitted by the script. For example, Slack users may want
to test the creation of a
[message attachment](https://api.slack.com/docs/attachments).

Given the following script...

```coffee
module.exports = (robot) ->

  robot.respond /check status$/i, (msg) ->
    robot.emit 'slack.attachment',
      message: msg.message,
      content:
        color: "good"
        text: "It's all good!"
```

We could test the emitted event...

```coffee
Pretend = require 'hubot-pretend'
pretend = new Pretend '../scripts/status_check.coffee'

{expect} = require 'chai'

describe 'status check', ->

  beforeEach ->
    response = null
    pretend.startup()
    pretend.robot.on 'slack.attachment', (event) -> response = event.content
    pretend.user('bob').say '@hubot check status'

  it 'should send a slack event', ->
    expect(response.text).to.eql "It's all good!"
```

---

## TODO

- add gulp build chain for lint/test/watching
- link back to docs for HTH #32, #37, #38
- npm publish full release (1.0.0)
- publish github docs pages
- helper methods to test hubot brain - HTH #31
- helper methods to test user id, other attributes - HTH #26
