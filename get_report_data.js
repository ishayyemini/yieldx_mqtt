const sql = require('mssql')
const EventLogger = require('node-windows').EventLogger

const log = new EventLogger('get_report_data')

const get_report_data = async ({ username, UID }, res) => {
  if (username === 'all') username = ''
  console.log(`Fetching data of test number ${UID}`)
  log.info(`Fetching data of test number ${UID}`)

  console.time('Total time')
  const request = new sql.Request()

  // Send row count to end user
  const [{ row_count }] = await request
    .query(
      `
SELECT Count(*) as row_count 
FROM SensorsData
WHERE dateCreated = (
  SELECT dateCreated
  FROM Locations
  WHERE UID = ${UID} 
  ${username ? `and Customer = '${username}'` : ''}
) 
      `
    )
    .then((res) => res.recordset)
  console.log(`Found ${row_count} rows`)
  log.info(`Found ${row_count} rows`)
  res.write(row_count.toString())
  res.flush()

  request.stream = true
  request.query(
    `
SELECT * 
FROM SensorsData
WHERE dateCreated = (
  SELECT dateCreated
  FROM Locations
  WHERE UID = ${UID} 
  ${username ? `and Customer = '${username}'` : ''}
)
      `
  )

  // Log fetching status
  const updateStatus = () => {
    if (
      process?.stdout?.clearLine &&
      process?.stdout?.cursorTo &&
      process?.stdout?.write
    ) {
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(
        `Fetched ${fetchedAlready} out of ${row_count} (${Math.round(
          (fetchedAlready / row_count) * 100
        )}%)`
      )
    }
  }

  let fetchedAlready = 0
  const BATCH_SIZE = 100

  const printing = setInterval(updateStatus, 1000)

  request.on('recordset', () => {
    res.write('[')
  })

  request.on('row', (row) => {
    if (fetchedAlready > 0) res.write(',')
    if (fetchedAlready % BATCH_SIZE === 0) res.flush()
    res.write(JSON.stringify(row))
    fetchedAlready++
  })

  request.on('done', () => {
    log.info(`Done, fetched ${fetchedAlready} rows out of ${row_count}`)
    clearInterval(printing)
    updateStatus()
    console.log()
    res.write(']')
    console.timeEnd('Total time')
    console.log()
    res.end()
  })
}

module.exports.default = get_report_data
