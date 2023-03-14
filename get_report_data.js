const sql = require('mssql')

const get_report_data = ({ username, UID }, res) => {
  if (username === 'all') username = ''
  console.log(`Fetching data of test number ${UID}`)

  console.time('Total time')
  const config = {
    user: 'sa',
    password: 'Yieldxbiz2021',
    server: 'localhost',
    database: 'SensorsN',
    options: { encrypt: false },
  }
  sql.connect(config).then(async () => {
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
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(
        `Fetched ${fetchedAlready} out of ${row_count} (${Math.round(
          (fetchedAlready / row_count) * 100
        )}%)`
      )
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
      clearInterval(printing)
      updateStatus()
      res.write(']')
      console.log()
      console.timeEnd('Total time')
      console.log()
      sql.close()
      res.end()
    })
  })

  sql.on('error', (err) => {
    console.timeEnd('Total time')
    res.end()
    console.log(err)
  })
}

module.exports.default = get_report_data
