(function() {
  var Pretend, chai, co, pretend;

  Pretend = require('../src/index');

  pretend = new Pretend('./scripts/hello-world.coffee');

  co = require('co');

  chai = require('chai');

  describe('Hello World - users say hi to hubot', function() {
    beforeEach(function() {
      pretend.startup({
        users: ['alice', 'bob']
      });
      return co(function*() {
        yield pretend.users.alice.send('@hubot hi');
        yield pretend.users.bob.send('@hubot hi');
      });
    });
    return it('replies to each', function() {
      return expect(pretend.messages).to.eql([['alice', '@hubot hi'], ['hubot', '@alice hi'], ['bob', '@hubot hi'], ['hubot', '@bob hi']]);
    });
  });
}).call(this);
