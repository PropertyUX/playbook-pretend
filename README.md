# Hubot Pretend

[![npm version](https://img.shields.io/npm/v/hubot-pretend.svg?style=flat)](https://www.npmjs.com/package/hubot-pretend)
[![Build Status](https://travis-ci.org/timkinnane/hubot-pretend.svg?branch=master)](https://travis-ci.org/timkinnane/hubot-pretend)
[![dependencies Status](https://david-dm.org/timkinnane/hubot-pretend/status.svg)](https://david-dm.org/timkinnane/hubot-pretend)
[![devDependencies Status](https://david-dm.org/timkinnane/hubot-pretend/dev-status.svg)](https://david-dm.org/timkinnane/hubot-pretend?type=dev)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Hubot Pretend** is a powerful test suite for [Hubot](hubot.github.com). It
provides mock messaging and internal processes, with helpers to make shorthand
assertions using mocha, chai and sinon.

---

## Install

`npm install hubot-pretend --save-dev`

## Usage examples

*[See the docs]()* for specific usage examples:

- [Using pretend]()
- [Sending from users]()
- [Receiving in rooms]()
- [Entering and leaving a room]()
- [Observering messages]()
- [Receiving HTTP requests]()
- [Private messages]()
- [Teting events]()
- [Testing logs]()
- [Method spies]()
- [Middleware and responses]()
- [Custom response objects]()

## Quick Usage

We have the following Hubot script (_my-script.coffee_)...

```coffee
module.exports = (robot) ->
  robot.respond /hello$/i, (msg) -> msg.reply 'hello'
```

Test file processes some messages...

```js
const pretend = require('hubot-pretend')
const {expect} = require('chai')

describe('Hello World', function () {
  it('says hello back', function (done) {
    pretend.read('scripts/hello-world.coffee').start()
    pretend.user('margaret').send('hubot hello').then(function() {
      expect(pretend.messages).to.eql([
        ['margaret', 'hubot hello'],
        ['hubot', '@margaret hello']
      ])
      pretend.shutdown()
      done()
    })
  })
})
```

- `.read` reads in scripts (can be done before test)
- `.start` creates a robot and adapter to route messages
- `.user` creates user with helpers for pre-populated message envelopes
- `.send` passes messages to `robot.receive` and returns a promise*
- `.messages` keeps a record of all messages sent and received by the robot
- `.shutdown` resets collections and runs shutdown on the robot

This example shows a minimal dependency approach using the tests's `done`
function on the promise `.then`. Other [examples in the docs](./test/usage/01-users_test.js)
show how to improve the style of such tests using generators with _mocha-co_.

---

## Important Notes

Script paths are resolved from the package root, *not* relative to tests.

Currently, Pretend uses a custom fork of hubot that adds promises to middleware,
to allow async tests. It can test your hubot scripts, but it won't use your own
package's hubot version. Hopefully in later versions of hubot, async will be
supported and Pretend can be adapted to test with the exact dependencies of your
hubot projects.

---

## TODO

- npm publish full release (1.0.0)
- publish github docs pages
- generate coverage and write missing module tests
- convert mocha-co usage to babel async/await
- convert room/user messages to property getter
- link back to docs for HTH #32, #37, #38
- helper methods to test hubot brain - HTH #31
- helper methods to test user id, other attributes - HTH #26
- helpers and promise returns for get/post request tests
- add end to end test with internal IRC server and adapter
