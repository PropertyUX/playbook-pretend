export default ({ router }) => router.get('/hello/world', (req, res) =>
  res.status(200).send('Hello World!')
)
