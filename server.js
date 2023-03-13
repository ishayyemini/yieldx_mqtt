const express = require('express')
const cors = require('cors')

const getReportData = require('./get_report_data').default

const app = express()

app.use(cors())

const PORT = 5000

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' })
})

app.get('/health-check', (req, res) => {
  res.json({ message: 'Server up and running' })
})

app.get('/get-report-data', (req, res) => {
  const { UID, username } = req.query
  if (!UID) res.json({ err: 'Missing UID' })
  else {
    res.writeHead(200, {
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    })
    getReportData(
      { UID, username },
      (chunk) => res.write(chunk),
      () => res.end()
    )
  }
})

app.listen(PORT, () => {
  console.log('Server Running on PORT', PORT)
})
