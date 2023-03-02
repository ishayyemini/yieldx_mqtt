const express = require('express')

const getReportData = require('./get_report_data').default

const app = express()

const PORT = 5000

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' })
})

app.get('/health-check', (req, res) => {
  res.json({ message: 'Server up and running' })
})
app.get('/get-report-data', (req, res) => {
  const { UID, username } = req.query
  getReportData({ UID, username }).then((result) => res.json(result))
})

app.listen(PORT, () => {
  console.log('Server Running on PORT', PORT)
})
