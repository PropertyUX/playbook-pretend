class temp {
  /**
   * Record details of a private message from hubot
   * @param  {Object} envelope   A Object with message, room and user details
   * @param  {Array} strings...  Array of message text strings
  */
  sendPrivate ({ user }, ...strings) {
    if (!(user.name in this.privateMessages)) {
      this.privateMessages[user.name] = []
    }
    for (let str of strings) {
      this.privateMessages[user.name].push(['hubot', str])
    }
  }

  /**
   * Record details of an event emitted by hubot
  */
  robotEvent (...args) {
    this.events.push(...args)
    this.robot.emit(...args)
  }

  /**
   * Process and record details of a user entering a room
   * @param  {MockUser} user    Sender's user object
   * @return Promise            Promise resolving when robot finished processing
  */
  enter (user) {
    return new Promise(resolve => {
      return this.robot.receive(new EnterMessage(user), resolve)
    })
  }

  /**
   * Process and record details of a user leaving a room
   * @param  {MockUser} user    Sender's user object
   * @return Promise            Promise resolving when robot finished processing
  */
  leave (user) {
    return new Promise(resolve => {
      return this.robot.receive(new LeaveMessage(user), resolve)
    })
  }
}
