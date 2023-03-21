const express = require('express')
const sql = require('mssql')
const cors = require('cors')
const compression = require('compression')

const getReportData = require('./get_report_data')

const app = express()

app.use(cors())
app.use(compression())

app.get('/test', (req, res) => {
  res.send('test ok!')
})

app.get('/', (req, res) => {
  res.send('welcome to the backend (:')
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
    getReportData({ UID, username }, res).catch((err) => {
      console.log(err)
    })
  }
})

const config = {
  user: 'sa',
  password: 'Yieldxbiz2021',
  server: 'localhost',
  database: 'SensorsN',
  options: { encrypt: false },
}
sql.connect(config).then(() => {
  app.listen(process.env.PORT, () => {
    console.log('Server Running on PORT', process.env.PORT)
  })
})

sql.on('error', (err) => {
  console.log(err)
})
