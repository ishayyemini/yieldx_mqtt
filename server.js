const express = require('express')
const cors = require('cors')
const compression = require('compression')

const getReportData = require('./get_report_data').default

const app = express()

app.use(cors())
app.use(compression())

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
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    })
    getReportData({ UID, username }, res)
  }
})

app.listen(PORT, () => {
  console.log('Server Running on PORT', PORT)
})
