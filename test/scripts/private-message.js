export default robot =>
  robot.respond(/tell me a secret$/i, res =>
    res.sendPrivate('whisper whisper whisper')
  )
