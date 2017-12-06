[nubot]: http://nubot.github.com
[playbook-pretend]: https://propertyux.github.io/playbook-pretend
[nubot]: https://github.com/PropertyUX/nubot
[playbook]: https://timkinnane.github.io/nubot-playbook
[standard]: https://standardjs.com/

# Playbook Pretend

[**Pretend**][playbook-pretend] is a powerful test suite for [nubot][nubot] and [Playbook][playbook]
chat bots, providing mock messaging and internal processes, with helpers to make
shorthand assertions using mocha, chai and sinon.

Current releases have drop support for hubot in favor of [Nubot][nubot], which
only supports Node 8+ and is written in es6 [StandardJS][standard]
(phasing out coffee-script support), with [Playbook][playbook] integration.

[![npm version](https://img.shields.io/npm/v/playbook-pretend.svg?style=flat)](https://www.npmjs.com/package/playbook-pretend)
[![Build Status](https://travis-ci.org/PropertyUX/playbook-pretend.svg?branch=master)](https://travis-ci.org/PropertyUX/playbook-pretend)
[![dependencies Status](https://david-dm.org/PropertyUX/playbook-pretend/status.svg)](https://david-dm.org/PropertyUX/playbook-pretend)
[![devDependencies Status](https://david-dm.org/PropertyUX/playbook-pretend/dev-status.svg)](https://david-dm.org/PropertyUX/playbook-pretend?type=dev)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Install

`npm install playbook-pretend --save-dev`

or

`yarn add playbook-pretend --dev`

## Usage examples

### *[See the docs](https://PropertyUX.github.io/playbook-pretend/usage/00-setup_test.html)* for specific usage examples

## Quick Usage

We have the following bot script (_hello-world.js_)...

```javascript
module.exports = (robot) => {
  robot.respond(/hello$/i, (msg) => msg.reply('hello'))
}
```

Test file processes some messages...

```javascript
const pretend = require('playbook-pretend')
const {expect} = require('chai')

describe('Hello World', function () {
  it('says hello back', function (done) {
    pretend.read('scripts/hello-world.coffee').start()
    pretend.user('margaret').send('nubot hello').then(function() {
      expect(pretend.messages).to.eql([
        ['margaret', 'nubot hello'],
        ['nubot', '@margaret hello']
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
function on the promise `.then`.

Other [examples in the docs](https://PropertyUX.github.io/playbook-pretend/usage/01-users_test.html)
show how to improve the style of such tests using generators with _co_.

---

## Important Notes

Script paths are resolved from the package root, *not* relative to tests.

## Contributing

This is a fairly new project, so there's no contrib guidelines yet. Just follow
[the standard process](https://opensource.guide/how-to-contribute/#how-to-submit-a-contribution).

See the TODO list below for the roadmap of objectives if you'd like to help. Or
just create an issue and start working on it if you've found something wrong.

Use the NPM scripts to test and build any changes:
- `npm run test` - lint and test current build
- `npm run dev` - lint, compile and test development changes
- `npm run dev:watch` - run dev scripts automatically on change
- `npm run build` - lint, compile, test, regenerate docs

Follow [standardsj](https://standardjs.com/) syntax to avoid bikeshedding.

Use the [commitizen cli](https://github.com/commitizen/cz-cli) for writing
commit messages.

---

## TODO

- convert room/user messages to property getter
- link back to docs for HTH #32, #37, #38
- helper methods to test nubot brain - HTH #31
- helper methods to test user id, other attributes - HTH #26
- helpers and promise returns for get/post request tests
- add end to end test with internal IRC server and adapter
